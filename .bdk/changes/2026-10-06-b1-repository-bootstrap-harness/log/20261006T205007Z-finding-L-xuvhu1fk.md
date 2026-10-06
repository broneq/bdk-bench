---
schema: 1
id: L-xuvhu1fk
type: finding
summary: 05-commands.md:49 still has placeholder commit abcdef0123…; L-3xo22umd triage says it was replaced
status: accepted
source: agent:verifier
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T20:50:07.821Z
ticket: A-2snzg4fp
refs:
  - .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/05-commands.md
  - L-3xo22umd
  - BDK-PL-2
review: true
level: nice-to-have
disposition: defer
---

05-commands.md:49 reads "the description of series `s1` of suite `smoke` at commit `abcdef0123…` with model `m` is `smoke s1 bench@abcdef0 m`". L-3xo22umd was resolved as not-a-problem with the note "plan placeholder replaced in 05-2", but `git log -S` shows the text unchanged since 22663df. The implementation used a full commit (harness/runner.test.ts:19 `abcdef0123456789abcdef0123456789abcdef01`), so nothing broke; the plan text and the triage claim disagree (BDK-PL-2).

Suggested fix: write the full 40-hex commit into 05-commands.md:49.

Triaged as nice-to-have at 2026-10-06T20:50:41.795Z

Triaged as nice-to-have at 2026-10-06T20:50:41.956Z

Decided defer at 2026-10-06T21:15:03.443Z
