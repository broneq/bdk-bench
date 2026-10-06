// Fixed locations of the harness: configs and raw outputs live under `.runs/`
// (gitignored), what a session sees lives in a sandbox outside the repository;
// only result rows are committed.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import type { FixturePin } from "./fixture.ts";

export const ROOT_DIR = dirname(dirname(fileURLToPath(import.meta.url)));
export const RUNS_DIR = join(ROOT_DIR, ".runs");
export const LEDGER_FILE = join(RUNS_DIR, "budget.json");

/**
 * Working copies and config homes: outside the repository, because a session
 * that walks up from its working copy must not find the repository's own files.
 */
export const SANDBOX_DIR = join(
  process.env.XDG_CACHE_HOME ?? join(homedir(), ".cache"),
  "bdk-bench",
);

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
  if (!path.startsWith("..") && !isAbsolute(path)) {
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

export function resultsFile(suite: string, series: string, root = ROOT_DIR): string {
  return join(root, "results", suite, `${series}.jsonl`);
}
