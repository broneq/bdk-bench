---
schema: 1
ticket: A-kuit02bz
role: implementer
at: 2026-10-07T02:46:33.568Z
status: done
files: [harness/paths.ts, harness/paths.test.ts, harness/main.ts, harness/compare.ts, harness/suites/smoke/suite.ts]
entries: []
evidence: []
---

Fixed L-bndhs6ue: cacheHome falls back to os.userInfo().homedir (injectable second argument), tests now independent of the process HOME (injected fallback plus an absolute-path assertion). Verified HOME= gives SANDBOX_DIR under the real home.

Fixed L-7qqjll91: added seriesDir and seriesNames to harness/paths.ts; used by suite.ts, main.ts regrade and compare.ts. Renamed a shadowing local in suite.ts.

lint, typecheck and 179 unit tests pass.
