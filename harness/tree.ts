// Verify the working tree is clean before running a series: changes outside
// results/ and .bdk/ must be committed. All sessions in a run are on the same
// commit; session changes live in results/ and .bdk/; uncommitted project changes
// would interfere with reproducibility.
import { execFileSync } from "node:child_process";
import { ROOT_DIR } from "./paths.ts";

/**
 * Get the full commit hash of HEAD.
 */
export function headCommit(repoRoot: string = ROOT_DIR): string {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: "pipe",
  }).trim();
}

/**
 * Assert that the working tree is clean outside results/ and .bdk/.
 * Throws if there are uncommitted changes to tracked files or untracked files
 * outside these directories.
 */
export function assertCommitted(repoRoot: string = ROOT_DIR): void {
  const status = execFileSync("git", ["status", "--porcelain", ":!results", ":!.bdk"], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: "pipe",
  }).trim();

  if (status) {
    const lines = status.split("\n");
    const paths = lines.map((line) => line.replace(/^.. /, "")).join("\n");
    throw new Error(`commit the working tree before a series; the rows record HEAD:\n${paths}`);
  }
}
