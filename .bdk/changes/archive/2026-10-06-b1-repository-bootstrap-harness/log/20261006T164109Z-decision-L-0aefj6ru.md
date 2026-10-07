---
schema: 1
id: L-0aefj6ru
type: decision
summary: Default one run per workflow and item; harness records turns and wall_s
status: proposed
source: kernel
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T16:41:09.831Z
refs:
  - .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/design.md
---
From CLAUDE.md "Cost" (one run by default) and issue #1 (record turns and wall time). Rejected: T43 default of 5 runs with a --runs minimum of 2, and per-suite recording of turns and wall time.
