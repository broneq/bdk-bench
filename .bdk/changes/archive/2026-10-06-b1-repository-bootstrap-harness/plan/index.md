---
schema: 1
generated: true
parts:
  - id: "01"
    title: Root package, pinned promptfoo and tooling configuration
    depends-on: []
    wave: 1
  - id: "02"
    title: Ledger, plan, row and shared leaf modules
    depends-on:
      - "01"
    wave: 2
  - id: "03"
    title: Fixture cache, locations, committed-tree check and pinned tool calls
    depends-on:
      - "01"
    wave: 2
  - id: "04"
    title: Run lifecycle - hook, provider, provider entries, assertion, transcript
    depends-on:
      - "02"
      - "03"
    wave: 3
  - id: "05"
    title: Commands - cli, series runner, comparison, re-grade
    depends-on:
      - "04"
    wave: 4
  - id: "06"
    title: Smoke suite and the bench entry point
    depends-on:
      - "05"
    wave: 5
  - id: "07"
    title: CI, README, CLAUDE.md and the formatted tree
    depends-on:
      - "06"
    wave: 6
---

| Part | Title                                                                   | Depends on | Wave |
| ---- | ----------------------------------------------------------------------- | ---------- | ---- |
| 01   | Root package, pinned promptfoo and tooling configuration                | -          | 1    |
| 02   | Ledger, plan, row and shared leaf modules                               | 01         | 2    |
| 03   | Fixture cache, locations, committed-tree check and pinned tool calls    | 01         | 2    |
| 04   | Run lifecycle - hook, provider, provider entries, assertion, transcript | 02, 03     | 3    |
| 05   | Commands - cli, series runner, comparison, re-grade                     | 04         | 4    |
| 06   | Smoke suite and the bench entry point                                   | 05         | 5    |
| 07   | CI, README, CLAUDE.md and the formatted tree                            | 06         | 6    |
