---
schema: 1
id: L-jo5q7no0
type: observation
summary: cacheHome ignores empty or relative XDG_CACHE_HOME and HOME; tools.ts shares it
status: proposed
source: agent:reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T21:39:01.610Z
ticket: A-f1miv2g3
group: p03
refs:
  - harness/paths.ts:18
level: nice-to-have
---

Problem: cacheHome gained validation (absolute paths only) beyond the plan, which says XDG_CACHE_HOME else $HOME/.cache. It is covered by tests and sensible.

Why it matters: Behaviour is a superset of the plan; promptfooEnv in tools.ts relies on it, so its plan test cases still hold.

Suggested fix: None required; keep plan part 03 in sync if kept.

Triaged as nice-to-have at 2026-10-06T21:40:37.129Z
