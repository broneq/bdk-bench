---
schema: 1
id: L-lwx3j8iz
type: observation
summary: sandboxOf inside-repo test only covers one case; '..'-prefixed names misread as outside
status: proposed
source: agent:reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T20:31:52.033Z
ticket: A-qy7ysb9p
group: p03
refs:
  - harness/paths.ts
review: true
level: blocker
disposition: fix
---

Problem: harness/paths.ts:39 uses `path.startsWith("..")` on the relative path, so a sandbox directory whose first segment merely starts with two dots (e.g. `..cache` inside the repository) would be accepted as outside. The `dir === repoRoot` case throws correctly.

Why it matters: edge case only; the guard is a safety net for a misconfigured XDG_CACHE_HOME and a miss is unlikely.

Suggested fix: optional; compare `path === ".." || path.startsWith(`..${sep}`)`.

Triaged as nice-to-have at 2026-10-06T20:35:39.481Z

Decided fix at 2026-10-06T21:15:02.013Z
