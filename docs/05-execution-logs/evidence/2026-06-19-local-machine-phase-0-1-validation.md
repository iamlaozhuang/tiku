# Local Machine Phase 0 + Phase 1 Validation Evidence

result: blocked

## Task

- Task id: `local-machine-phase-0-1-validation`
- Branch: `codex/local-machine-phase-0-1-validation`
- Task kind: `validation`
- Module Run version: 2
- Date: 2026-06-19
- Batch range: single user-directed local machine phase 0 + phase 1 validation task.
- Commit: `7712270e` is the accepted pre-task baseline; the final local validation commit follows this evidence record.

## RED / GREEN

- RED: The selected existing local Docker database `tiku` is not ready for full phase 1 validation. It has only 2
  Drizzle migration ledger entries while later schema objects are partially present, and regular `drizzle-kit migrate`
  against that selected database exits non-zero without advancing the ledger. Full unit validation also has 2 stable
  failing tests.
- GREEN: Phase 0 baseline completed, local tooling is installed, Docker Postgres is healthy, pgvector is present, E2E
  discovery lists 31 tests in 14 files, `.env.local` / `rawfiles` / runtime work directories are ignored, lint and
  typecheck passed, and the failure has a redacted follow-up path.

## Approval Boundary

User approved local phase 0 + phase 1 validation using the existing local Docker `tiku-postgres` database and one local commit. User approved `.env.local` reads only for local tooling to obtain the local `DATABASE_URL`. `.env*` values must not be printed, copied, changed, or committed.

## Validation Commands

| Command                                                                                                                                                                                                                                                                                                                                                                                         | Result  | Summary                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short --branch`                                                                                                                                                                                                                                                                                                                                                                   | pass    | Branch `codex/local-machine-phase-0-1-validation`; only task-scoped docs/state files were changed or untracked.                                                                                      |
| `node --version`                                                                                                                                                                                                                                                                                                                                                                                | pass    | Node `v22.14.0`.                                                                                                                                                                                     |
| `npm --version`                                                                                                                                                                                                                                                                                                                                                                                 | pass    | npm `10.9.2`.                                                                                                                                                                                        |
| `pnpm --version`                                                                                                                                                                                                                                                                                                                                                                                | pass    | pnpm `10.33.4`.                                                                                                                                                                                      |
| `docker compose ps`                                                                                                                                                                                                                                                                                                                                                                             | pass    | `tiku-postgres-dev` is running and healthy on localhost.                                                                                                                                             |
| `npm.cmd run test:e2e -- --list`                                                                                                                                                                                                                                                                                                                                                                | pass    | 31 Playwright tests discovered in 14 files.                                                                                                                                                          |
| `git check-ignore -v .env.local rawfiles .runtime .worktrees`                                                                                                                                                                                                                                                                                                                                   | pass    | All four local/runtime paths are ignored.                                                                                                                                                            |
| `docker compose exec -T tiku-postgres psql -U tiku -d tiku -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"`                                                                                                                                                                                                                                                         | pass    | pgvector present, version `0.8.2`.                                                                                                                                                                   |
| `docker compose exec -T tiku-postgres psql -U tiku -d tiku -c "SELECT count(*) AS public_table_count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';"`                                                                                                                                                                                              | pass    | Selected local `tiku` database reports 40 public base tables before phase 1 migration.                                                                                                               |
| `docker compose exec -T tiku-postgres psql -U tiku -d tiku -c "SELECT id, hash, created_at FROM drizzle.__drizzle_migrations ORDER BY id;"`                                                                                                                                                                                                                                                     | pass    | Selected local `tiku` database reports only 2 migration ledger entries before phase 1 migration.                                                                                                     |
| `docker compose up -d tiku-postgres`                                                                                                                                                                                                                                                                                                                                                            | pass    | Existing `tiku-postgres-dev` container was already running.                                                                                                                                          |
| `npx.cmd drizzle-kit migrate`                                                                                                                                                                                                                                                                                                                                                                   | failed  | Redacted `.env.local` target migrated successfully, but it was not the selected compose `tiku` database. Process-scoped migration against selected `tiku` exited 1 and left the ledger at 2 entries. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Seed-DevDatabase.ps1`                                                                                                                                                                                                                                                                                                     | partial | Seed completed against the redacted `.env.local` target before the selected database mismatch was detected; selected `tiku` seed was not rerun because migration was blocked.                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\local\Invoke-ValidationDataPrep.ps1`                                                                                                                                                                                                                                                                                         | partial | Existing validation data prep E2E passed 1/1 against the redacted local env target; it is not accepted as proof for selected `tiku`.                                                                 |
| `npm.cmd run lint`                                                                                                                                                                                                                                                                                                                                                                              | pass    | ESLint exited 0.                                                                                                                                                                                     |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                                                                                                                                         | pass    | `tsc --noEmit` exited 0.                                                                                                                                                                             |
| `npm.cmd run test:unit`                                                                                                                                                                                                                                                                                                                                                                         | failed  | Full unit suite: 284 files passed, 2 files failed; 1201 tests passed, 2 failed. Targeted rerun of the 2 failed files reproduced the same 2 failures.                                                 |
| `npm.cmd run test:e2e`                                                                                                                                                                                                                                                                                                                                                                          | skipped | Not run after migration target drift and stable unit failures; no full local phase 1 pass claim.                                                                                                     |
| `npm.cmd run build`                                                                                                                                                                                                                                                                                                                                                                             | skipped | Not run after migration target drift and stable unit failures; no build pass claim.                                                                                                                  |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                              | pass    | No whitespace errors after scoped docs formatting.                                                                                                                                                   |
| `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-local-machine-phase-0-1-validation.md docs/05-execution-logs/evidence/2026-06-19-local-machine-phase-0-1-validation.md docs/05-execution-logs/audits-reviews/2026-06-19-local-machine-phase-0-1-validation.md` | pass    | All matched docs/state files use Prettier style after scoped `--write`.                                                                                                                              |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId local-machine-phase-0-1-validation`                                                                                                                                                                                                                              | pass    | Scope scan covered 5 changed files and passed; Cost Calibration Gate remains blocked.                                                                                                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId local-machine-phase-0-1-validation -AllowMissingThreadRolloverDecision -AllowMissingNextModuleRunCandidate`                                                                                                                                                 | pass    | Blocked evidence closeout approved; failure summary, next repair, validation anchors, audit approval, and blocked remainder passed.                                                                  |

