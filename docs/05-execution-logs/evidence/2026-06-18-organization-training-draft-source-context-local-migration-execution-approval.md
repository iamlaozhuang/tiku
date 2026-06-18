# Organization Training Draft Source Context Local Migration Execution Approval Evidence

## Summary

- taskId: `organization-training-draft-source-context-local-migration-execution-approval`
- executionProfile: `local_migration_execution_plus_scoped_full_flow`
- branch: `codex/organization-training-local-experience-chain`
- result: `local_migration_applied_full_flow_blocked_by_admin_visible_scope_409080`
- `experience_closed`: not claimed
- Cost Calibration Gate remains blocked

The user selected option 1 in the current 2026-06-18 prompt, approving local-only migration execution. The reviewed
Drizzle migration was applied to the current local/dev loopback database. The original manual draft runtime `500001`
blocker is no longer the active failure. The scoped local full-flow now reaches the manual draft service guard and fails
with response code `409080`.

Root-cause evidence points to local seed authorization data: the seed admin exists but has no `admin_organization`
visible root, so the organization picked by the e2e fixture is not visible to that admin. The service therefore blocks
manual draft creation before draft/source-context UI flow can continue.

## Changed Files

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-18-organization-training-draft-source-context-local-migration-execution-approval.md`
- `docs/05-execution-logs/evidence/2026-06-18-organization-training-draft-source-context-local-migration-execution-approval.md`
- `docs/05-execution-logs/audits-reviews/2026-06-18-organization-training-draft-source-context-local-migration-execution-approval.md`
- `docs/05-execution-logs/evidence/2026-06-18-organization-training-admin-employee-local-full-flow-validation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-18-organization-training-admin-employee-local-full-flow-validation.md`

No product source, schema, migration SQL, package, lockfile, dependency, `.env*`, provider/model, staging/prod/cloud/
deploy/payment/external-service, PR, force-push, or Cost Calibration Gate file was modified by this task.

## Approval Boundary

- Approved by user option 1: run `npx.cmd drizzle-kit migrate` against the current local dev database after local-target
  validation.
- Approved follow-up: rerun `npm.cmd run test:e2e -- e2e/organization-training-local-full-flow.spec.ts`.
- Not approved: `drizzle-kit push`, destructive data operations, `.env*` modification, non-local database target,
  staging/prod/cloud/deploy/payment/external-service, provider/model calls, dependency changes, PR, force-push, or Cost
  Calibration Gate.

## Capability And Target Evidence

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId organization-training-draft-source-context-local-migration-execution-approval -Capability schemaMigration -Intent use_capability
```

Result: passed.

```text
localCapabilityDecision: capability_ready
adapterAction: schema_migration_plan_ready_no_execution
blockedAdapterAction: drizzle_push
blockedAdapterAction: destructive_data_operation
blockedAdapterAction: staging_prod_connection
```

Command: local `.env.local` `DATABASE_URL` target validation with no URL output.

Result: passed.

```text
OK_LOCAL_DATABASE_TARGET
databaseScheme: postgresql
databaseHost: loopback
databaseUrl: <redacted>
```

The first validation script attempt used PowerShell variable name `$host`, which conflicts with the built-in `$Host`.
That attempt was discarded and rerun with `$databaseHostName`; only the second result above is treated as valid evidence.

## Migration Evidence

Command:

```powershell
npx.cmd drizzle-kit migrate
```

Result: passed.

```text
No config path provided, using default 'drizzle.config.ts'
Reading config file 'D:\tiku\drizzle.config.ts'
Using 'postgres' driver for database querying
migrations applied successfully
```

The command did not print the database URL. It printed PostgreSQL notices that the `drizzle` schema and
`__drizzle_migrations` relation already existed, then applied migrations successfully.

Command: local schema readiness check, no row data or public identifiers output.

Result: passed.

```text
OK_SCHEMA_READINESS
organization_training_draft: present
organization_training_source_context: present
```

## Local Full-Flow Rerun

Command:

```powershell
npm.cmd run test:e2e -- e2e/organization-training-local-full-flow.spec.ts
```

Result: failed after migration execution.

```text
Expected: 0
Received: 409080
at createDraftFromAdminUi
```

Observed progression:

- Previous blocker resolved: `POST /api/v1/organization-trainings` no longer returns `500001`.
- Current blocker: manual draft service guard returns `409080`, which maps to
  `organizationTrainingManualDraftCreationBlockedMessage`.
