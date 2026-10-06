# Skipped ruleset bullets

The `quality` and `process` groups reword bullets of the BDK ruleset into neutral checks (neutrality rule 4 in `schema.md`). This file lists every bullet that did **not** become a check, with the reason, so the coverage is auditable. A bullet is skipped when it does not apply to a TypeScript/React single-page-app change of this size, when a diff cannot decide it, when it would reward one workflow's process, or when the fixture's own conventions contradict it (the fixture wins, neutrality rule 5).

## Bullets used in checks

| Bullet                         | Used in                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| ARCH-1                         | `quality.q08`                                                                               |
| ARCH-4                         | `quality.q07`                                                                               |
| ARCH-5                         | `quality.q06`                                                                               |
| CQ-2, CQ-3                     | `quality.q05`                                                                               |
| CQ-4, CQ-5                     | `quality.q04`                                                                               |
| CQ-6                           | `quality.q07`                                                                               |
| CQ-7                           | `tests.t03`, `tests.t01`, `tests.t06`                                                                |
| CQ-9                           | `process.p06`                                                                               |
| JS-1, JS-4                     | `quality.q02`                                                                               |
| REACT-7                        | `users-csv.f01` (native button)                                                             |
| REACT-11                       | `quality.q05`                                                                               |
| REACT-13                       | `quality.q07`                                                                               |
| SEC-2, SEC-3                   | `users-csv.f13`, `users-csv.f14` (escaping and formula guard), `quality.q02` (no raw HTML)  |
| SEC-5, SEC-7                   | `users-csv.f16` (admin-only, unavailable on failed access checks)                           |
| SEC-8                          | `users-csv.f07` (no role grant history in the file)                                         |
| SEC-9                          | `process.p06` (no dependency changes)                                                       |
| TQ-1                           | `tests.t04`, `tests.t01`, `tests.t05`                                                              |
| TQ-2 to TQ-10                  | `tests.t04` (TQ-7 to TQ-10 as allowances)                                                 |
| TQ-11                          | `process.p13`                                                                               |
| TS-2, TS-7                     | `quality.q02`                                                                               |
| TS-5, TS-6                     | `quality.q03`                                                                               |
| TS-11                          | `process.p06` (no configuration changes)                                                    |

## Skipped bullets

| Bullet         | Headline                                                     | Reason for skipping                                                                                                                                                                       |
| -------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ARCH-2         | Dependency Inversion                                         | Neither task introduces a service boundary or an interface; the fixture calls its API modules directly from pages, and a check would reward abstraction the tasks do not need.            |
| ARCH-3         | Interface Segregation                                        | No interface is defined or widened in scope.                                                                                                                                              |
| CQ-1           | Naming                                                       | Subjective; a judge question on naming has low agreement between samples and would add noise rather than separate workflows.                                                              |
| CQ-8           | Async pipeline observability                                 | No async pipeline, queue or background job in either task.                                                                                                                                |
| DP-1 to DP-10  | Object-oriented design patterns and anti-patterns            | The fixture is function components and plain modules; neither task exercises Strategy, Factory, Observer, Decorator, Repository, polymorphism or OCP extension points. Over-engineering is already covered by `quality.q07`. |
| DP-11          | Pattern documentation                                        | About documenting a chosen pattern in a proposal or plan; process artifact.                                                                                                               |
| EJ-1           | Quality over build cost                                      | A decision-weighting principle; not observable in the final state.                                                                                                                        |
| EJ-2           | Fix what's clearly off, even if unrelated                    | Contradicts the fixture's "keep the change scoped to the requested behavior" rule (`docs/DEVELOPMENT_LIFECYCLE.md`) and `process.p07`; the fixture wins.                                |
| PL-1 to PL-4   | Plan quality                                                 | Rules for plan documents. Checking plans would reward a workflow that writes them (neutrality rule 1).                                                                                    |
| SEC-1          | Trust boundaries                                             | No new trust boundary: both tasks render data the existing API client already validated and typed. The CSV-specific input risk is covered by `users-csv.f13` and `users-csv.f14`.         |
| SEC-4          | Secrets                                                      | Neither task handles credentials; a "no secret added" check would pass for every workflow and not discriminate.                                                                           |
| SEC-6          | Least privilege                                              | No permissions, tokens or roles are granted by either change.                                                                                                                              |
| JS-2           | `async`/`await` over raw `.then` chains                      | The fixture's established effect pattern is `.then` with an `ignore` flag (15 places); following the codebase is correct here (neutrality rule 5).                                       |
| JS-3           | Parallelize independent async work                           | No new async work in either task (the export is synchronous, the i18n work is render-time).                                                                                               |
| JS-5           | `Error.cause` and typed errors                               | No new error handling is required; the fixture's `ApiRequestError` already models failures.                                                                                               |
| JS-6           | Modern stdlib                                                | Knowledge guidance; rarely decidable from a small diff and covered in spirit by `quality.q07`.                                                                                            |
| JS-7           | Classic foot-guns                                            | `==`/`!=` is checked in `quality.q02`; the rest is too broad to verify binarily.                                                                                                         |
| JS-8           | Prototype pollution                                          | No untrusted keys are used as object keys in either task.                                                                                                                                 |
| REACT-1        | Server Components by default                                 | Client-only Vite SPA, no server rendering.                                                                                                                                                |
| REACT-2        | Drop manual memoization                                      | The fixture uses `useMemo` and has no React Compiler configured; following the codebase is correct (neutrality rule 5).                                                                    |
| REACT-3        | Forms go through Actions                                     | The fixture's forms use controlled state and URL search params; no new form in scope.                                                                                                     |
| REACT-4        | Suspense + `use()` for data fetching                         | Conflicts with the fixture's `LoadState` effect pattern used on every page.                                                                                                               |
| REACT-5, REACT-6, REACT-17 | State escalation, composition over Context, Context vs store | No new shared state or context in either task.                                                                                                                                     |
| REACT-8        | Suspense + ErrorBoundary granularity                         | Conflicts with the fixture's `StateBlock` loading/error convention; no Suspense in the fixture.                                                                                           |
| REACT-9        | `ref` is a prop                                              | No ref forwarding in scope.                                                                                                                                                               |
| REACT-10       | State shape                                                  | Rare in these tasks; folded into `quality.q05`.                                                                                                                                           |
| REACT-12       | Prop count and boolean explosion                             | Rare in these tasks; a new component with many props would be caught by the `quality.q05` judge.                                                                                          |
| REACT-14       | `useEffectEvent`                                             | No latest-value handler in scope.                                                                                                                                                         |
| REACT-15, REACT-16 | Optimistic UI, Server Action errors                      | No optimistic updates, no Server Actions.                                                                                                                                                 |
| REACT-18, REACT-19 | View transitions, asset preloading                       | Not used by the fixture and not needed by either task.                                                                                                                                    |
| TS-1, TS-10, TS-12 | Compiler, module and import settings                     | About `tsconfig`; changing configuration is out of scope (`process.p06` forbids it).                                                                                                     |
| TS-3           | Annotate boundaries, infer the interior                      | The fixture infers exported function return types throughout; a check would contradict the codebase.                                                                                      |
| TS-4           | Discriminated unions                                         | Rare in these tasks; the fixture's `LoadState` already is one, and reuse is covered by `quality.q06`.                                                                                    |
| TS-8           | Readable generics                                            | No generics are needed by either task.                                                                                                                                                    |
| TS-9           | Template literal types                                       | Rare; message keys are typed by the registry's `keyof typeof UI_MESSAGES`.                                                                                                                |
