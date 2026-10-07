// The pinned tool package: promptfoo and the Agent SDK are dependencies of the
// root package and install with `pnpm install` into `<root>/node_modules`, an
// ancestor of every rendered config, so promptfoo resolves the SDK from it.
import { execFileSync, spawn } from "node:child_process";
import { join } from "node:path";

import { cacheHome } from "./paths.ts";

function promptfooBin(rootDir: string): string {
  return join(rootDir, "node_modules/.bin/promptfoo");
}

/**
 * Environment of every promptfoo call: no telemetry, no update check, and its
 * state under the cache directory instead of `~/.promptfoo`.
 */
export function promptfooEnv(
  env: Readonly<Record<string, string | undefined>>,
): Record<string, string> {
  return {
    PROMPTFOO_DISABLE_TELEMETRY: "1",
    PROMPTFOO_DISABLE_UPDATE: "1",
    PROMPTFOO_CONFIG_DIR: join(cacheHome(env), "bdk-bench", "promptfoo"),
  };
}

/** Validates a rendered config with the pinned promptfoo; no credentials, no model call. */
export function validateConfig(rootDir: string, config: string): void {
  execFileSync(promptfooBin(rootDir), ["validate", "config", "-c", config], {
    stdio: "pipe",
    env: { ...process.env, ...promptfooEnv(process.env) },
  });
}

function runPromptfoo(
  rootDir: string,
  args: readonly string[],
  extraEnv: Readonly<Record<string, string>> = {},
): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(promptfooBin(rootDir), args, {
      cwd: rootDir,
      stdio: "inherit",
      env: { ...process.env, ...promptfooEnv(process.env), ...extraEnv },
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolve(code ?? 1);
    });
  });
}

/**
 * Runs a series and resolves to promptfoo's exit code: 0 all assertions
 * passed, 100 some failed (a measured outcome, not an error), anything else a
 * failure.
 */
export function evaluate(
  rootDir: string,
  config: string,
  output: string,
  env: Readonly<Record<string, string>>,
): Promise<number> {
  return runPromptfoo(rootDir, ["eval", "--no-cache", "-c", config, "-o", output], env);
}

/** Opens the promptfoo viewer on the stored results; resolves to its exit code. */
export function view(rootDir: string): Promise<number> {
  return runPromptfoo(rootDir, ["view"]);
}