## Runtime Failure Summary

- Failure category: local database target and migration ledger drift, plus stable pre-existing unit failures.
- Selected database target: existing local Docker `tiku` database from `compose.yaml`; no database URL is recorded.
- Observed drift: selected `tiku` has 40 public base tables and only 2 Drizzle migration ledger entries. Later schema
  objects such as `question_knowledge_node`, `question_tag`, `tag`, and `fill_blank_answers` are already present, while
  later required tables such as `organization_training_draft`, `organization_training_source_context`, and
  `personal_ai_generation_result` are absent.
- Migration result: regular `drizzle-kit migrate` against the redacted `.env.local` target exited 0, but subsequent
  direct checks showed that target was not the selected compose `tiku` database. A process-scoped rerun against selected
  `tiku` exited 1 and did not advance the migration ledger.
- Unit result: `tests/unit/admin-model-config-management-ui.test.ts` failed because the UI now redacts the fallback
  identifier text that the test expects to see. `tests/unit/phase-9-multi-client-rest-contract-verification.test.ts`
  failed because one inventoried `/api/v1` route had zero exported methods.

## DB Post-Validation Checks

- Required runtime tables: blocked. Selected `tiku` does not contain `organization_training_draft`,
  `organization_training_source_context`, or `personal_ai_generation_result`.
- Dev seed key public-id counts: partially blocked. Selected `tiku` still has the original dev auth user and content
  seed rows, but later organization training tables are unavailable.

## Local Validation Level

- localFullLoopGate: L2/L3 attempted, blocked before L5/L6 full local phase 1 validation.
- blocked remainder: provider/model calls, provider configuration, staging/prod/cloud/deploy, payment, external-service, dependency changes, product/test/source changes, schema/migration file changes, PR, merge, push, force-push, destructive database operations, raw sensitive evidence, and Cost Calibration Gate remain blocked.

## Recommended Smallest Follow-Up Task

- nextModuleRunCandidate: `local-machine-fresh-db-phase-1-validation-rerun`.
- Recommended action: create a fresh local dev database or otherwise repair the local `tiku` migration ledger under a
  task-specific approval, then rerun `drizzle-kit migrate`, dev seed, validation data prep, full unit, full E2E, and
  build against one confirmed local target.
- Approval boundary for follow-up: no provider/model calls, no dependency changes, no source/test changes unless the
  follow-up explicitly changes scope to repair the two unit failures, no staging/prod/cloud/deploy, no payment, no
  external service, no destructive database operation without fresh task-specific approval, and Cost Calibration Gate
  remains blocked.

## Redaction

This evidence records only redacted local validation metadata. It does not include `.env.local` contents, database URLs,
credentials, secrets, tokens, Authorization headers, raw DB rows, cleartext `redeem_code`, full `paper` or `material`
content, raw prompts, raw AI responses, provider payloads, screenshots, traces, or HTML reports. Cost Calibration Gate
remains blocked.

## Thread Rollover

- threadRolloverDecision: not required for this single validation task.
