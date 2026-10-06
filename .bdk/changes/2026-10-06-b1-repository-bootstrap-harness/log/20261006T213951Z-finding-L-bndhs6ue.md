---
schema: 1
id: L-bndhs6ue
type: finding
summary: "cacheHome HOME fallback is ineffective: os.homedir() returns the same empty or relative $HOME"
status: proposed
source: agent:integration-reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T21:39:51.266Z
ticket: A-f1miv2g3
group: integration
refs:
  - harness/paths.ts
  - harness/paths.test.ts
  - L-bqedx5xr
  - configuration
  - BDK-TQ-1
level: should-fix
---

Problem: Severity medium, not blocking. The fix for L-bqedx5xr (harness/paths.ts:18-23) falls back to `homedir()` when `HOME` is empty or relative, but on POSIX Node's `os.homedir()` returns `$HOME` itself when it is set. Probed on Node v24.21.0: `HOME= node -e 'os.homedir()'` gives `""` and `HOME=rel` gives `"rel"`; with XDG_CACHE_HOME unset, `HOME=` makes `SANDBOX_DIR` `.cache/bdk-bench` and `HOME=rel` makes it `rel/.cache/bdk-bench`, both relative, exactly the case the finding asked to close. Only the XDG_CACHE_HOME half of the fix works. The new tests at harness/paths.test.ts:46-47 expect `join(homedir(), ".cache")` while the test process has a real HOME, so they pass and cannot fail for the production path, where `env` and `homedir()` read the same `process.env.HOME` (BDK-TQ-1).

Why it matters: `promptfooEnv` (harness/tools.ts:23) then sets PROMPTFOO_CONFIG_DIR to a relative path resolved against the promptfoo child's cwd, the repository root, so the database lands inside the repository, which architecture.md "Isolation" forbids and which then trips `assertCommitted` on the next measured series. The sandbox is refused by `sandboxOf` only when the shell cwd is inside the repository. The `configuration` risk area (environment variables) is touched and the fix reads as done while it is not.

Suggested fix: Fall back to `os.userInfo().homedir` (read from the password database, it ignores $HOME; probed: `HOME= node -e 'os.userInfo().homedir'` gives `/Users/broneq`), or reject a non-absolute result and throw. Make the test independent of the test process's HOME, e.g. assert that `cacheHome({ HOME: "" })` and `cacheHome({ HOME: "rel" })` are absolute, and inject the fallback if needed to test it deterministically.

Triaged as should-fix at 2026-10-06T21:40:36.881Z
