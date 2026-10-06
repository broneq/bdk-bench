---
schema: 1
id: L-zfku9tci
type: finding
summary: 07-2 README test runs every Running command without credentials, so 'pnpm bench view' starts the viewer and blocks
status: proposed
source: agent:verifier
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T17:42:54.410Z
ticket: A-diur9hxq
refs:
  - .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/07-ci-docs-format.md
---
07-ci-docs-format.md:40: "every command listed under Running is accepted by pnpm bench (checked by running pnpm bench <command> ... except the ones that need credentials)". `view` needs no credentials (05-1), and `view(rootDir)` (03-4, source tools.ts) spawns `promptfoo view --yes` and resolves only when the user stops it, so the executor's check hangs on a server. Exclude `view` too (or check it with `pnpm bench view --nope`-style usage errors only), and name the excluded commands explicitly: `smoke [--probe]` and `regrade` must never run here (a logged-in Claude Code counts as credentials, so `smoke --probe` would start a paid session without the approval CLAUDE.md "Cost" requires).
