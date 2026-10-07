import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  ROOT_DIR,
  cacheHome,
  readVersions,
  resultsFile,
  sandboxOf,
  seriesDir,
  seriesNames,
} from "./paths.ts";

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

describe("sandboxOf with a dot-prefixed directory", () => {
  it("accepts a sandbox root outside the repository whose name merely starts with two dots", () => {
    expect(() => sandboxOf("smoke", "s1", "/c/..cache", "/r/bdk-bench")).not.toThrow();
    expect(() => sandboxOf("smoke", "s1", "/r/bdk-bench/..cache", "/r/bdk-bench")).toThrow(
      /inside the repository/,
    );
  });
});

describe("cacheHome", () => {
  it("prefers XDG_CACHE_HOME, then HOME, then the home directory", () => {
    expect(cacheHome({ XDG_CACHE_HOME: "/c", HOME: "/h" })).toBe("/c");
    expect(cacheHome({ HOME: "/h" })).toBe("/h/.cache");
    expect(cacheHome({}, "/pw")).toBe("/pw/.cache");
  });

  it("ignores an empty or relative XDG_CACHE_HOME and HOME", () => {
    expect(cacheHome({ XDG_CACHE_HOME: "", HOME: "/h" })).toBe("/h/.cache");
    expect(cacheHome({ XDG_CACHE_HOME: "rel", HOME: "/h" })).toBe("/h/.cache");
    expect(cacheHome({ XDG_CACHE_HOME: "", HOME: "" }, "/pw")).toBe("/pw/.cache");
    expect(cacheHome({ HOME: "rel" }, "/pw")).toBe("/pw/.cache");
  });
});

describe("cacheHome without an injected fallback", () => {
  it("is absolute even when HOME is empty or relative", () => {
    expect(isAbsolute(cacheHome({ HOME: "" }))).toBe(true);
    expect(isAbsolute(cacheHome({ HOME: "rel" }))).toBe(true);
  });
});

describe("seriesDir", () => {
  it("names one directory per series under the runs directory", () => {
    expect(seriesDir("/x/.runs", "smoke", "s1")).toBe("/x/.runs/series/smoke/s1");
  });
});

describe("seriesNames", () => {
  it("lists the series of a suite from its result files, sorted, and none when absent", () => {
    const dir = mkdtempSync(join(tmpdir(), "results-"));
    expect(seriesNames(dir, "smoke")).toEqual([]);
    mkdirSync(join(dir, "smoke"));
    writeFileSync(resultsFile(dir, "smoke", "b"), "");
    writeFileSync(resultsFile(dir, "smoke", "a"), "");
    writeFileSync(join(dir, "smoke", "notes.md"), "");
    expect(seriesNames(dir, "smoke")).toEqual(["a", "b"]);
  });
});

describe("resultsFile", () => {
  it("names one jsonl file per series under the results directory", () => {
    expect(resultsFile("/x/results", "smoke", "s1")).toBe("/x/results/smoke/s1.jsonl");
  });
});

describe("readVersions", () => {
  it("returns the pinned fixture of a versions file", () => {
    const file = join(mkdtempSync(join(tmpdir(), "versions-")), "versions.json");
    writeFileSync(file, JSON.stringify({ fixture: { repository: "r", commit: "c" } }));
    expect(readVersions(file).fixture).toEqual({ repository: "r", commit: "c" });
  });
});
