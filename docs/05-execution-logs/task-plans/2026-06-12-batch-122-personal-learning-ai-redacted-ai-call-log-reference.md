# Task Plan: batch-122-personal-learning-ai-redacted-ai-call-log-reference

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Recent evidence and audit reviews for phase-71 and batches 119-121.
- Existing personal AI generation request-flow, result-reference, and AI task log evidence-reference services.

## Goal

Implement a redacted `ai_call_log` reference contract/service/read-model for personal AI generation local flows without
storing raw generated AI content, raw prompt, provider payload, or any provider execution result.

## Scope

Allowed:

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Blocked:

- package or lockfile changes
- schema, migration, env, provider, deploy, payment, external-service, repository, UI, e2e, and formal content write paths
- saving raw prompt, raw generated content, raw provider payload, secret, token, plaintext `redeem_code`, full `paper`
  content, or numeric ids
- PR creation, force push, and Cost Calibration Gate execution

## Implementation Plan

1. Add focused RED unit coverage for a personal AI generation redacted `ai_call_log` reference service.
2. Introduce a small model/contract/validator/service anchor:
   - accept `taskPublicId`, personal AI generation task type, optional `aiCallLogPublicId`, local task status, evidence
     status, citation count, and redaction flags;
   - reject raw prompt, raw generated content, provider payload, token, and full `paper` content when present;
   - output only summary metadata and redacted public-id references.
3. Reuse existing terminology and result-reference status concepts; do not connect to provider runtime or persistence.
4. Update docs/state/evidence/audit for this task only.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-71-advanced-personal-ai-generation-implementation-planning -CandidateTaskId batch-122-personal-learning-ai-redacted-ai-call-log-reference`
- RED/GREEN focused unit: `npm.cmd run test:unit -- src/server/services/personal-ai-generation-ai-call-log-reference-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-122-personal-learning-ai-redacted-ai-call-log-reference`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-122-personal-learning-ai-redacted-ai-call-log-reference`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-122-personal-learning-ai-redacted-ai-call-log-reference`

## Risk Controls

- No provider calls, no provider configuration, and no real content write path.
- No schema or migration work; this is a local read-model only.
- Evidence records public-id-shaped fixtures and command summaries only.
- Cost Calibration Gate remains blocked.
