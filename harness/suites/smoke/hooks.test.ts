import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { loadSuiteHooks } from "../../hook.ts";
import type { EvalResult, RunContext } from "../../hook.ts";
import { hooks } from "./hooks.ts";

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function contextWith(content: string | null): RunContext {
  const workDir = mkdtempSync(join(tmpdir(), "smoke-hooks-"));
  dirs.push(workDir);
  if (content !== null) writeFileSync(join(workDir, "HELLO.md"), content);
  return { paths: { workDir } } as unknown as RunContext;
}

const result: EvalResult = {};

describe("smoke hooks", () => {
  it("counts HELLO.md holding hello as completed", async () => {
    const measurement = await hooks.measure(contextWith("hello\n"), result);
    expect(measurement).toEqual({ metrics: { completed: 1 }, extraCost: 0 });
    expect(hooks.passOf?.(measurement.metrics)).toBe(true);
  });

  it("counts a missing HELLO.md as not completed", async () => {
    const measurement = await hooks.measure(contextWith(null), result);
    expect(measurement.metrics).toEqual({ completed: 0 });
    expect(hooks.passOf?.(measurement.metrics)).toBe(false);
  });

  it.each(["hello world", "Hello"])("counts %j as not completed", async (content) => {
    const measurement = await hooks.measure(contextWith(content), result);
    expect(measurement.metrics).toEqual({ completed: 0 });
  });

  it("is what loadSuiteHooks resolves for smoke", async () => {
    expect(await loadSuiteHooks("smoke")).toBe(hooks);
  });
});
