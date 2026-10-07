---
schema: 1
id: L-ed8n1xs0
type: observation
summary: cacheHome process-env guard relies on vitest's default forks pool; under threads it cannot fail
status: accepted
source: agent:integration-reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-07T02:57:26.147Z
ticket: A-29z6o7zg
group: integration
refs:
  - harness/paths.test.ts:70
  - L-ydk80cmr
  - BDK-TQ-1
review: true
level: nice-to-have
disposition: defer
---

Problem: The new test "is absolute for the process environment when HOME is empty or relative" (harness/paths.test.ts:70-76) stubs `process.env.HOME` with `vi.stubEnv` and asserts `cacheHome(process.env)` is absolute. Against the regression it guards (default fallback reverted to `os.homedir()`), it fails as intended today: vitest 5.0.2 resolves `pool` to `forks` (node_modules/vitest/dist/chunks/index.C-uw7tH9.js:14311), assigning `process.env.HOME` in a forked child calls setenv, and `os.homedir()` then returns `"rel"` or `""` (probed on Node v24.21.0), so `join(..., ".cache")` is relative. Under `pool: "threads"` `process.env` is a per-thread copy while `os.homedir()` reads the real process environment, so the reverted default would return the absolute real home and the test would pass.

Why it matters: Not wrong today; vitest.config.ts sets no pool. It is a non-obvious coupling between one test and a runner default that a later config change could silently weaken (BDK-TQ-1).

Suggested fix: None needed now. If the pool is ever changed, pin `pool: "forks"` for this file or assert with an injected fallback spy that the default reads `userInfo()` rather than the environment.

Triaged as nice-to-have at 2026-10-07T02:57:51.096Z

Decided defer at 2026-10-07T03:05:28.226Z
