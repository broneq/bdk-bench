---
schema: 1
id: L-cqwh6vbp
type: observation
summary: cli accepts stray args after check and view, and a repeated flag silently takes the last value
status: proposed
source: agent:reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T20:32:33.561Z
ticket: A-qy7ysb9p
group: p05
refs:
  - harness/cli.ts:151
level: nice-to-have
---

Problem: parseArgs returns for "check" and "view" without looking at the rest, so "check foo" succeeds. Report and regrade flagValues also let a repeated flag override silently, and pairs flags by position (a missing value shifts the next flag in as the value).

Why it matters: harmless for a human-run CLI; it only hides typos.

Suggested fix: optionally throw UsageError on extra args for check and view.

Triaged as nice-to-have at 2026-10-06T20:35:39.740Z
