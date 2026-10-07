# Hidden spec: operator localization coverage (M-I18N-004)

The product owner's spec for the `operator-i18n` task, taken from the fixture's `ROADMAP.md` milestone `M-I18N-004` (epic `E-I18N-006`, tasks `T-I18N-011`, `T-I18N-012`, `T-I18N-013`) and the code at the base commit. The simulated user answers clarifying questions from this document. The workflow never sees it. Where the roadmap and the code do not settle a choice, the decision is marked **Decision (not settled by the codebase)**, with the reason.

## Context

The UI renders its chrome through the localization registry: `t(key, params)` from `useI18n()` (`src/i18n/useI18n.ts`) resolves a key from the active language's catalog (loaded by `I18nProvider` from the public `/api/localizations` endpoint) and falls back to the English default recorded in `UI_MESSAGES` (`src/i18n/messages.ts`). Placeholders use `{name}` and `formatUiMessage`.

The operator pages bypass `t()` for most of their chrome: about 90 strings on `/operator` (`src/operator/OperatorPage.tsx`, `src/operator/AuditEntryDetails.tsx`, `src/operator/auditFormat.ts`) and `/operator/diagnostics` (`src/operator/OperatorDiagnosticsPage.tsx`) are hard-coded English. With Polish active, those pages render mixed languages. The roadmap also records three registry keys left without call sites by earlier reworks.

## Goal

With a non-English language active, every user-visible string on `/operator` and `/operator/diagnostics` resolves through the localization registry, with English appearing only as the documented per-key fallback; audit enum values keep stable identifiers in code and URLs; the registry has no keys without call sites.

## Acceptance criteria (from the roadmap)

1. With a non-English language active, every user-visible string on `/operator` and `/operator/diagnostics` resolves through the localization registry, with English appearing only as the documented per-key fallback.
2. Audit enum values keep stable identifiers in code and URLs; only their display labels localize.
3. The registry contains no keys without call sites.
4. Backend `ui.*` seed alignment for new keys stays backend-owned through the existing seed-alignment intake in the sibling `technical-interview-demo` roadmap.

"User-visible" includes visible text, `<option>` text, table captions (even visually hidden), headings, link text, and the accessible names and descriptions read by assistive technology (`aria-label` and similar attributes).

## T-I18N-011: operator audit chrome (`/operator`)

Key every string below through `t()` with its current English text as the English default. The English rendering must stay exactly as it is today.

