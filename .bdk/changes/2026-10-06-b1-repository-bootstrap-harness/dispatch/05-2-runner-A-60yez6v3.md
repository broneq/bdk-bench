---
schema: 1
ticket: A-60yez6v3
target: 05-2
role: runner
adapter: runner
attempt: 1
of: 3
scope: full
at: 2026-10-06T18:22:58.516Z
kernel-version: 2.7.0
template-hash: sha256:2b93453803b2b63419da370a087d886028a09d26941c3cf6a9a5d00f57a9703b
report: .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/reports/05-2-runner-A-60yez6v3.md
rules: []
---
# BDK dispatch package A-60yez6v3

You are the `runner` of ticket A-60yez6v3: attempt 1 of 3, scope `full`. Work from this package; read other state only through `bdk`.

## Change

B1 Repository bootstrap: harness extracted from BDK evals (https://github.com/broneq/bdk-bench/issues/1)

## Target 05-2

From `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/05-commands.md`:

### 05-2 Series rendering and probe summary

Copy `runner.ts` and `runner.test.ts`. Keep `renderSeries(setup, dir)`, `runSeries(setup, rendered, io)`, `seriesFilter`, `probeSummary(rows, runsPerWorkflow, budgetUsd, spentUsd, sample?)`, `SeriesSetup`, `WorkflowSetup { provider; plan: WorkflowPlan; prompt? }`, `SeriesIo`, `RenderedSeries`. The config `description` is `<suite> <series> bench@<first 7 of benchCommit> <models>` and `tags` is `{ suite, series, benchCommit, model }`. `runSeries` still treats promptfoo exit 0 and 100 as a finished series, returns 1 with the budget-reached message when the ledger reached the budget, and returns other codes with `promptfoo exited with <code>; raw output in <file>`. `UsageError` is imported as a value from `cli.ts`.

The copied test builds its providers with `sessionProvider` (from `providers.ts`) with `plugin` null instead of the removed `oneTurnProvider`.

**Files:**

- Create: `harness/runner.ts`
- Create: `harness/runner.test.ts`

**Test cases:**

- 2 workflows, 2 items, 3 runs render 6 tests and 2 providers, `maxConcurrency` equal to the setup's concurrency, the extension hook and the harness assertion in `defaultTest`
- the description of series `s1` of suite `smoke` at commit `abcdef0123…` with model `m` is `smoke s1 bench@abcdef0 m`
- two workflows with the same prompt share one prompt entry, and a workflow with its own prompt gets its own entry labelled by that workflow
- `only: { workflows: ["plain"] }` keeps one provider; an unknown workflow throws `UsageError` containing `unknown workflow nope; known workflows: plain`
- an `evaluate` that resolves 100 makes `runSeries` return 0; one that resolves 3 returns 3 and prints the output file
- a ledger at the budget makes `runSeries` return 1 and print `budget reached`
- `probeSummary` of one row costing 0.5 for 5 runs prints `plain: 0.50 USD per run, 2.50 USD for 5 runs` and `projected series: 2.50 USD`; a discarded row is listed with its reason; a sample of 1 of 4 items scales the cost by 4

`do-not-touch`: `package.json`, `pnpm-lock.yaml`, `harness/hook.ts`, `harness/provider.ts`, `harness/series.ts`, `harness/results.ts`, `harness/budget.ts`.

## Ledger entries

No accepted decision or open blocker names this target.

Other entries of this target: 1 blocker; read them with `bdk log list --for 05-2`.

## Role: runner

### Input

Your prompt or skill argument is the path of your dispatch package. Rely on nothing else from the conversation: what binds you is in the package or in what it names.

1. Read the package with `bdk dispatch show <path>`. It carries your ticket, the task, the decisions and blockers that bind you, and your report path.
2. Read the rules for your ticket with `bdk rules show --ticket <ticket>` before any other work.
3. Read the entries the package only counts, when you need them, with `bdk log list --for <task|part|file>` and `bdk log show <id>`.

If the package is missing or does not parse, stop and return `blocked` with the reason.

### Work

You run the checks of the package's `Checks` section, exactly as written and in its order, and record their outcome as evidence. You change no project file.

- Run each check once and save its output to a file under `.bdk/.machine/checks/`, ending with the line `exit <code>`. Git ignores that directory; a file anywhere else is a change in the tree that the diff check and the evidence see. You never write or edit that output yourself, and never record a file the check did not write. Report its command, exit code and the shortest decisive lines of output.
- Record each check with `bdk evidence record <kind> <file> --ticket <ticket>` and the verdict the output shows, and put the evidence id in your envelope.
- For `pass`, cite with `--cite "<file>:<line>=<text>"`, the line of your output file that shows the result, its number read with `grep -n`, e.g. `--cite ".bdk/.machine/checks/tests.txt:7=Tests  12 passed (12)"`; never the console line alone, which is not a citation. The kernel refuses a `pass` without one.
- Log each failure as a `finding` with the failing test or file and line, and record the check as `fail`.
- When a check cannot run (missing tool, broken setup, no command configured), do not work around it: record `not-run` with the reason in the file and log an `observation`.
- Never edit code or configuration to make a check pass.
- Paths under `.bdk/` are BDK's own files: log no finding for them but one `question` naming `/bdk:setup`, and record a check that fails only on them as `not-run` with that reason.
- When the package has a `Work root` section, every file you read or edit and every command you run, its checks included, stay inside that path; `bdk` commands stay as written, since the kernel finds the home checkout itself.

### Ledger

Record what others need when you know it, each entry with a ref: `bdk log add <type> "<summary>" --ref <file|task|id> --ticket <ticket>`; summary at most 120 characters, details via `--body -`.

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

Run `bdk rules show --ticket A-60yez6v3` before you start and follow the rules it prints.

## Checks

Run the checks in this order. Save each check's output to a file under `.bdk/.machine/checks/` (git ignores it; a file elsewhere is a change in the tree) and end the file with the line `exit <code>`, so a check that prints nothing still leaves a line to cite; never write or edit the output yourself. Record each file; for `pass`, cite the output line or JSON value that shows the result as `--cite <file>:<line>=<text>` or `--cite <file>#<json-pointer>`.

### tests-scoped

- `npx vitest related --run harness/runner.test.ts harness/runner.ts`

Record: `bdk evidence record tests-scoped <file> --ticket A-60yez6v3 --verdict pass|fail|not-run --cite <citation>`

### lint

- `npx eslint harness/runner.test.ts harness/runner.ts`
- `npx prettier --check harness/runner.test.ts harness/runner.ts`

Record: `bdk evidence record lint <file> --ticket A-60yez6v3 --verdict pass|fail|not-run --cite <citation>`

## Return

Write your entries with `bdk log add <type> <summary> --ref <ref> --ticket A-60yez6v3`: the summary is 1 to 120 characters (put detail in `--body`), the type is one of decision, finding, observation, blocker, question, assumption, risk, learning, report. Then pipe the full report to `bdk log ingest --ticket A-60yez6v3` on stdin (`bdk log ingest --ticket A-60yez6v3 < <report-file>`; there is no frontmatter flag), the envelope (`status`, `files`, `entries`, `evidence`) as its frontmatter between two `---` lines. `entries` lists the ids `log add` printed. Leave `reason` out, except for `blocked` or `needs-context`. When it refuses, fix the named field and call it again. Return only the envelope and the report path `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/reports/05-2-runner-A-60yez6v3.md`.
