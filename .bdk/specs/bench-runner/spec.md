---
bdk-merge-hash: sha256:67897fa6c1663d094b1485392672f8496e46591cdd40415e7ba83def4021ff8d
bdk-change: 2026-10-06-b1-repository-bootstrap-harness
---

# bench-runner Specification

## Purpose

The bench runner runs one workflow session per workflow, task and run on a pinned fixture repository, in parallel, within a cost budget, and records each run as one result row that the promptfoo viewer also shows.

## Requirements

### Requirement: Per-run isolation

The runner SHALL give every run its own working copy, configuration home and debug log, copied fresh from its workflow's base, outside the repository, and SHALL discard a run whose debug log shows a directory-loaded plugin other than the workflow's, claude.ai connectors that were not disabled, or an MCP tool call.

#### Scenario: Two runs in parallel do not share files

- **WHEN** two runs of one task start at the same time
- **THEN** each session works in a different directory and writes a different debug log

#### Scenario: A run with an unexpected plugin is not counted

- **WHEN** the debug log of a run shows a directory-loaded plugin count different from the workflow's expected count
- **THEN** its row has a discard reason and its metrics hold only turns and wall time

### Requirement: Budget ledger and run cap

The runner SHALL keep one ledger of the cost of every run and judge call of every suite, SHALL NOT start a run once the ledger reaches the budget, and SHALL cap each session at the run cap; the budget defaults to 100 USD and the run cap to 15 USD.

#### Scenario: The budget is reached

- **WHEN** the ledger holds 100 USD of a 100 USD budget and a run is about to start
- **THEN** no session starts, the response names the budget, and the run gets no row and no charge

#### Scenario: A run without a reported cost

- **WHEN** a session ends without a reported cost
- **THEN** the ledger is charged the run cap and the row is discarded with that reason

### Requirement: One row per run

The runner SHALL append one JSON line per run to `results/<suite>/<series>.jsonl` with the suite, series, workflow, item, run number, discard reason, cost, metrics including turns and wall time in seconds when reported, and provenance: models, fixture commit, bench commit and adapter name and version.

#### Scenario: A counted run

- **WHEN** a session reports 7 turns and a wall time of 12.5 seconds
- **THEN** its row holds `turns` 7 and `wall_s` 12.5 next to the suite's metrics

#### Scenario: A row without a bench commit is refused

- **WHEN** a row is appended whose bench commit is not 40 hexadecimal characters
- **THEN** the append fails and names the field

### Requirement: Default of one run

The runner SHALL run each workflow once per item unless `--runs` names a larger integer, and SHALL refuse `--runs` below 1.

#### Scenario: Default runs

- **WHEN** `bench smoke` is given no `--runs`
- **THEN** every workflow runs once per item

#### Scenario: Zero runs

- **WHEN** `--runs 0` is given
- **THEN** the command exits 2 and prints the usage text

### Requirement: Pinned fixture

The runner SHALL prepare the fixture at the commit pinned in `versions.json` once, remove the fixture's own agent instructions, commit the result as the base on branch `feat/eval` and `main`, mark it `.bench-base`, and refuse when the fetched commit differs from the pin.

#### Scenario: Pin mismatch

- **WHEN** the fetched HEAD differs from the pinned commit
- **THEN** preparation fails with an error that names both commits

#### Scenario: Agent instructions are removed

- **WHEN** the fixture has `.claude/`, `.agents/`, `CLAUDE.md` and `AGENTS.md`
- **THEN** the base has none of them

### Requirement: Committed tree for a measured series

The runner SHALL refuse to start a measured series when the working tree has changes outside `results/` and `.bdk/`, and SHALL NOT apply that check to a probe.

#### Scenario: Dirty tree

- **WHEN** a tracked file outside `results/` and `.bdk/` is modified and a measured series starts
- **THEN** it refuses and names the file

#### Scenario: Probe on a dirty tree

- **WHEN** the same tree is used for a probe
- **THEN** the probe starts

### Requirement: Model-free check

The `check` command SHALL render every suite's configuration for one and for five runs and validate it with the pinned promptfoo without credentials, network or a model call.

#### Scenario: Check in CI

- **WHEN** `pnpm bench check` runs with no credentials
- **THEN** it exits 0 and prints the names of the checked suites

### Requirement: Series comparison and re-grade

The runner SHALL print, for two series of one suite, each workflow's, item's and metric's values side by side from the counted rows, and SHALL re-judge the saved judge requests of a series with the suite's current instructions without starting a session, refusing before the first judge call when any request is missing.

#### Scenario: Comparing two series

- **WHEN** `report smoke --baseline a --candidate b` runs and both series have rows
- **THEN** a table with one line per workflow, item and metric, cost included, is printed

#### Scenario: Re-grade with a missing request

- **WHEN** a counted row has no saved judge request
- **THEN** the command exits 2 before any judge call and names the workflow, item and run
