---
schema: 1
ticket: A-zrxyr8dj
target: 04-2
role: implementer
adapter: worker
attempt: 1
of: 3
scope: full
at: 2026-10-06T18:13:05.485Z
kernel-version: 2.7.0
template-hash: sha256:7ea5784bbe45e4bdb14bd40e08dcf2544eed9f8d618d1e591069dd5b95e09cc1
report: .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/reports/04-2-implementer-A-zrxyr8dj.md
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
  - BDK-JS-1
  - BDK-JS-2
  - BDK-JS-3
  - BDK-JS-4
  - BDK-JS-5
  - BDK-JS-6
  - BDK-JS-7
  - BDK-JS-8
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
# BDK dispatch package A-zrxyr8dj

You are the `implementer` of ticket A-zrxyr8dj: attempt 1 of 3, scope `full`. Work from this package; read other state only through `bdk`.

## Change

B1 Repository bootstrap: harness extracted from BDK evals (https://github.com/broneq/bdk-bench/issues/1)

## Target 04-2

From `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/04-run-lifecycle.md`:

### 04-2 Harness provider

Copy `provider.ts` and `provider.test.ts`. `RunProviderConfig` is `{ workflow: string; sdk: Record<string, unknown> }`; the class `RunProvider` reads `options.config.workflow`, its `id()` is `bench:<workflow>`, and the response metadata keys are `benchWorkflow`, `wallMs`, `transcript`, and `budgetStop` on a budget stop. Behaviour unchanged: start the run, call the SDK provider with `working_dir`, `debug_file` and an `env` that adds `XDG_CONFIG_HOME` of the run, add wall time and transcript.

**Files:**

- Create: `harness/provider.ts`
- Create: `harness/provider.test.ts`

**Test cases:**

- a run with a workflow base copies the base into the run's working copy and the suite's `beforeRun` sees that copy
- the wrapped session gets `working_dir`, `debug_file` and `XDG_CONFIG_HOME` of this run only, and the sdk's own `env` entries are kept
- a workflow without a base gets an empty working copy
- files an earlier series left in the working copy and debug log are gone
- the response metadata has `benchWorkflow`, `wallMs` (difference of the injected clock) and a `transcript`
- at the budget no session starts, the response has `error` containing `budget reached` and `metadata.budgetStop` true
- a preparation that throws returns `error` starting `harness error:` and `cost` 0
- an unknown workflow name throws and names it

`do-not-touch`: `package.json`, `pnpm-lock.yaml`, `harness/results.ts`, `harness/budget.ts`, `harness/cli.ts`, `harness/runner.ts`.

## Craft

Before your first edit, print each craft skill below with its command and follow it while you work:

- `tdd`: `bdk ctx craft tdd`

## Ledger entries

No accepted decision or open blocker names this target.

No other entry names this target; `bdk log list --for 04-2` shows later ones.

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

Run `bdk rules show --ticket A-zrxyr8dj` before you start and follow the rules it prints.

## Return

Write your entries with `bdk log add <type> <summary> --ref <ref> --ticket A-zrxyr8dj`: the summary is 1 to 120 characters (put detail in `--body`), the type is one of decision, finding, observation, blocker, question, assumption, risk, learning, report. Then pipe the full report to `bdk log ingest --ticket A-zrxyr8dj` on stdin (`bdk log ingest --ticket A-zrxyr8dj < <report-file>`; there is no frontmatter flag), the envelope (`status`, `files`, `entries`, `evidence`) as its frontmatter between two `---` lines. `entries` lists the ids `log add` printed. Leave `reason` out, except for `blocked` or `needs-context`. When it refuses, fix the named field and call it again. Return only the envelope and the report path `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/reports/04-2-implementer-A-zrxyr8dj.md`.
