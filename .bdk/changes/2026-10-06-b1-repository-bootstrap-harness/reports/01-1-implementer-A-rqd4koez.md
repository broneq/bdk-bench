---
schema: 1
ticket: A-rqd4koez
role: implementer
at: 2026-10-06T17:51:39.771Z
status: done
files: [ package.json, pnpm-workspace.yaml, patches/promptfoo@0.123.1.patch, pnpm-lock.yaml ]
entries: []
evidence: []
---
# 01-1 report

Created the four files. `pnpm install` applied the patch with no refusal. Checked:
- the patch is byte-identical to `evals/patches/promptfoo@0.123.1.patch` at `825455dd` (`cmp` exits 0)
- the four patched `dist/src/claude-agent-sdk-*` files exist under `node_modules/promptfoo/` and contain an added line of the patch
- `pnpm install --frozen-lockfile` exits 0
- no version in `package.json` starts with `^` or `~`

Dev dependency versions are those of `package.json` at `825455dd`, except `@types/node` 24.19.1. `pnpm-workspace.yaml` is the BDK file unchanged, since its `patchedDependencies` path was already `patches/promptfoo@0.123.1.patch`.

The test cases are shell checks of a manifest and a patch, so no unit test was written (BDK-TQ-11).

The untracked `versions.json` was already there before this task and I left it alone.
