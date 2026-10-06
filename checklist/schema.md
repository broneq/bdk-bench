# Checklist schema

The benchmark gives one short user request to a coding workflow, lets the workflow run to completion in a copy of a pinned fixture repository, and then scores the final repository state and the final reply against a checklist. The score is reported next to the run's cost and wall time, for example `41/44 checks, 10 min, 10 USD`.

This document defines the check format, the groups, the verification kinds, the shared test harness, scoring, and the neutrality rules every check must follow.

## Files

| Path                           | Content                                                                       |
| ------------------------------ | ----------------------------------------------------------------------------- |
| `checklist/schema.md`          | This document.                                                                |
| `checklist/quality.yaml`       | Shared code-quality checks (group `quality`).                                 |
| `checklist/process.yaml`       | Shared outcome-hygiene checks (group `process`).                              |
| `checklist/tests.yaml`         | Shared test-quality checks (group `tests`), including mutation testing.       |
| `checklist/skipped-rules.md`   | Source ruleset bullets that were not turned into checks, with the reason.     |
| `tasks/<id>/task.yaml`         | Task id, prompt, fixture pin, scope allow-list, and the shared checks that apply. |
| `tasks/<id>/spec.md`           | The hidden product spec. Only the simulated user reads it; the workflow never does. |
| `tasks/<id>/checks.yaml`       | The task's functional checks and its own `tests` checks for the spec's risky cases. |

## Check format

Every check file is a YAML list of entries:

```yaml
- id: users-csv.f01          # <task id or group>.<letter><nn>; f = functional, q = quality, t = tests, p = process
  group: functional           # functional | quality | tests | process
  check: One sentence stating the observable condition that passes.
  verify:
    kind: test                # test | command | judge
    how: >-
      test: setup, action, assertion, naming the harness helpers below.
      command: the exact shell command and its pass condition.
      judge: the exact yes/no question (yes always means pass) and the evidence the judge reads.
  source: spec.md#columns     # spec section, ruleset bullet id, or fixture document
```

Rules for a check:

- It is binary. There is no partial credit and no "not applicable": a check whose subject is absent from the change states in its `how` whether that counts as a pass (for example "no type assertion was added" passes the type-assertion check).
- It is decided only from the final repository state (working tree compared with the base commit, untracked files included) and the final reply. Nothing that happened during the run (messages, tool calls, intermediate files, time spent, questions asked) is evidence.
- It names its verification precisely enough that two people implementing it get the same verdict.
- `source` points at the reason the check exists. A check derived from the BDK ruleset cites the bullet id only in `source`; the id, the word BDK and the rule text never appear in `check` or in a judge prompt.

## Groups

| Group        | Scope                                                                                       | File                      |
| ------------ | ------------------------------------------------------------------------------------------- | ------------------------- |
| `functional` | The requirements of one task's hidden spec.                                                  | `tasks/<id>/checks.yaml`  |
| `quality`    | Code quality of the change, shared by all tasks: neutral rewordings of ruleset bullets that fit a TypeScript/React diff, plus conventions the fixture itself demands. | `checklist/quality.yaml`  |
| `tests`      | The quality of the tests the workflow wrote: they exist and fail without the feature, existing tests stay intact, the right layer, real assertions, mutation score and line coverage of the new code (`checklist/tests.yaml`), plus per-task checks that the spec's risky cases are tested (`tasks/<id>/checks.yaml`). In agentic coding the tests are what lets the next change trust the code, so they are scored apart from the code itself. | `checklist/tests.yaml`, `tasks/<id>/checks.yaml` |
| `process`    | Outcome hygiene any workflow should meet: green suite, typecheck, lint and build; scope; no debug leftovers; fixture documentation conventions; an honest final reply. | `checklist/process.yaml`  |

`task.yaml` lists which shared checks apply to the task under `applies`. A shared check that does not apply to a task is left out of that task's total; it is never scored as a free pass.

## Verification kinds

### `test`

A hidden behavioural test. The runner copies the benchmark's hidden test files into `src/__bench__/` of the final working tree and runs them with the fixture's own runner:

```sh
TZ=America/New_York npx vitest run src/__bench__/<file> --reporter=json --outputFile=<out>
```

Each check maps to one `it()` whose title starts with the check id. A check that needs a real browser (a download, for example) is a `command` check that runs a hidden Playwright script from `bench/e2e/` against the fixture's Vite mock mode, the way the fixture's own smoke scripts do. The check passes if and only if that test passes. A hidden test that fails to compile or import counts as failed.

Hidden tests depend only on what exists at the base commit and on what the hidden spec fixes:

- They import only modules that exist at the base commit (`src/admin/AdminUsersPage.tsx`, `src/operator/*.tsx`, `src/i18n/*`, `src/api/*`, `src/ui/format.ts`). They never import a module, function or key name the workflow chose.
- They find controls by role and an accessible-name pattern (`getByRole('button', { name: /export|csv/i })`), act through `@testing-library/react` the way a user would, and assert on observable output: rendered text and attributes, the router location, the requests sent, the downloaded file.
- They render page components inside `createMemoryRouter` / `RouterProvider`, exactly as the fixture's own page tests do, with `fetch` stubbed through `vi.stubGlobal`.