- The flow still does not reach source-context attachment, publish/copy, employee visible-list, draft-save, submit, or
  readonly-summary assertions.

## Supporting Checks

Command:

```powershell
npm.cmd run test:unit -- tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts
```

Result: passed.

```text
Test Files  2 passed (2)
Tests  6 passed (6)
```

Command:

```powershell
npm.cmd run test:e2e -- e2e/organization-training-local-full-flow.spec.ts --list
```

Result: passed.

```text
Total: 1 test in 1 file
```

Command:

```powershell
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-18-organization-training-draft-source-context-local-migration-execution-approval.md docs/05-execution-logs/evidence/2026-06-18-organization-training-draft-source-context-local-migration-execution-approval.md docs/05-execution-logs/audits-reviews/2026-06-18-organization-training-draft-source-context-local-migration-execution-approval.md docs/05-execution-logs/evidence/2026-06-18-organization-training-admin-employee-local-full-flow-validation.md docs/05-execution-logs/audits-reviews/2026-06-18-organization-training-admin-employee-local-full-flow-validation.md
```

Result: passed.

Command:

```powershell
npm.cmd run lint
```

Result: passed.

Command:

```powershell
npm.cmd run typecheck
```

Result: passed.

Command:

```powershell
git diff --check
```

Result: passed.

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-draft-source-context-local-migration-execution-approval
```

Result: failed.

Reason: the current branch still contains uncommitted route-repair/full-flow files from earlier tasks in the same local
experience chain. The pre-commit scope scan flagged those as outside this migration-execution task's allowed files,
including the moved admin route page, the e2e spec, and route-repair evidence/plan files. No commit was created.

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-draft-source-context-local-migration-execution-approval
```

Result: passed. No push was performed.

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId organization-training-draft-source-context-local-migration-execution-approval
```

Result: failed. The task remains blocked because the scoped local full-flow failed with `409080`, and the closeout script
also had not accepted this blocked migration-execution task as GREEN/closed evidence.

## Root-Cause Diagnostic

Command: local read-only aggregate diagnostic for seed admin visible organization scope. No public IDs, row data, tokens,
or database URL were output.

Result:

```text
OK_SCOPE_DIAGNOSTIC
firstOrganizationExists: true
seedAdminExists: true
visibleRootExists: false
visibleCount: 0
firstOrganizationVisible: false
publicIds: <redacted>
```

Interpretation:

- The seed admin used by the e2e login exists.
- The seed admin has no `admin_organization` visible root in the current local database.
- The first organization selected by the e2e fixture is therefore not visible to the admin.
- The service guard blocks manual draft creation before persistence can create a draft row for this flow.

## Module Run v2 Evidence

- Batch range: local-only migration execution plus rerun of the organization-training local full-flow.
- Commit: `de549c3e0a4defd0a1f996c6f4d7062a9e742c7a` baseline before this task; no completion commit is approved or
  created.
- batchCommitEvidence: no task commit was created because local full-flow remains blocked and closeout commit is not
  approved for this task; additionally, pre-commit hardening failed on existing uncommitted prior-task files in the same
  branch.
- localFullLoopGate: rerun attempted; migration blocker is resolved, but full-flow is now blocked by admin visible
  organization scope `409080`.
- Thread rollover gate: no rollover required.
- nextModuleRunCandidate: `organization-training-admin-visible-scope-local-fixture-contract-repair`.
- Blocked remainder: admin visible scope local fixture/contract repair, rerun local full-flow GREEN evidence, closure
  readiness audit, and Cost Calibration Gate.

## Redaction

- No Authorization header, browser session value, password, database URL, provider payload, model response, raw prompt,
  raw answer, row data, public identifier inventory, screenshot, trace, or DOM dump is recorded.
- Database evidence records only local target classification, table presence, aggregate booleans, and standard response
  codes.

## Taste Compliance Checklist

- API response contract: the rerun still validates the standard response envelope; failure is a standard code `409080`.
- Naming: no naming contract was changed; task identifiers and paths remain kebab-case.
- Database boundary: executed only reviewed local Drizzle migration; no `drizzle-kit push` and no destructive data
  operation.
- Secret handling: `.env.local` was read only to validate/use local `DATABASE_URL`; the URL was not printed or written.
- Architecture boundary: no product source, schema, migration SQL, package, lockfile, dependency, provider/model, or
  external-service file was changed.
- Conclusion discipline: no `experience_closed` claim; local full-flow remains blocked by admin visible scope.
