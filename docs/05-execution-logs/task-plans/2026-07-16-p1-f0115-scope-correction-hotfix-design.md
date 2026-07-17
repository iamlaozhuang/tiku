# P1 F-0115 Scope Correction Hotfix Design

Date: 2026-07-16

Design approval source: the user's explicit 2026-07-16 approval of the one-time F-0115 scope-correction governance hotfix and execution option 1.

## Problem

F-0115 JIT review proved that the already-atomic single employee transaction does not close response-loss and generated-secret recovery for batch import. The approved product design therefore needs a persistent `employee_import_command` aggregate, Drizzle-generated migration source, canonical recovery routes, and focused tests. The active task was intentionally frozen before that JIT conclusion: its queue block forbids `src/db/schema/**` and `drizzle/**`, omits the approved product files, and says to stop if persistence is required.

The P1 guard correctly rejects changing those controls after the task entered `in_progress`, and it correctly rejects combining self-expansion with product implementation. The correction must therefore be a separate, base-pinned governance commit. It must not weaken the standard rule that every other `in_progress` SHA mismatch hard-blocks.

## Considered Designs

### Selected: exact task-block correction with a one-time transition bridge

P1 and Module pre-commit independently recognize the same twelve-file hotfix against base `6bde2f2aec3d71fa0ce138b26f64243861cace6f` on branch `codex/p1-f0115-scope-correction-hotfix`. The queue mutation is accepted only when deterministic anchor/replacement operations yield the complete candidate queue and only the active F-0115 task block changes. P1 pre-push emits `transition_only` only for the resulting one-parent governance commit. Module pre-push accepts an ancestor checkpoint only when that exact mode and ancestry chain are independently proven.

### Rejected: combine queue correction with product implementation

That would allow an `in_progress` task to authorize its own implementation range and would defeat the scope-freeze invariant.

### Rejected: generic schema approval or generic ancestor allowance

A reusable schema exception would outlive the approved task. A generic ancestor rule would turn all steady-task SHA drift into an implicit bypass. Both exceed the approval.

## Exact Hotfix File Set

1. `docs/04-agent-system/state/task-queue.yaml`
2. `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`
3. `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
4. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
5. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`
6. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
7. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
8. `docs/05-execution-logs/acceptance/2026-07-16-p1-f0115-scope-correction-hotfix-authorization.md`
9. `docs/05-execution-logs/task-plans/2026-07-16-p1-f0115-scope-correction-hotfix-design.md`
10. `docs/05-execution-logs/task-plans/2026-07-16-p1-f0115-scope-correction-hotfix.md`
11. `docs/05-execution-logs/evidence/2026-07-16-p1-f0115-scope-correction-hotfix.md`
12. `docs/05-execution-logs/audits-reviews/2026-07-16-p1-f0115-scope-correction-hotfix.md`

No product, schema, migration, dependency, project-state, hook, or F-0115 product evidence/specification file belongs in this governance commit.

## Exact Queue Correction

Only the task block whose id is `p1-remediation-rc-02-employee-creation-atomicity-2026-07-16` may change. The transformation is valid only if every old anchor occurs exactly once in that block, every replacement is applied exactly once, and the complete candidate queue equals the computed result byte-for-byte after LF normalization.

### Scalar changes

- Add `freshApprovalSource: docs/05-execution-logs/acceptance/2026-07-16-p1-f0115-scope-correction-hotfix-authorization.md` immediately after `authorizationSource`.
- Replace `rollbackOrStopCondition` with `stop_if_generated_migration_source_would_be_executed_or_if_dependency_database_provider_runtime_p2_pr_force_push_deploy_or_other_finding_repair_is_required`.
- Replace `schemaMigration: blocked_without_fresh_approval` with `schemaMigration: approved_source_generation_only_no_execution`.
- Preserve `databaseMutation`, dependency, Provider, runtime/browser, P2, deployment, force-push, PR, and cost calibration blocks.

### Focused gates

Replace the current focused gate list with exactly:

```yaml
- persistent_employee_import_command_idempotency_and_request_hmac
- auth_user_auth_account_user_employee_current_org_auth_quota_atomicity
- row_savepoint_rolls_back_all_identity_side_effects_before_rejection
- unknown_result_remains_recoverable_and_is_never_reclassified_as_rejected
- generated_credential_placeholder_rotate_revision_and_confirm_distribution
- login_and_issue_share_advisory_lock_with_deterministic_multi_lock_order
- canonical_and_legacy_routes_are_no_store_and_redacted
- operations_or_super_admin_write_and_actor_visibility_boundaries
- drizzle_generated_migration_source_only_without_execution
- focused_service_repository_route_ui_and_static_regression
- full_static_regression
- two_round_adversarial_review
```

### Product allowlist

Replace `allowedFiles` with exactly these entries:

