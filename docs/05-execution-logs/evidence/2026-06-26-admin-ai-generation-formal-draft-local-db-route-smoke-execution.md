# Admin AI generation formal draft local DB route smoke execution evidence

Task id: `admin-ai-generation-formal-draft-local-db-route-smoke-execution-2026-06-26`

## Scope

- Branch: `codex/admin-ai-formal-draft-local-db-smoke-20260626`
- Approval consumed: `admin-ai-generation-formal-draft-adapter-route-integration-approval-package-2026-06-26`
- Route: `/api/v1/content-ai-generation-results/{publicId}/formal-adoptions`

## Boundary

- Live local DB connection approved for this task: true
- Sanitized eligible-source lookup approved: true, max 2 queries
- Route-handler POST smoke approved: true, max 2 calls
- Local formal `question`/`paper` draft write approved: true, max 2 route calls only
- Adoption metadata update approved: true, max 2 route calls only
- Migration or schema change approved: false
- Seed or fixture creation approved: false
- Organization-scoped adoption approved: false
- Provider call or Provider credential read approved: false
- Package or lockfile change approved: false
- Staging/prod/deploy/payment/external-service approved: false
- Cost Calibration or final Pass approved: false

## Smoke Result

Command shape:

```powershell
npx.cmd vitest run --config <external-temp-config> --reporter=verbose --testTimeout 30000
```

The smoke harness and config were created outside the committed repository state and removed after execution. Early
harness attempts were startup-only failures caused by external Vitest include/config path resolution and did not execute
DB lookup or route POST. The final harness entered the route smoke and produced this sanitized result:

| Field                              | Result                                        |
| ---------------------------------- | --------------------------------------------- |
| Status                             | `blocked_route_response_question_500014`      |
| Eligible-source lookup query count | 1                                             |
| Route POST call count              | 1                                             |
| Attempted workflow                 | `content_question_formal_draft_adoption`      |
| Unattempted workflow               | `content_paper_formal_draft_adoption`         |
| Unattempted reason                 | `stopped_after_question_route_failure`        |
| Response status                    | `500014` / persistence failure class          |
| Formal target write status         | not returned as `draft_created`               |
| Redaction status                   | redacted summary only                         |
| Provider call executed             | false                                         |
| Migration/schema/seed executed     | false                                         |
| Formal `question`/`paper` publish  | false                                         |
| Failure category                   | `blocked_formal_draft_writer_context_missing` |

Read-only source inspection after the failure found that the default formal draft adapter calls existing
`QuestionService.createQuestion` / `PaperDraftService.createPaper` without a content mutation context, while both
repositories require an admin actor for content mutation. This is an inferred root cause from source code and must be
handled by a separate focused TDD repair task.

## Validation Results

| Command                                        | Result  | Notes                                                                                 |
| ---------------------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| External transient route-handler smoke harness | BLOCKED | Final harness executed 1 sanitized lookup and 1 question POST; route returned 500014. |
| Scoped `prettier --check` before smoke         | PASS    | Initial docs/state plan files used Prettier style.                                    |
| Scoped `prettier --write` after closeout       | PASS    | Ran on changed docs/state/evidence/audit files.                                       |
| Scoped `prettier --check` after closeout       | PASS    | All matched files use Prettier code style.                                            |
| `git diff --check`                             | PASS    | No whitespace errors.                                                                 |
| `Test-ModuleRunV2PreCommitHardening.ps1`       | PASS    | Scope, sensitive evidence, terminology, and anchors passed.                           |
| `Test-ModuleRunV2PrePushReadiness.ps1`         | PASS    | Git readiness, evidence/audit paths, and anchors passed.                              |

## Changed File Inventory

- Added:
  - `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-formal-draft-local-db-route-smoke-execution.md`
  - `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-local-db-route-smoke-execution.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-draft-local-db-route-smoke-execution.md`
- Modified:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`

## Redaction Statement

This evidence must not include raw generated result body, prompt, model output, Provider payload, API key, token, cookie,
Authorization header, DB URL, password, secret, raw DB rows, internal numeric ids, full formal `question` or `paper`
content, or raw provider payload.

## Residual Gaps

- Content question formal draft route smoke did not pass because the route returned `500014`.
- Content paper formal draft route smoke was not attempted after the question failure; no retry was consumed.
- The likely repair is to pass the content admin actor/mutation context through the formal draft adapter writer boundary.
- No Provider/Cost, organization-scoped adoption, staging/prod, payment, external service, release readiness, or final
  Pass was performed or claimed.

## Final Closeout

Status: `BLOCKED_ROUTE_SMOKE_EXECUTED_QUESTION_500014_NO_RETRY`.
