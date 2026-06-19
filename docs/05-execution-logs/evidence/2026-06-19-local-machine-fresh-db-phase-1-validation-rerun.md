# Local Machine Fresh DB Phase 1 Validation Rerun Evidence

result: blocked

## Task

- Task id: `local-machine-fresh-db-phase-1-validation-rerun`
- Branch: `codex/local-machine-fresh-db-phase-1-validation-rerun`
- Task kind: `validation`
- Module Run version: 2
- Date: 2026-06-19
- Batch range: single user-directed fresh local DB phase 1 rerun.
- Commit: `058f40c5` is the accepted pre-task stacked baseline; the final local validation commit follows this evidence record.

## RED / GREEN

- RED: Prior phase 1 validation was blocked by existing `tiku` migration ledger drift and 2 stable unit failures.
- GREEN: Fresh local DB creation, reviewed Drizzle migration, dev seed, validation data prep, lint, typecheck, and DB
  post-validation checks passed. Full phase 1 remains blocked by the same two stable unit failures reproduced on a fresh
  database.

## Approval Boundary

User requested the follow-up task `local-machine-fresh-db-phase-1-validation-rerun`. This task may create a fresh disposable local dev database, run existing migrations and validation commands against it with process-scoped redacted environment, and commit docs/state/evidence/audit only. Existing local tooling may perform secret-safe runtime reads of `.env.local`, but `.env*` values must not be changed, copied, output, or committed.

## Validation Commands

| Command                                                                                                                                                                                                                                                                                                                                                                                                                                | Result  | Summary                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short --branch`                                                                                                                                                                                                                                                                                                                                                                                                          | pass    | Branch `codex/local-machine-fresh-db-phase-1-validation-rerun`; only task-scoped docs/state files were changed or untracked.                             |
| `docker compose up -d tiku-postgres`                                                                                                                                                                                                                                                                                                                                                                                                   | pass    | Existing local Docker Postgres service was running.                                                                                                      |
| `docker compose exec -T tiku-postgres createdb -U tiku tiku_fresh_phase1_202606182307`                                                                                                                                                                                                                                                                                                                                                 | pass    | Fresh disposable local database was created; no existing database was dropped, truncated, reset, or repaired.                                            |
| `npx.cmd drizzle-kit migrate`                                                                                                                                                                                                                                                                                                                                                                                                          | pass    | Current tracked Drizzle migrations applied successfully against the fresh local database; one long-identifier truncation notice was emitted by Postgres. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Seed-DevDatabase.ps1`                                                                                                                                                                                                                                                                                                                                            | pass    | Dev seed completed against the fresh local database; evidence records only counts.                                                                       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\local\Invoke-ValidationDataPrep.ps1`                                                                                                                                                                                                                                                                                                                                | pass    | Existing validation data prep E2E passed 1/1 against the fresh local database.                                                                           |
| `npm.cmd run lint`                                                                                                                                                                                                                                                                                                                                                                                                                     | pass    | ESLint exited 0.                                                                                                                                         |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                                                                                                                                                                                | pass    | `tsc --noEmit` exited 0.                                                                                                                                 |
| `npm.cmd run test:unit`                                                                                                                                                                                                                                                                                                                                                                                                                | failed  | Full unit suite: 284 files passed, 2 files failed; 1201 tests passed, 2 failed. Targeted rerun of the 2 failed files reproduced the same failures.       |
| `npm.cmd run test:e2e`                                                                                                                                                                                                                                                                                                                                                                                                                 | skipped | Not run after stable full-unit failure; no full phase 1 pass claim.                                                                                      |
| `npm.cmd run build`                                                                                                                                                                                                                                                                                                                                                                                                                    | skipped | Not run after stable full-unit failure; no build pass claim.                                                                                             |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                                     | pass    | No whitespace errors after scoped docs formatting.                                                                                                       |
| `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-local-machine-fresh-db-phase-1-validation-rerun.md docs/05-execution-logs/evidence/2026-06-19-local-machine-fresh-db-phase-1-validation-rerun.md docs/05-execution-logs/audits-reviews/2026-06-19-local-machine-fresh-db-phase-1-validation-rerun.md` | pass    | All matched docs/state files use Prettier style after scoped `--write`.                                                                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId local-machine-fresh-db-phase-1-validation-rerun`                                                                                                                                                                                                                                                        | pass    | Scope scan covered 5 changed files and passed; Cost Calibration Gate remains blocked.                                                                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId local-machine-fresh-db-phase-1-validation-rerun -AllowMissingThreadRolloverDecision -AllowMissingNextModuleRunCandidate`                                                                                                                                                                           | pass    | Blocked evidence closeout approved; failure summary, next repair, validation anchors, audit approval, and blocked remainder passed.                      |

## Fresh DB Checks

- Fresh database alias: `tiku_fresh_phase1_202606182307`
- Migration ledger count: 14.
- Required runtime tables: present for `organization_training_draft`, `organization_training_source_context`, and
  `personal_ai_generation_result`.
- Dev seed key public-id counts: present for seeded auth users, paper, model_config, and organization training version.

## Runtime Failure Summary

- Failure category: stable unit failures after fresh DB migration and seed readiness passed.
- Fresh DB migration readiness: passed; migration ledger count is 14 and current required tables exist.
- Seed/bootstrap readiness: passed; dev seed and validation data prep completed against the fresh database.
- Unit readiness: blocked by two stable failures.
- `tests/unit/admin-model-config-management-ui.test.ts` expects visible fallback public id text, but the current UI
  renders redacted fallback wording.
- `tests/unit/phase-9-multi-client-rest-contract-verification.test.ts` finds at least one `/api/v1` route inventory item
  with zero exported methods.

## Local Validation Level

- localFullLoopGate: L4 reached for fresh DB migration/seed/data-prep readiness; L5/L6 full local role flow blocked
  because full unit validation failed before E2E/build.
- blocked remainder: provider/model calls, provider configuration, staging/prod/cloud/deploy, payment, external-service, dependency changes, product/test/source changes, schema/migration file changes, existing `tiku` ledger repair, PR, merge, push, force-push, destructive database operations against existing databases, raw sensitive evidence, and Cost Calibration Gate remain blocked.

## Recommended Smallest Follow-Up Task

- nextModuleRunCandidate: `local-machine-unit-failure-repair-before-full-phase-1`.
- Recommended action: open a scoped code/test repair task for the two stable unit failures, with allowed files limited to
  the affected component/route inventory surfaces and their tests, then rerun full unit, E2E, and build against the
  already verified fresh DB pattern.
- Approval boundary for follow-up: no provider/model calls, no dependency changes, no schema/migration file changes, no
  staging/prod/cloud/deploy, no payment, no external service, no existing `tiku` ledger repair, no destructive database
  operation, and Cost Calibration Gate remains blocked.

## Redaction

This evidence must not include `.env.local` contents, database URLs, credentials, secrets, tokens, Authorization headers, raw DB rows, cleartext `redeem_code`, full `paper` or `material` content, raw prompts, raw AI responses, provider payloads, screenshots, traces, or HTML reports. Cost Calibration Gate remains blocked.

## Next Module Run

- nextModuleRunCandidate: `local-machine-unit-failure-repair-before-full-phase-1`.

## Thread Rollover

- threadRolloverDecision: not required for this single validation task.
