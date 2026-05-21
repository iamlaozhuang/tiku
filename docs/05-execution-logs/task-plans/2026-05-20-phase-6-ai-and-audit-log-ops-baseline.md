# Task Plan: Phase 6 AI And Audit Log Ops Baseline

## Task Metadata

- Task id: `phase-6-ai-and-audit-log-ops-baseline`
- Phase: `phase-6-admin-ops`
- Branch: `codex/phase-6-ai-and-audit-log-ops-baseline`
- Source stories:
  - `docs/01-requirements/stories/epic-06-admin-ops.md#us-06-07-超级管理员-ai-配置`
  - `docs/01-requirements/stories/epic-06-admin-ops.md#us-06-11-审计日志查看`
  - `docs/01-requirements/stories/epic-06-admin-ops.md#us-06-12-ai-调用日志查看`
- Task plan policy: `required`
- Evidence path: `docs/05-execution-logs/evidence/2026-05-20-phase-6-ai-and-audit-log-ops-baseline.md`
- Security review path: `docs/05-execution-logs/audits-reviews/2026-05-20-phase-6-ai-and-audit-log-ops-baseline-security-review.md`

## Required Sources Read

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/sop/skill-dispatch-matrix.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-20-phase-6-content-and-knowledge-ops-baseline.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`

## Scope From Queue

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-20-phase-6-ai-and-audit-log-ops-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-20-phase-6-ai-and-audit-log-ops-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-20-phase-6-ai-and-audit-log-ops-baseline-security-review.md`
- `src/app/(admin)/**`
- `src/app/api/v1/audit-logs/**`
- `src/app/api/v1/ai-call-logs/**`
- `src/app/api/v1/model-configs/**`
- `src/ai/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/models/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `drizzle/**`
- `.env.example`

## Implementation Plan

1. Add focused RED tests for AI and audit log admin operations covering model configuration contracts, secret redaction, read-only `audit_log`, read-only `ai_call_log`, cost summary aggregation, route adapters, and UI states.
2. Add `src/server/contracts/admin-ai-audit-log-ops-contract.ts` with camelCase DTOs for `ModelConfigSummaryDto`, `ModelConfigDetailDto`, `AuditLogSummaryDto`, `AuditLogDetailDto`, `AiCallLogSummaryDto`, `AiCallLogDetailDto`, and cost summaries.
3. Add service helpers in `src/server/services/admin-ai-audit-log-ops-service.ts` that return safe baseline projections, enforce super-admin-only model configuration mutations, and keep log views read-only.
4. Add route adapters in `src/server/services/admin-ai-audit-log-ops-route.ts` for `/api/v1/model-configs`, `/api/v1/audit-logs`, `/api/v1/ai-call-logs`, and `/api/v1/ai-call-logs/summary`, preserving `{ code, message, data, pagination? }`.
5. Add Next.js route exports under `src/app/api/v1/model-configs/**`, `src/app/api/v1/audit-logs/**`, and `src/app/api/v1/ai-call-logs/**` using unavailable runtime services until authenticated admin context and persistence are wired.
6. Add an admin UI baseline under `src/app/(admin)/**` for model configuration, audit log, and AI call log operations with loading, empty, error, ready, confirmation, and toast states.
7. Complete the required security review artifact covering admin role boundaries, secret redaction, provider payload redaction, log immutability, public id handling, and accepted runtime gaps.
8. Update project state and task queue after implementation and validation prove the task is ready for closeout.

## Risk Controls

- No dependency, lockfile, migration, `.env.example`, deployment, real secret, or force-push changes.
- Model provider API keys are accepted only as create/update input concepts and never returned; displayed keys are redacted to a safe suffix.
- `audit_log` and `ai_call_log` remain read-only in the admin UI and services for this baseline.
- No raw prompts, raw user answers, raw model outputs, raw citations, raw retrieved chunks, provider headers, provider payloads, provider errors, session tokens, passwords, or numeric database `id` values are exposed.
- Model configuration operations are super-admin-only at the service boundary.
- JSON fields stay camelCase; route folders stay kebab-case plural nouns under `/api/v1/`.
- UI uses existing admin patterns and tokens; no pure black, default Inter, hardcoded theme branching, or purple-blue gradient.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-6-ai-and-audit-log-ops-baseline`
- Focused RED/GREEN unit test command for this task.
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
