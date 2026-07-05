# 2026-07-04 Full-Chain Scenario 9 Advanced Personal Pre-Provider Plan

## Scope

- Task id: `full-chain-scenario-9-advanced-personal-pre-provider-2026-07-04`
- Branch: `codex/full-chain-scenario-9-advanced-personal-pre-provider-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Learner selector label: `fc_personal_contact_user_registered`
- Upgrade card selector label: `fc_redeem_code_edition_upgrade`
- Role label: `personal_advanced_student`

This task starts Scenario 9 from the pre-runtime gate. It stops before browser runtime, private input use, DB access, and card redemption because source review shows the current student redeem runtime cannot yet prove the required `edition_upgrade` contract.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-provider-cost-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- Scenario 7 and Scenario 8 evidence/audit files.
- `src/features/student/profile/StudentProfileRedeemPage.tsx`
- `src/features/student/home/StudentHomePage.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/app/(student)/redeem-code/page.tsx`
- `src/app/(student)/ai-generation/page.tsx`
- `src/app/api/v1/redeem-codes/redeem/route.ts`
- `src/app/api/v1/personal-ai-generation-requests/route.ts`
- `src/server/services/student-authorization-redeem-runtime.ts`
- `src/server/repositories/student-authorization-redeem-runtime-repository.ts`
- `src/server/services/effective-authorization-service.ts`
- `src/server/repositories/redeem-code-authorization-repository.ts`
- `src/db/schema/auth.ts`
- `tests/unit/phase-8-student-authorization-redeem-runtime.test.ts`
- `tests/unit/student-personal-ai-generation-ui.test.ts`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`

## Contract Check

Required Scenario 9 behavior:

- `edition_upgrade` requires an active matching standard `personal_auth`.
- It creates `auth_upgrade` for the matching source authorization.
- It does not create a second `personal_auth`.
- It does not consume an upgrade card if the target is already effectively advanced.
- Real AI generation remains blocked until separate Provider/Cost approval.

Observed pre-runtime source contract:

- The student redeem repository updates an unused card and inserts `personal_auth`.
- The runtime path does not read `redeem_code_type` from the card row.
- The runtime path does not branch `personal_advanced_activation` versus `edition_upgrade`.
- The runtime path does not create `auth_upgrade`.
- The focused Phase 8 redeem runtime test covers standard redemption and effective authorization derivation, but does not protect upgrade redemption semantics.

## Stop Decision

Stop before browser/e2e and before any product DB write. Running Scenario 9 now would risk consuming the upgrade card and creating a wrong authorization shape.

## Next Task

Split `full-chain-scenario-9-edition-upgrade-redeem-runtime-repair-2026-07-04` as the minimal source/test/doc repair. The repair must add upgrade redemption semantics without weakening authorization, changing schema, expanding fixtures, calling Provider, or exposing private values.

## Validation

- `rg -n "redeem_code_type|insert\\(personalAuth\\)|authUpgrade|edition_upgrade" src/server/repositories/student-authorization-redeem-runtime-repository.ts src/db/schema/auth.ts tests/unit/phase-8-student-authorization-redeem-runtime.test.ts`
- `npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-9-advanced-personal-pre-provider.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-9-advanced-personal-pre-provider.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-9-advanced-personal-pre-provider.md`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-9-advanced-personal-pre-provider.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-9-advanced-personal-pre-provider.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-9-advanced-personal-pre-provider.md`
- `git diff --check`
- `git diff --name-only -- package.json package-lock.yaml package-lock.json pnpm-lock.yaml pnpm-workspace.yaml src tests e2e src/db/schema drizzle migrations seed scripts compose.yaml playwright-report test-results .next .runtime .env*`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-9-advanced-personal-pre-provider-2026-07-04`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-chain-scenario-9-advanced-personal-pre-provider-2026-07-04 -SkipRemoteAheadCheck`
