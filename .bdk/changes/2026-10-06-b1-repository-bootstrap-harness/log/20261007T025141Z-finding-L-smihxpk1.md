---
schema: 1
id: L-smihxpk1
type: finding
summary: userInfo() default param runs on every cacheHome call; throws without a passwd entry even when HOME is set
status: proposed
source: agent:integration-reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-07T02:51:41.108Z
ticket: A-kuit02bz
group: integration
refs:
  - harness/paths.ts:20
  - harness/paths.ts:32
  - configuration
  - BDK-CQ-6
review: true
level: blocker
disposition: fix
---

Problem: Severity medium, not blocking. `cacheHome(env, fallbackHome = userInfo().homedir)` (harness/paths.ts:18-21) evaluates the default parameter on every call where the second argument is absent, whether or not the fallback is used. `SANDBOX_DIR` (harness/paths.ts:32) calls `cacheHome(process.env)` at module load, and `promptfooEnv` (harness/tools.ts:23) calls it per promptfoo invocation. Node documents that `os.userInfo()` throws a SystemError when the user has no username or home directory, i.e. when the UID has no password-database entry (`docker run --user 1234`, OpenShift arbitrary UIDs, some CI sandboxes). Before the fix, `os.homedir()` never threw in that case.

Why it matters: Every module that imports paths.ts (main.ts, the smoke suite, tools.ts, compare.ts, tree.ts) now crashes at import with a libuv ENOENT in such environments, even when HOME or XDG_CACHE_HOME is set and absolute and the fallback would never be read. The fix for one edge case of the `configuration` risk area (empty or relative HOME) introduced a harder failure in another, and the message names the password database, not the harness.

Suggested fix: Read the fallback lazily, only in the branch that needs it, e.g. `fallbackHome: () => string = () => userInfo().homedir` and call it after the HOME check, or compute `userInfo().homedir` inside the final branch. Optionally wrap it so a missing entry raises a harness error naming XDG_CACHE_HOME/HOME as the remedy. Add a test that an injected throwing fallback is not called when HOME is absolute.

Triaged as should-fix at 2026-10-07T02:53:16.855Z

Decided fix at 2026-10-07T02:53:49.708Z
