---
schema: 1
id: L-i3qunljw
type: finding
summary: "Risk public-api: rendered provider entry now file://harness/provider.ts with config {workflow, sdk}"
status: accepted
source: agent:integration-reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T20:46:10.957Z
ticket: A-1pnrlzrw
group: integration
refs:
  - public-api
  - harness/providers.ts
  - harness/runner.ts
review: true
level: nice-to-have
disposition: defer
---

Problem: Severity low, not blocking. The exported `ProviderEntry` (harness/providers.ts:13-17) changes from `{ id: "anthropic:claude-agent-sdk", config: Record<string, unknown> }` to `{ id: string, config: RunProviderConfig }`, and the `providers` entries of every rendered `promptfooconfig.json` (harness/runner.ts:109-112) change accordingly: `id` is an absolute `file://` path to harness/provider.ts and the SDK options sit under `config.sdk`. The consumers in the repository (runner.ts `modelsOf`, suite.test.ts, providers.test.ts, runner.test.ts) were all updated, and promptfoo loads the new shape (L-5590ogrm).

Why it matters: The rendered config is a file format promptfoo and the viewer consume; it now embeds the absolute checkout path, so a rendered config is valid only on the machine that rendered it, and any later tool reading `providers[].config.model` must read `config.sdk.model`. This matches the source at 825455dd and plan 04-3, so it is intended.

Suggested fix: None required. Keep the runner.test.ts seam test (id ends with /harness/provider.ts, config.workflow equals label) as the guard of this contract.

Triaged as nice-to-have at 2026-10-06T20:46:40.722Z

Decided defer at 2026-10-06T21:15:03.177Z
