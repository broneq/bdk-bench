# bdk-bench

A benchmark of AI coding workflows. The same short, realistic request goes to each workflow - Claude Code with no plugin, [BDK](https://github.com/broneq/bdk), [OpenSpec](https://github.com/Fission-AI/OpenSpec), others later - in a fresh copy of a pinned frontend repository. Each run goes to completion without a human, and the result is scored against a fixed checklist next to the run's cost and wall time:

| workflow | task | functional | quality | tests | process | total | cost | time |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| example | users-csv | 17/19 | 10/11 | 8/11 | 9/10 | 44/51 | 10.20 USD | 26 min |

## How a run is scored

- **Checklist.** About 50 binary checks per task in four groups: `functional` (the task's requirements), `quality` (code quality, derived from the BDK ruleset but worded neutrally), `tests` (the quality of the tests the workflow wrote, including a mutation score on the new code), `process` (tests, typecheck and lint pass, nothing outside scope changed, the final reply matches the repository state). Each check says how it is verified: a hidden behavioural test, a command, or a judge question. Format: [`checklist/schema.md`](checklist/schema.md).
- **Short prompts, hidden spec.** The workflow gets a request as a user would type it ("I want to export the user list to CSV"). The full product spec stays hidden; a simulated user answers the workflow's questions from it, the same way for every workflow.
- **Same everything else.** Same fixture commit, same orchestrator model, same budget cap; only the workflow differs. Each row records the workflow's version.

## Tasks

| id | request | area |
| --- | --- | --- |
| `users-csv` | Export the user list to CSV | admin users page |
| `operator-i18n` | The operator pages still show English text in another language | operator area, i18n (the fixture's roadmap milestone M-I18N-004) |

Fixture: [`kamkie/technical-interview-frontend`](https://github.com/kamkie/technical-interview-frontend) at `946a2081`, a React and TypeScript app with an admin and an operator area, a mock API and an i18n registry.

## Status

Work in progress; the plan is the issues B1-B8 of this repository. Results will be published under `results/` once the first comparison (B8) has run.

## License

MIT
