# Task Plan: organization-admin-workspace-runtime-rerun-scope-approval-2026-06-24

## Summary

- Task id: `organization-admin-workspace-runtime-rerun-scope-approval-2026-06-24`.
- Branch: `codex/org-admin-rerun-scope-approval-20260625`.
- Task kind: `runtime_scope_approval_package`.
- Execution profile: `docs_runtime_scope_approval_no_runtime`.
- Product closure contribution: none; mechanism queue/status convergence only.
- Goal: materialize the missing queue entry for the organization admin workspace runtime rerun scope approval and prepare
  a redacted local runtime scope package for a later independently approved task.
- Runtime/browser execution: blocked by this task.
- Final MVP Pass claim: blocked by this task.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`.
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`.
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`.
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`.
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`.
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`.
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/01-user-auth.md`.
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/stories/epic-06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`.
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.

## Requirement Decision Map

- `2026-06-24-role-separated-mvp-requirement-alignment.md` is the active role-separated repair decision for the
  organization admin rows.
- `role-experience-fulfillment-matrix.md` keeps the runtime gate blocked until fresh redacted runtime observation proves
  the relevant role rows.
- `edition-aware-authorization-requirements.md` and ADR-007 require `effectiveEdition` to be service-computed and forbid
  UI visibility as the authorization boundary.
- `advanced-edition/modules/04-organization-training.md` requires `org_standard_admin` to have no enterprise training
  access and `org_advanced_admin` to manage enterprise training inside organization scope.
- `advanced-edition/modules/08-organization-ai-generation.md` requires `org_standard_admin` to have no organization AI
  generation access and `org_advanced_admin` to discover `AI出题` and `AI组卷`.

## Requirement Mapping

### Requirement Mapping Result

- Result target: `pass_organization_admin_workspace_runtime_rerun_scope_package_materialized_no_runtime_no_final_pass`.
- This task maps only the approval and queue state needed before a later runtime rerun.
- It does not change source, tests, schemas, migrations, env files, dependency files, Provider configuration, accounts,
  seed data, or browser runtime state.

### Role Mapping Result

| Role row             | Future runtime target                                                                                | This task outcome                             |
| -------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `org_standard_admin` | Organization workspace only; employee/auth status; no `企业训练`, `统计摘要`, `AI出题`, or `AI组卷`. | Scope package prepared; runtime not executed. |
| `org_advanced_admin` | Organization workspace; employee/auth status; `企业训练`, `统计摘要`, `AI出题`, and `AI组卷`.        | Scope package prepared; runtime not executed. |
| `ops_admin`          | Remains outside this focused rerun except as an explicit denied-surface boundary if later approved.  | No runtime or source assertion changed.       |
| `content_admin`      | Remains outside this focused rerun except as an explicit denied-surface boundary if later approved.  | No runtime or source assertion changed.       |

### Acceptance Mapping Result

- Queue materialization: expected pass after `task-queue.yaml` receives the full closed task entry.
- Approval package: expected pass after the package records scope, roles, redaction, blocked gates, and next approval
  requirement.
- Runtime acceptance: not approved or executed by this task.
- Chinese visible UI acceptance: captured as a mandatory item for the later runtime rerun; not executed by this task.
- Final MVP Pass: not claimed.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-design-first-scope.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-repair.md`.
- `docs/05-execution-logs/task-plans/2026-06-24-role-separated-post-repair-runtime-rerun-scope-approval.md`.
- `docs/05-execution-logs/acceptance/2026-06-24-role-separated-post-repair-runtime-rerun-scope-approval-package.md`.

## Conflict Check

- No conflict found between requirement SSOT and the requested docs/state-only materialization.
- The previous repair evidence proves static/unit closure only; it does not prove browser/runtime Pass.
- The later runtime rerun must receive fresh explicit approval for browser/runtime observation and owner-entered
  credentials if credentials are required.
- Runtime evidence must include Chinese UI checks because the current acceptance convention requires visible UI language
  validation.

## Allowed File Scope

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-runtime-rerun-scope-approval-package.md`.
- `docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-rerun-scope-approval.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun-scope-approval.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun-scope-approval.md`.

## Blocked Scope

- Product source, tests, e2e specs, scripts, schema, migrations, seed data, database reads/writes, dependency files,
  lockfiles, `.env*`, Provider/model calls, Provider configuration, Cost Calibration, staging/prod/deploy, payment,
  external services, PR creation/update, force push, browser/runtime execution, credential handling, account actions, and
  final MVP Pass.

## Documentation Approach

1. Add the missing task queue entry as a closed docs/runtime-scope package task.
2. Update `project-state.yaml` currentTask and org-admin scope package recovery pointer.
3. Add the approval package that a later runtime task can reference.
4. Add evidence and audit with mapping results, validation results, and blocked remainder.

## Validation Commands

1. `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-runtime-rerun-scope-approval-package.md docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-rerun-scope-approval.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun-scope-approval.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun-scope-approval.md`.
2. `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-runtime-rerun-scope-approval-package.md docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-rerun-scope-approval.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun-scope-approval.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun-scope-approval.md`.
3. `git diff --check`.
4. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`.
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-workspace-runtime-rerun-scope-approval-2026-06-24`.
6. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-workspace-runtime-rerun-scope-approval-2026-06-24 -SkipRemoteAheadCheck`.

## Stop Conditions

- Stop if validation reports files outside the allowlist.
- Stop if a runtime/browser, credential, Provider, env, database, dependency, schema, migration, staging/prod, payment, or
  external-service action becomes necessary.
- Stop if evidence would need to contain secrets, credentials, local storage/session data, screenshots, raw prompts, raw
  generated AI content, raw employee answers, full paper content, or plaintext `redeem_code`.
