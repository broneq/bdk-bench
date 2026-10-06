---
schema: 1
id: L-yzhrhjvc
type: finding
summary: 07-4 allows quoting changes but its word-diff test fails on them; operator-i18n/checks.yaml:263 is one
status: proposed
source: agent:verifier
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T17:27:53.841Z
ticket: A-pvbw6479
refs:
  - .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/07-ci-docs-format.md
---
07-ci-docs-format.md:60 allows "whitespace, table alignment, quoting and line wrapping"; its test at line 73 (`git diff --word-diff=porcelain --ignore-all-space`, "no added or removed word") and stop rule at line 76 treat any word change as a stop. Prettier 3.9.9 with the source .prettierrc.json rewrites `tasks/operator-i18n/checks.yaml:263` from single to double quotes (`'ROADMAP.md ...'` -> `"ROADMAP.md ..."`), which word-diff reports as changed words, so the executor either fails the test or stops as blocked on a permitted change. For YAML compare parsed data (both revisions parse to deep-equal values); for Markdown the word-diff works (checked: only table padding changes in checklist/*.md and tasks/*/spec.md).
