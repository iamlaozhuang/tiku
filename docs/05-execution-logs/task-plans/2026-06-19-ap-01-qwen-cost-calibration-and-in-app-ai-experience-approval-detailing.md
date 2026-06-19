# AP-01 Qwen Cost Calibration And In-App AI Experience Approval Detailing

## Task

- Task id: `ap-01-qwen-cost-calibration-and-in-app-ai-experience-approval-detailing`
- Branch: `codex/ap-01-qwen-cost-calibration-and-in-app-ai-experience-approval-detailing`
- Base commit: `eabc17db`
- Date: `2026-06-19`
- Scope: docs/state approval detailing only.

## Mandatory Readings

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
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen3-7-max-one-request-smoke-approval.md`

## Code Surfaces Read Only

- `src/app/(student)/ai-generation/page.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/app/api/v1/personal-ai-generation-requests/route.ts`
- `src/app/api/v1/personal-ai-generation-results/route.ts`
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-result-route.ts`
- `src/server/services/personal-ai-generation-local-browser-experience-service.ts`
- `src/server/services/ai-generation-task-provider-adapter-service.ts`
- `src/server/services/ai-generation-task-provider-sandbox-proposal-service.ts`
- `src/server/services/ai-generation-task-request-service.ts`
- `src/server/services/ai-scoring-service.ts`
- `src/server/services/ai-explanation-hint-service.ts`
- `src/ai/prompts/templates.ts`
- `src/server/models/ai-rag.ts`
- `e2e/personal-ai-generation-local-request.spec.ts`
- `package.json`

## Allowed Files

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-cost-calibration-and-in-app-ai-experience-approval-detailing.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-cost-calibration-and-in-app-ai-experience-approval-detailing.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-cost-calibration-and-in-app-ai-experience-approval-detailing.md`

## Blocked Files And Capabilities

- `.env*`
- `package.json`
- lockfiles
- `src/**`
- `e2e/**`
- `tests/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`
- `playwright-report/**`
- `test-results/**`
- Provider/model calls.
- Additional provider retry.
- Provider/model/base URL configuration changes.
- Cost Calibration Gate execution.
- Staging/prod/cloud/deploy.
- Payment/external service.
- Dependency/schema/migration/product/test/e2e changes.
- PR, push, force push.
- Destructive database operations.
- Raw sensitive evidence.

## Implementation Plan

1. Record the current in-app AI candidate entry and the observed runtime boundary.
2. Define the sample material boundary for a first real in-app run.
3. Define evidence redaction rules for prompt, response, provider payload, errors, and local DB artifacts.
4. Define request, token, retry, timeout, and task-level cost ceilings.
5. Define rollback and stop conditions.
6. Update task queue, project state, and coverage matrix to keep the use case release-blocked until a fresh approved
   runtime bridge or equivalent in-app execution path exists.
7. Run docs/state formatting, diff, lint/typecheck, and Module Run v2 hardening/readiness checks.

## Key Risk Controls

- This task does not read `.env.local`.
- This task does not execute Qwen or any other provider.
- The existing student page is `local_contract_only`; the approval package must not imply real in-app provider execution
  is already wired.
- The next execution task must have fresh approval before any real application-path AI call.
