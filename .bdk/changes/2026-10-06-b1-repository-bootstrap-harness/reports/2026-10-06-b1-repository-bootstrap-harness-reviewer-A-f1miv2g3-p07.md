---
schema: 1
ticket: A-f1miv2g3
role: reviewer
at: 2026-10-06T21:39:15.069Z
group: p07
status: done
files: []
entries: []
evidence: []
---

# Review p07 (README.md), range 57b47df..1c946e8

The range changes one sentence of README.md's Isolation section: the discard reasons now also list "no cost was reported (the run cap is charged)" and "a harness error".

Holds:
- Both added reasons match harness/hook.ts lines 229 and 298-303 ("harness error: ..." and "no reported cost; the ledger charged the run cap").
- Plan 07-2 checks pass: no `evals/`, `pnpm eval`, `hooks.json` or `bdk:` match; 0 em dashes; `prettier --check README.md` clean; Provider facts table has header, separator and 13 rows; budget defaults 100 and 15 match harness/budget.ts; ledger path matches harness/paths.ts.
- Commands under "Running" match the `pnpm bench` usage text.

Not wrong: the sentence is a long run-on with a mixed "when" list, which is style and left to simplify. No findings.
