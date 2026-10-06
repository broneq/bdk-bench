// `pnpm bench`: argument parsing, the credentials check and dispatch to the
// suites. The suites own their runs; this module owns only the command line.
import { DEFAULT_BUDGET_USD, DEFAULT_RUN_CAP_USD } from "./budget.ts";

const DEFAULT_CONCURRENCY = 4;

const USAGE = [
  "usage: pnpm bench <suite> [--probe] [--runs N] [--budget USD] [--run-cap USD] [--concurrency N]",
  "                          [--workflows a,b] [--items x,y]",
  "       pnpm bench check",
  "       pnpm bench view",
  "       pnpm bench report <suite> --baseline <series> --candidate <series>",
  "       pnpm bench regrade <suite> --series <name>",
].join("\n");

export type SuiteName = string;

export interface RunOptions {
  readonly command: "run";
  readonly suite: SuiteName;
  readonly probe: boolean;
  readonly runs: number;
  readonly budget: number;
  readonly runCap: number;
  readonly concurrency: number;
  readonly workflows?: readonly string[];
  readonly items?: readonly string[];
}

export type Options =
  | RunOptions
  | { readonly command: "check" }
  | { readonly command: "view" }
  | {
      readonly command: "compare";
      readonly suite: SuiteName;
      readonly baseline: string;
      readonly candidate: string;
    }
  | { readonly command: "regrade"; readonly suite: SuiteName; readonly series: string };

export class UsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UsageError";
  }
}

function suiteName(value: string | undefined, suites: readonly string[]): SuiteName {
  const found = suites.find((suite) => suite === value);
  if (found === undefined) {
    throw new UsageError(`unknown suite ${value ?? "(none)"}; known suites: ${suites.join(", ")}`);
  }
  return found;
}

function number(flag: string, value: string | undefined): number {
  const parsed = Number(value);
  if (value === undefined || !Number.isFinite(parsed) || parsed <= 0) {
    throw new UsageError(`${flag} needs a positive number, got ${value ?? "nothing"}`);
  }
  return parsed;
}

function integer(flag: string, value: string | undefined): number {
  const parsed = number(flag, value);
  if (!Number.isInteger(parsed)) {
    throw new UsageError(`${flag} needs an integer of at least 1, got ${value}`);
  }
  return parsed;
}

function list(flag: string, value: string | undefined): readonly string[] {
  const names = (value ?? "").split(",").filter((name) => name !== "");
  if (names.length === 0) throw new UsageError(`${flag} needs a comma-separated list`);
  return names;
}

function flagValues(flags: readonly string[], known: readonly string[]): Map<string, string> {
  const values = new Map<string, string>();
  for (let index = 0; index < flags.length; index += 2) {
    const flag = flags[index] ?? "";
    if (!known.includes(flag)) throw new UsageError(`unknown flag ${flag}`);
    const value = flags[index + 1];
    if (value === undefined) throw new UsageError(`${flag} needs a value`);
    values.set(flag, value);
  }
  return values;
}

function parseCompare(suite: SuiteName, flags: readonly string[]): Options {
  const values = flagValues(flags, ["--baseline", "--candidate"]);
  const baseline = values.get("--baseline");
  const candidate = values.get("--candidate");
  if (baseline === undefined || candidate === undefined) {
    throw new UsageError("report needs --baseline <series> and --candidate <series>");
  }
  return { command: "compare", suite, baseline, candidate };
}

function parseRegrade(suite: SuiteName, flags: readonly string[]): Options {
  const series = flagValues(flags, ["--series"]).get("--series");
  if (series === undefined) throw new UsageError("regrade needs --series <name>");
  return { command: "regrade", suite, series };
}

