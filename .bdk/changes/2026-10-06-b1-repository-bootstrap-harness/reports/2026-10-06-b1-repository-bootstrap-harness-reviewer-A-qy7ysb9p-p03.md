---
schema: 1
ticket: A-qy7ysb9p
role: reviewer
at: 2026-10-06T20:31:56.898Z
group: p03
status: done-with-concerns
files: []
entries: [L-bdw67ijx, L-226dmo7r, L-u6zj24kd, L-lwx3j8iz]
evidence: []
---

# Review p03: fixture, paths, tools, tree

All 19 tests in the four modules pass. fixture.ts, paths.ts and tools.ts match plan part 03 (marker `.bench-base`, BASE_FORMAT 3, identity, exports, env, sandbox naming and refusal message). All plan test cases for fixture, paths and tools are present and check behaviour.

Concerns:
- L-bdw67ijx (finding): `assertCommitted` reports a collapsed `src/` for an untracked file, not `src/new.ts` as plan 03-3 states; the test asserts only `/src/`, which hides it. Fix: add `--untracked-files=all`.
- L-226dmo7r (finding): tree.test.ts creates repos at `tmpdir()/test-repo-${Date.now()}` and never removes them; same-millisecond tests can share a repository (flaky) and leave residue. Fix: mkdtempSync plus afterEach cleanup.
- L-u6zj24kd (observation): promptfooEnv with no HOME gives a relative cache path; SANDBOX_DIR uses homedir().
- L-lwx3j8iz (observation): the `startsWith("..")` check in sandboxOf misreads a `..name` directory as outside.

No rule violation beyond BDK-TQ-1 on the weakened tree test (L-bdw67ijx).
