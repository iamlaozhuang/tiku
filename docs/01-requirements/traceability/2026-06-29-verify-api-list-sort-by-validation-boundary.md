# Verify API List SortBy Validation Boundary Traceability

- Task id: `verify-api-list-sort-by-validation-boundary-2026-06-29`
- Branch: `codex/api-sort-validation-boundary-20260629`
- Status: closed
- Created at: `2026-06-29T09:13:26-07:00`

## Scope

This traceability record covers a verification-only follow-up for `api-inv-001`. It may read scoped source/test files
and run focused local checks, but it does not authorize source/test edits. It does not authorize browser/runtime, DB,
Provider/AI, dependency, schema/migration/seed, release readiness, final Pass, Cost Calibration, deployment, PR, or
force-push actions.

## Governance Inputs

| Input                                                                      | Status       |
| -------------------------------------------------------------------------- | ------------ |
| `AGENTS.md`                                                                | read         |
| `docs/03-standards/code-taste-ten-commandments.md`                         | read         |
| `docs/02-architecture/adr/`                                                | read         |
| `docs/04-agent-system/state/project-state.yaml`                            | read/updated |
| `docs/04-agent-system/state/task-queue.yaml`                               | read/updated |
| predecessor API inventory task plan/evidence/audit/acceptance/traceability | read         |
| repository `SECURITY.md`                                                   | not found    |

## Requirement Mapping

| Requirement                             | Evidence target                                                                                                                                           |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Preserve release/deploy gates           | No staging/prod/cloud/deploy/release readiness/final Pass/Cost Calibration actions are run.                                                               |
| Preserve source/test no-change boundary | No `src/**` or `tests/**` files are modified in this task.                                                                                                |
| Verify `sortBy` boundary statically     | Evidence records validator/service/repository allowlist status by path and risk ID only.                                                                  |
| Preserve DB and Provider boundaries     | No DB connection/mutation/schema/seed and no Provider/AI call/configuration action are executed.                                                          |
| Preserve sensitive evidence rules       | Evidence records no raw DB rows, credentials, env/secrets, Provider payloads, prompts, full business content, DOM, screenshots, or traces.                |
| Split repair if needed                  | If static evidence shows unallowlisted `sortBy` reaches query construction, record a future fresh-approval repair task instead of modifying source/tests. |

## Verification Matrix

| Finding         | Severity | Status                                                   | Boundary                       | Follow-up |
| --------------- | -------- | -------------------------------------------------------- | ------------------------------ | --------- |
| `api-inv-001`   | medium   | not actionable for query construction; contract watch    | list query sort-field boundary | low       |
| `api-watch-003` | low      | optional future contract consistency task, not a blocker | pagination metadata sort field | optional  |

## Evidence Plan

1. Map validators that preserve caller-supplied `sortBy`.
2. Map validators that fix or allowlist `sortBy`.
3. Trace affected services and repositories only as static source evidence.
4. Run focused existing local checks when they do not require DB, Provider, browser, dev server, credentials, or private fixtures.
5. Record a verdict without changing source or tests.

## Static Evidence Map

| Surface                                 | Paths                                                                                                                                                                                                  | Result                                                                                                               |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Generic pagination validator            | `src/server/validators/pagination.ts`                                                                                                                                                                  | Preserves any non-empty trimmed `sortBy`; this is a contract consistency watch, not direct query execution evidence. |
| Generic list wrappers                   | `src/server/validators/material.ts`, `paper-asset.ts`, `paper-draft.ts`, `question.ts`, `student-paper.ts`, `question-paper/exam-paper-validator.ts`                                                   | Some wrappers preserve caller-supplied `sortBy` or remap only the default field.                                     |
| Repository query construction           | `src/server/repositories/material-repository.ts`, `paper-asset-repository.ts`, `paper-draft-repository.ts`, `question-repository.ts`, `student-flow-runtime-repository.ts`                             | Query construction uses fixed Drizzle columns or default columns; no caller string is used as a SQL column.          |
| Fixed or allowlisted list validators    | `src/server/validators/exam-report.ts`, `mistake-book.ts`, `ai-call-log/list-query.ts`, `audit-log/list-query.ts`, `organization/list-query.ts`                                                        | Sort field is fixed or allowlisted before service/repository execution.                                              |
| Admin/runtime repository raw SQL checks | `src/server/repositories/admin-flow-runtime-repository.ts`, `admin-ai-audit-log-runtime-repository.ts`, `admin-organization-org-auth-runtime-repository.ts`, `admin-redeem-code-runtime-repository.ts` | Reviewed `orderBy` values are fixed SQL fragments or typed column expressions selected by known branches.            |

## Verdict

`api-inv-001` is closed as `not_actionable_for_query_construction_with_contract_watch`. No source/test repair is
authorized or performed in this task. The next recommended security task returns to the pending high-severity session
login response credential boundary verification, which requires fresh task materialization before any source/test
change.
