---
schema: 1
id: L-u6zj24kd
type: observation
summary: promptfooEnv falls back to relative .cache when HOME is unset; SANDBOX_DIR uses homedir()
status: resolved
source: agent:reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T20:31:51.723Z
ticket: A-qy7ysb9p
group: p03
refs:
  - harness/tools.ts
review: true
level: blocker
disposition: fix
---

Problem: harness/tools.ts:18 uses `join(env.HOME ?? "", ".cache")`, which gives the relative path `.cache/bdk-bench/promptfoo` when HOME is unset, while paths.ts SANDBOX_DIR falls back to os.homedir(). Both also treat an empty XDG_CACHE_HOME as set (`??`). The plan fixes the HOME form, so this is not a deviation.

Why it matters: in an environment without HOME, promptfoo state would land under the current directory (the repository root for evaluate) instead of the sandbox cache, while the sandbox goes elsewhere.

Suggested fix: optional; fall back to os.homedir() in promptfooEnv, or leave as is given the plan.

Triaged as nice-to-have at 2026-10-06T20:35:39.394Z

Decided fix at 2026-10-06T21:15:01.921Z

Resolved as resolved at 2026-10-06T21:27:56.585Z: fixed in 57b47df
