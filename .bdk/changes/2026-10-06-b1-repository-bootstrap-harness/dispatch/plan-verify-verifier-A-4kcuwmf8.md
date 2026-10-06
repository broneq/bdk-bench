---
schema: 1
ticket: A-4kcuwmf8
target: plan-verify
role: verifier
adapter: reader
attempt: 1
of: 2
scope: full
at: 2026-10-06T21:18:23.780Z
kernel-version: 2.7.0
template-hash: sha256:8d24a97fd19fe72fc598665e6400c3d3cd62cbd5cab5e292d8ade321c2e63b46
report: .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/reports/plan-verify-verifier-A-4kcuwmf8.md
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
  - BDK-EJ-1
  - BDK-EJ-2
  - BDK-PL-1
  - BDK-PL-2
  - BDK-PL-3
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
  - BDK-PL-4
  - BDK-CQ-9
  - BDK-JS-1
  - BDK-JS-2
  - BDK-JS-3
  - BDK-JS-4
  - BDK-JS-5
  - BDK-JS-6
  - BDK-JS-7
  - BDK-JS-8
---

# BDK dispatch package A-4kcuwmf8

You are the `verifier` of ticket A-4kcuwmf8: attempt 1 of 2, scope `full`. Work from this package; read other state only through `bdk`.

## Change

B1 Repository bootstrap: harness extracted from BDK evals (https://github.com/broneq/bdk-bench/issues/1)

## Target plan-verify

Read:

- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/01-tooling.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/02-leaf-modules.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/03-fixture-paths-tools.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/04-run-lifecycle.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/05-commands.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/06-smoke-suite-and-entry.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/07-ci-docs-format.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/spec-delta/bench-runner.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/design.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/architecture.md`

## Ledger entries

No accepted decision or open blocker names this target.

Other entries of this target: 2 blocker, 5 report, 2 finding; read them with `bdk log list --for plan-verify`.

## Role: verifier

### Input

Your prompt or skill argument is the path of your dispatch package. Rely on nothing else from the conversation.

1. Read the package with `bdk dispatch show <path>`: your ticket, target, binding decisions and blockers, report path.
2. Read your rules with `bdk rules show --ticket <ticket>` before any other work.
3. Read entries the package only counts with `bdk log list --for <task|part|file>` and `bdk log show <id>`.

A missing or unparseable package: return `blocked` with the reason.

### Work

You verify the plan parts the package names, together, against the current code and the design documents it names. You change no file.

For each task, check:

1. Every function, field and file it relies on exists as stated.
2. Two or three traced inputs reach what the next step reads.
3. Edge cases the intent or design implies that the task left open.
4. Callers of a changed symbol that would behave differently. If users would see the change and no task or `decision` covers it, it is an `unresolved-decision` blocker.
5. Files used but not in `Files:`; undeclared task dependencies.

Across the plan, check:

- **Test cases.** Each case names an input and its expected observable result. An edge case outside the intent and design is a finding. A behaviour without a case is an `unresolved-decision` blocker.
- **Design coverage.** Every requirement, decision and failure path of the design and accepted `decision` entries has a task; a missing one is an `unresolved-decision` blocker.
- **Between parts.** A part using another's output names it in `depends-on`; independent parts do not modify one file; callers use a changed signature in its new form.
- **Isolation.** Two `shared` parts of one wave rewriting one state outside `Files:` (a lockfile, codegen output, migrations) are an `integration-failure` blocker naming both; `isolation: worktree` on one, with an `isolation-reason` naming it, settles it. A reason naming none is a finding.
- **No implementation code.** A function body in a task's code block is a finding.

- Raise a `blocker` only with a category from the package's blocking categories (`--category <id>`).
- Anything on the package's "not a FAIL" list is an `observation` or nothing.
- Any other problem is a `finding` naming file and line.
- Your verdict is the envelope `status` and the report: what holds and what does not, with evidence. You never move the Change on.

### Ledger

Record what others need when you know it, each entry with a ref: `bdk log add <type> "<summary>" --ref <file|task|id> --ticket <ticket>`; summary at most 120 characters, details via `--body -`.

When a rule forced a decision or a finding breaks one, cite its rule id exactly as `bdk rules show --ticket` prints it: as a `--ref <id>` of the entry and by id in your report.

### Messages

A `SendMessage` carries a ledger id and one sentence, never the content; write the entry first. Send an entry that affects the rest of the part to your parent (`BDK-PARENT`), one that must stop other work to `main`, one for particular running agents to the ids `bdk agents list --affected-by <entry>` returns, your own id left out. On a message, read the named entry with `bdk log show <id>`, then continue, adapt within your package, or return `blocked` with the entry id.

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

When `log ingest` exits non-zero, fix the field it names and call it again; never write the report file yourself.

Then record your verdict: `bdk log add report "<your verdict in one line>" --ref <target> --ticket <ticket>`.

Then return only the envelope, at most 15 lines, and the report path as the package names it.

## Rules

Run `bdk rules show --ticket A-4kcuwmf8` before you start and follow the rules it prints.

## Blocking categories (P8)

A blocker names one of these with `bdk log add blocker <summary> --ref <ref> --ticket A-4kcuwmf8 --category <id>`; any other blocker is stored as an observation for review.

- `architecture`: Materially invalid architecture, or a contradiction with an accepted decision.
- `security`: A security, privacy or authentication risk.
- `irreversible-step`: An irreversible or high-cost step without justification, such as a migration or data loss.
- `integration-failure`: A critical integration, data, rollout or rollback failure.
- `unresolved-decision`: An execution-critical unresolved decision or omitted requirement.
- `false-code-claim`: A claim about the real code that is false.

## Not a fail

Never block on these:

- `style`: Style.
- `template-conformance`: Template conformance.
- `files-bookkeeping`: `Files:` bookkeeping.
- `wording`: Wording.
- `report-length`: Report length.
- `verification-defect`: A verification defect, unless it removes the only real evidence of the change's safety.

## Return

Write your entries with `bdk log add <type> <summary> --ref <ref> --ticket A-4kcuwmf8`: the summary is 1 to 120 characters (put detail in `--body`), the type is one of decision, finding, observation, blocker, question, assumption, risk, learning, report. Then pipe the full report to `bdk log ingest --ticket A-4kcuwmf8` on stdin (`bdk log ingest --ticket A-4kcuwmf8 < <report-file>`; there is no frontmatter flag), the envelope (`status`, `files`, `entries`, `evidence`) as its frontmatter between two `---` lines. `entries` lists the ids `log add` printed. Leave `reason` out, except for `blocked` or `needs-context`. When it refuses, fix the named field and call it again. Return only the envelope and the report path `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/reports/plan-verify-verifier-A-4kcuwmf8.md`.
