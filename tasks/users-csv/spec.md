# Hidden spec: export the admin user list to CSV

The product owner's spec for the `users-csv` task. The simulated user answers clarifying questions from this document. The workflow never sees it. Where the fixture codebase does not settle a choice, the decision is marked **Decision (not settled by the codebase)**, with the reason.

## Context

The user administration page (`/admin/users`, `src/admin/AdminUsersPage.tsx`) lists application accounts for administrators. It loads the whole list once from `GET /api/admin/users` (`fetchAdminUsers` in `src/api/adminUsers.ts`), which has no query parameters, and filters (search `q`, `role`, `status`), sorts (`sort`) and paginates (`page`, `size`) it client-side, with that state kept in the URL. Each row shows the user label and login, provider, email, roles, account status and last login; the inline detail adds preferred language, updated time, block provenance and role grant history.

Administrators want to take the list into a spreadsheet for access reviews and audits.

## User story

As an administrator on the user administration page, I can download the users I am currently looking at as a CSV file that opens correctly in common spreadsheet tools, so that I can review accounts offline.

## Who can export

- Only administrators: the control lives inside the admin-only part of the page (`AdminUsersManager`), so signed-out visitors and signed-in users without the `ADMIN` role never see it. The backend stays the authorization owner; the export uses only data the admin list already returned.
- If access is still being checked, or the admin list failed to load, there is nothing to export and the control is not offered (see "States").

## Where and how it looks

- One button in the list toolbar of the users list (the `catalog-toolbar` row that holds the "Showing x-y of n users" summary and the top pagination controls), styled like the existing secondary toolbar controls. It must not be inside the filter `<form>` as a submit control.
- English label: **Export CSV**. No icon-only button.
- It is a native `<button type="button">`.

## What is exported

- **Rows:** every user that matches the current search, role filter and status filter, in the current sort order, **across all pages**. Pagination (`page`, `size`) does not limit the export. The selected user (detail route `/admin/users/:id`) does not change what is exported.
  - **Decision (not settled by the codebase):** filters and sort apply, pagination does not. Reason: the filters express which users the admin wants; the page size is only a viewing choice, and exporting ten rows of a filtered list of forty would surprise.
- **Data source:** the list already loaded on the page, including any role or status change made in this session (the page updates its list from mutation responses). Clicking export sends **no request**.
  - **Decision (not settled by the codebase):** no refetch. Reason: the export must match what the admin sees, the contract returns the full list in one response, and there is no export endpoint; the spec forbids inventing one.
- The same filter and sort logic the page uses for the table must produce the export rows (one implementation, not a copy).

## Columns

One header row, then one record per user. Columns in this order:

| #   | Header (English default) | Value                                                         |
| --- | ------------------------ | ------------------------------------------------------------- |
| 1   | ID                       | `id`                                                          |
| 2   | Display name             | `displayName`                                                 |
| 3   | Login                    | `login`                                                       |
| 4   | Email                    | `email`                                                       |
| 5   | Provider                 | `provider`                                                    |
| 6   | Roles                    | all `roles` in API order, joined with `; ` (`USER; ADMIN`)    |
| 7   | Status                   | `accountStatus` as its identifier: `ACTIVE` or `BLOCKED`      |
| 8   | Last login               | `lastLoginAt`                                                 |
| 9   | Created                  | `createdAt`                                                   |
| 10  | Updated                  | `updatedAt`                                                   |
| 11  | Preferred language       | `preferredLanguage`                                           |
| 12  | Blocked at               | `blockedAt`                                                   |
| 13  | Blocked by               | `blockedBy`                                                   |
| 14  | Block reason             | `blockedReason`                                               |

- **Decision (not settled by the codebase):** the column set and order. Reason: identity first, then access, then timestamps, then block provenance; it covers everything the list and the detail show except the nested role grant history.
- Role grant history (`roleGrants`) is **not** exported: it is nested, belongs to the per-user detail, and includes other administrators' ids and reasons that an access-review sheet does not need.
- Header labels are localized (see "Localization"). Where the page already has a message key with the same meaning and English text, it is reused: `Email`, `Provider`, `Roles`, `Status`, `Last login`, `Updated`, `Preferred language`, `Blocked at`, `Blocked by`, `Block reason` all exist under `ui.admin-users.*`. New keys are needed only for `ID`, `Display name`, `Login`, `Created`.

## Value formats

- Values are raw data, not display text: no `Unknown`, `Unavailable`, `Login unavailable`, `No roles` or other UI placeholders, and no `undefined`/`null` strings. A missing value is an empty field.
- Timestamps are written exactly as the API returns them (ISO 8601 UTC, for example `2026-06-06T22:10:00Z`), not in the page's localized `formatTimestamp` form.
  - **Decision (not settled by the codebase):** ISO instead of the on-screen format. Reason: spreadsheets parse ISO reliably and it does not depend on the admin's browser locale.
- Status is the contract identifier (`ACTIVE`, `BLOCKED`); a missing status is an empty field, not `ACTIVE`.
  - **Decision (not settled by the codebase):** identifiers, not the localized pill text. Reason: stable values for filtering in a sheet; roles are shown as identifiers in the UI already.
- Roles: all roles in API order joined with `; `; no roles is an empty field.

## File format

