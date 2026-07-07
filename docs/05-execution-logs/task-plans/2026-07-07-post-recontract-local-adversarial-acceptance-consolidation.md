# Post-Recontract Local Adversarial Acceptance Consolidation Plan

## Task

- Task id: `post-recontract-local-adversarial-acceptance-consolidation-2026-07-07`
- Branch: `codex/post-recontract-local-acceptance-consolidation-2026-07-07`
- Scope: docs/state/evidence/audit consolidation only.
- Trigger: user requested a post-recontract local adversarial acceptance consolidation based on completed DB-backed replay, Provider-enabled bounded smoke, browser role matrix, and current source/unit tests.

## Read Gate

Read before consolidation:

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- Latest post-recontract source/unit, DB-backed replay, Provider-disabled replay, Provider-enabled bounded smoke, browser role-matrix, and final rollup evidence.

## Consolidation Method

Use evidence before conclusion:

1. Confirm git workspace state and current branch.
2. Re-run current source gates: lint, typecheck, aggregate AI generation source/unit suite, and `git diff --check`.
3. Run mechanism diagnostics: `Get-TikuNextAction`, `Get-TikuProjectStatus`, and `Get-ModuleRunV2QueueSlimmingSelfRepair`.
4. Review existing DB-backed replay evidence without rerunning DB mutation or fixture materialization.
5. Review existing browser role matrix evidence without taking screenshots, DOM dumps, traces, or submitting generation forms.
6. Review existing Provider-disabled and Provider-enabled evidence without executing new Provider calls.
7. Record final conclusion buckets with explicit anti-extrapolation notes.

## Boundaries

- No source or test code change.
- No dependency, package, or lockfile change.
- No schema, migration, seed, or destructive DB operation.
- No new DB-backed replay, browser replay, Provider call, Provider payload inspection, raw prompt inspection, or raw AI output inspection.
- No env/secret value readout or mutation.
- No staging/prod/deploy.
- No Cost Calibration.
- No release readiness, production usability, or final production pass claim.

## Validation

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit -- src/server/services/ai-paper-plan-and-select-service.test.ts src/server/services/ai-paper-source-adapter-service.test.ts src/server/services/ai-paper-route-assembly-service.test.ts src/server/services/ai-paper-route-source-resolution-service.test.ts src/server/services/ai-paper-route-plan-select-wiring-service.test.ts src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/route-integrated-provider-instruction-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-learning-session-paper-source-resolver.test.ts src/server/repositories/organization-training-repository.test.ts src/server/services/personal-ai-generation-learning-session-route.test.ts src/server/services/personal-ai-generation-learning-session-service.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/student-personal-ai-generation-ui.test.ts tests/unit/student-home-ui.test.ts tests/unit/admin-workspace-role-guard-contract.test.ts`
- `git diff --check`
- scoped Prettier check for changed docs/state files
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId post-recontract-local-adversarial-acceptance-consolidation-2026-07-07`
