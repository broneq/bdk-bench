---
schema: 1
id: L-qiayxtz6
type: finding
summary: 04-3 has no case pinning entry id file://.../harness/provider.ts; the gap let L-dzhorbso ship
status: accepted
source: agent:verifier
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T20:50:07.706Z
ticket: A-2snzg4fp
refs:
  - .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/04-run-lifecycle.md
  - 04-3
  - L-dzhorbso
  - BDK-EJ-2
review: true
level: nice-to-have
disposition: defer
---

04-run-lifecycle.md:74-80 (04-3 test cases) check plugins, per-run fields, max_turns and env of `config.sdk`, and `config.workflow`, but no case states that the entry's `id` is `file://<root>/harness/provider.ts`. That `id` is what makes promptfoo load the harness provider (architecture.md "Isolation": only the harness provider can give each run its own directories). Without a case, the implementation rendered `anthropic:claude-agent-sdk` directly and every run shared one working directory (L-dzhorbso, found only at review).

The code now covers it: harness/providers.test.ts:10 (`expect(entry.id).toMatch(/\/harness\/provider\.ts$/)`) and harness/runner.test.ts:90-93 (every rendered provider names harness/provider.ts and `config.workflow` equals its label). So the behaviour is tested and this is a finding, not a blocker.

Suggested fix: add to 04-3 "the entry's `id` is `file://` followed by the absolute path of `harness/provider.ts`", and to 05-2 "each rendered provider names the harness provider", so a re-plan or re-execution keeps the seam.

Triaged as nice-to-have at 2026-10-06T20:50:41.877Z

Decided defer at 2026-10-06T21:15:03.354Z
