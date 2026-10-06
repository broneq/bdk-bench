---
schema: 1
id: E-gvswu17m
kind: tests-scoped
ticket: A-ypvektfx
target: 07-3
at: 2026-10-06T18:30:34.205Z
author: Przemysław Broniszewski <przemek@broniszewski.net>
source: agent:runner
tree-hash: sha256:924ba146cab0de20d68c1bbd2b6c69acea47cfa124fa3cc9305df53b6e614a8f
tree:
  - path: .github/workflows/ci.yml
    hash: sha256:3ad1a19d8944f436295b968ca6080f7043327de32feb76b60b72054a88c4bb40
  - path: checklist/*.yaml
    hash: absent
  - path: package.json
    hash: sha256:d0255b0c4663b3d6aff46bdbf637660d99da4ec9fbf72f3f2b57b7fd09ab7faf
  - path: pnpm-lock.yaml
    hash: sha256:efc4423237323c53dd4e1e6cd76babe41b1198a56577acea9b2a5fb1ae8c68eb
  - path: tasks/*/checks.yaml
    hash: absent
  - path: tasks/*/task.yaml
    hash: absent
  - path: tsconfig.json
    hash: sha256:115dd33790e519c9348085813625885c51010d6a7655ab928a83b92b19303d7d
files:
  - path: .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/evidence/07-3-E-gvswu17m-tests-scoped.txt
    hash: sha256:e5adf86a13b8d900ca2316b8f8bc01ed1e789b525ec53a4fee56a78fce007cf9
    stored: committed
verdict: not-run
citations:
  - .bdk/.machine/checks/tests-scoped.txt:1=The target CLAUDE.md is a documentation file, not an executable file.
---
