// The budget ledger: one JSON file that sums the cost of every run of every suite, so one cap covers all of them.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export const DEFAULT_BUDGET_USD = 100;
/** A single session's cap, so one runaway run cannot spend the whole budget. */
export const DEFAULT_RUN_CAP_USD = 15;

export interface LedgerEntry {
  readonly suite: string;
  readonly workflow: string;
  readonly run: number;
  readonly cost: number;
  readonly at: string;
}

export interface Ledger {
  readonly entries: readonly LedgerEntry[];
}

export class BudgetReached extends Error {
  constructor(spentUsd: number, budgetUsd: number) {
    super(
      `budget reached: ${spentUsd.toFixed(2)} USD spent of ${budgetUsd} USD; no new run starts (raise it with --budget)`,
    );
    this.name = "BudgetReached";
  }
}

export function readLedger(path: string): Ledger {
  if (!existsSync(path)) return { entries: [] };
  return JSON.parse(readFileSync(path, "utf8")) as Ledger;
}

export function spent(ledger: Ledger): number {
  return ledger.entries.reduce((sum, entry) => sum + entry.cost, 0);
}

export function record(path: string, entry: Omit<LedgerEntry, "at">): Ledger {
  const ledger = readLedger(path);
  const next: Ledger = {
    entries: [...ledger.entries, { ...entry, at: new Date().toISOString() }],
  };
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`);
  return next;
}

export function assertCanStart(ledger: Ledger, budgetUsd: number): void {
  const used = spent(ledger);
  if (used >= budgetUsd) throw new BudgetReached(used, budgetUsd);
}

/** The `max_budget_usd` of the next session. */
export function runCap(ledger: Ledger, budgetUsd: number, perRunCapUsd: number): number {
  return Math.max(0, Math.min(budgetUsd - spent(ledger), perRunCapUsd));
}

export interface Projection {
  readonly perWorkflow: Readonly<Record<string, number>>;
  readonly total: number;
}

export function projection(
  probeCostPerWorkflow: Readonly<Record<string, number>>,
  runsPerWorkflow: number,
): Projection {
  const perWorkflow = Object.fromEntries(
    Object.entries(probeCostPerWorkflow).map(([workflow, cost]) => [
      workflow,
      cost * runsPerWorkflow,
    ]),
  );
  const total = Object.values(perWorkflow).reduce((sum, cost) => sum + cost, 0);
  return { perWorkflow, total };
}

interface ProviderResult {
  readonly response?: {
    readonly cost?: number;
    readonly metadata?: { readonly modelUsage?: Record<string, { readonly costUSD?: number }> };
  };
}

/** The cost a promptfoo result reports. */
export function costOf(result: ProviderResult): number {
  const response = result.response;
  if (typeof response?.cost === "number") return response.cost;
  const usage = response?.metadata?.modelUsage;
  if (usage !== undefined) {
    return Object.values(usage).reduce((sum, model) => sum + (model.costUSD ?? 0), 0);
  }
  throw new Error("the provider result carries no cost; the ledger cannot count this run");
}
