---
schema: 1
id: L-7hqcoik5
type: observation
summary: tools.ts evaluate, validateConfig and view have no tests; tree.test.ts has narrating comments
status: accepted
source: agent:reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T21:28:26.044Z
ticket: A-eq1itdbh
group: p03
refs:
  - harness/tools.ts
review: true
level: nice-to-have
disposition: defer
---

Problem: only promptfooEnv is tested, as the plan lists; the spawn wrappers (exit code passthrough, cwd, env merge) are uncovered. tree.test.ts carries comments like "Create new files in allowed directories" (BDK-CQ-4).

Why it matters: the wrappers are exercised later by the commands part and check; comments are a style matter for simplify.

Suggested fix: cover exit-code passthrough with a fake promptfoo bin in a temp rootDir if cheap; drop the narrating comments.

Triaged as nice-to-have at 2026-10-06T21:31:07.393Z

Decided defer at 2026-10-06T21:33:05.241Z
