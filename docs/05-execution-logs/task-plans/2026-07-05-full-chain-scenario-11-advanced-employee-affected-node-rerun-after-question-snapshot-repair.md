# 2026-07-05 Full-chain Scenario 11 Advanced Employee Affected-node Rerun After Question Snapshot Repair Plan

## Task

- Task id: `full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-snapshot-repair-2026-07-05`
- Branch: `codex/full-chain-scenario-11-affected-node-rerun-after-question-snapshot-repair-2026-07-05`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Selector label: `fc_org_advanced_employee`
- Role label: `org_advanced_employee`
- Scope label: `marketing:3`
- Restart node: S11 browser login, enterprise training answerability, training answer product-UI write, and AI training no-submit boundary after paper-source question snapshot repair.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/traceability/2026-07-02-organization-training-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-training-baseline-preflight.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-training-baseline-preflight.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-scenario-11-enterprise-training-question-snapshot-source-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-scenario-11-enterprise-training-question-snapshot-source-repair.md`
- `src/features/student/organization-training/StudentOrganizationTrainingPage.tsx`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/repositories/organization-training-repository.ts`
- `tests/unit/organization-training-employee-entry-surface.test.ts`

## Execution Order

1. Run selector/DB target/forbidden-repeat preflight with aggregate-only DB reads.
2. Start local app with process-scoped isolated DB target.
3. Run minimum browser login readiness smoke before private credential input.
4. Login as advanced employee and go only to the affected S11 enterprise-training node.
5. Verify `marketing:3` visible training returns answerable question snapshots.
6. Save/submit one enterprise-training answer through product UI if the surface is answerable.
7. Verify AI training surface availability without submit or Provider call.
8. Run selector-scoped aggregate DB verification.
9. Stop runtime and execute closeout gates.

## Forbidden Repeats

- Do not repeat employee import.
- Do not repeat S10 standard employee learning data.
- Do not rerun S1-S10 runtime.
- Do not repeat old authorization flow.
- Do not create duplicate training baseline or duplicate provisioning.

## Evidence Rules

Evidence may record task id, branch, route/surface label, selector label, role label, scope label, aggregate counts, command names, pass/fail/block, and redacted summary only.

Do not record credentials, passwords, phones, emails, connection strings, tokens, sessions, cookies, localStorage, Authorization headers, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payloads, raw prompts, raw AI I/O, full material/question/paper content, plaintext card values, or private fixture contents.

## Stop Rules

Stop and split if selector/account/auth/content/training baseline/DB target is missing, if question snapshots are still unavailable after repair, if duplicate product writes would be required, if Provider/staging/prod/Cost/schema/migration/seed/dependency/source repair is needed, or if redaction risk appears.

## Validation Commands

- selector-scoped aggregate DB preflight and post-runtime verification
- browser login readiness smoke
- local affected-node browser runtime observation
- `npm.cmd run test:unit -- src/server/repositories/organization-training-repository.test.ts tests/unit/organization-training-employee-entry-surface.test.ts`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-snapshot-repair.md docs/05-execution-logs/evidence/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-snapshot-repair.md docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-snapshot-repair.md`
- `git diff --check`
- blocked path diff
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-snapshot-repair-2026-07-05`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-snapshot-repair-2026-07-05 -SkipRemoteAheadCheck`
