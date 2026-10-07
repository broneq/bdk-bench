---
schema: 1
id: L-mqr6vztt
type: finding
summary: "review-fix commit refused: do-not-touch harness/** of done parts 01 and 07"
status: resolved
source: kernel
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T20:38:41.976Z
refs:
  - harness/providers.test.ts
level: not-a-problem
---

A review-fix ticket targets the whole Change, so 'bdk commit' checks its files against the do-not-touch lists of every plan part. Parts 01 and 07 list harness/**, so no review fix that changes harness/ can be committed: policy/do-not-touch, and its 'instead' is to git restore the fix. The lists were written for each part's own tasks. Fix belongs in BDK: apply a part's do-not-touch only to that part's task tickets.

Triaged as not-a-problem at 2026-10-06T20:46:41.064Z: reported as broneq/bdk#160 and worked around by L-geqc05p3 and L-b4ha6o0l
