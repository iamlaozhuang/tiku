# Evidence: edition-aware-authorization-schema-migration-approval-packet

result: pass

## Summary

- Task id: `edition-aware-authorization-schema-migration-approval-packet`
- Branch: `codex/edition-auth-schema-migration-packet`
- Scope: edition-aware authorization schema and generated Drizzle migration.
- Source changes: `src/db/schema/auth.ts`.
- Schema/unit test changes: `src/db/schema/auth.test.ts`, `src/server/models/auth.test.ts`.
- Migration changes: `drizzle/20260621024911_add_edition_aware_authorization.sql`,
  `drizzle/meta/20260621024911_snapshot.json`, and `drizzle/meta/_journal.json`.
- Drizzle generate executed: yes.
- Local DB migration apply executed: no.
- Destructive DB: not executed.
- Cost Calibration Gate remains blocked.

## Startup Evidence

| Command                                                                                                                                                                                                                                          | Result  | Redacted summary                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short --branch`                                                                                                                                                                                                                    | pass    | `master` matched `origin/master`; worktree clean before branch creation.                                                                                                    |
| `git log --oneline --decorate -n 12`                                                                                                                                                                                                             | pass    | `HEAD` was `0317139b` on `master` and `origin/master`.                                                                                                                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`                                                                                                                                       | pass    | Repository clean; diagnostic reported no auto-pending task.                                                                                                                 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`                                                                                                                          | pass    | Queue had no automatic pending task; the five packet entries were present but required fresh approval.                                                                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId edition-aware-authorization-schema-migration-approval-packet -Capability schemaMigration -Intent use_capability` | blocked | Initial local task state still used `blocked_without_task_fresh_approval`; this packet then materialized the current user fresh approval in docs/state before schema edits. |

## Validation Results

| Command                                                                                                                                                                                                                                          | Result  | Redacted summary                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId edition-aware-authorization-schema-migration-approval-packet -Capability schemaMigration -Intent use_capability` | pass    | `schemaMigration` capability accepted `approved_migration_plan`; drizzle push, destructive data operation, and staging/prod connection remain blocked.                            |
| `npm.cmd run test:unit -- src/db/schema/auth.test.ts src/db/schema/system.test.ts`                                                                                                                                                               | RED     | 2 schema tests failed because edition-aware exports and `auth_upgrade` were not implemented.                                                                                      |
| `npm.cmd run test:unit -- src/db/schema/auth.test.ts src/db/schema/system.test.ts`                                                                                                                                                               | GREEN   | 2 files passed, 8 tests passed after schema implementation.                                                                                                                       |
| `npx.cmd drizzle-kit generate`                                                                                                                                                                                                                   | pass    | Generated migration for 49-table schema snapshot; no DB migration apply was run. Generated file was renamed to the project timestamp convention and journal tag was synchronized. |
| `npm.cmd run test:unit -- src/server/models/auth.test.ts`                                                                                                                                                                                        | pass    | 1 model/schema type test file passed, 3 tests passed after adding the required `edition` fixture field.                                                                           |
| `npm.cmd run lint`                                                                                                                                                                                                                               | pass    | ESLint completed successfully.                                                                                                                                                    |
| `npm.cmd run typecheck`                                                                                                                                                                                                                          | pass    | `tsc --noEmit` completed successfully after fixture alignment.                                                                                                                    |
| `git diff --check`                                                                                                                                                                                                                               | pass    | No whitespace errors.                                                                                                                                                             |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId edition-aware-authorization-schema-migration-approval-packet`                                                     | pending | To run after evidence update.                                                                                                                                                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId edition-aware-authorization-schema-migration-approval-packet`                                                | pending | To run after validation commit hash is recorded.                                                                                                                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId edition-aware-authorization-schema-migration-approval-packet`                                                       | pending | To run before merge/push.                                                                                                                                                         |

## Migration Scope

- Added enum values for `authorization_edition`, `redeem_code_type`, `auth_upgrade_source_type`, and
  `auth_upgrade_status`.
- Added source `edition` fields to `personal_auth` and `org_auth`, defaulting to `standard`.
- Added `redeem_code.redeem_code_type`, defaulting to `personal_standard_activation`.
- Added `auth_upgrade` with source authorization references, target edition, source type, upgrade status, operation
  metadata fields, revocation fields, timestamps, indexes, and the exactly-one-source-authorization check constraint.
- No migration apply command was executed.

## Required Anchors

- Batch range: single schema/migration packet for edition-aware authorization.
- RED: focused schema tests failed on missing edition-aware schema exports and `auth_upgrade`.
- GREEN: focused schema tests, related model test, `drizzle-kit generate`, lint, typecheck, and diff check pass.
- Commit: pending validation commit.
- localFullLoopGate: not used; schemaMigration gate is used instead.
- threadRolloverGate: current thread can continue only after this packet closes and the branch is merged, pushed, and
  cleaned.
- nextModuleRunCandidate: `edition-aware-authorization-api-contract-packet` after this packet closes.
- blocked remainder: local DB migration apply, destructive DB, staging/prod DB work, provider/model calls, env/secret
  access, dependency changes, payment, deploy, PR, force-push, and Cost Calibration Gate remain blocked.

## Redaction Boundary

No database URLs, secrets, tokens, Authorization headers, raw DB rows, raw prompts, raw generated AI content, provider
payloads, plaintext `redeem_code`, full `paper`, full `material`, raw employee answer text, screenshots, traces, or DOM
dumps are recorded.
