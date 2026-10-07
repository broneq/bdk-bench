---
schema: 1
id: L-wmfm3hwc
type: finding
summary: The raw subdirectory of a series is still spelled twice (smoke suite, main.ts regrade) and once more in a doc comment
status: proposed
source: agent:integration-reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-07T02:51:41.359Z
ticket: A-kuit02bz
group: integration
refs:
  - harness/main.ts:53
  - harness/suites/smoke/suite.ts:78
  - harness/paths.ts:69
  - L-7qqjll91
  - BDK-ARCH-5
level: nice-to-have
---

Problem: Severity low, not blocking. The fix for L-7qqjll91 moved the series directory into `paths.seriesDir`, but the `raw` leaf that the runner writes and `bench regrade` reads is still spelled independently: `join(spec.dir, "raw")` in `describeSmoke` (harness/suites/smoke/suite.ts:78) and `join(seriesDir(RUNS_DIR, suite, series), "raw")` in harness/main.ts:53. The doc comment of `seriesDir` (harness/paths.ts:69) states the same fact a third time ("raw records sit in its `raw` subdirectory") without any code enforcing it.

Why it matters: The runner-to-regrade seam is half unified (BDK-ARCH-5): renaming the leaf in the suite leaves regrade looking for `judge.json` in the old place. It fails loudly (regrade exits 2 with the path), so the cost is a confusing error, not wrong scores, but the finding was closed as resolved while its suggested `join(seriesDir, "raw")` shape is only used on one side.

Suggested fix: Add `rawDir(seriesDirectory: string)` (or `seriesRawDir(runsDir, suite, series)`) to paths.ts and use it in both `describeSmoke` and main.ts; drop the "raw" sentence from the `seriesDir` comment once the code carries it.

Triaged as nice-to-have at 2026-10-07T02:53:17.014Z