```yaml
- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml
- docs/05-execution-logs/task-plans/2026-07-16-p1-remediation-rc-02-employee-creation-atomicity.md
- docs/05-execution-logs/evidence/2026-07-16-p1-remediation-rc-02-employee-creation-atomicity.md
- docs/05-execution-logs/audits-reviews/2026-07-16-p1-remediation-rc-02-employee-creation-atomicity.md
- docs/superpowers/specs/2026-07-16-employee-import-command-recovery-design.md
- docs/superpowers/plans/2026-07-16-employee-import-command-recovery.md
- src/db/schema/employee-import.ts
- src/db/schema/employee-import.test.ts
- src/db/schema/index.ts
- drizzle/*_p1_rc_02_employee_import_command_recovery.sql
- drizzle/meta/*_snapshot.json
- drizzle/meta/_journal.json
- src/server/contracts/employee-import-command-contract.ts
- src/server/validators/employee-import-command.ts
- src/server/validators/employee-import-command.test.ts
- src/server/services/employee-import-command-crypto.ts
- src/server/services/employee-import-command-crypto.test.ts
- src/server/repositories/employee-import-command-repository.ts
- src/server/repositories/postgres-employee-import-command-repository.ts
- src/server/repositories/postgres-employee-import-command-repository.test.ts
- src/server/services/employee-import-command-service.ts
- src/server/services/employee-import-command-service.test.ts
- src/server/services/employee-import-command-route.ts
- src/server/services/employee-import-command-route.test.ts
- src/app/api/v1/employee-import-commands/route.ts
- src/app/api/v1/employee-import-commands/[publicId]/route.ts
- src/app/api/v1/employee-import-commands/[publicId]/issue-credentials/route.ts
- src/app/api/v1/employee-import-commands/[publicId]/confirm-distribution/route.ts
- src/server/repositories/admin-organization-org-auth-runtime-repository.ts
- src/server/repositories/admin-organization-org-auth-runtime-repository.test.ts
- src/server/services/admin-organization-org-auth-runtime.ts
- src/server/contracts/admin-user-org-auth-ops-contract.ts
- src/server/contracts/employee-account-contract.ts
- src/server/services/employee-account-service.ts
- src/server/services/employee-account-service.test.ts
- src/server/auth/local-session-runtime.test.ts
- src/features/admin/org-auth-redeem/employee-import-command-client.ts
- src/features/admin/org-auth-redeem/employee-import-command-client.test.ts
- src/features/admin/org-auth-redeem/useEmployeeImportCommand.ts
- src/features/admin/org-auth-redeem/useEmployeeImportCommand.test.tsx
- src/features/admin/org-auth-redeem/EmployeeImportCommandPanel/EmployeeImportCommandPanel.tsx
- src/features/admin/org-auth-redeem/EmployeeImportCommandPanel/EmployeeImportCommandPanel.test.tsx
- src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx
- tests/unit/p1-employee-import-command-atomicity.test.ts
- tests/unit/p1-employee-import-command-migration-source.test.ts
- tests/unit/p0-rc-02-organization-scope-quota-employee.test.ts
- tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts
- tests/unit/phase-20-ra-01-04-employee-import.test.ts
- tests/unit/admin-user-org-auth-ops-baseline.test.ts
- tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts
- tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts
- tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts
- tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts
```

Remove only `src/db/schema/**` and `drizzle/**` from `blockedFiles`; retain every other blocked pattern.

### Acceptance and validation

The four acceptance statements become:

1. The command idempotency key and normalized request HMAC must make same-key/same-request resume safe and same-key/different-request fail with 409 without storing raw request, phone, name, or password.
2. Each row must atomically commit identity, credential, employee membership, current `org_auth` quota, outcome, and audit; deterministic rejection must roll back identity through a savepoint, and unknown outcome must remain recoverable rather than being marked rejected.
3. Generated credentials must start with an unknowable placeholder and only explicit revision-bound issue may rotate and return plaintext once; GET never returns plaintext, active sessions block issue, and confirm closes distribution.
4. F-0115 closes statically only after focused/full regression and two reviews; Drizzle generation may create migration source but no migration/database execution occurs, RV-0018 remains pending, and dependency/Provider/browser/P2/PR/force/deploy remain blocked.

The first validation command becomes the exact focused Vitest file list from Task 8 of `docs/superpowers/plans/2026-07-16-employee-import-command-recovery.md`; the remaining unit, lint, typecheck, format, build, P1/P0/Module, and diff gates remain unchanged.

## Guard Architecture

### P1 Program

- Recognize the exact twelve-file set only in `pre_commit` and `pre_push`.
- Read mutable authorization, queue, evidence, and audit blobs from the index at pre-commit and from `HEAD` at pre-push.
- Independently prove base, branch, single-parent shape, active task/status, parent absence of the approval file, unsplit index/worktree, exact queue transformation, completed evidence, and two-pass audit.
- Exempt only the validated bridge from steady-task scope-change, scope-self-modification, product branch binding, and current product final-review checks.
- Emit `p1TransitionScopeMode: transition_only` only for the valid committed pre-push range.

### Module pre-commit and pre-push

- Pre-commit independently validates the same topology, approval, file set, queue transformation, and evidence/audit without trusting the P1 result.
- Pre-push accepts ancestor checkpoint semantics only after P1 emitted `transition_only`, with `in_progress`, `master == HEAD`, equal non-empty state master/origin checkpoints, state checkpoint ancestry into `origin/master`, and strict `origin/master` ancestry into `master`.
- Without that exact context, any `in_progress` SHA drift keeps its existing hard-block.

## One-Time Semantics and Adversarial Matrix

At pre-commit, `HEAD` must equal the fixed base and the authorization path must be absent from `HEAD`. At pre-push, the candidate commit must have one parent equal to the base, `origin/master` must still equal the base, and the authorization path must be absent from the parent. The bridge becomes unusable after materialization or base advancement.

Smokes must cover exact positive pre-commit/pre-push, transition-only handoff, wrong base/branch/task/status, invalid approval, missing/extra path, partial staging, altered queue scalar/list/order/content, product path, replay, state mismatch, origin movement, and ordinary steady-task SHA drift.

## Scope Boundary

This task changes governance only. It does not generate schema or migration source, execute a database, edit product code/tests/spec/evidence, add dependencies, call a Provider, run browser/runtime acceptance, implement P2, open a PR, force push, or deploy.
