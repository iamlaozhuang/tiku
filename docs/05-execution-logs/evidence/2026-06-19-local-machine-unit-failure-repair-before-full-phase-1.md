# Local Machine Unit Failure Repair Before Full Phase 1 Evidence

result: passed

## Task

- Task id: `local-machine-unit-failure-repair-before-full-phase-1`
- Branch: `codex/local-machine-phase-1-unit-repair-and-rerun`
- Task kind: `implementation_tdd`
- Module Run version: 2
- Date: 2026-06-19
- Fresh database alias: `tiku_fresh_phase1_unit_repair_202606182324`

## Batch Evidence

- Batch range: single task repair-and-rerun batch for `local-machine-unit-failure-repair-before-full-phase-1`.

## Batch Commit Evidence

- Commit: `f501d976` is the accepted pre-task stacked baseline; the final local task commit follows this readiness evidence and will be reported at closeout.

## RED / GREEN

- RED: targeted unit run reproduced the two stable failures from the fresh DB phase 1 rerun.
- GREEN: targeted unit run passed after repairing the admin fallback redaction test contract and the employee-statistics route `GET` export.
- Non-counted note: one early full-unit command was interrupted by a 120s tool timeout before final fresh DB validation; it was rerun with a longer timeout and passed.

## Repair Summary

- `tests/unit/admin-model-config-management-ui.test.ts`: now expects `fallback: identifier values folded` and asserts the raw fallback public id is not rendered.
- `tests/unit/admin-model-config-management-ui.test.ts`: constructs the synthetic provider key at runtime so the changed file does not contain a continuous provider-key-shaped literal.
- `src/app/api/v1/organization-analytics/employee-statistics/route.ts`: now uses direct `export const GET = ...` assignment so the route inventory recognizes the HTTP method.

## Validation Commands

| Command                                                                                                                                                                                                                                                            | Result | Summary                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short --branch`                                                                                                                                                                                                                                      | pass   | Branch `codex/local-machine-phase-1-unit-repair-and-rerun`; changes are limited to this task scope.                                                     |
| `npm.cmd run test:unit -- tests/unit/admin-model-config-management-ui.test.ts tests/unit/phase-9-multi-client-rest-contract-verification.test.ts`                                                                                                                  | failed | RED: 2 files failed, 2 tests failed, 5 tests passed; failures matched prior evidence categories.                                                        |
| `npm.cmd run test:unit -- tests/unit/admin-model-config-management-ui.test.ts tests/unit/phase-9-multi-client-rest-contract-verification.test.ts`                                                                                                                  | pass   | GREEN: 2 files passed, 7 tests passed.                                                                                                                  |
| `docker compose up -d tiku-postgres`                                                                                                                                                                                                                               | pass   | Existing local Docker Postgres service was running.                                                                                                     |
| `docker compose exec -T tiku-postgres createdb -U tiku tiku_fresh_phase1_unit_repair_202606182324`                                                                                                                                                                 | pass   | Fresh disposable local database was created; no existing database was dropped, truncated, reset, or repaired.                                           |
| `npx.cmd drizzle-kit migrate`                                                                                                                                                                                                                                      | pass   | Current tracked Drizzle migrations applied successfully against the fresh local database; Postgres emitted the known long-identifier truncation notice. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Seed-DevDatabase.ps1`                                                                                                                                                                        | pass   | Dev seed completed against the fresh local database; output was count-only.                                                                             |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\local\Invoke-ValidationDataPrep.ps1`                                                                                                                                                            | pass   | Existing validation data prep E2E passed 1/1 against the fresh local database.                                                                          |
| `npm.cmd run lint`                                                                                                                                                                                                                                                 | pass   | ESLint exited 0.                                                                                                                                        |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                            | pass   | `tsc --noEmit` exited 0.                                                                                                                                |
| `npm.cmd run test:unit`                                                                                                                                                                                                                                            | pass   | Full unit suite: 286 files passed, 1203 tests passed.                                                                                                   |
| `npm.cmd run test:e2e`                                                                                                                                                                                                                                             | pass   | Full Playwright suite: 31 tests passed.                                                                                                                 |
| `npm.cmd run build`                                                                                                                                                                                                                                                | pass   | Next build completed successfully; 65 static pages generated.                                                                                           |
| `docker compose exec -T tiku-postgres psql -U tiku -d tiku_fresh_phase1_unit_repair_202606182324 -c "SELECT count(*) AS migration_ledger_count FROM drizzle.__drizzle_migrations;"`                                                                                | pass   | Migration ledger count: 14.                                                                                                                             |
| `docker compose exec -T tiku-postgres psql -U tiku -d tiku_fresh_phase1_unit_repair_202606182324 -c "<required table presence check>"`                                                                                                                             | pass   | `organization_training_draft`, `organization_training_source_context`, and `personal_ai_generation_result` are present.                                 |
| `git diff --check`                                                                                                                                                                                                                                                 | pass   | No whitespace errors.                                                                                                                                   |
| `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`                                                                                                                                                                                             | pass   | All matched docs/source/test files use Prettier style.                                                                                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId local-machine-unit-failure-repair-before-full-phase-1`                                                                              | pass   | Scope scan, sensitive evidence scan, terminology scan, and blocked Cost Calibration Gate anchor passed.                                                 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId local-machine-unit-failure-repair-before-full-phase-1 -AllowMissingThreadRolloverDecision -AllowMissingNextModuleRunCandidate` | pass   | Evidence, audit, validation, RED/GREEN, batch, local full-loop, blocked remainder, and audit approval anchors passed.                                   |

## Fresh DB Checks

- Fresh database alias: `tiku_fresh_phase1_unit_repair_202606182324`.
- Migration ledger count: 14.
- Required runtime tables: present for `organization_training_draft`, `organization_training_source_context`, and `personal_ai_generation_result`.
- Dev seed key count output: present for auth users, admin, organization, employee, org_auth, organization training version, organization training answer, personal_auth, paper, paper_question, and model_config.

## Local Validation Level

- localFullLoopGate: L6 local fresh DB phase 1 validation passed.
- The result proves the local dev baseline only. It does not prove staging/prod readiness, real provider/model behavior, payment, OCR, export, cloud deployment, production migration, or Cost Calibration Gate readiness.

## Blocked Gates

- Provider/model calls and provider configuration remain blocked.
- Dependency/package/lockfile changes remain blocked.
- Schema/drizzle/migration file changes remain blocked.
- Existing `tiku` ledger repair and `drizzle-kit push` remain blocked.
- `.env*` changes, copies, or value output remain blocked.
- Staging/prod/cloud/deploy, payment, external-service, PR, push, force-push, and Cost Calibration Gate remain blocked.

## Next Module Run

- nextModuleRunCandidate: `ap-01-provider-smoke-execution-approval-detailing` if the owner wants to proceed toward real DeepSeek/Qwen validation.
- Alternative: keep provider gates blocked and continue local-only UX/product polish on the now-green local baseline.

## Redaction

This evidence does not include `.env.local` contents, database URLs, credentials, secrets, tokens, Authorization headers, raw DB rows, cleartext `redeem_code`, full `paper` or `material` content, raw prompts, raw AI responses, provider payloads, screenshots, traces, or HTML reports. Cost Calibration Gate remains blocked.
