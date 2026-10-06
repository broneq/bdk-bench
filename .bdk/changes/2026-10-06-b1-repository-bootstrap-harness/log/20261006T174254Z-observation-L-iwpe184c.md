---
schema: 1
id: L-iwpe184c
type: observation
summary: README example row (17/19 ... 44/51) disagrees with task.yaml check_counts (20/11/12/11 = 54)
status: proposed
source: agent:verifier
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T17:42:54.907Z
ticket: A-diur9hxq
refs:
  - README.md
  - BDK-EJ-2
review: true
level: blocker
disposition: fix
---

README.md:7 shows an example row `users-csv | 17/19 | 10/11 | 8/11 | 9/10 | 44/51`; tasks/users-csv/task.yaml check_counts are functional 20, quality 11, tests 12, process 11, total 54. 07-2 keeps the intro unchanged; while it rewrites README it could fix the denominators (BDK-EJ-2).

Triaged as nice-to-have at 2026-10-06T20:35:42.320Z

Decided fix at 2026-10-06T21:15:01.828Z
