---
schema: 1
id: "01"
title: Root package, pinned promptfoo and tooling configuration
goal: The repository installs its pinned tools with the promptfoo patch applied and has lint, format, typecheck and unit test configuration.
success-measure: "`pnpm install --frozen-lockfile` exits 0 with the patch applied, and `npx prettier --check` passes on every file this part wrote."
do-not-touch: ["checklist/**", "tasks/**", "README.md", "CLAUDE.md", ".bdk/**"]
depends-on: []
spec-impact: [bench-runner]
---

Source of every copied file: `git -C /Users/broneq/projects/bdk show 825455dd:<path>` (the `v3/T43-regression-eval` commit of `broneq/bdk`).

## 01-1 Root package and pnpm workspace settings

Create `package.json`: `name` `bdk-bench`, `private` true, `type` `module`, `engines.node` `>=24`, `packageManager` `pnpm@10.22.0`. Scripts: `bench` = `node harness/main.ts`, `lint` = `eslint --max-warnings 0 .`, `format` = `prettier --write .`, `format:check` = `prettier --check .`, `typecheck` = `tsc --noEmit`, `test` = `vitest run`. `dependencies`: `@anthropic-ai/claude-agent-sdk` `0.3.284` and `promptfoo` `0.123.1`, exact. `devDependencies`: `@eslint/js`, `@types/node`, `eslint`, `eslint-config-prettier`, `prettier`, `typescript`, `typescript-eslint`, `vitest`, each pinned to the exact version `package.json` has at `825455dd`, except `@types/node`, which is pinned to `24.19.1` (the Node of `.nvmrc` is 24).

Create `pnpm-workspace.yaml` from `evals/pnpm-workspace.yaml` at `825455dd`, unchanged except `patchedDependencies` pointing at `patches/promptfoo@0.123.1.patch`. Create `patches/promptfoo@0.123.1.patch` byte-identical to `evals/patches/promptfoo@0.123.1.patch`. Run `pnpm install` once to write `pnpm-lock.yaml`.

**Files:**

- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `patches/promptfoo@0.123.1.patch`
- Create: `pnpm-lock.yaml`

**Test cases:**

- `pnpm install --frozen-lockfile` in a clean clone exits 0, so the patch applies
- `git -C /Users/broneq/projects/bdk show 825455dd:evals/patches/promptfoo@0.123.1.patch | cmp - patches/promptfoo@0.123.1.patch` exits 0
- `git -C /Users/broneq/projects/bdk show 825455dd:evals/patches/promptfoo@0.123.1.patch | grep '^+++ b/'` lists `dist/src/claude-agent-sdk-*` files, and each listed file exists under `node_modules/promptfoo/` and contains the text the patch adds (`grep -F` of one added line of the patch)
- no version in `package.json` starts with `^` or `~`

**Stop rule:** stop and return `blocked` if `pnpm install` refuses the patch.

## 01-2 TypeScript, lint, format and test configuration

Create `tsconfig.json` from the root `tsconfig.json` at `825455dd` with `include` `["harness/**/*.ts", "*.config.ts"]` and `exclude` `["node_modules", ".runs", "tasks"]`. Create `eslint.config.mjs` from the root file at `825455dd`: `ignores` `[".runs/", ".bdk/", "node_modules/", "coverage/", "tasks/*/hidden/", "tasks/*/reference/"]`, rules block `files` `["harness/**/*.ts"]`. Create `.prettierrc.json` identical to the source. Create `.prettierignore` listing `.bdk/`, `.runs/`, `node_modules/`, `coverage/`, `pnpm-lock.yaml`, `patches/`, `tasks/*/hidden/`, `tasks/*/reference/`. Create `vitest.config.ts` with one project `unit`: the `env` block of the source (git maintenance off), `include` `["harness/**/*.test.ts"]`, `exclude` `["tasks/*/hidden/**"]`.

**Files:**

- Create: `tsconfig.json`
- Create: `eslint.config.mjs`
- Create: `.prettierrc.json`
- Create: `.prettierignore`
- Create: `vitest.config.ts`

**Test cases:**

- `npx tsc --showConfig` exits 0 and lists `harness/**/*.ts` under `include`
- `npx vitest run --passWithNoTests` exits 0
- `npx prettier --check package.json tsconfig.json eslint.config.mjs vitest.config.ts pnpm-workspace.yaml .prettierrc.json` exits 0
- `npx prettier --check .` does not list any path under `.bdk/`, `.runs/` or `tasks/*/hidden/`

## 01-3 Fixture pin and ignore list

Create `versions.json` with one key, `fixture`: `repository` `https://github.com/kamkie/technical-interview-frontend` and `commit` `946a2081f84381ffc3b4a494467479a5b6886ead`. Add `coverage/` to `.gitignore`.

**Files:**

- Create: `versions.json`
- Modify: `.gitignore`

**Test cases:**

- `grep -F 946a2081f84381ffc3b4a494467479a5b6886ead versions.json tasks/users-csv/task.yaml tasks/operator-i18n/task.yaml` matches all three files
- `node -e 'JSON.parse(require("fs").readFileSync("versions.json","utf8"))'` exits 0 and the parsed object has no `v2Tag` key
- `git check-ignore coverage/x` exits 0