### `command`

A shell command run from the root of the final working tree, with `BASE` set to the base commit and the working tree prepared as described under "Diff preparation". The `how` text states the command and the pass condition (usually exit status 0, or an empty output). Commands may call small scripts shipped with the benchmark under `bench/scripts/`; the `how` text then states exactly what the script computes.

### `judge`

An LLM judge answers one yes/no question. `how` gives the exact question and the evidence it reads, chosen from:

- `diff`: the prepared diff against the base commit (see below), with the files' full post-change content available on request.
- `added-tests`: the added and changed test code from the diff.
- `reply`: the workflow's final reply to the user.
- `command-outputs`: the outputs of the `process` commands for the same run.

Judge protocol: a fixed model pinned in the benchmark config, temperature 0, three independent samples, majority vote. A "yes" always means pass. Before judging, the reply is redacted of workflow and tool names (for example plugin names, agent names, slash commands), and the judge is told to ignore any mention of how the work was organised. Use `judge` only where a test or a command cannot decide.

## Diff preparation

Before any check runs, the runner prepares the final working tree once:

1. `git add --intent-to-add --all` so untracked files appear in `git diff` (ignored files stay ignored by `.gitignore`).
2. Workflow-state paths are excluded from every diff, command and judge input. Each workflow adapter declares its own state paths up front (for example `.bdk/`, `openspec/`, `.claude/`, `CLAUDE.md`, `AGENTS.md`, plan or scratch directories it creates). The same exclusion mechanism applies to every workflow; the excluded paths are listed in the run report but never scored. A file a workflow writes outside its declared state paths is part of the change and is scored like any other file.
3. "The diff" means `git diff --find-renames $BASE -- . <exclude pathspecs>`, which covers commits made during the run, staged and unstaged changes, and new files.
4. "Added lines" means lines starting with `+` (excluding `+++`) in `git diff -U0 $BASE`.
5. "Non-test source" means `src/**/*.ts` and `src/**/*.tsx` excluding `**/*.test.ts`, `**/*.test.tsx`, `src/test/**` and `src/__bench__/**`.

## Hidden test harness

The hidden tests share these helpers (shipped in `bench/harness/`, copied next to the hidden tests). Check `how` texts refer to them by name.

### `H-admin` (admin users page)

- Verbatim copies of the file-local helpers of the base commit's `src/admin/AdminUsersPage.test.tsx`: `renderAdminUsers(initialEntry, session)`, `mockAdminUsersFetch({ account, users, replaceRolesResponse, replaceStatusResponse })`, `createUsers()`, `createAdminUser(overrides)`, `createRoleGrant(overrides)`, `createAccount(overrides)`, `createSession(overrides)`, `problemResponse(status, message)`, `toResponse(value)`, `clearDocumentCookies()`.
- One extension: `mockAdminUsersFetch` also accepts `catalog` (a localization page) and answers any `GET` whose path starts with `LOCALIZATIONS_PATH` with it, and `pendingUsers: true`, which answers `GET /api/admin/users` with a promise that never settles.
- `exportUsers()`: the export data set described in `tasks/users-csv/checks.yaml` (header comment), built with `createAdminUser`.
- Every test creates a fresh session object, because the fixture caches the current account per session.

### `H-download` (file download capture)

`installDownloadCapture()` must be called before the click. It records every way a browser download can be triggered from page code without new dependencies:

- spies `URL.createObjectURL` (records the `Blob`, returns `blob:bench/<n>`) and `URL.revokeObjectURL` (records the revoked URL);
- spies `HTMLAnchorElement.prototype.click` and click events passed to `HTMLAnchorElement.prototype.dispatchEvent`, recording the anchor's `href`, `download` attribute and whether it was connected to the document;
- stubs `window.open`, recording the URL.

`downloads()` returns one entry per triggered download: `{ fileName, mime, bytes, text, href, revoked }`. For a `blob:` href the payload is the recorded `Blob` (`bytes` from `blob.arrayBuffer()`, `mime` from `blob.type`); for a `data:` href it is decoded from the URL (`mime` from the media type). `text` is `new TextDecoder('utf-8', { ignoreBOM: true }).decode(bytes)`, so a byte order mark stays visible as `﻿`. `revoked` is true when the blob URL was passed to `URL.revokeObjectURL` within one second after the click (always true for `data:` hrefs). `strayAnchors()` returns `a[download]` elements still attached to the document.

### `H-csv` (CSV parsing)

