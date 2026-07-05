# 2026-07-05 Full-chain Scenario 11 Advanced Employee Affected-node Rerun After Question Count Boundary Repair Plan

## Task

- Task id: `full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-count-boundary-repair-2026-07-05`
- Branch: `codex/full-chain-scenario-11-affected-node-rerun-after-question-count-boundary-repair-2026-07-05`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Selector label: `fc_org_advanced_employee`
- Role label: `org_advanced_employee`
- Scope label: `marketing:3`
- Restart node: S11 selector/DB/content/training preflight, browser login readiness smoke, enterprise training answerability, one product-UI training answer, and AI training no-submit boundary after paper-source question count cap repair.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-snapshot-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-snapshot-repair.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-scenario-11-enterprise-training-question-snapshot-source-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-scenario-11-enterprise-training-question-snapshot-source-repair.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-scenario-11-paper-source-question-count-boundary-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-scenario-11-paper-source-question-count-boundary-repair.md`
- `src/features/student/organization-training/StudentOrganizationTrainingPage.tsx`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/repositories/organization-training-repository.ts`
- `tests/unit/organization-training-employee-entry-surface.test.ts`
- `src/server/repositories/organization-training-repository.test.ts`

## Execution Order

1. Run selector/DB target/forbidden-repeat/content/training preflight with selector-scoped aggregate-only DB reads.
2. Confirm no repeated employee import, S10 learning replay, S1-S10 runtime replay, old authorization flow, or duplicate training provisioning is needed.
3. Start local app only after preflight passes, using the isolated DB target.
4. Run minimum browser login readiness smoke before any private credential input.
5. Login as the advanced employee through the product login surface.
6. Navigate only to the affected S11 enterprise-training node.
7. Verify `marketing:3` visible training returns answerable question snapshots capped to published training question count.
8. Save draft and submit one enterprise-training answer through product UI if the surface is answerable.
9. Verify learner AI training entry availability without AI submit, Provider call, prompt payload, or raw AI I/O.
10. Run selector-scoped aggregate DB verification.
11. Stop runtime and execute closeout gates.

## Forbidden Repeats

- Do not repeat employee import.
- Do not repeat S10 standard employee learning data.
- Do not rerun S1-S10 runtime.
- Do not repeat old authorization flow.
- Do not create duplicate training baseline or duplicate provisioning.
- Do not retarget the training content to a different scope.

## Evidence Rules

Evidence may record task id, branch, route/surface label, selector label, role label, scope label, aggregate counts, command names, pass/fail/block, and redacted summary only.

Do not record credentials, passwords, phones, emails, connection strings, tokens, sessions, cookies, localStorage, Authorization headers, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payloads, raw prompts, raw AI I/O, full material/question/paper content, plaintext card values, private fixture contents, or raw employee answers.

## Stop Rules

Stop and split if selector/account/auth/content/training baseline/DB target is missing, if browser login readiness fails before private input, if answerable question snapshots remain unavailable or count-mismatched after repair, if duplicate product writes would be required, if Provider/staging/prod/Cost/schema/migration/seed/dependency/source repair is needed, if redaction risk appears, or if release readiness/final Pass/production usability would be implied.

## Validation Commands

- selector-scoped aggregate DB preflight and post-runtime verification
- browser login readiness smoke
- local affected-node browser runtime observation
- `npm.cmd run test:unit -- src/server/repositories/organization-training-repository.test.ts tests/unit/organization-training-employee-entry-surface.test.ts`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-count-boundary-repair.md docs/05-execution-logs/evidence/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-count-boundary-repair.md docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-count-boundary-repair.md`
- `git diff --check`
- blocked path diff
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-count-boundary-repair-2026-07-05`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-count-boundary-repair-2026-07-05 -SkipRemoteAheadCheck`
