---
schema: 1
ticket: A-eq1itdbh
role: reviewer
at: 2026-10-06T21:28:30.146Z
group: p03
status: done
files: []
entries: [L-tya33mi7, L-7hqcoik5]
evidence: []
---

# Review p03: paths, tools, tree

Verdict: the group matches plan part 03 (tasks 03-2, 03-3, 03-4). No findings. 17 tests in the three test files pass.

- paths.ts: exports, sandbox name (basename plus 8 hex of sha256), refusal message, resultsFile and readVersions match the contract. The `..cache` edge case is handled and tested.
- tree.ts: pathspec `:!results :!.bdk`, message text and headCommit match. All five plan cases are covered, plus the bare-path format.
- tools.ts: needsInstall and ensureTools are removed; env, binary path and cwd match. All three plan cases are covered, plus the HOME-unset fallback.

Observations: L-tya33mi7 (lexical containment check ignores symlinks), L-7hqcoik5 (spawn wrappers untested, narrating test comments).
