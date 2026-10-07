---
schema: 1
id: L-bqedx5xr
type: finding
summary: "cacheHome treats an empty XDG_CACHE_HOME or HOME as set: sandbox and promptfoo DB become cwd-relative"
status: resolved
source: agent:integration-reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T21:30:28.866Z
ticket: A-eq1itdbh
group: integration
refs:
  - harness/paths.ts
  - harness/tools.ts
  - configuration
review: true
level: blocker
disposition: fix
---

Problem: Severity low, not blocking. `cacheHome` (harness/paths.ts:17-19), now the single source of the cache location for both `SANDBOX_DIR` and `promptfooEnv`, uses `??`, so `XDG_CACHE_HOME=""` (or `HOME=""` without XDG) yields `""` or `.cache`, a relative path. Probed: with `XDG_CACHE_HOME=""` the promptfoo config dir is `bdk-bench/promptfoo`, resolved against the promptfoo child's cwd, which is the repository root (tools.ts:42); the sandbox becomes relative to the shell's cwd and `sandboxOf` only refuses it when that cwd is inside the repository. The XDG Base Directory spec says an empty or relative value must be ignored.

Why it matters: The design requires the sandbox and the promptfoo database to live outside the repository (architecture.md "Isolation"). An empty variable, common in CI or `env -i` style launches, would put the promptfoo database under the repository, where the next measured series then fails `assertCommitted` on an untracked `bdk-bench/` directory, or would give sessions relative working directories.

Suggested fix: In `cacheHome`, ignore a value that is empty or not absolute (`isAbsolute(env.XDG_CACHE_HOME ?? "")`), same for HOME, falling back to `homedir()`; add the empty-string case to paths.test.ts.

Triaged as should-fix at 2026-10-06T21:31:06.862Z

Decided fix at 2026-10-06T21:33:02.868Z

Resolved as resolved at 2026-10-06T21:38:23.108Z: fixed in 1c946e8
