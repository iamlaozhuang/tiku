# Content Admin P0 Data Integrity Evidence

Date: 2026-07-13

Task: `content-admin-p0-data-integrity-2026-07-13`

Branch: `codex/content-admin-p0-data-integrity`

Start SHA: `dadef0975c2e8c60343fb06286ceb6c8c622d818`

## Boundary

- Local source, tests, governance state, plan, evidence, and audit only.
- No browser, screenshot, raw DOM, private credential, database connection/write, Provider, environment secret, schema/migration/fixture/seed, dependency, staging/prod/deploy, PR, or Cost Calibration action was executed during implementation and review.
- `master` and this branch started at the local ratified baseline; remote synchronization is separately authorized only for `master` to `origin/master` after commit, ff-only merge, and master gates.

## TDD Evidence

### Baseline

- Existing focused baseline: 3 files, 52 tests passed.
- This established that the current baseline was healthy before adding Batch A failure cases.

### RED

- Initial semantic/API/UI RED: 3 files, 14 failed and 50 passed.
- Expected failures covered semantic-empty rich text, managed media, option/type matrix, fill-blank/scoring structure, blank new forms, error summary, first-error focus, and request blocking.
- Duplicate-submit mutation proof: with the synchronous in-flight guard temporarily removed, the single regression test failed because two POST requests were observed instead of one; after restoring the guard, the same test passed (1 passed, 39 skipped).
- No failure was attributed to credentials, database state, Provider state, or a historical A01-A30 issue.

### GREEN

- Final focused suite: 6 files, 94 tests passed.
- Covered shared semantic rules, question/material validators, question service compatibility, content-admin UI, and runtime route envelope/audit behavior.

## Full Gates

| Gate                                   | Result                                                  |
| -------------------------------------- | ------------------------------------------------------- |
| `npm.cmd run test:unit`                | PASS — 363 files, 2036 tests                            |
| `npm.cmd run lint`                     | PASS                                                    |
| `npm.cmd run typecheck`                | PASS                                                    |
| `npm.cmd run format:check`             | PASS                                                    |
| `npm.cmd exec -- next build --webpack` | PASS — compiled, typechecked, 90 static pages generated |
| `git diff --check`                     | PASS                                                    |
| Module Run v2 pre-commit hardening     | PASS — 15 files scanned                                 |

The first full unit run exposed two stale single-choice service test inputs with only one option. The inputs were aligned to the accepted matrix and irrelevant objective scoring points were removed; the second full unit run passed completely.

## P0 Acceptance Trace

| Contract    | Evidence                                                                                                                                                         |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0-01       | New question/material values and critical classification start blank; examples remain helper/placeholder text only.                                              |
| P0-02       | Shared pure rules normalize entities/invisible characters, reject empty tags/tables/broken media, and accept only meaningful text or accessible managed images.  |
| P0-03       | UI tests prove field errors, summary, request blocking, first-error focus, correction, and retry.                                                                |
| P0-04       | Validator and runtime tests prove UI bypass rejection with the existing 422 envelope and redacted audit boundary.                                                |
| P0-05/P0-06 | Server and UI tests cover option count/content/unique label/correct count/answer-set consistency; option add/remove capacity is retained.                        |
| P0-07       | Server and UI tests preserve A.正确/B.错误 and internal correct-answer mapping.                                                                                  |
| P0-08       | Per-blank answers require semantic content and positive 0.5-granularity scores; method switching preserves entered data and validates the active structure.      |
| P0-09       | Subjective/AI-scored structures require valid scoring points; objective payloads reject scoring points and non-option types reject choice options.               |
| P0-10       | Client/server tests reject semantic-empty title/body, empty table helper markup, broken media, and body length above 30000.                                      |
| P0-11       | In-flight ref guard, disabled reason, mutation proof, and UI tests cover deduplication; conflict/failure preserve input and remain distinguishable.              |
| P0-12       | Existing edit/copy/disable/lock/reference/material/knowledge/tag behaviors remain in focused and full regression suites.                                         |
| P0-13       | Required instructions, field/summary errors, `aria-invalid`, `aria-describedby`, first-error focus, keyboard form submit, and visible saving reason are covered. |
| P0-14       | RED/GREEN evidence, focused suite, full unit/lint/typecheck/format/webpack/diff gates, two adversarial reviews, and self-review are recorded.                    |

## Scope Inventory

- Runtime: shared integrity module, content-admin question/material client, question/material validators.
- Tests: shared module, validators, question service, UI, runtime route.
- Governance: current task state/queue, plan, evidence, audit.
- No package, lockfile, environment, schema, migration, fixture, seed, or remote change.

## Master Post-Merge Gates

- Local implementation commit: `ebe14d4274a1730000705e7bfa1f29a2b96e371e`.
- `master` accepted the task branch with `--ff-only`; the task commit is an ancestor of `master`.
- Focused regression: 6 files, 94 tests passed.
- The first master full-unit attempt ran concurrently with lint, typecheck, and full-repository formatting and produced 11 timeouts across 7 unrelated files. No assertion or Batch A semantic failure occurred.
- Adversarial diagnosis reran exactly those 7 files without competing gates: 67 tests passed. A subsequent standalone full-unit run passed 363 files and 2036 tests, confirming resource contention rather than a product regression; no timeout or test source was changed.
- Standalone lint, typecheck, and full format checks passed.
- Standalone webpack production build passed and generated 90 static pages.
- `git diff --check` passed.
- Pre-push readiness correctly blocked the non-standard queue statuses `ready_for_push_cleanup` and `closed_remote_synced`, because they disabled the accepted-ancestor checkpoint policy. The task status was normalized first to `ready_for_closeout` and finally to the supported terminal state `closed`; detailed result fields retain the remote-synchronized meaning. No repository SHA, product source, test, or remote ref was changed to bypass the gate.

## Closeout Boundary

- Implementation is committed, ff-only merged to `master`, and master post-merge gates passed.
- The current user explicitly approved the Batch A local commit, ff-only merge to `master`, push of `master` to `origin/master`, and cleanup after remote synchronization on 2026-07-13.
- Module Run v2 pre-push readiness passed both immediately before and inside the real push hook.
- The ordinary push synchronized `master` to `origin/master` at `f24c47d53fc55340756c63a3c8333279ac9b1992`; the post-push comparison showed no ahead/behind difference.
- The clean task worktree was removed from the repository-owned `.worktrees/` root, pruned, and the merged short branch was deleted.
- Force push, pull request, deployment, and every other remote target remained blocked and were not executed.
