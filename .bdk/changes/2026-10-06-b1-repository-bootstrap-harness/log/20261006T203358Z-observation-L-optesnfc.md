---
schema: 1
id: L-optesnfc
type: observation
summary: assertCommitted strips the status code from every line but the first; tree.ts comment misstates why .bdk/ is exempt
status: proposed
source: agent:integration-reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T20:33:58.064Z
ticket: A-qy7ysb9p
group: integration
refs:
  - harness/tree.ts
review: true
level: blocker
disposition: fix
---

Problem: harness/tree.ts:29 calls `.trim()` on the whole `git status --porcelain` output, which removes the leading space of a first line ` M README.md`; line 33's `/^.. /` then no longer matches it, so the message lists `M README.md` for that path. The header comment (lines 1-4) says "session changes live in results/ and .bdk/", but sessions run in the sandbox outside the repository; `.bdk/` is exempt for the workflow state of the session that builds the bench (design.md).

Why it matters: Cosmetic in the refusal message, and the test only checks the path is contained. The comment misleads a reader about what sessions may write into this repository, which matters for the neutrality rules.

Suggested fix: Split before trimming (`output.split("\n").filter(Boolean).map((line) => line.slice(3))`) and reword the comment to the design's reason.

Triaged as should-fix at 2026-10-06T20:35:39.310Z

Decided fix at 2026-10-06T21:15:00.174Z
