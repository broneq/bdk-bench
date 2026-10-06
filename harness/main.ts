// The entry point of `pnpm bench`: real dependencies for the CLI.
import { execFileSync } from "node:child_process";
import { join } from "node:path";

import { run } from "./cli.ts";
import type { AuthStatus, SuiteName, SuiteRunner } from "./cli.ts";
import { runCompare } from "./compare.ts";
import { loadSuiteHooks } from "./hook.ts";
import { judge } from "./judge.ts";
import { LEDGER_FILE, ROOT_DIR, RESULTS_DIR, RUNS_DIR, resultsFile } from "./paths.ts";
import { regradeSeries } from "./regrade.ts";
import { smokeRunner } from "./suites/smoke/suite.ts";
import { view } from "./tools.ts";

function authStatus(): AuthStatus | undefined {
  try {
    const output = execFileSync("claude", ["auth", "status", "--json"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return JSON.parse(output) as AuthStatus;
  } catch {
    return undefined;
  }
}

const print = (line: string): void => {
  console.log(line);
};
const printError = (line: string): void => {
  console.error(line);
};

const suites: Record<SuiteName, SuiteRunner> = {
  smoke: smokeRunner({ print, printError }),
};

process.exitCode = await run(process.argv.slice(2), {
  env: process.env,
  authStatus,
  suites,
  view: () => view(ROOT_DIR),
  compare: (suite, baseline, candidate) =>
    Promise.resolve(runCompare(RESULTS_DIR, suite, baseline, candidate, { print, printError })),
  regrade: (suite, series) =>
    regradeSeries(
      suite,
      series,
      {
        hooks: loadSuiteHooks,
        judge,
        resultsFile: resultsFile(RESULTS_DIR, suite, series),
        rawDir: join(RUNS_DIR, "series", suite, series, "raw"),
        ledgerFile: LEDGER_FILE,
      },
      { print, printError },
    ),
  print,
  printError,
});
