// Verify the working tree is clean before running a series, so the rows record
// the commit that ran. results/ (new rows) and .bdk/ (workflow state of the
// session that builds the bench) are exempt.
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
  const output = execFileSync(
    "git",
    ["status", "--porcelain", "--untracked-files=all", ":!results", ":!.bdk"],
    { cwd: repoRoot, encoding: "utf8", stdio: "pipe" },
  );
  const paths = output
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3));

  if (paths.length > 0) {
    throw new Error(
      `commit the working tree before a series; the rows record HEAD:\n${paths.join("\n")}`,
    );
  }
}
