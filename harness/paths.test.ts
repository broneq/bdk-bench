import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { ROOT_DIR, readVersions, resultsFile, sandboxOf } from "./paths.ts";

describe("sandboxOf", () => {
  it("places a series' sandbox under the sandbox root and the checkout name", () => {
    const dir = sandboxOf("smoke", "s1", "/c", "/r/bdk-bench");
    expect(dir.startsWith("/c/bdk-bench-")).toBe(true);
    expect(dir.endsWith("/smoke/s1")).toBe(true);
    expect(dir).toMatch(/^\/c\/bdk-bench-[0-9a-f]{8}\/smoke\/s1$/);
  });

  it("gives two repository roots with the same basename different sandboxes", () => {
    const a = sandboxOf("smoke", "s1", "/c", "/r/bdk-bench");
    const b = sandboxOf("smoke", "s1", "/c", "/r/worktrees/bdk-bench");
    expect(a).not.toBe(b);
  });

  it("refuses a sandbox root inside the repository", () => {
    expect(() => sandboxOf("smoke", "s1", `${ROOT_DIR}/.cache`)).toThrow(/inside the repository/);
  });
});

describe("resultsFile", () => {
  it("names one jsonl file per series under the results directory", () => {
    expect(resultsFile("smoke", "s1", "/x")).toBe("/x/results/smoke/s1.jsonl");
  });
});

describe("readVersions", () => {
  it("returns the pinned fixture of a versions file", () => {
    const file = join(mkdtempSync(join(tmpdir(), "versions-")), "versions.json");
    writeFileSync(file, JSON.stringify({ fixture: { repository: "r", commit: "c" } }));
    expect(readVersions(file).fixture).toEqual({ repository: "r", commit: "c" });
  });
});
