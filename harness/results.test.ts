import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { appendRow, modelsOf, readRows, writeRows } from "./results.ts";
import type { ResultRow } from "./results.ts";

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const SHA = "a".repeat(40);

function row(overrides: Partial<ResultRow> = {}): ResultRow {
  return {
    suite: "bench",
    series: "series-2026-10-06",
    workflow: "plain",
    item: "task",
    run: 1,
    discarded: null,
    cost: 2.5,
    metrics: { functional: 1, quality: 0.9, tests: null },
    provenance: {
      models: ["claude-opus-5-5", "claude-sonnet-5"],
      fixtureCommit: SHA,
      benchCommit: SHA,
      adapter: { name: "plain", version: "1.0.0" },
    },
    ...overrides,
  };
}

function tempFile(): string {
  const dir = mkdtempSync(join(tmpdir(), "bench-results-"));
  dirs.push(dir);
  return join(dir, "nested/series.jsonl");
}

describe("result rows", () => {
  it("appends rows as JSONL and reads them back equal and in order", () => {
    const file = tempFile();
    const first = row();
    const second = row({ run: 2, discarded: "provider error" });
    appendRow(file, first);
    appendRow(file, second);
    expect(readRows(file)).toEqual([first, second]);
  });

  it("replaces the file content with the rows written and validates each", () => {
    const file = tempFile();
    appendRow(file, row({ run: 9 }));
    writeRows(file, [row({ run: 1 }), row({ run: 2 })]);
    expect(readRows(file).map((read) => read.run)).toEqual([1, 2]);
    const provenance = { ...row().provenance, benchCommit: "abc" };
    expect(() => {
      writeRows(file, [row({ provenance })]);
    }).toThrow(/benchCommit/);
  });

  it("refuses a row with an empty adapter version", () => {
    const provenance = { ...row().provenance, adapter: { name: "plain", version: "" } };
    expect(() => {
      appendRow(tempFile(), row({ provenance }));
    }).toThrow(/adapter/);
  });

  it("refuses a row with an empty adapter name", () => {
    const provenance = { ...row().provenance, adapter: { name: "", version: "1.0.0" } };
    expect(() => {
      appendRow(tempFile(), row({ provenance }));
    }).toThrow(/adapter/);
  });

  it("refuses a counted row without models", () => {
    expect(() => {
      appendRow(tempFile(), row({ provenance: { ...row().provenance, models: [] } }));
    }).toThrow(/models/);
  });

  it("accepts a discarded row without models", () => {
    const file = tempFile();
    appendRow(
      file,
      row({ discarded: "provider error", provenance: { ...row().provenance, models: [] } }),
    );
    expect(readRows(file)).toHaveLength(1);
  });

  it("refuses a benchCommit that is not a commit", () => {
    expect(() => {
      appendRow(tempFile(), row({ provenance: { ...row().provenance, benchCommit: "abc" } }));
    }).toThrow(/benchCommit/);
  });

  it("refuses a fixtureCommit that is not a commit and accepts null", () => {
    expect(() => {
      appendRow(tempFile(), row({ provenance: { ...row().provenance, fixtureCommit: "main" } }));
    }).toThrow(/fixtureCommit/);
    const file = tempFile();
    appendRow(file, row({ provenance: { ...row().provenance, fixtureCommit: null } }));
    expect(readRows(file)).toHaveLength(1);
  });

  it("returns an empty list for a file that does not exist", () => {
    expect(readRows(tempFile())).toEqual([]);
  });

  it("reads the model ids a session reports, sorted", () => {
    expect(modelsOf({ response: { metadata: { modelUsage: { b: {}, a: {} } } } })).toEqual([
      "a",
      "b",
    ]);
    expect(modelsOf({ response: {} })).toEqual([]);
  });
});
