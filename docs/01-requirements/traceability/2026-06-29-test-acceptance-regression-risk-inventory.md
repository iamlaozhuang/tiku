# Test Acceptance Regression Risk Inventory Traceability

- Task id: `test-acceptance-regression-risk-inventory-2026-06-29`
- Branch: `codex/test-acceptance-regression-inventory-20260629`
- Scope: read-only test and acceptance regression risk inventory
- Browser/e2e/runtime execution: blocked in this task
- Status: closed_pass

## Governance Boundary

| Boundary                                      | Status       | Evidence                                                                                |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------- |
| Task materialized before test/e2e inventory   | pass         | state, queue, and task plan updated before read-only test/e2e path inventory            |
| Source/test/e2e modification                  | not executed | docs/state-only inventory task                                                          |
| Browser/dev-server/e2e execution              | not executed | current task blocks browser runtime, Playwright execution, screenshots, traces, raw DOM |
| DB connection/raw row/mutation                | not executed | blocked by task boundary                                                                |
| Provider/AI execution                         | not executed | Provider budget remains zero                                                            |
| Package/lockfile/dependency change            | not executed | blocked by task boundary                                                                |
| Release readiness/final Pass/Cost Calibration | not executed | all gates remain blocked                                                                |
| Sensitive evidence capture                    | not executed | evidence records paths, labels, counts, statuses, and redacted summaries only           |

## Surface Index

| Surface                           | Count / Status | Inventory Use                                |
| --------------------------------- | -------------- | -------------------------------------------- |
| `tests/unit/**/*.test.ts`         | 98             | current task-scoped unit test path inventory |
| `tests/unit/**` non-test files    | 0              | unit folder structure check                  |
| `e2e/**/*.spec.ts`                | 22             | e2e/browser spec path inventory              |
| `e2e/**` helper files             | 1              | e2e helper surface                           |
| `package.json` `test:unit` script | present        | unit command gate label                      |
| `package.json` `test:e2e` script  | present        | browser/e2e gate label                       |
| `package.json` aggregate `test`   | present        | chains unit and e2e, blocked for this task   |
| 2026-06-29 acceptance files       | 42             | recent acceptance status surface             |
| 2026-06-29 evidence files         | 42             | recent evidence status surface               |
| all evidence files                | 1713           | historical evidence volume                   |
| all acceptance files              | 240            | historical acceptance volume                 |
| all audit review files            | 1389           | historical audit volume                      |

## Read-Only Coverage Signals

| Signal Family          | Unit Path Count | E2E Path Count | Notes                                                                                   |
| ---------------------- | --------------- | -------------- | --------------------------------------------------------------------------------------- |
| admin                  | 25              | 2              | administrative UI/ops coverage exists                                                   |
| student                | 12              | 2              | learner flow coverage exists                                                            |
| organization           | 10              | 4              | organization admin/employee coverage exists                                             |
| auth                   | 11              | 4              | authorization/session coverage exists                                                   |
| AI                     | 15              | 6              | Provider and AI labels require runtime gate split before execution                      |
| RAG                    | 7               | 1              | RAG labels remain covered by unit/e2e path inventory only                               |
| paper/question         | 9               | 1              | paper/question flow coverage exists, question e2e label absent in filename inventory    |
| redeem/model/audit     | 17              | 1              | ops/security-relevant surfaces have unit coverage labels                                |
| analytics/training     | 3               | 4              | organization analytics/training labels exist in both unit and e2e inventory             |
| role/local/provider/db | 15              | 22             | most e2e files are local/browser-bound and must remain task-scoped before any execution |
| staging                | 0               | 1              | staging-labeled e2e spec exists but staging smoke remains blocked                       |

## Findings Matrix

| Id           | Risk Family                                      | Severity | Status                | Evidence Summary                                                                                                         | Follow-up                                                                                  |
| ------------ | ------------------------------------------------ | -------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| test-inv-001 | unit baseline freshness                          | low      | covered_watch         | Latest redacted unit evidence records `test:unit`, lint, and typecheck pass; this task did not rerun tests.              | Continue requiring focused and full unit reruns in source/test repair tasks.               |
| test-inv-002 | e2e/browser acceptance gate                      | medium   | needs_scoped_approval | 22 e2e specs exist, but browser/dev-server/e2e execution is blocked in this goal phase.                                  | `test-acceptance-e2e-runtime-boundary-approval-package-2026-06-29`                         |
| test-inv-003 | historical acceptance status reconciliation      | medium   | needs_scoped_review   | Recent acceptance/evidence files include pass, blocked, and partial labels; some blocked rows are superseded by repairs. | `test-acceptance-evidence-status-reconciliation-2026-06-29`                                |
| test-inv-004 | runtime gate split for Provider/DB/staging specs | medium   | guarded_watch         | E2E file names include Provider, DB-backed, and staging labels; each requires its own task boundary before execution.    | `test-acceptance-runtime-gate-split-review-2026-06-29`                                     |
| test-inv-005 | aggregate `npm test` command risk                | medium   | covered_by_boundary   | `npm test` chains unit and e2e, so it is not safe under a docs/source-read-only inventory boundary.                      | Use task-scoped validation commands; do not run aggregate `test` without browser approval. |
| test-inv-006 | redacted e2e evidence policy                     | medium   | needs_policy_review   | Future browser/e2e execution must avoid raw DOM, screenshots, traces, session material, and private fixture evidence.    | `test-acceptance-redacted-e2e-evidence-policy-review-2026-06-29`                           |
| test-inv-007 | release/final-pass gate drift                    | medium   | blocked_by_goal       | Release readiness, final Pass, staging smoke, and Cost Calibration remain explicitly blocked.                            | None until owner issues a future fresh release/staging/final-pass approval.                |

## Task Split

| Future Task Id                                                     | Type                   | Suggested Priority | Approval Needed                                                                      |
| ------------------------------------------------------------------ | ---------------------- | ------------------ | ------------------------------------------------------------------------------------ |
| `test-acceptance-evidence-status-reconciliation-2026-06-29`        | docs/state review      | p1                 | fresh materialization; no browser/runtime/source/test change by default              |
| `test-acceptance-e2e-runtime-boundary-approval-package-2026-06-29` | approval package       | p2                 | explicit browser/dev-server/e2e scope if owner wants runtime execution later         |
| `test-acceptance-runtime-gate-split-review-2026-06-29`             | docs/source review     | p2                 | fresh materialization; Provider/DB/staging execution stays blocked by default        |
| `test-acceptance-redacted-e2e-evidence-policy-review-2026-06-29`   | evidence policy review | p2                 | fresh materialization; no raw DOM, screenshot, trace, credential, or session capture |

## Next Recommended Task

The next smallest safe task is `test-acceptance-evidence-status-reconciliation-2026-06-29`.

Rationale: it reconciles superseded blocked/partial acceptance labels into a redacted, current-state queue view without
running browser/e2e/dev-server, touching source/tests, or entering release readiness/final Pass.
