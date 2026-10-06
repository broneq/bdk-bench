---
schema: 1
id: L-y1pqq7cv
type: observation
summary: "Minor plan defects: test commands in wrong repo, unprovable diff check, stale @types/node, lead-only steps"
status: resolved
source: agent:verifier
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T17:28:02.470Z
ticket: A-pvbw6479
refs:
  - .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/01-tooling.md
  - .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/07-ci-docs-format.md
level: not-a-problem
---

Verification defects and small gaps (not a fail):
- 01-tooling.md:30 `git show 825455dd:evals/patches/... | cmp -` runs in bdk-bench, where 825455dd does not exist ("Not a valid object name"); needs `git -C /Users/broneq/projects/bdk show` like line 31 (BDK-PL-2).
- 01-tooling.md:53 expects prettier to "print that every file is ignored"; prettier 3.9.9 on an all-ignored directory prints "All matched files use Prettier code style!" and exits 0 (checked on bdk's docs/v3).
- 07-ci-docs-format.md:53 `git diff --stat CLAUDE.md` cannot show which sections changed.
- 07-ci-docs-format.md:60 says fix any lint or typecheck finding, but the part forbids `harness/**`; moot once 06's whole-project eslint/tsc measure holds.
- 01-tooling.md:16 pins `@types/node` to the source's 22.20.4 while `.nvmrc` and `engines` are 24.
- 01-tooling.md:38 eslint ignores omit `tasks/*/hidden/`, `tasks/*/reference/` that design.md:78 lists; harmless today (rules scoped to harness/**, no such dirs yet).
- Lead-only steps with no part: the first commit's message naming the source commit (design.md:14) and the model-backed `bench smoke --probe` + `bench view` acceptance (design.md:70, 99).

Triaged as not-a-problem at 2026-10-06T20:35:42.944Z: plan defects fixed before execute
