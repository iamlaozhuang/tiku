# Module Run v2 DB Capability Governance Approval Evidence

## Summary

This mechanism task lands two DB capability governance paths:

- `standingLocalSchemaMigrationApproval`
- `taskScopedDestructiveLocalDockerDbApproval`

## Approval Boundary

The user requested continuing governance landing by splitting DB-related authorization into two governed approvals.

This task does not execute real DB operations, migrations, schema edits, destructive DB operations, env/secret access,
provider calls, dependency changes, deploys, PRs, force pushes, or Cost Calibration Gate actions.

`dbCapabilityGovernanceCloseoutApproval`: User authorized closeout for `codex/db-capability-governance-approval`: the
two committed scoped commits may be checked by readiness, fast-forward merged to `master`, pushed to `origin/master`,
the short branch cleaned up, and the worktree parked.

## Behavior

- `schemaMigration: approved_migration_plan` can pass `Test-ModuleRunV2LocalCapabilityGate.ps1 -Capability schemaMigration -Intent use_capability`.
- `destructiveLocalDockerDatabase: approved_destructive_local_dev_only` can pass the local capability gate only as a
  task-scoped local Docker dev DB approval.
- Destructive local Docker DB approval still requires explicit task evidence: operation kind, local target alias,
  backup/snapshot or disposable DB rationale, rollback/recovery, and redacted evidence plan.
- Future auto-seeded low-risk implementation tasks default `destructiveLocalDockerDatabase` to
  `blocked_without_task_approval`.

## Validation Results

Passed:

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.Smoke.ps1`: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1`: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveControlLoopAcceptance.Smoke.ps1`: pass
- `npm.cmd run lint`: pass
- `npm.cmd run typecheck`: pass
- `git diff --check`: pass
- `prettier.cmd --check` on changed Markdown/YAML files: pass
- `Test-ModuleRunV2UnattendedReadiness.ps1 -TaskId module-run-v2-db-capability-governance-approval`: pass, all 13 changed files matched `allowedFiles`

## Capability Gate Checks

- `schemaMigration: approved_migration_plan` now returns `localCapabilityDecision: capability_ready`.
- `destructiveLocalDockerDatabase: blocked_without_task_approval` returns `manual_required`.
- `destructiveLocalDockerDatabase: approved_destructive_local_dev_only` returns `localCapabilityDecision: capability_ready`.
- Unsafe destructive DB capability values hard-block through autodrive schema readiness.

## Closeout State

Commit: a8c94052

## Batch 106: DB Capability Governance

RED: DB-related capability approval had not fully landed in executable durable gates. `schemaMigration:
approved_migration_plan` was still routed to manual_required, and destructive local Docker DB work had no distinct
task-scoped capability value.

GREEN: `schemaMigration: approved_migration_plan` now passes local capability readiness, and
`destructiveLocalDockerDatabase` exists as a separate task-scoped local-dev-only capability with unsafe values blocked by
schema readiness.

localFullLoopGate: Mechanism validation reached local governance L4 for capability classification only. No real DB,
schema, migration, or destructive operation was executed.

threadRolloverGate: Not required for this mechanism-only closeout; no Codex thread creation or continuation was
performed.

nextModuleRunCandidate: After this governance closeout, the next guarded runner cycle may use durable DB capability
gates when a scoped task records approved capability values, or exit idle when no executable task exists.

Local validation passed. Repository merge/push/cleanup closeout is pending explicit approval for this governance task.

## Blocked Remainder

- Cost Calibration Gate remains blocked.
- Staging/prod/cloud DB, env/secret, provider, dependency/package/lockfile, deploy, payment, external-service, PR, and
  force-push actions remain blocked.
- `drizzle-kit push` remains blocked.

## Redaction

No secrets, database URLs, DB rows, Authorization headers, provider payloads, raw prompts, raw generated AI content,
plaintext `redeem_code`, auto-increment ids, or full `paper`/`material` content were recorded.
