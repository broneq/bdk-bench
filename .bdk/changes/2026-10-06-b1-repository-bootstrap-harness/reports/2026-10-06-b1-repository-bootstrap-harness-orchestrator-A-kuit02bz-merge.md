---
schema: 1
ticket: A-kuit02bz
role: orchestrator
at: 2026-10-07T02:53:24.544Z
group: merge
status: done-with-concerns
files: []
entries: [L-sdsnz2m7, L-smihxpk1, L-ydk80cmr, L-wmfm3hwc, L-glc4rqh8, L-yxi2wmcc, L-iqp3h0qz, L-licpvdiw]
evidence: [E-mzw3ni2n, E-ca3q9fxh]
---

Delta review of the third fix round (1c946e8..4d6e29d, 5 files). No blockers.

## should-fix
- L-sdsnz2m7: tools.test.ts still expects the os.homedir() fallback that cacheHome no longer uses; the test fails where HOME differs from the password-database home
- L-smihxpk1: the default parameter userInfo().homedir runs on every cacheHome call and throws without a passwd entry, even when HOME is set
- L-ydk80cmr: the new test of the default fallback cannot fail for the regression it guards (BDK-TQ-1)

## nice-to-have
- L-wmfm3hwc: the raw subdirectory is still spelled in suite.ts and main.ts
- L-glc4rqh8: seriesDir, seriesNames and the cacheHome fallback have no stated contract in plan parts 03 and 06
- L-yxi2wmcc: redundant sandboxOf assertions; readVersions does not validate its JSON
- L-iqp3h0qz: a series whose rows are all discarded makes runCompare exit 0 with an empty table

## not-a-problem
- L-licpvdiw repeats L-x53cb90l

## Fixed in this round
L-bndhs6ue and L-7qqjll91 in 4d6e29d.

## Gate
tests-full (179) and lint-full passed (E-mzw3ni2n, E-ca3q9fxh). Groups p03, p05, p06 and integration reviewed.
