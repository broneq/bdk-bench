---
schema: 1
id: L-rjk5xjek
type: finding
summary: design.md:70 says completed = HELLO.md exists; 06-1 requires the trimmed content to be exactly 'hello'
status: proposed
source: agent:verifier
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T17:42:54.604Z
ticket: A-diur9hxq
refs:
  - .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/design.md
  - .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/06-smoke-suite-and-entry.md
  - BDK-ARCH-5
level: nice-to-have
---

design.md:70: "`measure` reports `completed` (HELLO.md exists)". 06-smoke-suite-and-entry.md:16 and its cases at 25-27 make `completed` 1 only when the trimmed content is exactly `hello` (`hello world` and `Hello` give 0). The plan's rule matches the prompt better; update design.md:70 so the two documents state one rule (BDK-ARCH-5).

Triaged as nice-to-have at 2026-10-06T20:35:41.694Z
