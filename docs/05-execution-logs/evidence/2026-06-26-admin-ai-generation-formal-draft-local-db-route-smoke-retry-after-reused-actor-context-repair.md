# Admin AI generation formal draft local DB route smoke retry after reused actor context repair evidence

Task id:
`admin-ai-generation-formal-draft-local-db-route-smoke-retry-after-reused-actor-context-repair-2026-06-26`

## Scope

- Branch: `codex/admin-ai-formal-draft-local-db-smoke-retry-after-actor-repair-20260626`
- Approval consumed: `current_user_advance_approval_admin_ai_generation_goal_execution_2026_06_26`
- Predecessor source repair:
  `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-reused-adoption-writer-actor-context-repair-tdd.md`
- Route: `/api/v1/content-ai-generation-results/{publicId}/formal-adoptions`

## Planned Boundary

- Local DB connection through existing runtime configuration: approved for this task.
- Local runtime DB config read: approved only to connect; no value may be printed or recorded.
- Sanitized eligible-source lookup: approved max 2.
- Content admin route POST smoke: approved max 2.
- Local formal `question`/`paper` draft write: approved only through the route calls and only as draft.
- Migration/schema/seed/source change/Provider/staging/prod/payment/external service/final Pass: not approved.

## Validation Results

| Command                                                                                                                                                                 | Result                         | Notes                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts` | PASS                           | 2 files, 9 tests passed before route smoke.                                  |
| transient route smoke harness                                                                                                                                           | PASS_WITH_PAPER_SOURCE_MISSING | 1 actor lookup, 2 eligible-source lookups, 1 content question POST.          |
| Scoped Prettier check                                                                                                                                                   | PASS_AFTER_WRITE               | Evidence table formatting was repaired with scoped Prettier write.           |
| `git diff --check`                                                                                                                                                      | PASS                           | Whitespace check passed.                                                     |
| Module Run v2 precommit hardening                                                                                                                                       | PASS                           | Task-scoped gate passed; 5 files scanned in allowed scope.                   |
| Module Run v2 prepush readiness                                                                                                                                         | PASS                           | Task-scoped gate passed with remote-ahead check skipped per existing policy. |

## Route Smoke Result

| Field                                            | Result                                              |
| ------------------------------------------------ | --------------------------------------------------- |
| Status                                           | `pass_or_skipped_missing_source`                    |
| Actor lookup count                               | 1                                                   |
| Actor state                                      | present                                             |
| Eligible-source lookup count                     | 2                                                   |
| Route POST call count                            | 1                                                   |
| Content question workflow                        | `draft_created`                                     |
| Content question response code                   | 0                                                   |
| Content question formal question public id state | present                                             |
| Content question persistence status              | reused                                              |
| Content question latency                         | 160 ms                                              |
| Content paper workflow                           | not executed; eligible content paper source missing |
| Provider call executed                           | false                                               |
| Schema migration executed                        | false                                               |
| Seed or fixture creation executed                | false                                               |
| Formal publish executed                          | false                                               |

## Harness Startup Notes

- An initial external-temp harness attempt failed at TypeScript transform because top-level await was not supported for
  the current CJS output. No DB query or route POST executed.
- A second external-temp harness attempt failed at module resolution before DB query or route POST because dependencies
  were resolved from the system temp path.
- The final harness ran from a transient repository-root file and removed it after execution. `Test-Path` confirmed the
  transient file was removed.
- Only the final harness execution counted toward DB/route smoke limits.

## Boundary Result

- Local DB connection through existing runtime configuration: executed.
- Local runtime DB config read: executed only by existing runtime code; no value was printed or recorded.
- Sanitized eligible-source lookups: 2 of 2 maximum.
- Content admin route POST smoke: 1 of 2 maximum.
- Local formal question draft write through route: executed and returned `draft_created`.
- Local formal paper draft write through route: not executed because no eligible source was found.
- Migration/schema/seed/source change/Provider/staging/prod/payment/external service/final Pass: not executed.

## Redaction Statement

No raw generated result body, raw reviewed draft body, raw DB row, internal numeric id, DB URL, secret, token, cookie,
Authorization header, API key, prompt, raw output, Provider payload, full formal question content, full paper content,
or account credential may be written to this evidence.

## Residual Gaps

- Content paper formal draft route smoke remains unproven locally because there is no eligible content paper generated
  result in the current local DB.
- The goal is not complete until content paper adoption is either proven with an approved eligible source setup or
  explicitly accepted as deferred.

## Final Closeout

Status: `PASS_CONTENT_QUESTION_FORMAL_DRAFT_ROUTE_SMOKE_PAPER_SOURCE_MISSING`.
