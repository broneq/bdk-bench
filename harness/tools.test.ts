import { homedir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { promptfooEnv } from "./tools.ts";

describe("promptfooEnv", () => {
  it("keeps the promptfoo state under XDG_CACHE_HOME when it is set", () => {
    expect(promptfooEnv({ XDG_CACHE_HOME: "/c" }).PROMPTFOO_CONFIG_DIR).toBe(
      "/c/bdk-bench/promptfoo",
    );
  });

  it("falls back to $HOME/.cache, never to ~/.promptfoo", () => {
    const dir = promptfooEnv({ HOME: "/h" }).PROMPTFOO_CONFIG_DIR;
    expect(dir).toBe("/h/.cache/bdk-bench/promptfoo");
    expect(dir).not.toContain(".promptfoo");
  });

  it("falls back to the home directory when HOME is unset", () => {
    expect(promptfooEnv({}).PROMPTFOO_CONFIG_DIR).toBe(
      join(homedir(), ".cache", "bdk-bench", "promptfoo"),
    );
  });

  it("turns telemetry and update checks off", () => {
    const env = promptfooEnv({ HOME: "/h" });
    expect(env.PROMPTFOO_DISABLE_TELEMETRY).toBe("1");
    expect(env.PROMPTFOO_DISABLE_UPDATE).toBe("1");
  });
});
