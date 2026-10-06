---
schema: 1
ticket: A-wo0ruolo
target: 07-1
role: runner
adapter: runner
attempt: 1
of: 3
scope: full
at: 2026-10-06T18:29:46.416Z
kernel-version: 2.7.0
template-hash: sha256:2b93453803b2b63419da370a087d886028a09d26941c3cf6a9a5d00f57a9703b
report: .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/reports/07-1-runner-A-wo0ruolo.md
rules: []
---
# BDK dispatch package A-wo0ruolo

You are the `runner` of ticket A-wo0ruolo: attempt 1 of 3, scope `full`. Work from this package; read other state only through `bdk`.

## Change

B1 Repository bootstrap: harness extracted from BDK evals (https://github.com/broneq/bdk-bench/issues/1)

## Target 07-1

From `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/07-ci-docs-format.md`:

### 07-1 CI workflow

Create `.github/workflows/ci.yml`: `name` `ci`; `on` `pull_request` and `push` to `main`; one job `check` on `ubuntu-latest` with `permissions: { contents: read }`. Steps in order: `actions/checkout@v7`; `pnpm/action-setup@v6` (version from `packageManager`); `actions/setup-node@v7` with `node-version-file: .nvmrc` and `cache: pnpm`; `pnpm install --frozen-lockfile`; `pnpm lint`; `pnpm format:check`; `pnpm typecheck`; `pnpm test`; `pnpm bench check`. No secret and no `ANTHROPIC_API_KEY` is referenced.

**Files:**

- Create: `.github/workflows/ci.yml`

**Test cases:**

- `npx prettier --check .github/workflows/ci.yml` exits 0
- `grep -n "run:" .github/workflows/ci.yml` lists, in order, `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm bench check`, and the file has exactly one job
- `grep -ci secret .github/workflows/ci.yml` prints 0
- the pull request of this Change shows the `ci` check green (reported by the lead, not a unit test)

`do-not-touch`: `harness/**`, `package.json`, `pnpm-lock.yaml`, `.bdk/**`.

## Ledger entries

No accepted decision or open blocker names this target.

No other entry names this target; `bdk log list --for 07-1` shows later ones.

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

Run `bdk rules show --ticket A-wo0ruolo` before you start and follow the rules it prints.

## Checks

Run the checks in this order. Save each check's output to a file under `.bdk/.machine/checks/` (git ignores it; a file elsewhere is a change in the tree) and end the file with the line `exit <code>`, so a check that prints nothing still leaves a line to cite; never write or edit the output yourself. Record each file; for `pass`, cite the output line or JSON value that shows the result as `--cite <file>:<line>=<text>` or `--cite <file>#<json-pointer>`.

### tests-scoped

- `npx vitest related --run .github/workflows/ci.yml`

Record: `bdk evidence record tests-scoped <file> --ticket A-wo0ruolo --verdict pass|fail|not-run --cite <citation>`

### lint

- `npx eslint .github/workflows/ci.yml`
- `npx prettier --check .github/workflows/ci.yml`

Record: `bdk evidence record lint <file> --ticket A-wo0ruolo --verdict pass|fail|not-run --cite <citation>`

## Return

Write your entries with `bdk log add <type> <summary> --ref <ref> --ticket A-wo0ruolo`: the summary is 1 to 120 characters (put detail in `--body`), the type is one of decision, finding, observation, blocker, question, assumption, risk, learning, report. Then pipe the full report to `bdk log ingest --ticket A-wo0ruolo` on stdin (`bdk log ingest --ticket A-wo0ruolo < <report-file>`; there is no frontmatter flag), the envelope (`status`, `files`, `entries`, `evidence`) as its frontmatter between two `---` lines. `entries` lists the ids `log add` printed. Leave `reason` out, except for `blocked` or `needs-context`. When it refuses, fix the named field and call it again. Return only the envelope and the report path `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/reports/07-1-runner-A-wo0ruolo.md`.
