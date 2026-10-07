---
schema: 1
id: L-rdvhne2g
type: finding
summary: "Risk public-api: new bench CLI, result row JSONL format, ledger and plan file formats"
status: accepted
source: agent:integration-reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T20:34:21.766Z
ticket: A-qy7ysb9p
group: integration
refs:
  - public-api
  - harness/cli.ts
  - harness/results.ts
  - harness/budget.ts
review: true
level: nice-to-have
disposition: defer
---

Problem: Severity info. New interfaces others consume: the `pnpm bench` commands and flags (`<suite> --probe --runs --budget --run-cap --concurrency --workflows --items`, `check`, `view`, `report --baseline --candidate`, `regrade --series`), exit codes 0/1/2; the committed row format `results/<suite>/<series>.jsonl` (`workflow`, `discarded`, `metrics` with harness `turns`/`wall_s`, `provenance { models, fixtureCommit, benchCommit, adapter { name, version } }`) validated on append; `.runs/budget.json` entries `{ suite, workflow, run, cost, at }`; `SuiteRunner`/`SuiteHooks` for B3 and B7. README "Running" and CLAUDE.md "Development commands" match the parser.

Why it matters: Rows are committed and compared across series; a field change later needs a re-grade or migration. The row contract holds in code, but no row has been produced end to end yet (L-dzhorbso).

Suggested fix: None beyond L-dzhorbso; confirm one real probe row matches this format before B3 builds on it.

Triaged as nice-to-have at 2026-10-06T20:35:40.264Z

Decided defer at 2026-10-06T21:15:02.824Z
