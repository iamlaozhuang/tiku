# Phase 29 Staging Database Migration Rollback Plan Evidence

## Summary

- Result: pass.
- Scope: docs_only migration/rollback planning.
- Changed surfaces: evidence only.
- Gates: migration input, backup point, rollback decision point, drift check, and `drizzle-kit push` prohibition documented; no DB command was run.
- Forbidden scope (`forbiddenScope`): no staging/prod DB connection, no migration execution, no raw SQL, no schema/drizzle/migration edit, no migration table repair, no destructive data operation.
- Residual gaps (`residualGaps`): future staging migration needs explicit approval, staging DB resource, secret/env approval, backup/restore owner, and reviewed release branch.

## Staging Migration Input

- migration input: reviewed migration files already committed on the approved release branch only.
- Release branch input: future task must name the exact Git branch/commit and compare it to `master` or the approved release base.
- Schema input: current `src/db/schema/**` and `drizzle/**` state must be reviewed before execution, but Phase 29 does not edit either path.
- Environment input: staging target must be confirmed as `staging` without exposing `DATABASE_URL`, credentials, host, or account identifiers.

## Backup And Restore Gate

- backup point: create a staging DB backup immediately before applying reviewed migrations in the future approved task.
- Backup owner: DB owner named in the approval package.
- Restore owner: DB owner or delegated ops owner named before migration starts.
- Object storage relation: if migration relies on object metadata, staging object storage backup/version policy must be confirmed separately.
- Evidence rule: record backup existence/class, timestamp, owner, and restore method only; never record connection strings or cloud console payloads.

## Drift Check

- drift check: future approved task must compare reviewed migration state with the staging target before migration.
- Acceptable evidence: pass/fail summary, migration count/class, schema version label, and redacted target classification.
- Stop conditions: drift, duplicate objects, missing migration metadata, failed extension availability, or any need for manual migration table repair.
- If a stop condition occurs, record the blocked gate and do not attempt repair inside the dry run.

## Forward Migration And Rollback Decision Point

- Forward migration may run only after resource, secret/env, backup, and migration approvals are recorded.
- rollback decision point: immediately after migration command result and before owner acceptance traffic proceeds.
- Rollback triggers: migration failure, drift mismatch, missing pgvector capability, auth/session table failure, unacceptable data loss risk, failed smoke health check, or owner/security decision.
- Rollback method: restore from the named backup point or use an approved reversible migration plan if it exists; destructive shortcuts remain blocked.

## Explicit Prohibitions

- `drizzle-kit push` remains forbidden.
- Raw SQL remains forbidden in this plan and in future dry run unless a separate approved emergency repair plan exists.
- Migration table repair remains blocked.
- Drop, truncate, reset, delete, volume reset, destructive migration, and force schema push remain blocked.
- No staging/prod DB connection was made by this task.

## Phase 30 Entry Condition

Before `phase-30-staging-dry-run-after-approval`, evidence must include explicit human approval for staging DB resource, secret/env storage, migration source branch, backup point, rollback owner, drift check command, and non-destructive execution boundary.
