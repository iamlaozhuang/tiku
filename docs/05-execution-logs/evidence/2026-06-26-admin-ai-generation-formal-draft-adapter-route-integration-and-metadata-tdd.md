# Admin AI generation formal draft adapter route integration and metadata TDD evidence

Task id: `admin-ai-generation-formal-draft-adapter-route-integration-and-metadata-tdd-2026-06-26`

## Scope

- Branch: `codex/admin-ai-formal-draft-route-integration-tdd-20260626`
- Task kind: implementation TDD
- Approval consumed:
  `admin-ai-generation-formal-draft-adapter-route-integration-approval-package-2026-06-26`

## Boundary

- Source and focused test changes approved: true
- Live DB connection executed: false
- Route smoke executed: false
- Schema or migration changed: false
- Migration executed: false
- Seed or fixture created: false
- Formal `question`/`paper` draft write against live DB executed: false
- Provider call or credential read executed: false
- Package or lockfile changed: false
- Staging/prod/deploy/payment/external-service touched: false
- Cost Calibration or final Pass claimed: false

## Requirement Mapping Result

- Content admin adoption route now maps approved generated-result adoption metadata to the formal draft adapter.
- Successful formal draft creation is persisted back to adoption metadata as `formalTargetWriteStatus = draft_created`
  with exactly one matching formal `question` or `paper` draft public id.
- Route responses remain redacted and return public identifiers/status only.
- This task did not execute live DB route smoke or live formal draft writes; the next queued task owns that local DB
  evidence.
- Organization-scoped adoption, Provider/Cost, staging/prod, payment, external service, release readiness, and final
  Pass remain blocked.

## TDD Evidence

| Phase | Command                                                                                                                                                                                                                                                                                                                               | Result | Notes                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| RED   | `npm.cmd run test:unit -- src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts`                                                                                                                                                                                                                                    | FAIL   | Expected failure: route still returned `blocked_without_follow_up_task` instead of `draft_created`. |
| GREEN | `npm.cmd run test:unit -- src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts`                                                                                                                                                                                                                                    | PASS   | 1 file, 3 tests after route/service/repository integration.                                         |
| GREEN | `npm.cmd run test:unit -- src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts src/server/repositories/admin-ai-generation-formal-adoption-repository.test.ts src/server/repositories/admin-ai-generation-formal-adoption-db-adapter.test.ts src/server/services/admin-ai-generation-formal-draft-adapter.test.ts` | PASS   | 4 files, 19 tests. Covered question, paper, metadata update, mapper, and adapter boundaries.        |

## Validation Results

| Command                                                                                                                                                     | Result | Notes                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------- |
| `npm.cmd run lint`                                                                                                                                          | PASS   | ESLint passed.                                                   |
| `npm.cmd run typecheck`                                                                                                                                     | PASS   | Initial test fake type widening was fixed; final typecheck pass. |
| Scoped `prettier --write`                                                                                                                                   | PASS   | Ran on changed docs/state/source/test files.                     |
| Scoped `prettier --check`                                                                                                                                   | PASS   | Checked changed docs/state/source/test files.                    |
| `git diff --check`                                                                                                                                          | PASS   | No whitespace errors.                                            |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-formal-draft-adapter-route-integration-and-metadata-tdd-2026-06-26`                     | PASS   | Scope and gate checks passed; Cost Calibration remains blocked.  |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-formal-draft-adapter-route-integration-and-metadata-tdd-2026-06-26 -SkipRemoteAheadCheck` | PASS   | Branch readiness passed before closeout.                         |

## Changed File Inventory

- Added:
  - `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-formal-draft-adapter-route-integration-and-metadata-tdd.md`
  - `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-adapter-route-integration-and-metadata-tdd.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-draft-adapter-route-integration-and-metadata-tdd.md`
- Modified:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `src/server/contracts/admin-ai-generation-formal-adoption-contract.ts`
  - `src/server/repositories/admin-ai-generation-formal-adoption-repository.ts`
  - `src/server/repositories/admin-ai-generation-formal-adoption-repository.test.ts`
  - `src/server/repositories/admin-ai-generation-formal-adoption-db-adapter.ts`
  - `src/server/repositories/admin-ai-generation-formal-adoption-db-adapter.test.ts`
  - `src/server/services/admin-ai-generation-formal-adoption-service.ts`
  - `src/server/services/admin-ai-generation-formal-adoption-runtime.ts`
  - `src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts`

## Redaction Statement

Evidence must not include raw generated result body, prompt, model output, Provider payload, API key, token, cookie,
Authorization header, DB URL, password, secret, raw DB rows, internal numeric ids, or full formal `question`/`paper`
content.

## Residual Gaps

- Live local DB route smoke has not executed in this task.
- No seed or fixture was created; the later smoke can only use existing local generated results.
- Paper adoption currently creates a formal `paper` draft shell. Composing paper sections/questions from generated paper
  output remains a possible follow-up if required by product closure.
- The formal draft write and metadata update are not proven by live DB evidence until the next route smoke task.

## Final Closeout

Status: `PASS_FORMAL_DRAFT_ROUTE_INTEGRATION_AND_METADATA_TDD_NO_LIVE_DB`.

The route/service/runtime is wired to the formal draft adapter and adoption metadata update boundary under focused TDD.
No live DB route smoke, schema/migration execution, Provider call, staging/prod, payment, external service, release
readiness, or final Pass was performed or claimed.
