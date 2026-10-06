import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  BudgetReached,
  assertCanStart,
  costOf,
  projection,
  readLedger,
  record,
  runCap,
  spent,
} from "./budget.ts";

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function ledgerPath(): string {
  const dir = mkdtempSync(join(tmpdir(), "bench-budget-"));
  dirs.push(dir);
  return join(dir, "budget.json");
}

describe("ledger", () => {
  it("reads a missing file as no entries and sums runs of different suites", () => {
    const path = ledgerPath();
    expect(readLedger(path).entries).toEqual([]);
    expect(spent(readLedger(path))).toBe(0);
    record(path, { suite: "probe", workflow: "plain", run: 1, cost: 2.5 });
    record(path, { suite: "series", workflow: "bdk", run: 1, cost: 0.25 });
    const ledger = readLedger(path);
    expect(ledger.entries).toHaveLength(2);
    expect(spent(ledger)).toBeCloseTo(2.75);
    expect(ledger.entries[0]?.at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("records the workflow of a run and no cell key", () => {
    const path = ledgerPath();
    record(path, { suite: "probe", workflow: "plain", run: 1, cost: 1 });
    const [entry] = (JSON.parse(readFileSync(path, "utf8")) as { entries: object[] }).entries;
    expect(entry).toMatchObject({ suite: "probe", workflow: "plain", run: 1, cost: 1 });
    expect(entry).not.toHaveProperty("cell");
  });

  it("refuses to start a run once the spent cost reaches the budget, naming it", () => {
    const path = ledgerPath();
    record(path, { suite: "series", workflow: "plain", run: 1, cost: 60 });
    expect(() => {
      assertCanStart(readLedger(path), 100);
    }).not.toThrow();
    record(path, { suite: "series", workflow: "plain", run: 2, cost: 40 });
    expect(() => {
      assertCanStart(readLedger(path), 100);
    }).toThrow(BudgetReached);
    expect(() => {
      assertCanStart(readLedger(path), 100);
    }).toThrow("budget reached: 100.00 USD spent of 100 USD");
    expect(() => {
      assertCanStart(readLedger(path), 150);
    }).not.toThrow();
  });
});

describe("per-run cap", () => {
  it("is the smaller of the remaining budget and the per-run cap, never negative", () => {
    const path = ledgerPath();
    record(path, { suite: "series", workflow: "plain", run: 1, cost: 10 });
    expect(runCap(readLedger(path), 100, 15)).toBe(15);
    record(path, { suite: "series", workflow: "plain", run: 2, cost: 85 });
    expect(runCap(readLedger(path), 100, 15)).toBeCloseTo(5);
    record(path, { suite: "series", workflow: "plain", run: 3, cost: 25 });
    expect(runCap(readLedger(path), 100, 15)).toBe(0);
  });
});

describe("projection", () => {
  it("multiplies each workflow's probe cost by the runs per workflow", () => {
    expect(projection({ plain: 0.5 }, 5)).toEqual({ perCell: { plain: 2.5 }, total: 2.5 });
  });
});

describe("costOf", () => {
  it("reads the provider's reported cost", () => {
    expect(costOf({ response: { cost: 0.03 } })).toBe(0.03);
  });

  it("falls back to the sum of the per-model costs", () => {
    const result = {
      response: {
        metadata: {
          modelUsage: { "claude-opus-5-5": { costUSD: 1.5 }, "claude-haiku-4-5": { costUSD: 0.5 } },
        },
      },
    };
    expect(costOf(result)).toBe(2);
  });

  it("refuses a result without any cost, so the ledger never undercounts silently", () => {
    expect(() => costOf({ response: {} })).toThrow(/no cost/);
  });
});
