---
schema: 1
id: L-y2am8p8s
type: observation
summary: CLAUDE.md CI layout line omits the bench check step ci.yml runs
status: resolved
source: agent:reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T20:32:45.174Z
ticket: A-qy7ysb9p
group: p07
refs:
  - CLAUDE.md
review: true
level: blocker
disposition: fix
---

Problem: The Layout line for .github/workflows/ci.yml reads "CI: lint, format check, typecheck, unit tests", but ci.yml also runs `pnpm bench check`.

Why it matters: The layout description drifts from the workflow (BDK-ARCH-5); a reader assumes the config validation is not gated.

Suggested fix: Append "bench check" to that line.

Triaged as nice-to-have at 2026-10-06T20:35:39.828Z

Decided fix at 2026-10-06T21:15:02.376Z

Resolved as resolved at 2026-10-06T21:27:56.899Z: fixed in 57b47df
