# Task Plan: role-separated-post-org-admin-repair-gap-refresh-no-final-pass-2026-06-25

## Task Boundary

- Task id: `role-separated-post-org-admin-repair-gap-refresh-no-final-pass-2026-06-25`.
- Branch: `codex/role-separated-gap-refresh-20260625`.
- Task kind: `docs_state_gap_refresh`.
- Approval source: current user serial instruction on 2026-06-25 for task 1.
- Scope: docs/state-only gap refresh based on the 2026-06-24 eight-role runtime matrix and the 2026-06-25 organization admin post-repair evidence.
- Explicit non-claim: this task does not declare Standard MVP or Advanced MVP final Pass.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`.

## Requirement Decision Map

- The 2026-06-24 role-separated MVP alignment remains the requirement SSOT for R1-R15.
- The role experience fulfillment matrix remains the role-row acceptance summary owner.
- ADR-002 keeps authorization and workspace behavior in service-backed runtime boundaries rather than UI visibility alone.
- ADR-007 keeps `effectiveEdition` derived from authorization source state; this task does not change that model.

## Requirement Mapping

- `org_standard_admin`: maps to R1, R2, and R3. The post-repair evidence can close wrong landing, missing organization binding, sampled ops/content denial, and logout sub-blockers for the private account, but it does not close the standard-vs-advanced organization route boundary.
- `org_advanced_admin`: maps to R1, R2, and R4. The post-repair evidence can close wrong landing, organization portal/training/AI route no-access, sampled ops/content denial, and logout sub-blockers for the private account, but it does not close workflow-level or UI-language acceptance.
- Remaining learner/employee rows map to R5 and R6.
- Remaining content/ops rows map to R7, R8, R9-R15, and the backend UI/UX design-first gate.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-25-organization-admin-runtime-effective-role-source-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-25-organization-admin-private-account-state-reconciliation.md`.
- `docs/05-execution-logs/evidence/2026-06-25-default-tiku-db-organization-admin-schema-seed-alignment.md`.
- `docs/05-execution-logs/evidence/2026-06-25-organization-admin-private-account-post-repair-browser-rerun.md`.

## Conflict Check

There is no SSOT conflict. The 2026-06-25 organization admin evidence narrows and updates observed runtime facts for two private organization admin accounts, but it does not supersede the eight-role acceptance requirement or promote any row to final Pass. The standard organization admin route matrix must be interpreted against the R3 standard boundary because allowing all organization routes is not the same as proving standard-only restrictions.

## Execution Plan

1. Register the task in state and queue with docs/state-only allowed files.
2. Recompute role-row blocker state from the 2026-06-24 matrix plus 2026-06-25 org admin evidence.
3. Record closed sub-blockers and remaining blockers for `org_standard_admin` and `org_advanced_admin`.
4. Record the next minimal source repair candidate without starting implementation.
5. Run scoped formatting, diff, pre-commit hardening, and pre-push readiness.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-25-role-separated-post-org-admin-repair-gap-refresh-no-final-pass.md`.
- `docs/05-execution-logs/evidence/2026-06-25-role-separated-post-org-admin-repair-gap-refresh-no-final-pass.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-25-role-separated-post-org-admin-repair-gap-refresh-no-final-pass.md`.

## Blocked Scope

No browser, DB, seed, schema, source, test, environment, credential, Provider, Cost Calibration, staging/prod, payment, external service, PR, force push, or final acceptance Pass work is approved.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-role-separated-post-org-admin-repair-gap-refresh-no-final-pass.md docs/05-execution-logs/evidence/2026-06-25-role-separated-post-org-admin-repair-gap-refresh-no-final-pass.md docs/05-execution-logs/audits-reviews/2026-06-25-role-separated-post-org-admin-repair-gap-refresh-no-final-pass.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-role-separated-post-org-admin-repair-gap-refresh-no-final-pass.md docs/05-execution-logs/evidence/2026-06-25-role-separated-post-org-admin-repair-gap-refresh-no-final-pass.md docs/05-execution-logs/audits-reviews/2026-06-25-role-separated-post-org-admin-repair-gap-refresh-no-final-pass.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId role-separated-post-org-admin-repair-gap-refresh-no-final-pass-2026-06-25`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId role-separated-post-org-admin-repair-gap-refresh-no-final-pass-2026-06-25 -SkipRemoteAheadCheck`

## Stop Conditions

Stop if the refresh requires runtime/browser evidence, DB inspection or mutation, source/test changes, dependency or lockfile changes, `.env*`, Provider or Cost work, staging/prod/cloud/deploy, payment, external service, credentials, or final Pass wording.
