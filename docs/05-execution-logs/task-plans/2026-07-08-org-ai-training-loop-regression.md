# 2026-07-08 Organization AI Training Loop Regression Plan

## Scope

- Task id: `org-ai-training-loop-regression-2026-07-08`
- Branch: `codex/org-ai-training-loop-regression`
- This phase is regression and adversarial review only.
- No business source change, no test source change unless a current regression is proven and split into a separate approved short branch.

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
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- Prior stage evidence:
  - `docs/05-execution-logs/evidence/2026-07-08-org-ai-generation-parameter-contract.md`
  - `docs/05-execution-logs/evidence/2026-07-08-org-ai-generation-rag-scope.md`
  - `docs/05-execution-logs/evidence/2026-07-08-org-ai-question-to-training-draft.md`
  - `docs/05-execution-logs/evidence/2026-07-08-org-ai-paper-to-training-draft.md`

## Related Code Read Surface

- `tests/unit/admin-ai-generation-entry-surface.test.ts`
- `tests/unit/organization-training-admin-entry-surface.test.ts`
- `tests/unit/admin-dashboard-layout-navigation.test.ts`
- `tests/unit/admin-workspace-role-guard-contract.test.ts`
- `src/server/services/admin-ai-generation-local-contract-route.test.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/services/organization-training-route.test.ts`
- `src/server/services/ai-paper-route-plan-select-wiring-service.test.ts`
- `src/server/services/ai-paper-route-source-resolution-service.test.ts`
- `src/server/services/ai-paper-route-assembly-service.test.ts`
- `src/server/services/ai-paper-plan-and-select-service.test.ts`
- `src/server/services/ai-paper-source-adapter-service.test.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`
- `src/server/services/personal-ai-generation-result-route.test.ts`
- `src/server/services/personal-ai-generation-learning-session-service.test.ts`

## Requirement Mapping Result

- `org_advanced_admin` AI出题 must materialize a training-question draft, support admin review/detail, publish through organization training, and remain outside formal platform content.
- `org_advanced_admin` AI组卷 must use the plan-and-select contract, materialize an organization-training paper draft, support admin detail, and remain outside formal platform content.
- `org_standard_admin` must remain denied, hidden, upgrade-guided, or unavailable for advanced AI and enterprise training.
- `org_advanced_employee` may see and answer published organization training, but must not see unpublished drafts or admin-only AI generation/task details.
- Evidence must stay redacted and must not include credentials, session/cookie/token/localStorage values, env values, DB URL, raw DB rows, internal numeric ids, Provider payloads, raw prompt, raw AI output, or full question/paper/material/chunk content.

## Validation Plan

1. Run targeted stage-1 parameter contract and admin UI regression tests.
2. Run targeted stage-2 RAG scope regression tests.
3. Run targeted stage-3 and stage-4 organization training draft materialization tests.
4. Run targeted AI组卷 plan/select adjacent tests.
5. Run role-boundary and employee learner regression tests.
6. Run `lint`, `typecheck`, `git diff --check`.
7. Run Module Run v2 pre-commit hardening and pre-push readiness.

## Boundary Guards

- Do not read `.env*`, secrets, session storage, cookies, localStorage, DB rows, or Provider payloads.
- Do not execute Provider-enabled tests or runtime Provider calls.
- Do not connect to DB, mutate DB, or run destructive commands.
- Do not change DB schema, migrations, seeds, fixtures, package files, or lockfiles.
- Do not run staging/prod/deploy/payment/Cost Calibration work.
- If a regression is found, stop and split the fix into a separate minimal approved branch.
