import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Measurement, RunContext, SuiteHooks } from "../../hook.ts";

const EXPECTED_CONTENT = "hello";

function measure(context: RunContext): Promise<Measurement> {
  let content: string | null = null;
  try {
    content = readFileSync(join(context.paths.workDir, "HELLO.md"), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const completed = content?.trim() === EXPECTED_CONTENT ? 1 : 0;
  return Promise.resolve({ metrics: { completed }, extraCost: 0 });
}

export const hooks: SuiteHooks = {
  measure,
  passOf: (metrics) => metrics.completed === 1,
};
