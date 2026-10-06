---
schema: 1
ticket: A-1pnrlzrw
target: 2026-10-06-b1-repository-bootstrap-harness
role: implementer
adapter: worker
attempt: 2
of: 2
scope: high+
at: 2026-10-06T20:36:13.647Z
kernel-version: 2.7.0
template-hash: sha256:a46392ab75b1acd8707ac18ada462d340a990f8e0f344833810fc622886b1f90
report: .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/reports/2026-10-06-b1-repository-bootstrap-harness-implementer-A-1pnrlzrw.md
rules:
  - BDK-ARCH-1
  - BDK-ARCH-2
  - BDK-ARCH-3
  - BDK-ARCH-4
  - BDK-ARCH-5
  - BDK-CQ-1
  - BDK-CQ-2
  - BDK-CQ-3
  - BDK-CQ-4
  - BDK-CQ-5
  - BDK-CQ-6
  - BDK-CQ-7
  - BDK-CQ-8
  - BDK-DP-1
  - BDK-DP-2
  - BDK-DP-3
  - BDK-DP-4
  - BDK-DP-5
  - BDK-DP-6
  - BDK-DP-7
  - BDK-DP-8
  - BDK-DP-9
  - BDK-DP-10
  - BDK-DP-11
  - BDK-SEC-1
  - BDK-SEC-2
  - BDK-SEC-3
  - BDK-SEC-4
  - BDK-SEC-5
  - BDK-SEC-6
  - BDK-SEC-7
  - BDK-SEC-8
  - BDK-SEC-9
  - BDK-TQ-1
  - BDK-TQ-2
  - BDK-TQ-3
  - BDK-TQ-4
  - BDK-TQ-5
  - BDK-TQ-6
  - BDK-TQ-7
  - BDK-TQ-8
  - BDK-TQ-9
  - BDK-TQ-10
  - BDK-TQ-11
---

# BDK dispatch package A-1pnrlzrw

You are the `implementer` of ticket A-1pnrlzrw: attempt 2 of 2, scope `high+`. Work from this package; read other state only through `bdk`.

## Change

