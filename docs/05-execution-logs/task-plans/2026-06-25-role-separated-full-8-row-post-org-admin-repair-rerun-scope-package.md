# Task Plan: role-separated-full-8-row-post-org-admin-repair-rerun-scope-package-2026-06-25

## Task Boundary

- Task id: `role-separated-full-8-row-post-org-admin-repair-rerun-scope-package-2026-06-25`.
- Branch: `codex/full-8-row-rerun-scope-package-20260625`.
- Task kind: `scope_approval_package`.
- Approval source: current user serial instruction on 2026-06-25 for task 2.
- Scope: prepare the full eight-role real-browser rerun scope approval package only.
- Explicitly not approved: actual browser execution, credential files, DB, seed, schema, source, tests, env, Provider, Cost Calibration, staging/prod, payment, external services, or final MVP Pass.

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

- The 2026-06-24 role-separated MVP alignment remains the requirement SSOT.
- The 2026-06-25 gap refresh is evidence-only predecessor input for blocker prioritization.
- The future rerun package must not expand acceptance beyond the R1-R15 aligned requirements.

## Requirement Mapping

- R1-R4: backend workspace and organization admin standard/advanced boundary.
- R5-R6: learner and employee AI/training entry boundaries.
- R7-R8: content and ops backend separation plus content AI draft/review entries.
- R9-R15: ops `redeem_code`, `org_auth`, upgrade, multi-scope, and employee import surfaces are observable only without mutation in this package.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-25-role-separated-post-org-admin-repair-gap-refresh-no-final-pass.md`.
- `docs/05-execution-logs/evidence/2026-06-25-organization-admin-private-account-post-repair-browser-rerun.md`.

## Conflict Check

No requirement conflict is resolved in this task. The package explicitly preserves the standard organization admin denial boundary for training and organization AI even though the 2026-06-25 private account route rerun sampled those routes as reachable.

## Execution Plan

1. Create `ROLE_SEPARATED_FULL_8_ROW_POST_ORG_ADMIN_REPAIR_RERUN_SCOPE_2026_06_25`.
2. Define owner manual credential entry and redaction policy.
3. Define the eight-row route/workflow matrix.
4. Define allowed evidence fields and blocked scopes.
5. Register state/queue/evidence/audit.
6. Run scoped formatting, diff, pre-commit hardening, and pre-push readiness.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/acceptance/2026-06-25-role-separated-full-8-row-post-org-admin-repair-rerun-scope-package.md`.
- `docs/05-execution-logs/task-plans/2026-06-25-role-separated-full-8-row-post-org-admin-repair-rerun-scope-package.md`.
- `docs/05-execution-logs/evidence/2026-06-25-role-separated-full-8-row-post-org-admin-repair-rerun-scope-package.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-25-role-separated-full-8-row-post-org-admin-repair-rerun-scope-package.md`.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/acceptance/2026-06-25-role-separated-full-8-row-post-org-admin-repair-rerun-scope-package.md docs/05-execution-logs/task-plans/2026-06-25-role-separated-full-8-row-post-org-admin-repair-rerun-scope-package.md docs/05-execution-logs/evidence/2026-06-25-role-separated-full-8-row-post-org-admin-repair-rerun-scope-package.md docs/05-execution-logs/audits-reviews/2026-06-25-role-separated-full-8-row-post-org-admin-repair-rerun-scope-package.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/acceptance/2026-06-25-role-separated-full-8-row-post-org-admin-repair-rerun-scope-package.md docs/05-execution-logs/task-plans/2026-06-25-role-separated-full-8-row-post-org-admin-repair-rerun-scope-package.md docs/05-execution-logs/evidence/2026-06-25-role-separated-full-8-row-post-org-admin-repair-rerun-scope-package.md docs/05-execution-logs/audits-reviews/2026-06-25-role-separated-full-8-row-post-org-admin-repair-rerun-scope-package.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId role-separated-full-8-row-post-org-admin-repair-rerun-scope-package-2026-06-25`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId role-separated-full-8-row-post-org-admin-repair-rerun-scope-package-2026-06-25 -SkipRemoteAheadCheck`

## Stop Conditions

Stop if package preparation requires actual browser execution, credential/account file reads, DB/seed/schema/source/test/env/package changes, Provider, Cost Calibration, staging/prod, payment, external service, PR, force push, or final Pass claims.