`parseCsv(text)` is a strict RFC 4180 parser: it strips one leading `﻿`, splits fields on `,`, supports quoted fields with doubled quotes and embedded line breaks, and returns `{ records, terminators }`, where `terminators` lists the line terminator found after each record (`\r\n` or `\n`; the last record may have none). It throws on a malformed quote. `column(records, pattern)` returns the index of the single header cell matching `pattern` (case-insensitive) and throws when zero or several match. `cell(records, rowPredicate, pattern)` returns one data cell.

### `H-i18n` (rendering with a non-English language)

- `pseudoRows()`: one localization row per key of `UI_MESSAGES` (imported from `src/i18n/messages.ts` of the final tree, so it includes keys the workflow added), language `pl`, message text `⟦<English default>⟧`. Placeholders such as `{count}` stay inside the brackets, so formatted values appear inside the marked segment.
- `catalogPage(rows)`: a localization page response containing all rows on page 0 with `last: true`.
- `renderWithCatalog(ui, { rows })`: sets the cookie `language=pl`, routes `GET` requests starting with `LOCALIZATIONS_PATH` to `catalogPage(rows)` (other paths go to the test's own router), renders `<I18nProvider><Probe />{ui}</I18nProvider>`, where `Probe` renders a hidden `data-bench-probe` element with `t('ui.shell.brand')`, and waits until the probe text contains `⟦`, which proves the catalog is applied. Cleanup: `clearUiCatalogCache()`, `setActiveRequestLanguage(undefined)`, the `language` cookie cleared, `vi.unstubAllGlobals()`.

### `H-sweep` (unkeyed text detector)

`unkeyedText(root, allowlist)` walks every element under `root` except the probe and collects (a) the element's text when the element has a direct non-blank text node, using the element's full `textContent`, and (b) the values of the attributes `aria-label`, `title`, `placeholder`, `alt`, `aria-description`, `aria-roledescription` and `aria-valuetext`. For each collected string it repeatedly removes innermost `⟦...⟧` segments, then removes every allowlisted data value (longest first), then reports any remaining run of two or more letters (`/\p{L}{2,}/u`). The result is a list of `<tag or [attribute]>: <leftover words>`; an empty list means every visible word came from the registry or from data. `isSingleTemplate(text)` is true when the trimmed text is exactly one balanced `⟦...⟧` segment (nested segments allowed inside), which proves the string came from one message template rather than concatenated fragments.

### `H-operator` (operator fixtures)

`auditPage(overrides)`, `auditRow(overrides)`, `surface(overrides)`, `session()` (a new object on every call, which also bypasses the diagnostics page's per-session cache) and `operatorFetch({ auditPage, surface })`. The data values are listed in the header comment of `tasks/operator-i18n/checks.yaml`; the sweep allowlist is exactly those values, their `formatTimestamp` renderings, `__APP_NAME__`, `__APP_VERSION__`, `formatTimestamp(__APP_BUILD_TIME__)`, the Vite mode `test`, and the raw audit enum identifiers.

## Scoring

- Each check scores 1 (pass) or 0 (fail). A check that cannot run because of the change (missing file, compile error, a command failing on the workflow's code) scores 0. A failure of the grader itself (a crashed tool before it reached the workflow's code, a judge error after retries) is not a score: the run is re-graded.
- Per run the report gives passed/total for each group and in total: `functional 17/19, quality 10/11, tests 8/11, process 9/10, total 44/51`.
- The report row adds the run's wall time (workflow start to final reply) and its cost (sum of model usage at list prices) next to the total. Cost and time are reported, never folded into the score.
- A workflow runs once per task by default; where it runs several times, the report gives the median and the range of each number.

## Neutrality rules

The benchmark compares workflows, so no check may favour one of them.

1. No check rewards using a particular workflow, plugin, tool, file layout or vocabulary. Checks never mention or look for `.bdk/` files, OpenSpec changes, plans, task lists, review reports, test-first ordering, subagents, or any other process artifact.
2. Only the final repository state and the final reply are evidence. A check never inspects the conversation, tool calls, intermediate states or the number of questions asked.
3. Workflow-state paths are excluded uniformly (see "Diff preparation"); everything else a workflow writes is scored the same way for every workflow.
4. Ruleset-derived checks are reworded into concrete, framework-neutral statements about this codebase. Only bullets that apply to a TypeScript/React frontend change and can be decided from the diff are used; the rest are listed in `skipped-rules.md`.
5. Where the fixture's own conventions (its `CONTRIBUTING.md`, `docs/`, ESLint config, i18n registry rules, test layout) conflict with a ruleset bullet, the fixture wins and the bullet is skipped.
6. Hidden tests depend only on the base commit and the hidden spec, never on names the workflow chose.
7. A functional check verifies only what every correct implementation must satisfy. Choices the codebase does not settle (file name, column set, header wording, value formats, whether filters apply) live in `spec.md` as the simulated user's answers, never as a pass condition: a workflow that asks gets the spec's answer, and any reasonable choice passes. Where a check covers such a choice, it accepts every reasonable option and fails only the wrong ones.
8. Judge prompts are fixed in advance, phrased so that "yes" means pass, and never mention which workflow produced the change.