B1 Repository bootstrap: harness extracted from BDK evals (https://github.com/broneq/bdk-bench/issues/1)

## Target 2026-10-06-b1-repository-bootstrap-harness

Read:

- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/change.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/01-tooling.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/02-leaf-modules.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/03-fixture-paths-tools.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/04-run-lifecycle.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/05-commands.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/06-smoke-suite-and-entry.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/07-ci-docs-format.md`

## Craft

Before your first edit, print each craft skill below with its command and follow it while you work:

- `tdd`: `bdk ctx craft tdd`

## Ledger entries

### L-dzhorbso finding, proposed

Rendered configs call anthropic:claude-agent-sdk directly; harness provider.ts is never loaded, so no run is isolated

Refs: `harness/providers.ts`, `harness/runner.ts`, `harness/provider.ts`, `04-3`, `BDK-CQ-7`

Problem: Severity critical. `sessionProvider` (harness/providers.ts:28-60) returns `{ id: "anthropic:claude-agent-sdk", label, config: { workflow, ...sdkOptions } }`, and `renderSeries` (harness/runner.ts:109-112) spreads that entry into the promptfoo config unchanged. No production module references `harness/provider.ts` (`grep -rn provider.ts harness/` finds only provider.test.ts and two comments in hook.ts), so `RunProvider`/`callRun` is dead code. The source at 825455dd wrapped every entry as `{ id: "file://<harness>/provider.ts", label, config: { cell: label, sdk } }`; plan 04-3 kept that shape (its test case asserts `config.sdk.plugins` and `config.workflow`), and plan 06-2 asserts `config.sdk.plugins` too, but providers.test.ts:10 and suite.test.ts:72 were written against the flat shape, and runner.ts:78 reads `provider.config.model` to match it. Every part passes its own tests and `pnpm bench check` (promptfoo validates the flat entry), so only the seam is broken.

Why it matters: In a real `pnpm bench smoke --probe`, promptfoo's SDK provider gets no `working_dir`, so (node_modules/promptfoo/dist/src/claude-agent-sdk-*.js:570) it runs in a fresh `os.tmpdir()/promptfoo-claude-agent-sdk-*` directory, not the fixture copy; no `debug_file`, no per-run `XDG_CONFIG_HOME`; `startRun` never runs, so the per-run budget refusal (`BudgetReached` before a session) never happens; `metadata.benchWorkflow` and `wallMs` are never set. Then `gradeRun` calls `runContext(plan, "")`, which throws "the run names no workflow", no measurement.json is written, isolation would report "no session log" anyway, and `wall_s` is never recorded. Every run is discarded or measures `completed` 0, so the spec-delta requirements "Per-run isolation", "Budget ledger and run cap" (SHALL NOT start a run at the budget), "One row per run" (wall time) and the design's acceptance run all fail, while CI stays green.

Suggested fix: Restore the wrapper in providers.ts: `ProviderEntry = { id: string; label: string; config: RunProviderConfig }` built as `{ id: \`file://${fileURLToPath(new URL("./provider.ts", import.meta.url))}\`, label, config: { workflow: label, sdk: {...} } }`; read `config.sdk.model` in runner.ts `modelsOf`; fix providers.test.ts and suite.test.ts to the plan's `config.sdk.*` assertions; add one runner or suite test asserting each rendered provider's `id` ends with `/harness/provider.ts` and its `config.workflow` equals its label (the seam test that would have caught this). Then run the approved `bench smoke --probe` and check the row has `completed` 1, `turns` and `wall_s`.

Triaged as blocker at 2026-10-06T20:35:38.469Z

Other entries of this target: 1 report, 1 finding; read them with `bdk log list --for 2026-10-06-b1-repository-bootstrap-harness`.

## Role: implementer

### Input

Your prompt or skill argument is the path of your dispatch package. Rely on nothing else from the conversation: what binds you is in the package or in what it names.

1. Read the package with `bdk dispatch show <path>`. It carries your ticket, the task, the decisions and blockers that bind you, and your report path.
2. Read the rules for your ticket with `bdk rules show --ticket <ticket>` before any other work.
3. Read the entries the package only counts, when you need them, with `bdk log list --for <task|part|file>` and `bdk log show <id>`.

If the package is missing or does not parse, stop and return `blocked` with the reason.

### Work

- Build the task test-first: a failing test for each behaviour the task names, then the code, then the scoped checks the package lists.
- Before your first edit, print each skill of the package's `Craft` section with `bdk ctx craft <name>` and follow it within this contract.
- Change only the task's `Files:` and never a `do-not-touch` path. When another file must change, log a `finding` and name it in the report.
- When the task's `stop-rule` fires, stop and return `blocked` naming it.
- On a `review-fix` ticket the package embeds the round's blocking entries instead of a task: fix each one, name each fixed entry by id in your report, and resolve none; the orchestrator does after the commit.
- Log a `decision` for a choice the package leaves open and an `assumption` for what you could not verify.
- When the package has a `Work root` section, every file you read or edit and every command you run, its checks included, stay inside that path; `bdk` commands stay as written, since the kernel finds the home checkout itself.
- When the package has a `Conflict` section, edit only its paths and follow its instruction, leave staging and the merge commit to the kernel, and return `blocked` naming the paths the instruction does not settle.
- Never change the project's tool configuration for `.bdk/` files, and never rewrite them with a formatter: log a `question` naming `/bdk:setup`.
- Leave your changes uncommitted for the orchestrator, and never run git commands that discard work or rewrite history (stash, reset, clean, checkout or restore of paths, commit, rebase and the like), because other agents share this working tree; return `blocked` with the cause instead.

### Ledger

Record what others need when you know it, each entry with a ref: `bdk log add <type> "<summary>" --ref <file|task|id> --ticket <ticket>`; summary at most 120 characters, details via `--body -`.

When a rule forced a decision or a finding breaks one, cite its rule id exactly as `bdk rules show --ticket` prints it (`BDK-CQ-4`, `API-2`): as a `--ref <id>` of the entry and by id in your report.

### Messages

A `SendMessage` carries a ledger id and one sentence, never the content; write the entry first. An entry that affects the rest of the part goes to your parent, the `BDK-PARENT` line of your start context; one that must stop other work goes to `main`; one that affects particular running agents goes to the ids `bdk agents list --affected-by <entry>` returns, your own id left out. On a message to you, read the named entry with `bdk log show <id>`, then continue, adapt your work within your package, or return `blocked` with the entry id.

### Output

Pipe the full report to `bdk log ingest --ticket <ticket>` with this envelope as its frontmatter, each list `[]` when empty:

```
---
status: done | done-with-concerns | needs-context | blocked
files: [<paths you changed>]
entries: [<ledger ids you wrote>]
evidence: [<evidence ids>]
# reason: blocked and needs-context only
---
```

The kernel stamps your ticket and role and stores the report at the package's `report` path. When `log ingest` exits non-zero, fix the field it names and call it again; never write the report file yourself.

Then return only the envelope, at most 15 lines, and the report path as the package names it.

## Rules

Run `bdk rules show --ticket A-1pnrlzrw` before you start and follow the rules it prints.

## Return

Write your entries with `bdk log add <type> <summary> --ref <ref> --ticket A-1pnrlzrw`: the summary is 1 to 120 characters (put detail in `--body`), the type is one of decision, finding, observation, blocker, question, assumption, risk, learning, report. Then pipe the full report to `bdk log ingest --ticket A-1pnrlzrw` on stdin (`bdk log ingest --ticket A-1pnrlzrw < <report-file>`; there is no frontmatter flag), the envelope (`status`, `files`, `entries`, `evidence`) as its frontmatter between two `---` lines. `entries` lists the ids `log add` printed. Leave `reason` out, except for `blocked` or `needs-context`. When it refuses, fix the named field and call it again. Return only the envelope and the report path `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/reports/2026-10-06-b1-repository-bootstrap-harness-implementer-A-1pnrlzrw.md`.
