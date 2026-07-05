# 2026-07-05 Full-Chain Scenario 11 Advanced Employee Affected-Node Rerun After Training Baseline Preflight Plan

Task id: `full-chain-scenario-11-advanced-employee-affected-node-rerun-after-training-baseline-preflight-2026-07-05`

Status: blocked closeout

## Scope

Rerun S11 only from the affected browser login / advanced employee learning / enterprise-training boundary after the
read-only reconciliation proved the `marketing:3` enterprise training baseline exists. Do not repeat employee import,
S10 standard employee learning data, S1-S10 runtime, or old authorization flows.

## Read Gate

Read before execution:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-organization-training-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-training-baseline-reconciliation.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-training-baseline-reconciliation.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-11-advanced-employee-learning-surface-gap-repair-or-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-11-advanced-employee-learning-surface-gap-repair-or-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-learning-surface-route-selection-classification.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-learning-surface-route-selection-classification.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-scenario-11-training-baseline-provisioning-preflight-reconciliation.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-scenario-11-training-baseline-provisioning-preflight-reconciliation.md`
- `src/app/(student)/home/page.tsx`
- `src/app/(student)/practice/page.tsx`
- `src/app/(student)/organization-training/page.tsx`
- `src/app/(student)/ai-generation/page.tsx`
- `src/features/student/home/StudentHomePage.tsx`
- `src/features/student/practice/StudentPracticePage.tsx`
- `src/features/student/organization-training/StudentOrganizationTrainingPage.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/repositories/organization-training-repository.ts`
- `tests/unit/ui-input-contract.test.ts`
- `tests/unit/student-practice-ui.test.ts`
- `tests/unit/organization-training-employee-entry-surface.test.ts`
- `tests/unit/student-personal-ai-generation-ui.test.ts`

## Execution Order

1. Selector, account, authorization, content baseline, training baseline, DB target, and forbidden-repeat preflight.
2. Browser login readiness smoke: wait for hydrated/interactable login before private input.
3. Log in as `fc_org_advanced_employee` using private credentials in memory only.
4. Select or verify `marketing:3` before learning assertions.
5. Enter standard learning through the product-generated practice link, without Provider-triggering actions.
6. Enter `企业训练`, save/submit only if product runtime permits and evidence can remain redacted.
7. Visit `AI训练` and verify advanced employee availability without submitting AI generation.
8. Run selector-scoped aggregate DB verification.
9. Cleanup runtime, write evidence/audit, and close out through Module Run v2 gates.

## Runtime Stop Result

The task stopped at the enterprise-training boundary after browser login and `marketing:3` practice succeeded. The
employee visible-list runtime returned one visible `marketing:3` training with question count `4`, but returned zero
answerable question snapshots. This is not duplicate provisioning: the isolated DB still has the published training and
source-context question count. It requires a separate source/test repair task before S11 can resume from the
enterprise-training boundary and AI no-submit node.

## Evidence Rules

Allowed evidence: task id, branch, route/surface labels, selector label, role label, scope label, aggregate counts,
command names, pass/fail/block, and redacted summaries.

Forbidden evidence: credentials, phone, email, connection strings, tokens, cookies, sessions, localStorage,
Authorization headers, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payloads, raw prompts, raw AI
I/O, full material/question/paper/training content, raw employee answers, and plaintext card values.

## Stop Rules

Stop and split repair/provisioning if any required selector, account, authorization, content baseline, training baseline,
or DB target is missing; if login hydration/readiness fails; if scope selection cannot establish `marketing:3`; if a
standard role gains advanced-only access; if evidence redaction is at risk; if product source/schema/seed/dependency
repair is needed; or if Provider, staging, prod, Cost Calibration, destructive DB, release readiness, final Pass, or
production usability is required.

## Validation Commands

- redacted selector-scoped aggregate DB preflight and post-runtime verification
- browser login readiness smoke against the same local runtime target
- local S11 affected-node browser runtime observation
- `npm.cmd run test:unit -- tests/unit/ui-input-contract.test.ts tests/unit/student-practice-ui.test.ts tests/unit/organization-training-employee-entry-surface.test.ts tests/unit/student-personal-ai-generation-ui.test.ts`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-training-baseline-preflight.md docs/05-execution-logs/evidence/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-training-baseline-preflight.md docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-training-baseline-preflight.md`
- `git diff --check`
- `git diff --name-only -- AGENTS.md .env .env.local .env.development .env.production package.json package-lock.yaml package-lock.json pnpm-lock.yaml pnpm-workspace.yaml src tests e2e src/db/schema drizzle migrations seed scripts compose.yaml playwright-report test-results .next .runtime`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-11-advanced-employee-affected-node-rerun-after-training-baseline-preflight-2026-07-05`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-chain-scenario-11-advanced-employee-affected-node-rerun-after-training-baseline-preflight-2026-07-05 -SkipRemoteAheadCheck`

## Non-Claims

This task does not claim Scenario 12, Provider readiness, Cost Calibration, staging/prod readiness, release readiness,
final Pass, production usability, or complete full-chain acceptance.
