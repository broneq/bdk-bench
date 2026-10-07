---
schema: 1
id: L-yxi2wmcc
type: observation
summary: "paths tests: redundant assertions and no test for readVersions on missing or malformed file"
status: accepted
source: agent:reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-07T02:50:31.372Z
ticket: A-kuit02bz
group: p03
refs:
  - harness/paths.test.ts:19
review: true
level: nice-to-have
disposition: defer
---

Problem: The first sandboxOf test asserts startsWith and endsWith and then a regex that subsumes both. The ROOT_DIR-based refusal test depends on the real checkout path. readVersions casts JSON without validating shape, and has no test for a malformed file.

Why it matters: Redundant assertions add noise, not coverage; unvalidated versions.json is a trust boundary only for a repo-owned file, so the risk is low.

Suggested fix: Keep only the regex assertion; pass an explicit repoRoot in the refusal test; optionally validate fixture.repository and fixture.commit in readVersions.

Triaged as nice-to-have at 2026-10-07T02:53:17.169Z

Decided defer at 2026-10-07T02:53:49.944Z
