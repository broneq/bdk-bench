---
schema: 1
id: L-tya33mi7
type: observation
summary: sandboxOf containment check is lexical; a symlinked cache root inside the repo is not detected
status: proposed
source: agent:reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T21:28:25.896Z
ticket: A-eq1itdbh
group: p03
refs:
  - harness/paths.ts
level: nice-to-have
---

Problem: sandboxOf compares path.relative of unresolved strings (paths.ts:40-41), so an XDG_CACHE_HOME that is a symlink into the repository passes the check.

Why it matters: a session could then see the repository's own files, which the check exists to prevent. Unlikely in practice, low severity.

Suggested fix: optionally realpath the existing root before comparing; otherwise accept and leave as is.

Triaged as nice-to-have at 2026-10-06T21:31:07.269Z
