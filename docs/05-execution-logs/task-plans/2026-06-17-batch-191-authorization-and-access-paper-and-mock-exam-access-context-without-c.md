# Batch 191 Paper And Mock Exam Access Context Plan

## Scope

- Task: `batch-191-authorization-and-access-paper-and-mock-exam-access-context-without-c`
- Target closure: `paper` and `mock_exam` access context without changing real permission behavior.
- Execution profile: `local_unit_tdd`
- Evidence mode: `full`
- Validation policy: `local_unit`
- Allowed code surfaces: `src/server/models/**`, `src/server/contracts/**`, `src/server/validators/**`, `src/server/services/**`.
- Blocked surfaces: `.env*`, package and lock files, `src/db/schema/**`, `drizzle/**`, provider/model calls, staging/prod/cloud/deploy/payment/external-service, PR, force push, and Cost Calibration Gate.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `src/server/models/authorization-paper-mock-exam-access-context.ts`
- `src/server/contracts/authorization-paper-mock-exam-access-context-contract.ts`
- `src/server/services/authorization-paper-mock-exam-access-context-service.ts`
- `src/server/services/authorization-paper-mock-exam-access-context-service.test.ts`
- `src/server/validators/authorization-paper-mock-exam-access-context.ts`

## Local Reality

The existing `authorization-paper-mock-exam-access-context` service already returns `accessContextStatus: "context_summary_only"` and `permissionBehaviorStatus: "unchanged"`, covers paper/mock_exam match metadata, rejects invalid inputs, and keeps content/private payloads out of the DTO. Batch 191 will add only an explicit local read-model scope marker so downstream consumers can tell this context is limited to `paper` and `mock_exam` references without changing permission enforcement.

## TDD Plan

1. RED: require `accessContextScopeStatus: "paper_mock_exam_context_only"` in `authorization-paper-mock-exam-access-context-service.test.ts`.
2. GREEN: add the minimal model/contract/service mapping for that status marker.
3. Keep `permissionBehaviorStatus: "unchanged"` and the existing redaction expectations unchanged.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/authorization-paper-mock-exam-access-context-service.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-69-advanced-authorization-context-implementation-planning -CandidateTaskId batch-191-authorization-and-access-paper-and-mock-exam-access-context-without-c`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-191-authorization-and-access-paper-and-mock-exam-access-context-without-c`