function parseRun(suite: SuiteName, flags: readonly string[]): RunOptions {
  let options: RunOptions = {
    command: "run",
    suite,
    probe: false,
    runs: 1,
    budget: DEFAULT_BUDGET_USD,
    runCap: DEFAULT_RUN_CAP_USD,
    concurrency: DEFAULT_CONCURRENCY,
  };
  const queue = [...flags];
  const value = (): string | undefined => queue.shift();
  for (let flag = queue.shift(); flag !== undefined; flag = queue.shift()) {
    switch (flag) {
      case "--probe":
        options = { ...options, probe: true };
        break;
      case "--runs":
        options = { ...options, runs: integer(flag, value()) };
        break;
      case "--budget":
        options = { ...options, budget: number(flag, value()) };
        break;
      case "--run-cap":
        options = { ...options, runCap: number(flag, value()) };
        break;
      case "--concurrency":
        options = { ...options, concurrency: integer(flag, value()) };
        break;
      case "--workflows":
        options = { ...options, workflows: list(flag, value()) };
        break;
      case "--items":
        options = { ...options, items: list(flag, value()) };
        break;
      default:
        throw new UsageError(`unknown flag ${flag}`);
    }
  }
  return options;
}

export function parseArgs(argv: readonly string[], suites: readonly string[]): Options {
  const [first, ...rest] = argv;
  if (first === "check") return { command: "check" };
  if (first === "view") return { command: "view" };
  if (first === "report") return parseCompare(suiteName(rest[0], suites), rest.slice(1));
  if (first === "regrade") return parseRegrade(suiteName(rest[0], suites), rest.slice(1));
  return parseRun(suiteName(first, suites), rest);
}

export interface AuthStatus {
  readonly loggedIn: boolean;
}

/** Null when the SDK can authenticate: an API key, or a Claude Code login. */
export function credentialsProblem(
  env: Readonly<Record<string, string | undefined>>,
  authStatus: () => AuthStatus | undefined,
): string | null {
  if ((env.ANTHROPIC_API_KEY ?? "") !== "") return null;
  if (authStatus()?.loggedIn === true) return null;
  return "no credentials: set ANTHROPIC_API_KEY, or log in to Claude Code with `claude auth login`";
}

export interface SuiteRunner {
  /** Runs the series or the probe; resolves to the exit code. */
  run(options: RunOptions): Promise<number>;
  /** Renders and validates the suite's configs without a model call. */
  check(): Promise<void>;
}

export interface CliDeps {
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly authStatus: () => AuthStatus | undefined;
  readonly suites: Readonly<Record<SuiteName, SuiteRunner>>;
  readonly view: () => Promise<number>;
  readonly compare: (suite: SuiteName, baseline: string, candidate: string) => Promise<number>;
  readonly regrade: (suite: SuiteName, series: string) => Promise<number>;
  readonly print: (line: string) => void;
  readonly printError: (line: string) => void;
}

export async function run(argv: readonly string[], deps: CliDeps): Promise<number> {
  try {
    return await dispatch(parseArgs(argv, Object.keys(deps.suites)), deps);
  } catch (error) {
    if (!(error instanceof UsageError)) throw error;
    deps.printError(`${error.message}\n${USAGE}`);
    return 2;
  }
}

async function withCredentials(deps: CliDeps, action: () => Promise<number>): Promise<number> {
  const problem = credentialsProblem(deps.env, deps.authStatus);
  if (problem !== null) {
    deps.printError(problem);
    return 1;
  }
  return action();
}

function suiteRunner(deps: CliDeps, name: SuiteName): SuiteRunner {
  const runner = deps.suites[name];
  if (runner === undefined) throw new UsageError(`unknown suite ${name}`);
  return runner;
}

async function dispatch(options: Options, deps: CliDeps): Promise<number> {
  switch (options.command) {
    case "check": {
      for (const runner of Object.values(deps.suites)) await runner.check();
      deps.print(`checked ${Object.keys(deps.suites).join(", ")}`);
      return 0;
    }
    case "view":
      return deps.view();
    case "compare":
      return deps.compare(options.suite, options.baseline, options.candidate);
    case "regrade":
      return withCredentials(deps, () => deps.regrade(options.suite, options.series));
    case "run":
      return withCredentials(deps, () => suiteRunner(deps, options.suite).run(options));
  }
}
