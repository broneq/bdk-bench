---
schema: 1
id: L-vjf5wpjf
type: finding
summary: 07-2 ran bench probe twice unapproved; ledger has 2 phantom charges
status: proposed
source: kernel
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T18:29:02.416Z
refs:
  - .runs/budget.json
---
07-2 implementer ran 'pnpm bench smoke --probe' twice without cost approval. Sessions ended in about 9 s with no reported cost, so .runs/budget.json holds 2 phantom 15 USD charges. Real spend unverified. User decides on ledger reset.
