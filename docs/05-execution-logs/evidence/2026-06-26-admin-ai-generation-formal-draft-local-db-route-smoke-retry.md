# Admin AI generation formal draft local DB route smoke retry evidence

Task id: `admin-ai-generation-formal-draft-local-db-route-smoke-retry-2026-06-26`

## Scope

- Branch: `codex/admin-ai-formal-draft-local-db-smoke-retry-20260626`
- Approval consumed: `current_user_advance_approval_admin_ai_generation_goal_execution_2026_06_26`
- Approval package reference:
  `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-formal-draft-adapter-route-integration-approval-package.md`
- Route: `/api/v1/content-ai-generation-results/{publicId}/formal-adoptions`

## Requirement Mapping Result

- `docs/01-requirements/modules/02-question-paper.md`: this task attempted only local draft `question` adoption; no
  publish or student-visible content was executed.
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`: route smoke stayed on governed
  review/adoption metadata and did not treat AI generated content as automatically formal.
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`: content admin adoption
  remains a human-reviewed formal draft path; Provider, direct publish, and final Pass are separate.

## Boundary

- Local DB connection through existing runtime configuration: executed.
- Local runtime DB config read: executed only to connect to local DB; no value was printed or recorded.
- Sanitized eligible-source lookup: executed once.
- Sanitized admin actor lookup: executed once.
- Content admin route POST smoke: executed once.
- Local formal `question` draft write attempt: attempted through the route; not confirmed because route returned `500014`.
- Local formal `paper` draft write attempt: not executed because no eligible content `paper` source was found.
- Migration/schema/seed/source change/Provider/staging/prod/payment/external service/final Pass: not executed.

## Validation Results

| Command                                                                                                                                                                 | Result  | Notes                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts` | PASS    | 2 files, 8 tests passed.                                                                           |
| transient route smoke harness                                                                                                                                           | BLOCKED | Actual route smoke executed 1 actor lookup, 1 eligible-source lookup, and 1 content question POST. |
| transient read-only diagnostic harness                                                                                                                                  | PASS    | Confirmed existing adoption metadata is still blocked and its reviewer admin cannot be resolved.   |

## Route Smoke Result

| Field                          | Result                                           |
| ------------------------------ | ------------------------------------------------ |
| Status                         | `blocked_question_route_response`                |
| Eligible-source lookup count   | 1                                                |
| Actor lookup count             | 1                                                |
| Route POST call count          | 1                                                |
| Attempted workflow             | `content_question_formal_draft_adoption`         |
| Paper workflow                 | not executed; eligible content paper missing     |
| Response code                  | `500014`                                         |
| Formal target write status     | not returned                                     |
| Provider call executed         | false                                            |
| Migration/schema/seed executed | false                                            |
| Formal publish executed        | false                                            |
| Failure category               | `blocked_reused_adoption_reviewer_actor_missing` |

## Redacted Diagnostic

Read-only diagnostic after the failed route smoke found:

| Diagnostic field                | Result                           |
| ------------------------------- | -------------------------------- |
| Source state                    | present                          |
| Adoption metadata state         | present                          |
| Adoption formal write status    | `blocked_without_follow_up_task` |
| Formal question public id state | missing                          |
| Formal paper public id state    | missing                          |
| Reviewer admin state            | missing                          |
| Raw ids printed                 | false                            |
| Additional route POST calls     | 0                                |

Inferred source boundary: the route reused an existing blocked adoption metadata row. The formal draft adapter writer
context still derives from that persisted adoption reviewer, but the persisted reviewer cannot be resolved as a local
admin actor. A focused source TDD repair should pass the current route actor as the formal draft writer mutation context
when a blocked adoption row is reused, or explicitly block stale reviewer metadata with a narrower diagnostic.

## Changed File Inventory

- Added:
  - `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-formal-draft-local-db-route-smoke-retry.md`
  - `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-local-db-route-smoke-retry.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-draft-local-db-route-smoke-retry.md`
- Modified:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`

## Redaction Statement

No raw generated result body, raw reviewed draft body, raw DB row, internal numeric id, DB URL, secret, token, cookie,
Authorization header, API key, prompt, raw output, Provider payload, full formal question content, full paper content,
or account credential was written to evidence.

## Residual Gaps

- Content question formal draft route smoke is still blocked by `500014`.
- Content paper formal draft route smoke could not execute because the local DB did not have an eligible content paper
  generated result.
- The goal remains incomplete until a source repair and a successful local route smoke prove at least content question
  adoption; content paper adoption still needs either an eligible local source or a separately approved setup path.

## Final Closeout

Status: `BLOCKED_ROUTE_SMOKE_RETRY_QUESTION_500014_REUSED_ADOPTION_REVIEWER_ACTOR_MISSING`.
