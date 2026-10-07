// Fixed locations of the harness: configs and raw outputs live under `.runs/`
// (gitignored), what a session sees lives in a sandbox outside the repository;
// only result rows are committed.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { userInfo } from "node:os";
import { basename, dirname, isAbsolute, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

import type { FixturePin } from "./fixture.ts";

export const ROOT_DIR = dirname(dirname(fileURLToPath(import.meta.url)));
export const RESULTS_DIR = join(ROOT_DIR, "results");
export const RUNS_DIR = join(ROOT_DIR, ".runs");
export const LEDGER_FILE = join(RUNS_DIR, "budget.json");

/** The user cache directory: XDG_CACHE_HOME, else `$HOME/.cache`, else the `.cache` of the account's home directory from the password database (`os.homedir()` would echo `$HOME`); an empty or relative value is ignored. */
export function cacheHome(
  env: Readonly<Record<string, string | undefined>>,
  fallbackHome: () => string = () => userInfo().homedir,
): string {
  const xdg = env.XDG_CACHE_HOME;
  if (xdg !== undefined && isAbsolute(xdg)) return xdg;
  const home = env.HOME;
  return join(home !== undefined && isAbsolute(home) ? home : fallbackHome(), ".cache");
}

/**
 * Working copies and config homes: outside the repository, because a session
 * that walks up from its working copy must not find the repository's own files.
 */
export const SANDBOX_DIR = join(cacheHome(process.env), "bdk-bench");

/**
 * A series' sandbox directory, one per checkout: two worktrees name a series
 * alike from their own results, and a shared sandbox lets one run reset the
 * other's working copy. Refused when it would lie inside the repository.
 */
export function sandboxOf(
  suite: string,
  series: string,
  root = SANDBOX_DIR,
  repoRoot = ROOT_DIR,
): string {
  const checkout = `${basename(repoRoot)}-${createHash("sha256").update(repoRoot).digest("hex").slice(0, 8)}`;
  const dir = join(root, checkout, suite, series);
  const path = relative(repoRoot, dir);
  const outside = path === ".." || path.startsWith(`..${sep}`) || isAbsolute(path);
  if (!outside) {
    throw new Error(
      `the bench sandbox ${dir} lies inside the repository; point XDG_CACHE_HOME elsewhere`,
    );
  }
  return dir;
}

export interface Versions {
  readonly fixture: FixturePin;
}

export function readVersions(file = join(ROOT_DIR, "versions.json")): Versions {
  return JSON.parse(readFileSync(file, "utf8")) as Versions;
}

export function resultsFile(resultsDir: string, suite: string, series: string): string {
  return join(resultsDir, suite, `${series}.jsonl`);
}

/** A series' directory under `.runs/`; raw records sit in its `raw` subdirectory. */
export function seriesDir(runsDir: string, suite: string, series: string): string {
  return join(runsDir, "series", suite, series);
}

/** The series of a suite that have a results file, sorted: the inverse of `resultsFile`. */
export function seriesNames(resultsDir: string, suite: string): string[] {
  const dir = join(resultsDir, suite);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".jsonl"))
    .map((file) => file.slice(0, -".jsonl".length))
    .sort();
}
