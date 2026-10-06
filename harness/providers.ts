// Provider entries of the rendered configs. Every entry is
// `anthropic:claude-agent-sdk`; the options that keep a run isolated and
// measurable are set here once, not per suite. The per-run fields (working
// directory, debug file, config home) are added by the provider.

export interface ProviderEntry {
  readonly id: "anthropic:claude-agent-sdk";
  /** The workflow name: tests select their workflow by this label. */
  readonly label: string;
  readonly config: Readonly<Record<string, unknown>>;
}

export interface SessionWorkflow {
  readonly label: string;
  readonly model: string;
  /** The workflow's plugin directory, or null for a session with no directory-loaded plugin. */
  readonly plugin: string | null;
  readonly maxBudgetUsd: number;
  readonly maxTurns?: number;
  /**
   * Offers `AskUserQuestion`. The SDK exposes the tool only to a session with
   * a permission callback, which promptfoo installs for `ask_user_question`.
   */
  readonly askUserQuestion?: boolean;
}

/** A full Claude Code session in a fixture copy, started like a user would start it. */
export function sessionProvider(workflow: SessionWorkflow): ProviderEntry {
  return {
    id: "anthropic:claude-agent-sdk",
    label: workflow.label,
    config: {
      // An API key or a logged-in Claude Code both authenticate the SDK.
      apiKeyRequired: false,
      workflow: workflow.label,
      // Merged over the harness's own environment by the provider.
      env: {
        // claude.ai connectors load unless switched off.
        ENABLE_CLAUDEAI_MCP_SERVERS: "false",
        // The fixture's local config holds the identity; no user signing, hooks path or alias.
        GIT_CONFIG_GLOBAL: "/dev/null",
        GIT_CONFIG_NOSYSTEM: "1",
      },
      model: workflow.model,
      plugins: workflow.plugin === null ? [] : [{ type: "local", path: workflow.plugin }],
      // Project settings only: no user plugin, user CLAUDE.md or user MCP server.
      setting_sources: ["project"],
      permission_mode: "bypassPermissions",
      allow_dangerously_skip_permissions: true,
      // The Agent tool is off without it.
      allow_all_tools: true,
      // Otherwise promptfoo strips subagent transcripts from what the orchestrator sees.
      forward_subagent_text: true,
      max_budget_usd: workflow.maxBudgetUsd,
      ...(workflow.maxTurns === undefined ? {} : { max_turns: workflow.maxTurns }),
      ...(workflow.askUserQuestion === true
        ? { ask_user_question: { behavior: "first_option" } }
        : {}),
    },
  };
}