- RFC 4180 CSV: comma delimiter, records separated by CRLF (`\r\n`); a trailing CRLF after the last record is allowed.
- A field is enclosed in double quotes when it contains a comma, a double quote, CR or LF; a double quote inside a field is doubled. Other fields are not quoted. Line breaks inside a value are kept as they are.
- Encoding UTF-8 with a byte order mark (`EF BB BF`) so Excel detects UTF-8 and names such as `Zażółć Gęślą` survive.
- Media type `text/csv;charset=utf-8`.
- **Spreadsheet formula injection guard:** user-controlled text can start a formula. Any field whose value starts with `=`, `+`, `-`, `@`, a tab (`\t`) or a carriage return (`\r`) is written with a single quote prepended (`'=HYPERLINK(...)`), then CSV-escaped as usual. No other value is altered: a value that merely contains those characters later (`anne-marie`, `admin@example.test`, `2026-06-06T22:10:00Z`, `O'Brien`) stays exactly as it is.

## File name

`users-YYYY-MM-DD.csv`, using the admin's **local** calendar date at the time of export (for example `users-2026-10-06.csv`).

- **Decision (not settled by the codebase):** the name and the local date. Reason: a sortable, self-describing name; the local date matches the admin's day even late in the evening (a UTC date would roll over early in the Americas).

## Download mechanics

- Built entirely in the browser from the loaded data: a `Blob` with the CSV, an object URL, a temporary `<a download="...">` that is clicked and removed, and the object URL revoked afterwards. No new dependency (no `file-saver` or CSV library: the format is small and fully specified here).
- Exporting does not navigate, change the URL, the filters, the page or the selected user, and leaves no element behind in the document.

## States

- Access check loading or failed, users loading, or the users request failed: the export control is not offered (not rendered, or rendered disabled; the toolbar summary is not shown in these states either).
- List loaded but nothing to export (the backend returned no users, or no user matches the filters): the control is rendered **disabled**.
- Otherwise enabled. Generating the file is synchronous, so there is no loading or progress state and no success toast.

## Accessibility

- Native `<button type="button">` with a visible text label; its accessible name is the label (`Export CSV`).
- Disabled through the `disabled` attribute, so it is skipped by the tab order and announced as unavailable.
- Keyboard operable like any button (Enter and Space), with the existing focus styling.

## Localization

- The button label and every CSV header label come from the localization registry (`t()` with English defaults in `src/i18n/messages.ts`), so an admin whose UI runs in Polish gets Polish labels in the button and in the file header.
- New keys follow the registry convention, under `ui.admin-users.` (suggested: `ui.admin-users.export-csv`, `ui.admin-users.column-id`, `ui.admin-users.column-display-name`, `ui.admin-users.column-login`, `ui.admin-users.column-created`). Exact key names are the implementer's choice.
- Data values (names, emails, identifiers, timestamps) are never translated.
- The file name is not localized.

## Tests expected

- Unit tests of the CSV building logic: column order, escaping (comma, quote, line break), formula guard and the no-over-escaping cases, BOM and CRLF, empty values.
- A page test: the button exports exactly the filtered and sorted users across pages, is disabled with no users, and is absent for non-admins.

## Documentation

- `docs/specs/SPEC_admin_user_management.md`: add the export to the user-visible scope and list behaviour, with its rules and required tests (today the spec lists what the surface does and does not do).
- `CHANGELOG.md`: an `Added` entry under `## [Unreleased]`.
- No `ROADMAP.md` change is required (not a breaking or contract change).

## Out of scope

- Any backend change or new endpoint; any change to `src/api/generated/` or `docs/backend/`.
- Other formats (Excel, JSON), choosing columns, exporting role grant history, exporting from other admin pages.
- New npm dependencies.
- Commits: leave the change uncommitted for review.

## Answers to likely questions

| Question                                        | Answer                                                                                               |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| All users or only the current page?             | All users matching the current search and filters, in the current sort order, across all pages.     |
| Should filters apply?                           | Yes: search, role and status, plus the sort order.                                                   |
| Which columns?                                  | The 14 columns in the table above, in that order. Not the role grant history.                       |
| Localized headers or fixed English ones?        | Localized through the registry, like the rest of the UI.                                             |
| Status as "Active" or `ACTIVE`?                 | `ACTIVE` / `BLOCKED` identifiers.                                                                    |
| Date format?                                    | As the API returns it (ISO 8601 UTC).                                                                |
| Separator / encoding?                           | Comma, CRLF, UTF-8 with BOM.                                                                         |
| Excel formula injection?                        | Yes, guard it: prefix `'` for values starting with `=`, `+`, `-`, `@`, tab or CR.                    |
| File name?                                      | `users-YYYY-MM-DD.csv`, local date.                                                                  |
| Server-side export / new endpoint?              | No. The contract has none; build it in the browser from the loaded list.                             |
| Refetch before exporting?                       | No. Export what the page has loaded.                                                                 |
| Add a CSV library?                              | No new dependencies.                                                                                 |
| Where does the button go?                       | In the users list toolbar next to the "Showing ..." summary.                                         |
| What if no users match?                         | Button disabled.                                                                                     |
| Who can see it?                                 | Administrators only (the page is already admin-only).                                                |
| Success message after download?                 | Not needed; the browser shows the download.                                                          |
| Should I update docs / changelog?               | Yes: the admin user management spec and an Unreleased changelog entry.                              |
| Should I commit?                                | No, leave it uncommitted.                                                                            |
