# 2026-07-06 AI training quantity validation and degradation alignment

## Scope

- Task id: `ai-training-quantity-validation-degradation-alignment-2026-07-06`
- Branch: `codex/ai-training-quantity-validation-degradation-alignment-2026-07-06`
- Parent phase: `ai-generation-recontract-local-repair-goal-2026-07-06`
- Requirement overlay: `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- Current `project-state.yaml` and `task-queue.yaml` top-level active task state

## Objective

Align the local AI出题 / AI组卷 quantity and user-facing degradation contract:

- AI出题 default `3`, maximum `10`.
- AI组卷 default `30`, maximum `80`.
- Request entrypoints reject out-of-range quantity before persistence or runtime bridge work.
- Admin UI preserves visible quantity controls and does not allow persisted or manually entered values to bypass the contract.
- AI组卷 insufficiency and automatic supplement text remains Chinese product wording and does not expose technical enum names.

## TDD Plan

1. Add RED tests for shared task spec defaults and max-count normalization.
2. Add RED tests for personal and admin route request rejection when quantity exceeds the role-independent contract.
3. Add RED tests for admin UI persisted/manual count normalization.
4. Implement minimal shared helpers and call them from request validators/routes and admin UI.
5. Re-run focused unit tests, then local gates.

## Boundaries

- No dependency, package, or lockfile change.
- No schema, migration, seed, or destructive DB operation.
- No `.env*`, secret, credential, session, cookie, token, Provider payload, raw prompt, raw AI output, raw DB row, internal id, full question, full paper, material, resource, chunk, screenshot, trace, or DOM evidence.
- No Provider execution, browser runtime, dev server, staging, production, deploy, release readiness, production usability, or Cost Calibration claim.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts`
- `git diff --check`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-06-ai-training-quantity-validation-degradation-alignment.md docs/05-execution-logs/evidence/2026-07-06-ai-training-quantity-validation-degradation-alignment.md docs/05-execution-logs/audits-reviews/2026-07-06-ai-training-quantity-validation-degradation-alignment.md src/server/contracts/ai-generation-task-spec-contract.ts src/server/services/admin-ai-generation-local-contract-route.ts src/server/services/personal-ai-generation-request-route.ts src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-training-quantity-validation-degradation-alignment-2026-07-06`
