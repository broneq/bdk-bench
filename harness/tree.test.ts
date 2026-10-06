import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { assertCommitted, headCommit } from "./tree.ts";

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function temp(): string {
  const dir = mkdtempSync(join(tmpdir(), "test-repo-"));
  tempDirs.push(dir);
  return dir;
}

function initRepo(dir: string): void {
  execFileSync("git", ["init", "--quiet", "--initial-branch", "main"], { cwd: dir });
  execFileSync("git", ["config", "user.name", "Test"], { cwd: dir });
  execFileSync("git", ["config", "user.email", "test@test.invalid"], { cwd: dir });
  execFileSync("git", ["config", "commit.gpgsign", "false"], { cwd: dir });
  execFileSync("git", ["config", "maintenance.auto", "false"], { cwd: dir });
  execFileSync("git", ["config", "gc.auto", "0"], { cwd: dir });
}

function makeCommit(dir: string, message: string): void {
  execFileSync("git", ["commit", "--quiet", "--allow-empty", "-m", message], { cwd: dir });
}

describe("headCommit", () => {
  it("returns 40 hex characters equal to git rev-parse HEAD", () => {
    const dir = temp();
    initRepo(dir);
    makeCommit(dir, "initial commit");

    const hash = headCommit(dir);
    const expected = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: dir,
      encoding: "utf8",
    }).trim();

    expect(hash).toBe(expected);
    expect(hash).toMatch(/^[0-9a-f]{40}$/);
  });
});

describe("assertCommitted", () => {
  it("passes when the repository is clean", () => {
    const dir = temp();
    initRepo(dir);
    makeCommit(dir, "initial commit");

    expect(() => {
      assertCommitted(dir);
    }).not.toThrow();
  });

  it("passes when there are new files in results/ and .bdk/", () => {
    const dir = temp();
    initRepo(dir);
    makeCommit(dir, "initial commit");

    // Create new files in allowed directories
    mkdirSync(join(dir, "results", "smoke"), { recursive: true });
    writeFileSync(join(dir, "results", "smoke", "s1.jsonl"), "test");

    mkdirSync(join(dir, ".bdk", "changes", "x"), { recursive: true });
    writeFileSync(join(dir, ".bdk", "changes", "x", "design.md"), "test");

    expect(() => {
      assertCommitted(dir);
    }).not.toThrow();
  });

  it("throws when README.md is modified", () => {
    const dir = temp();
    initRepo(dir);
    writeFileSync(join(dir, "README.md"), "initial");
    execFileSync("git", ["add", "README.md"], { cwd: dir });
    makeCommit(dir, "add README");

    // Modify README.md
    writeFileSync(join(dir, "README.md"), "modified");

    expect(() => {
      assertCommitted(dir);
    }).toThrow(/README.md/);
    expect(() => {
      assertCommitted(dir);
    }).toThrow(/commit the working tree before a series/);
  });

  it("throws when there is an untracked file outside results/ and .bdk/", () => {
    const dir = temp();
    initRepo(dir);
    makeCommit(dir, "initial commit");

    // Create untracked file in src/
    mkdirSync(join(dir, "src"), { recursive: true });
    writeFileSync(join(dir, "src", "new.ts"), "test");

    expect(() => {
      assertCommitted(dir);
    }).toThrow(/src\/new\.ts/);
    expect(() => {
      assertCommitted(dir);
    }).toThrow(/commit the working tree before a series/);
  });

  it("lists a modified tracked file by its bare path", () => {
    const dir = temp();
    initRepo(dir);
    writeFileSync(join(dir, "README.md"), "initial");
    execFileSync("git", ["add", "README.md"], { cwd: dir });
    makeCommit(dir, "add README");
    writeFileSync(join(dir, "README.md"), "modified");

    expect(() => {
      assertCommitted(dir);
    }).toThrow(/:\nREADME\.md$/);
  });
});
