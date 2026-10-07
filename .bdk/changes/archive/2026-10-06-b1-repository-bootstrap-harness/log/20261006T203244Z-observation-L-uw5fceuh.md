---
schema: 1
id: L-uw5fceuh
type: observation
summary: smokeRunner reads versions.json from real ROOT_DIR, not deps.dirs.rootDir
status: resolved
source: agent:reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T20:32:44.144Z
ticket: A-qy7ysb9p
group: p06
refs:
  - harness/suites/smoke/suite.ts:154
level: not-a-problem
---

Problem: readVersions() uses its default path (real ROOT_DIR) while package.json and results use dirs.rootDir. Tests depend on the real versions.json and the dirs seam is incomplete.

Why it matters: Minor test isolation and consistency (BDK-ARCH-5).

Suggested fix: Use readVersions(join(dirs.rootDir, "versions.json")) and give the test root a versions.json.

Triaged as not-a-problem at 2026-10-06T20:35:40.625Z: repeats L-d4qsan2j
