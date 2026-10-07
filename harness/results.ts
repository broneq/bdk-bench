// Result rows: one JSON line per measured run, appended as each run finishes
// so an aborted series keeps every finished run.
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

interface Provenance {
  /** Model ids the session reported, orchestrator and subagents. */
  readonly models: readonly string[];
  /** Null for a run without a fixture. */
  readonly fixtureCommit: string | null;
  readonly benchCommit: string;
  readonly adapter: { readonly name: string; readonly version: string };
  readonly judgeHash?: string;
}

export interface ResultRow {
  readonly suite: string;
  readonly series: string;
  readonly workflow: string;
  /** The task of the run. */
  readonly item: string;
  readonly run: number;
  /** The isolation or harness reason a run is not counted; null when counted. */
  readonly discarded: string | null;
  readonly cost: number;
  /** Null marks a metric that does not apply to the workflow. */
  readonly metrics: Readonly<Record<string, number | null>>;
  readonly provenance: Provenance;
}

const COMMIT = /^[0-9a-f]{40}$/;

function validate(row: ResultRow): void {
  const { provenance } = row;
  // A discarded run may have failed before the session reported a model.
  if (row.discarded === null && provenance.models.length === 0)
    throw new Error("counted result row without models");
  if (!COMMIT.test(provenance.benchCommit))
    throw new Error(`result row benchCommit is not a commit: ${provenance.benchCommit}`);
  if (provenance.fixtureCommit !== null && !COMMIT.test(provenance.fixtureCommit)) {
    throw new Error(`result row fixtureCommit is not a commit: ${provenance.fixtureCommit}`);
  }
  if (provenance.adapter.name === "" || provenance.adapter.version === "")
    throw new Error("result row adapter name and version must not be empty");
}

export function appendRow(file: string, row: ResultRow): void {
  validate(row);
  mkdirSync(dirname(file), { recursive: true });
  appendFileSync(file, `${JSON.stringify(row)}\n`);
}

export function writeRows(file: string, rows: readonly ResultRow[]): void {
  rows.forEach(validate);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, rows.map((row) => `${JSON.stringify(row)}\n`).join(""));
}

export function readRows(file: string): ResultRow[] {
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => JSON.parse(line) as ResultRow);
}

interface ProviderResult {
  readonly response?: { readonly metadata?: { readonly modelUsage?: Record<string, unknown> } };
}

export function modelsOf(result: ProviderResult): string[] {
  return Object.keys(result.response?.metadata?.modelUsage ?? {}).sort();
}
