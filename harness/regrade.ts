// Re-grading a series without re-running it: `bench regrade <suite> --series <name>`. Every
// counted row's saved judge request is judged again with the suite's current
// instructions; the row's judged metrics and `provenance.judgeHash` are
// rewritten in place, and the old values stay in git history. No session runs.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { record } from "./budget.ts";
import type { RecordedJudgement, RegradableJudge, SuiteHooks } from "./hook.ts";
import type { JudgeRequest, Judgement } from "./judge.ts";
import { readRows, writeRows } from "./results.ts";
import type { ResultRow } from "./results.ts";

export interface RegradeDeps {
  readonly hooks: (suite: string) => Promise<SuiteHooks>;
  readonly judge: (request: JudgeRequest) => Promise<Judgement>;
  readonly resultsFile: string;
  /** The series' raw records, `.runs/series/<suite>/<series>/raw`. */
  readonly rawDir: string;
  readonly ledgerFile: string;
}

interface Io {
  readonly print: (line: string) => void;
  readonly printError: (line: string) => void;
}

/** sha256 of a judge's instructions: its system prompt and answer schema. */
export function judgeHash(system: string, schema: Readonly<Record<string, unknown>>): string {
  return createHash("sha256").update(system).update(JSON.stringify(schema)).digest("hex");
}

function judgeFile(rawDir: string, row: ResultRow): string {
  return join(rawDir, row.workflow, `${row.item}.run-${String(row.run)}`, "judge.json");
}

interface PendingRegrade {
  readonly row: ResultRow;
  readonly file: string;
  readonly saved: RecordedJudgement;
  readonly judge: RegradableJudge;
}

/** Resolves to the exit code: 0 re-graded, 2 nothing to re-grade. */
export async function regradeSeries(
  suite: string,
  series: string,
  deps: RegradeDeps,
  io: Io,
): Promise<number> {
  const hooks = await deps.hooks(suite);
  const judges = hooks.judges;
  if (judges === undefined) {
    io.printError(`${suite} declares no re-gradable judge`);
    return 2;
  }
  const rows = readRows(deps.resultsFile);
  if (rows.length === 0) {
    io.printError(`${suite} has no rows of series ${series}`);
    return 2;
  }
  const counted = rows.filter((row) => row.discarded === null);
  // Every saved request and its judge are resolved before the first judge call, so a re-grade
  // never starts what it cannot finish.
  const pending: PendingRegrade[] = [];
  for (const row of counted) {
    const file = judgeFile(deps.rawDir, row);
    if (!existsSync(file)) {
      io.printError(
        `no raw records of ${suite} ${series} ${row.workflow} ${row.item} run ${String(row.run)}: ${file}`,
      );
      return 2;
    }
    const saved = JSON.parse(readFileSync(file, "utf8")) as RecordedJudgement;
    const judge = judges[saved.judge];
    if (judge === undefined) {
      io.printError(`${suite} declares no re-gradable judge ${saved.judge} (${file})`);
      return 2;
    }
    pending.push({ row, file, saved, judge });
  }
  const regradedRows = new Map<ResultRow, ResultRow>();
  const savedJudgements: [file: string, saved: RecordedJudgement][] = [];
  for (const { row, file, saved, judge } of pending) {
    const request = { system: judge.system, schema: judge.schema, prompt: saved.prompt };
    const judgement = await deps.judge(request);
    record(deps.ledgerFile, { suite, workflow: row.workflow, run: row.run, cost: judgement.cost });
    savedJudgements.push([file, { ...saved, ...request, answer: judgement.output }]);
    regradedRows.set(row, {
      ...row,
      metrics: { ...row.metrics, ...judge.metrics(judgement.output, row.item) },
      provenance: { ...row.provenance, judgeHash: judgeHash(judge.system, judge.schema) },
    });
  }
  for (const [file, saved] of savedJudgements) {
    writeFileSync(file, `${JSON.stringify(saved, null, 2)}\n`);
  }
  writeRows(
    deps.resultsFile,
    rows.map((row) => regradedRows.get(row) ?? row),
  );
  io.print(`re-graded ${String(counted.length)} rows of ${suite} ${series}: ${deps.resultsFile}`);
  return 0;
}
