import { describe, expect, it } from "vitest";

import { sessionProvider } from "./providers.ts";

const base = { label: "plain", model: "m", plugin: null, maxBudgetUsd: 1 };

describe("sessionProvider", () => {
  it("gives a workflow without a plugin an empty plugin list and its label", () => {
    const entry = sessionProvider(base);
    expect(entry.id).toBe("anthropic:claude-agent-sdk");
    expect(entry.config).toMatchObject({
      workflow: "plain",
      plugins: [],
      model: "m",
      max_budget_usd: 1,
    });
  });

  it("loads a plugin directory as the only local plugin", () => {
    const entry = sessionProvider({ ...base, plugin: "/p" });
    expect(entry.config).toHaveProperty("plugins", [{ type: "local", path: "/p" }]);
  });

  it("leaves the per-run fields to the provider", () => {
    const config = sessionProvider(base).config;
    expect(config).not.toHaveProperty("working_dir");
    expect(config).not.toHaveProperty("debug_file");
  });

  it("sets max_turns and ask_user_question only when given", () => {
    const bare = sessionProvider(base).config;
    expect(bare).not.toHaveProperty("max_turns");
    expect(bare).not.toHaveProperty("ask_user_question");
    const set = sessionProvider({ ...base, maxTurns: 5, askUserQuestion: true }).config;
    expect(set).toHaveProperty("max_turns", 5);
    expect(set).toHaveProperty("ask_user_question", { behavior: "first_option" });
  });

  it("isolates settings, connectors, git config and permissions", () => {
    expect(sessionProvider(base).config).toMatchObject({
      apiKeyRequired: false,
      setting_sources: ["project"],
      permission_mode: "bypassPermissions",
      allow_dangerously_skip_permissions: true,
      allow_all_tools: true,
      forward_subagent_text: true,
      env: {
        ENABLE_CLAUDEAI_MCP_SERVERS: "false",
        GIT_CONFIG_GLOBAL: "/dev/null",
        GIT_CONFIG_NOSYSTEM: "1",
      },
    });
  });
});
