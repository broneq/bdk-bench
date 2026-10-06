---
schema: 1
ticket: A-ofr3q1ic
target: 07-2
role: runner
adapter: runner
attempt: 1
of: 3
scope: full
at: 2026-10-06T18:29:46.612Z
kernel-version: 2.7.0
template-hash: sha256:2b93453803b2b63419da370a087d886028a09d26941c3cf6a9a5d00f57a9703b
report: .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/reports/07-2-runner-A-ofr3q1ic.md
rules: []
---
# BDK dispatch package A-ofr3q1ic

You are the `runner` of ticket A-ofr3q1ic: attempt 1 of 3, scope `full`. Work from this package; read other state only through `bdk`.

## Change

B1 Repository bootstrap: harness extracted from BDK evals (https://github.com/broneq/bdk-bench/issues/1)

## Target 07-2

From `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/07-ci-docs-format.md`:

### 07-2 README

Rewrite the "Status" and add sections to `README.md`, keeping its intro, scoring and tasks sections: "Running" (commands from `pnpm bench` with a one-line meaning each: `smoke [--probe]`, `check`, `view`, `report <suite> --baseline <series> --candidate <series>`, `regrade <suite> --series <name>`, flags `--runs`, `--budget`, `--run-cap`, `--concurrency`, `--workflows`, `--items`), "Budget" (one ledger `.runs/budget.json`, caps 100 and 15 USD, run a probe first and approve its projection), "Viewer and results" (rows in `results/<suite>/<series>.jsonl`, promptfoo database under `${XDG_CACHE_HOME:-~/.cache}/bdk-bench/promptfoo`), "Isolation" (per-run working copy, config home and debug log in a sandbox outside the repository; discard reasons), and "Provider facts". Provider facts is the table of `evals/README.md` at `825455dd` (`git -C /Users/broneq/projects/bdk show 825455dd:evals/README.md`) reduced to the 13 rows that hold without a BDK plugin: SDK resolution (now from the root `node_modules`, configs rendered under `.runs/`), auth without an API key, cost of a run, sessions with background subagents (the patch), tools by default, subagent tool calls, per-run working directory, user configuration, promptfoo's model list, built-in plugins, per-run directory under concurrency, a `file://` provider's label, and the viewer. Rows about BDK plugin hooks, agents, skills, `Workflow`, `disable-model-invocation`, slash commands, the plugin skill scan and the v2 plugin are left out; a sentence in a kept row that names BDK is reworded to the bench or removed. Everything is English; no em dash.

**Files:**

- Modify: `README.md`

**Test cases:**

- `grep -n "evals/\|pnpm eval" README.md` prints nothing
- the Provider facts table has a header, a separator and 13 rows, and `grep -n "hooks.json\|bdk:" README.md` prints nothing
- `npx prettier --check README.md` exits 0
- every command listed under "Running" is accepted by `pnpm bench` (checked by running `pnpm bench <command>` with its arguments except the ones that need credentials: usage errors are fine, `unknown` errors are not)
- `grep -c "—" README.md` prints 0

`do-not-touch`: `harness/**`, `package.json`, `pnpm-lock.yaml`, `.bdk/**`.

## Ledger entries

No accepted decision or open blocker names this target.

Other entries of this target: 1 observation, 1 finding; read them with `bdk log list --for 07-2`.

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

Run `bdk rules show --ticket A-ofr3q1ic` before you start and follow the rules it prints.

## Checks

Run the checks in this order. Save each check's output to a file under `.bdk/.machine/checks/` (git ignores it; a file elsewhere is a change in the tree) and end the file with the line `exit <code>`, so a check that prints nothing still leaves a line to cite; never write or edit the output yourself. Record each file; for `pass`, cite the output line or JSON value that shows the result as `--cite <file>:<line>=<text>` or `--cite <file>#<json-pointer>`.

### tests-scoped

The target has no executable file: record `tests-scoped` with `--verdict not-run` and that reason in the file.

`bdk evidence record tests-scoped <file> --ticket A-ofr3q1ic --verdict pass|fail|not-run --cite <citation>`

### lint

The target has no executable file: record `lint` with `--verdict not-run` and that reason in the file.

`bdk evidence record lint <file> --ticket A-ofr3q1ic --verdict pass|fail|not-run --cite <citation>`

## Return

Write your entries with `bdk log add <type> <summary> --ref <ref> --ticket A-ofr3q1ic`: the summary is 1 to 120 characters (put detail in `--body`), the type is one of decision, finding, observation, blocker, question, assumption, risk, learning, report. Then pipe the full report to `bdk log ingest --ticket A-ofr3q1ic` on stdin (`bdk log ingest --ticket A-ofr3q1ic < <report-file>`; there is no frontmatter flag), the envelope (`status`, `files`, `entries`, `evidence`) as its frontmatter between two `---` lines. `entries` lists the ids `log add` printed. Leave `reason` out, except for `blocked` or `needs-context`. When it refuses, fix the named field and call it again. Return only the envelope and the report path `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/reports/07-2-runner-A-ofr3q1ic.md`.