| Where                                                | Current English                                                                                                                                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page section `aria-label`                            | `Operator audit` (reuse existing `ui.operator.title`)                                                                                                                           |
| Section heading                                      | `Audit rows`                                                                                                                                                                    |
| Container and form `aria-label`s                     | `Audit query controls`, `Audit filters`, `Audit table controls`                                                                                                                 |
| Filter labels                                        | `Target type`, `Action`, `Actor login`                                                                                                                                          |
| Filter "all" options                                 | `All targets`, `All actions`                                                                                                                                                    |
| Target type labels (`AUDIT_TARGET_TYPE_LABELS`)      | `Authentication`, `Book`, `Category`, `Localization message`, `User account`                                                                                                    |
| Action labels (`AUDIT_ACTION_LABELS`)                | `Create`, `Delete`, `Login failure`, `Login success`, `Logout`, `Session rejection`, `Update`                                                                                   |
| Toolbar summary (`formatAuditSummary`)               | `Audit rows need attention.`, `Audit rows are loading.`, `{count} audit entry` / `{count} audit entries`, `Showing {start}-{end} of {total}` (reuse `ui.common.window-summary`) |
| Pagination `aria-label`s                             | `Audit pagination top`, `Audit pagination`                                                                                                                                      |
| State blocks                                         | loading `Loading audit rows` / `Loading audit logs...`; error title `Audit rows unavailable`; empty `No audit rows found` / `No audit entries match these filters.`             |
| Table region `aria-label`, caption                   | `Scrollable operator audit table`, `Operator audit rows`                                                                                                                        |
| Column headers (also inside the sort buttons' names) | `Created`, `Target`, `Action`, `Actor`, `Summary`, `Details` (visually hidden)                                                                                                  |
| Row target id                                        | `ID {id}`                                                                                                                                                                       |
| Row expand button `aria-label`                       | `Details for {label}`, where `{label}` is the entry label below                                                                                                                 |
| Entry label (`createAuditEntryLabel`)                | `audit entry {id}` (or `audit entry {n}` by position when the id is missing)                                                                                                    |
| Expanded detail labels                               | `Entry`, `Created`, `Target type`, `Target ID`, `Action`, `Actor`                                                                                                               |
| Expanded detail headings and empty text              | `Summary`, `Structured details`, `No structured details available.`                                                                                                             |

Rules:

- **Enum identity (AC 2):** `AuditTargetType` and `AuditAction` values stay the contract identifiers everywhere in code: `<option value>`, the URL query (`targetType=BOOK`), the request to `/api/admin/audit-logs`, comparisons and React keys. Only the text shown for them changes. The two display maps become maps from identifier to message key (for example `Record<AuditTargetType, UiMessageKey>`), resolved with `t()` at render time, never translated once at module load.
- **Decision (not settled by the codebase):** the table's Target and Action cells and the expanded detail's `Target type` and `Action` values show the same localized display labels as the filter options (`Category`, `Create`) instead of the raw identifiers (`CATEGORY`, `CREATE`) they show today. A value the frontend does not know (a newer backend enum value) is shown as its raw identifier, and a missing value keeps the existing `ui.common.unknown` fallback. Reason: AC 1 covers every user-visible string, the labels already exist for the filters, and showing `CATEGORY` next to a Polish UI is the mixed-language problem being fixed. This is the only intended change to the English rendering.
- **Composed strings are single templates.** A sentence that contains a value is one message with a `{placeholder}`, so translators can reorder words: `Details for {label}`, `ID {id}`, `audit entry {id}`, the counts. Never concatenate translated fragments with values or with each other. Nesting one formatted message as a parameter of another is fine (`Showing {start}-{end} of {total}` with `{total}` = `{count} audit entries`, as the admin users page already does).
- **Plurals:** follow the existing one/many pattern (`ui.admin-users.user-count-one` / `-many`): `{count} audit entry` for exactly 1, `{count} audit entries` otherwise (including 0).
- The `auditFormat.ts` helpers keep accepting a localized fallback from their callers; `createAuditEntryLabel` must produce its text through `t()` (pass `t` or return parameters for a keyed template), since its result is user-visible in the row button name and the detail panel.

## T-I18N-012: diagnostics chrome (`/operator/diagnostics`)

| Where                                                | Current English                                                                                                                                                                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page section `aria-label` (signed-out and signed-in) | `System diagnostics` (reuse existing `ui.route.diagnostics.title`)                                                                                                                                                        |
| Section `aria-label`s                                | `Diagnostics overview`, `Frontend build`                                                                                                                                                                                  |
| State blocks                                         | loading `Loading operator overview` / `Loading operator overview...`; error title `Operator overview unavailable`                                                                                                         |
| Card titles                                          | `Operational status`, `Runtime summary`, `Audit summary`, `Dependencies`, `Configuration`, `Frontend build`                                                                                                               |
| Runtime group headings                               | `Build`, `Git`, `Runtime`                                                                                                                                                                                                 |
| Operational status labels                            | `Health`, `Liveness`, `Readiness`, `Health endpoint`, `Info endpoint`, `Prometheus endpoint`                                                                                                                              |
| Runtime summary labels                               | `Technical overview endpoint`; Build: `Name`, `Group`, `Artifact`, `Version`, `Build time`; Git: `Branch`, `Commit`, `Commit time`; Runtime: `Application`, `Java version`, `Java vendor`, `Profiles`                     |
| Audit summary labels and link                        | `Total entries`, `Audit API`, link `Browse audit rows`                                                                                                                                                                    |
| Configuration labels                                 | `Default page size`, `Max page size`, `Session store`, `Session timeout`, `Session cookie`, `Exposed endpoints`, `Health probes`, `Tracing sample`, `OpenAPI version`, `CSRF enabled`, `Public API path`, `Shutdown mode` |
| Frontend build labels                                | `Application`, `Version`, `Build time`, `Runtime mode`                                                                                                                                                                    |
| Boolean values                                       | `Yes`, `No`                                                                                                                                                                                                               |
| Unavailable texts                                    | `Operational status unavailable.`, `Build details unavailable.`, `Git details unavailable.`, `Runtime details unavailable.`, `Dependency details unavailable.`, `Configuration details unavailable.`                      |

Rules:

- `{title} details unavailable.` is built today by concatenating an English title. Either one keyed message per group or one template `{title} details unavailable.` fed with the localized group title is acceptable; concatenating a translated title with English text is not.
- `Yes` / `No` are generic: new keys under `ui.common.` are preferred so other pages can reuse them.
- Labels that contain product names or acronyms (`Git`, `OpenAPI version`, `CSRF enabled`, `Java vendor`) are keyed too; translators decide what to translate.
- The metadata lists currently use the label text as the React `key`. Once labels are translated, keys must come from a stable identifier (the message key or a field name), not from the translated text.

## What stays as data (not keyed)

Values that come from the backend or the build are data and are shown as they are: audit summaries, actor logins, ids, formatted timestamps, the structured details JSON, endpoint paths, dependency names and versions, health values (`UP`, `CORRECT`, `ACCEPTING_TRAFFIC`), build and git values, application name and version, the Vite runtime mode, backend problem messages (already localized by the backend), and raw enum identifiers for values the frontend does not know.

## T-I18N-013: registry cleanup

- Remove `ui.theme.option-title`, `ui.admin-localization.status` and `ui.admin-localization.missing-locales` from `UI_MESSAGES`. They have no call sites.
- The roadmap says to remove mock seeds that mirror them; at the base commit `createChromeLocalizations` in `src/mock-api/handler.ts` seeds none of them, so nothing else changes there.
- Keys used through template literals (`ui.language.${code}`, `ui.coverage.${status}`, `ui.theme.mode.${mode}`) do have call sites and stay.
- Every key added by this work must have a call site; no key is added "for later".

## Registry conventions

- New keys follow `ui.<area>.<name>`: suggested areas `ui.operator.` for the audit page and `ui.diagnostics.` for the diagnostics page, `ui.common.` for generic words. Exact names are the implementer's choice.
- Reuse an existing key when it has the same meaning and English text (`ui.operator.title`, `ui.common.window-summary`, `ui.route.diagnostics.title`, `ui.common.unknown`, `ui.common.unavailable`).
- Existing keys keep their names and English defaults; only the three orphans are removed.

## Backend seed alignment (AC 4)

- Do not edit `docs/backend/` or anything backend-owned. Translations for the new keys are seeded by the backend through its own roadmap intake.
- The final report should say that backend `ui.*` seed rows for the new keys are a backend follow-up. Adding Polish rows for the new keys to the mock API seeds (`createChromeLocalizations`) is optional.

## Out of scope

- Other pages and shared components that already use `t()`.
- The English fallback strings passed to `createLoadError` (`Audit logs could not be loaded.`, `Operator overview could not be loaded.`): the API client always rejects with an `Error`, so the fallback is never shown.
- Technical messages of `ApiRequestError` for non-problem 4xx responses (shared API client behaviour).
- The unused `formatAuditDescriptor` export in `auditFormat.ts` (may be removed, not required).
- Any change to `src/api/generated/`, `docs/backend/`, package files or configuration.
- Commits: leave the change uncommitted for review.

## Tests expected

- A rendered-page test of `/operator` and of `/operator/diagnostics` with a non-English catalog loaded through `I18nProvider` (as `src/i18n/I18nProvider.test.tsx` does), showing translated filter labels and options, headers, state blocks, card titles, metadata labels and Yes/No, and that the URL and request still use enum identifiers.
- The existing English page tests keep passing unchanged.

## Documentation

- `CHANGELOG.md`: a `Changed` or `Fixed` entry under `## [Unreleased]`.
- `ROADMAP.md`: optional. Marking `M-I18N-004` done is welcome but not required; do not archive it.

## Answers to likely questions

| Question                                                   | Answer                                                                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Which pages?                                               | `/operator` and `/operator/diagnostics` only.                                                           |
| Is this the roadmap item M-I18N-004?                       | Yes, all three tasks, including removing the three orphaned keys.                                       |
| Do I need to provide Polish translations?                  | No. Translations come from the backend catalog; English defaults go in `UI_MESSAGES`.                   |
| Should the English text change?                            | No, except that table and detail cells show the enum display labels (`Category`) instead of `CATEGORY`. |
| Should enum values in the URL be translated?               | No. Identifiers stay in code, URLs and requests; only labels localize.                                  |
| Translate endpoint paths, health values, dependency names? | No, they are data.                                                                                      |
| `Yes`/`No` keys?                                           | Add generic ones under `ui.common.`.                                                                    |
| How to handle "1 audit entry" vs "2 audit entries"?        | Two keys, one/many, like the admin users count.                                                         |
| Key naming?                                                | `ui.operator.*`, `ui.diagnostics.*`, `ui.common.*`; reuse existing keys where they fit.                 |
| Add backend seed rows?                                     | No, backend-owned; mention it as a follow-up.                                                           |
| Mock API seeds?                                            | Optional.                                                                                               |
| Update docs?                                               | Changelog entry under Unreleased; roadmap status optional.                                              |
| Should I commit?                                           | No, leave it uncommitted.                                                                               |
