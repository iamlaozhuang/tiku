# Admin AI generation formal adoption contract and repository TDD evidence

Task id: `admin-ai-generation-formal-adoption-contract-and-repository-tdd-2026-06-26`

## Scope

- Branch: `codex/admin-ai-formal-adoption-contract-repo-tdd-20260626`
- Approval consumed: current user fresh approval for this task id.
- Implemented scope:
  - `src/server/models/admin-ai-generation-formal-adoption.ts`
  - `src/server/contracts/admin-ai-generation-formal-adoption-contract.ts`
  - `src/server/repositories/admin-ai-generation-formal-adoption-repository.ts`
  - `src/server/repositories/admin-ai-generation-formal-adoption-repository.test.ts`
- Execution boundary:
  - Provider call executed: false
  - Provider credential read: false
  - Env/secret access: false
  - Live DB connection or mutation: false
  - Schema/migration change: false
  - Route integration or route smoke: false
  - Browser/dev server/e2e runtime: false
  - Formal `question`/`paper` write execution: false
  - Staging/prod/deploy/payment/external service touched: false
  - Final Pass or release readiness claimed: false

## TDD Evidence

### RED

Command:

```powershell
npm.cmd run test:unit -- src/server/repositories/admin-ai-generation-formal-adoption-repository.test.ts
```

Result: `FAIL_EXPECTED`.

Summary:

- Test file was added first.
- Vitest failed before collecting tests because `src/server/repositories/admin-ai-generation-formal-adoption-repository.ts` did not exist.
- This confirms the RED step was caused by missing implementation rather than unrelated runtime setup.

### GREEN

Command:

```powershell
npm.cmd run test:unit -- src/server/repositories/admin-ai-generation-formal-adoption-repository.test.ts
```

Result: `PASS`.

Summary:

- Test files: 1 passed.
- Tests: 4 passed.
- Covered behaviors:
  - creates a redacted platform formal adoption plan for reviewed content generated question results;
  - reuses an existing adoption plan for the same source result and target type;
  - blocks organization generated results from platform formal adoption and preserves a separate organization-scoped decision boundary;
  - rejects unconfirmed or target-mismatched adoption commands before insertion.

## Command Results

| Command                                                                                                   | Result                       | Notes                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- src/server/repositories/admin-ai-generation-formal-adoption-repository.test.ts` | `PASS`                       | 1 file, 4 tests.                                                                                                                                     |
| `npm.cmd run lint`                                                                                        | `PASS`                       | Initial unused-type warning was repaired; rerun passed.                                                                                              |
| `npm.cmd run typecheck`                                                                                   | `PASS`                       | `tsc --noEmit` passed.                                                                                                                               |
| `npx.cmd prettier --check --ignore-unknown ...`                                                           | `PASS`                       | Initial check found TS formatting issues, then a later evidence Markdown formatting issue; scoped `prettier --write` was run and final check passed. |
| `git diff --check`                                                                                        | `PASS`                       | No whitespace errors.                                                                                                                                |
| `Test-ModuleRunV2PreCommitHardening.ps1`                                                                  | `PASS_AFTER_SENTINEL_REPAIR` | First run blocked a test sentinel protected-text literal; the sentinel was changed to runtime string construction and the rerun passed.              |
| `Test-ModuleRunV2PrePushReadiness.ps1 -SkipRemoteAheadCheck`                                              | `PASS`                       | Passed with accepted ancestor checkpoint state.                                                                                                      |

## Requirement Mapping Result

- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`: generated content remains separate from formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and `mistake_book` until explicit review and governance.
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`: content admin AI generated output may only become formal `question` or `paper` through governed review, validation, attribution, and audit; direct formal write remains forbidden.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`: organization-owned AI generated output must not enter the platform formal question bank or paper library.
- `docs/05-execution-logs/acceptance/2026-06-26-formal-question-paper-adoption-approval-package.md`: this task consumes the approved minimum implementation task for contract/repository TDD only and keeps live DB mutation, schema/migration, and formal write execution out of scope.

## Acceptance Mapping Result

- Explicit reviewed adoption command: covered at repository-port level with `reviewerConfirmed`, `reviewDecision`, reviewer public id, and reviewed timestamp.
- Automatic Provider-to-formal write blocked: covered by no Provider integration and DTO `formalTargetWriteStatus: blocked_without_follow_up_task`.
- Provenance: covered by generated result, task, and request public ids in adoption DTO and insert input.
- Idempotency: covered by `findAdoptionBySourceResult` reuse before insert.
- Content vs organization separation: content workspace maps to `platform_formal_content`; organization workspace is blocked with a separate organization-scoped task message.
- Redaction: DTO contains digest, masked preview, evidence summary, and public ids only; no raw content, provider payload, credentials, token, cookie, Authorization header, internal ids, or raw provider output.

## Changed File Inventory

- Added:
  - `src/server/models/admin-ai-generation-formal-adoption.ts`
  - `src/server/contracts/admin-ai-generation-formal-adoption-contract.ts`
  - `src/server/repositories/admin-ai-generation-formal-adoption-repository.ts`
  - `src/server/repositories/admin-ai-generation-formal-adoption-repository.test.ts`
  - `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-formal-adoption-contract-and-repository-tdd.md`
  - `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-contract-and-repository-tdd.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-adoption-contract-and-repository-tdd.md`
- Modified:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`

## Blocked Remainder

- Live formal question/paper write execution remains blocked.
- DB adapter, schema, migration, and local DB adoption smoke remain blocked.
- Route integration and browser smoke remain blocked.
- Organization-scoped adoption remains blocked pending a separate decision package.
- Provider, env/secret, staging/prod, deployment/release readiness, payment, external service, and Cost Calibration remain blocked.

## Final Closeout

Result: `PASS_CONTRACT_REPOSITORY_TDD`.

The task adds explicit backend admin AI formal adoption contract/repository-port coverage only. It does not execute live formal content writes, DB mutation, route smoke, Provider calls, staging/prod/deploy/payment/external-service work, Cost Calibration, or final Pass.
