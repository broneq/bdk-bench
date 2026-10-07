---
schema: 1
id: L-v6x9tm6a
type: observation
summary: README discard reasons list omits two harness discard causes
status: resolved
source: agent:reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T21:29:04.844Z
ticket: A-eq1itdbh
group: p07
refs:
  - README.md
review: true
level: blocker
disposition: fix
---

Problem: README.md Isolation (line 59) lists four discard reasons. harness/hook.ts also discards a run on "no reported cost" (ledger charges the run cap) and on "harness error: ...".

Why it matters: a reader seeing a discarded run with those reasons will not find them documented. Low impact; the plan only asks for "discard reasons".

Suggested fix: add the two causes to the sentence, or say "for example".

Triaged as should-fix at 2026-10-06T21:31:06.955Z

Decided fix at 2026-10-06T21:33:03.244Z

Resolved as resolved at 2026-10-06T21:38:23.484Z: fixed in 1c946e8
