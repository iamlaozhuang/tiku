# 2026-07-06 AI Paper Route Source Resolution Integration Task Plan

## Task

- id: `ai-paper-route-source-resolution-integration-2026-07-06`
- branch: `codex/ai-paper-route-source-resolution-integration-2026-07-06`
- parent goal: `ai-generation-recontract-local-repair-goal-2026-07-06`
- scope: source/unit/docs/state/evidence/audit only.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `src/server/repositories/question-repository.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/services/ai-paper-source-adapter-service.ts`
- `src/server/services/ai-paper-route-assembly-service.ts`

## Requirement Contract

- AI组卷 means AI creates an assembly plan; local services select existing eligible formal questions.
- Platform source means `question.status = available`.
- Enterprise source v1 means same-organization published and not taken-down enterprise training question snapshots.
- `personal_advanced_student` and `content_admin` resolve platform formal questions only.
- `org_advanced_employee` resolves platform formal questions plus same-organization employee-visible enterprise snapshots.
- `org_advanced_admin` resolves platform formal questions plus same-organization admin-visible enterprise snapshots.
- Evidence must stay redacted and record only file paths, command status, role labels, source categories, counts, and failure categories.

## Implementation Plan

1. Write failing unit tests for a route source resolution service.
2. Implement a pure, injected service that calls repository interfaces without opening DB connections.
3. Reuse source adapter functions to map repository rows and enterprise training versions into selectable question metadata.
4. Reject missing role context safely before repository calls where the role requires organization or employee context.
5. Keep output metadata-only and ensure sensitive fixture content is not serialized.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-06-ai-paper-route-source-resolution-integration.md`
- `docs/05-execution-logs/evidence/2026-07-06-ai-paper-route-source-resolution-integration.md`
- `docs/05-execution-logs/audits-reviews/2026-07-06-ai-paper-route-source-resolution-integration.md`
- `src/server/services/ai-paper-route-source-resolution-service.ts`
- `src/server/services/ai-paper-route-source-resolution-service.test.ts`

## Blocked Boundaries

- No dependency, package, or lockfile change.
- No schema, migration, or seed change.
- No direct DB runtime, destructive DB operation, or env/secret access.
- No Provider call, prompt execution, payload capture, or Cost Calibration claim.
- No browser/dev server/e2e/staging/prod/deploy/remote closeout.
- No raw DB rows, internal ids, full question/paper/material/resource/chunk content, credentials, sessions, tokens, cookies, env values, Provider payloads, raw prompt, or raw AI output in evidence.

## Validation Plan

- RED: `npm.cmd run test:unit -- src/server/services/ai-paper-route-source-resolution-service.test.ts`
- GREEN/focused: `npm.cmd run test:unit -- src/server/services/ai-paper-route-source-resolution-service.test.ts src/server/services/ai-paper-source-adapter-service.test.ts src/server/services/ai-paper-route-assembly-service.test.ts src/server/services/ai-paper-plan-and-select-service.test.ts`
- `git diff --check`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-06-ai-paper-route-source-resolution-integration.md docs/05-execution-logs/evidence/2026-07-06-ai-paper-route-source-resolution-integration.md docs/05-execution-logs/audits-reviews/2026-07-06-ai-paper-route-source-resolution-integration.md src/server/services/ai-paper-route-source-resolution-service.ts src/server/services/ai-paper-route-source-resolution-service.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-paper-route-source-resolution-integration-2026-07-06`

## Risk Defense

- Keep the resolver dependency-injected so unit tests do not connect to the local 0704 DB.
- Do not expose raw question content; rely on existing metadata-only source adapters.
- Do not infer organization employee sources without explicit organization and employee public context.
- Do not claim runtime, browser, Provider-enabled, release, production, staging, or Cost Calibration readiness.
