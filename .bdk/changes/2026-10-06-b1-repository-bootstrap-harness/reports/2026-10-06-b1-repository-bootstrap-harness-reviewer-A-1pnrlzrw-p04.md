---
schema: 1
ticket: A-1pnrlzrw
role: reviewer
at: 2026-10-06T20:43:53.986Z
group: p04
status: done
files: []
entries: []
evidence: []
---

# Review p04: harness/providers.ts and providers.test.ts

Verdict: no finding at scope high+.

Holds, against plan part 04-3:
- Exports ProviderEntry, SessionWorkflow (label, model, plugin|null, maxBudgetUsd, optional maxTurns, askUserQuestion) and sessionProvider; oneTurnProvider and OneTurnCell are gone.
- Fixed options all present: apiKeyRequired false, ENABLE_CLAUDEAI_MCP_SERVERS "false", GIT_CONFIG_GLOBAL /dev/null, GIT_CONFIG_NOSYSTEM 1, setting_sources ["project"], permission_mode bypassPermissions, allow_dangerously_skip_permissions, allow_all_tools, forward_subagent_text.
- config.workflow equals the label; the shape matches RunProviderConfig in provider.ts (workflow, sdk); no working_dir or debug_file.
- Optional max_turns and ask_user_question are omitted when absent.
- Tests cover every listed case (empty plugins and label, local plugin, no per-run fields, optional keys, isolation options). They assert produced config values, so they can fail on a real change. `vitest run harness/providers.test.ts`: 5 passed.
- No BDK vocabulary (T40, T43, cell, bdk*) remains in the files.

Missing tests: none required by the plan.
