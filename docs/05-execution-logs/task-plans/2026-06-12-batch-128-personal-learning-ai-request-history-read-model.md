# Task Plan: batch-128-personal-learning-ai-request-history-read-model

## Scope

- Task id: `batch-128-personal-learning-ai-request-history-read-model`
- Branch: `codex/batch-128-personal-learning-ai-request-history-read-model`
- Goal: add a local redacted personal learning AI request history read-model with stable ordering and standard response envelope.
- Non-goals: route handlers, persistence, repository queries, UI display, provider execution, generated-content storage, e2e work, schema/migration, dependency/env/deploy/payment/external-service changes, PR, force push, and Cost Calibration Gate.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Recent evidence/audit: batch-127 student session auth bridge.

## Allowed Files

- `src/server/models/personal-ai-generation-request-history.ts`
- `src/server/contracts/personal-ai-generation-request-history-contract.ts`
- `src/server/validators/personal-ai-generation-request-history.ts`
- `src/server/services/personal-ai-generation-request-history-service.ts`
- `src/server/services/personal-ai-generation-request-history-service.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-12-batch-128-personal-learning-ai-request-history-read-model.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-128-personal-learning-ai-request-history-read-model.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-128-personal-learning-ai-request-history-read-model.md`

## Implementation Plan

1. Inspect existing personal AI request/read-model services and contract naming patterns.
2. Add focused RED unit tests for empty history response, redacted camelCase rows, and stable ordering by `requestedAt` descending then public id.
3. Implement model, contract, validator, and service using immutable transformations.
4. Keep rows limited to public ids, status, evidence status, citation counts, redaction status, and null-safe optional fields.
5. Avoid any route, repository, schema, provider, generated-content storage, or UI surface.

## Risk Defense

- Redaction boundary: no provider payload, raw prompt, raw generated content, full paper content, numeric internal ids, Authorization headers, or session material in output/evidence.
- Persistence boundary: all inputs are in-memory local read-model rows; no repository query or schema work.
- API contract boundary: response uses `{ code, message, data }`; JSON fields are camelCase; optional values use `null`; empty history uses `[]`.
- Dependency boundary: no `package.json` or lockfile changes.

## Verification Plan

- Pre-edit readiness: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- Focused RED/GREEN: `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-history-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-128-personal-learning-ai-request-history-read-model`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-128-personal-learning-ai-request-history-read-model`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-128-personal-learning-ai-request-history-read-model`
