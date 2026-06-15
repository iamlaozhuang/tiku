# Advanced Personal AI Generation Result Readonly Route Plan

## Task

- Task id: `advanced-personal-ai-generation-result-readonly-route`
- Branch: `codex/advanced-personal-ai-generation-result-readonly-route`
- Date: 2026-06-15
- Task kind: local route implementation

## Approval

The user approved the four-task serial advanced batch. This is task 3 of 4 and may proceed only after
`advanced-personal-ai-generation-result-redacted-read-model-service` is closed and pushed.

## Files Allowed

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-advanced-personal-ai-generation-result-readonly-route.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-personal-ai-generation-result-readonly-route.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-personal-ai-generation-result-readonly-route.md`
- `src/app/api/v1/personal-ai-generation-results/route.ts`
- `src/server/services/personal-ai-generation-result-route.ts`
- `src/server/services/personal-ai-generation-result-route.test.ts`
- `src/server/services/personal-ai-generation-result-history-service.ts`
- `src/server/contracts/personal-ai-generation-result-history-contract.ts`

## Files And Actions Blocked

- No UI, e2e, schema, migration, drizzle, script, package, or lockfile changes.
- No `.env.local`, `.env.*`, secret, provider configuration, database URL, token, cookie, Authorization header, raw
  prompt, raw answer, provider payload, row data, or private data access or output.
- No real DB access in tests, dev server, Browser, Playwright, provider/model call, quota/cost measurement, Cost
  Calibration Gate, staging/prod/cloud/deploy, payment, external-service, PR, or force-push.

## Implementation Plan

1. Follow TDD: add focused unit tests for a GET route handler and run them to see RED.
2. Add a result route service that resolves personal user context from session service and rejects missing/non-personal
   sessions.
3. Parse only a numeric optional `limit` query parameter; owner identity must come from session context, not from client
   query params.
4. Call the approved result history service with an injected repository; tests use a mock repository only.
5. Add `src/app/api/v1/personal-ai-generation-results/route.ts` exporting GET with the local session runtime and
   Postgres repository factory without accessing DB during tests.
6. Preserve standard API response envelopes and redaction boundaries.
7. Verify focused unit test, lint, typecheck, diff checks, and Module Run v2 closeout gates.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-result-route.test.ts`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-personal-ai-generation-result-readonly-route`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-personal-ai-generation-result-readonly-route`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-personal-ai-generation-result-readonly-route`

## Risks

- The route must not trust query/body owner ids; ownership must come from the session user public id.
- The route file may instantiate a lazy Postgres repository, but tests must use injected repositories and must not access
  the real DB.
- Route and service must not expose raw generated content, provider payloads, internal numeric ids, row data, or formal
  adoption write capabilities.
