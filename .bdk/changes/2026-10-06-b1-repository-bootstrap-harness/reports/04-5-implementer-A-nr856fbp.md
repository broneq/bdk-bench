---
schema: 1
ticket: A-nr856fbp
role: implementer
at: 2026-10-06T18:13:37.626Z
status: done
files: [ harness/transcript.ts, harness/transcript.test.ts ]
entries: []
evidence: []
---
Copied transcript.ts and its test with the copy rules. Removed the kernel-refusal branch of `outcome` and its test. A refused-looking output is now asserted as `ok`. BDK names in test inputs were replaced by neutral ones. Red was the missing module. Green is 5 tests. tsc, eslint and prettier are clean.
