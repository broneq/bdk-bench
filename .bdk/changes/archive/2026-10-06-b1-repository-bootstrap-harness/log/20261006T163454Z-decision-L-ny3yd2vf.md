---
schema: 1
id: L-ny3yd2vf
type: decision
summary: Fixture marker .bench-base, row adds adapter name and version, plain inline until B7
status: proposed
source: kernel
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T16:34:54.158Z
refs:
  - .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/design.md
---
tasks/*/task.yaml names marker .bench-base; B7 rule says rows record adapter name and version. Plain stays inline in the smoke suite so B7 owns the adapter contract (BDK-ARCH-4).
