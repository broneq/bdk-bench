// Two series of a suite compared: the counted rows of each series, grouped by
// workflow, item and metric, under the difference rule. No other series is pooled in.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { readRows } from "./results.ts";
import type { ResultRow } from "./results.ts";
import { formatValues, formatVerdict } from "./stats.ts";

export interface NamedSeries {
  readonly name: string;
  readonly rows: readonly ResultRow[];
}

function distinct(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function header(role: string, series: NamedSeries): string {
  const counted = series.rows.filter((row) => row.discarded === null);
  const models = distinct(counted.flatMap((row) => row.provenance.models));
  const commits = distinct(series.rows.map((row) => row.provenance.benchCommit.slice(0, 7)));
  return `- ${role} ${series.name}: models ${models.join(", ") || "none"}; bench ${commits.join(", ")}; ${String(counted.length)} counted, ${String(series.rows.length - counted.length)} discarded`;
}

function valuesOf(
  rows: readonly ResultRow[],
  workflow: string,
  item: string,
  metric: string,
): number[] {
  return rows
    .filter((row) => row.workflow === workflow && row.item === item)
    .map((row) => (metric === "cost" ? row.cost : (row.metrics[metric] ?? null)))
    .filter((value): value is number => value !== null);
}

export function compareSeries(
  suite: string,
  baseline: NamedSeries,
  candidate: NamedSeries,
): string[] {
  const baselineRows = baseline.rows.filter((row) => row.discarded === null);
  const candidateRows = candidate.rows.filter((row) => row.discarded === null);
  const both = [...baselineRows, ...candidateRows];
  const lines = [
    `# ${suite}: ${baseline.name} vs ${candidate.name}`,
    "",
    header("baseline", baseline),
    header("candidate", candidate),
    "",
    "| workflow | item | metric | baseline | candidate | candidate vs baseline |",
    "| --- | --- | --- | --- | --- | --- |",
  ];
  for (const workflow of distinct(both.map((row) => row.workflow))) {
    for (const item of distinct(
      both.filter((row) => row.workflow === workflow).map((row) => row.item),
    )) {
      const rows = both.filter((row) => row.workflow === workflow && row.item === item);
      const metrics = [...distinct(rows.flatMap((row) => Object.keys(row.metrics))), "cost"];
      for (const metric of metrics) {
        const baselineValues = valuesOf(baselineRows, workflow, item, metric);
        const candidateValues = valuesOf(candidateRows, workflow, item, metric);
        lines.push(
          `| ${workflow} | ${item} | ${metric} | ${formatValues(baselineValues)} | ${formatValues(candidateValues)} | ${formatVerdict(candidateValues, baselineValues, ["candidate", "baseline"])} |`,
        );
      }
    }
  }
  return lines;
}

interface Io {
  readonly print: (line: string) => void;
  readonly printError: (line: string) => void;
}

/** Prints the comparison of two series of `suite` in `resultsDir`; returns the exit code. */
export function runCompare(
  resultsDir: string,
  suite: string,
  baseline: string,
  candidate: string,
  io: Io,
): number {
  const dir = join(resultsDir, suite);
  const read = (name: string): NamedSeries => ({
    name,
    rows: readRows(join(dir, `${name}.jsonl`)),
  });
  const series = [read(baseline), read(candidate)] as const;
  const missing = series.find((named) => named.rows.length === 0);
  if (missing !== undefined) {
    const known = existsSync(dir)
      ? readdirSync(dir)
          .filter((file) => file.endsWith(".jsonl"))
          .map((file) => file.slice(0, -".jsonl".length))
          .sort()
      : [];
    io.printError(
      `${suite} has no rows of series ${missing.name}; its series: ${known.join(", ") || "none"}`,
    );
    return 2;
  }
  for (const line of compareSeries(suite, ...series)) io.print(line);
  return 0;
}
