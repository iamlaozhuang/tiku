# Advanced Personal AI Generation Result Redacted Read-Model Service Plan

## Task

- Task id: `advanced-personal-ai-generation-result-redacted-read-model-service`
- Branch: `codex/advanced-personal-ai-generation-result-redacted-read-model-service`
- Date: 2026-06-15
- Task kind: local service implementation

## Approval

The user approved the serial advanced task batch. This is task 2 of 4 and may proceed only after
`advanced-current-master-state-handoff-refresh` is closed and pushed.

## Files Allowed

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-advanced-personal-ai-generation-result-redacted-read-model-service.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-personal-ai-generation-result-redacted-read-model-service.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-personal-ai-generation-result-redacted-read-model-service.md`
- `src/server/models/personal-ai-generation-result-history.ts`
- `src/server/contracts/personal-ai-generation-result-history-contract.ts`
- `src/server/validators/personal-ai-generation-result-history.ts`
- `src/server/services/personal-ai-generation-result-history-service.ts`
- `src/server/services/personal-ai-generation-result-history-service.test.ts`

## Files And Actions Blocked

- No route, UI, repository, schema, migration, drizzle, script, package, or lockfile changes.
- No `.env.local`, `.env.*`, secret, provider configuration, database URL, token, cookie, Authorization header, raw
  prompt, raw answer, provider payload, row data, or private data access or output.
- No DB access, dev server, Browser, Playwright, provider/model call, quota/cost measurement, Cost Calibration Gate,
  staging/prod/cloud/deploy, payment, external-service, PR, or force-push.

## Implementation Plan

1. Follow TDD: add focused unit tests for a redacted result history service and run them to see RED.
2. Add a result history model for input and deterministic ordering.
3. Add a contract DTO that returns a standard API response body with `runtimeStatus: "local_contract_only"`, redacted
   result summaries, content visibility, redaction status, and formal adoption blocked metadata.
4. Add a validator for `{ ownerPublicId, limit? }`, rejecting invalid owner ids or invalid limits before repository use.
5. Add a service factory over `PersonalAiGenerationResultRepository.listDraftResults` only.
6. Ensure invalid input does not call the repository and repository failures return a standard error envelope.
7. Verify no raw prompt, raw answer, provider payload, internal numeric id, row data, or formal adoption write leaks.
8. Run focused unit test, lint, typecheck, diff checks, and Module Run v2 closeout gates.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-result-history-service.test.ts`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-personal-ai-generation-result-redacted-read-model-service`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-personal-ai-generation-result-redacted-read-model-service`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-personal-ai-generation-result-redacted-read-model-service`

## Risks

- The repository already has DB-backed implementation, but this task must test through a mocked repository only and must
  not access the real DB.
- The result DTO must remain redacted and must not expose raw generated content, provider payloads, internal ids, or
  formal adoption write capabilities.
- Route and UI integration are intentionally left for later tasks.
