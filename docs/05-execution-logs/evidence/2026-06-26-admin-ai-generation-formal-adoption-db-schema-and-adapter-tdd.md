# Admin AI generation formal adoption DB schema and adapter TDD evidence

Task id: `admin-ai-generation-formal-adoption-db-schema-and-adapter-tdd-2026-06-26`

## Scope

- Branch: `codex/admin-ai-formal-adoption-db-adapter-tdd-20260626`
- Approval consumed: current user advance approval for the admin AI formal adoption goal execution.
- Implemented scope:
  - `admin_ai_generation_formal_adoption` local schema definition;
  - reviewed SQL migration file;
  - Drizzle metadata snapshot and journal alignment;
  - Postgres DB adapter implementing the existing formal adoption repository gateway;
  - focused unit tests for mapper, insert value, source result mapping, and blocked formal write boundary.

## Boundary

- Local migration executed: false
- Live DB connection or mutation executed: false
- Route integration or route smoke executed: false
- Formal `question`/`paper` draft write executed: false
- Provider call or credential read executed: false
- Env file read/write executed: false
- Package or lockfile changed: false
- Staging/prod/deploy/payment/external-service touched: false
- Cost Calibration or final Pass claimed: false

## Requirement Mapping Result

- Formal content separation is preserved. AI generated results remain in `admin_ai_generation_result`; reviewed adoption metadata is stored in the separate `admin_ai_generation_formal_adoption` companion table.
- Content admin adoption metadata now records source public IDs, reviewer public ID, review status, reviewed time, target type/domain, redacted source digest/preview, evidence summary, and formal target write status.
- Formal target creation remains blocked by adapter validation: rows that reference a formal `question` or `paper` public ID, or a non-blocked write status, are rejected.
- Organization-scoped adoption, route execution, local migration execution, and formal draft creation remain future tasks.

## Changed File Inventory

- Added:
  - `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-formal-adoption-db-schema-and-adapter-tdd.md`
  - `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-db-schema-and-adapter-tdd.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-adoption-db-schema-and-adapter-tdd.md`
  - `drizzle/20260626235000_add_admin_ai_generation_formal_adoption.sql`
  - `drizzle/meta/20260626235000_snapshot.json`
  - `src/server/repositories/admin-ai-generation-formal-adoption-db-adapter.ts`
  - `src/server/repositories/admin-ai-generation-formal-adoption-db-adapter.test.ts`
- Modified:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `drizzle/meta/_journal.json`
  - `src/db/schema/ai-rag.ts`

## RED/GREEN Evidence

| Command                                                                                                   | Result | Notes                                                                                            |
| --------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------ |
| `npm.cmd run test:unit -- src/server/repositories/admin-ai-generation-formal-adoption-db-adapter.test.ts` | RED    | Failed as expected because `./admin-ai-generation-formal-adoption-db-adapter` did not exist yet. |
| `npm.cmd run test:unit -- src/server/repositories/admin-ai-generation-formal-adoption-db-adapter.test.ts` | PASS   | 1 test file passed, 4 tests passed. No DB connection or migration execution.                     |

## Command Results

| Command                                                      | Result | Notes                                                                          |
| ------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------ |
| `npm.cmd run lint`                                           | PASS   | ESLint completed successfully.                                                 |
| `npm.cmd run typecheck`                                      | PASS   | `tsc --noEmit` completed successfully.                                         |
| Scoped `prettier --write`                                    | PASS   | Ran on changed docs/state/source/schema/migration/meta files.                  |
| Scoped `prettier --check`                                    | PASS   | All matched files use Prettier code style.                                     |
| `git diff --check`                                           | PASS   | No whitespace errors.                                                          |
| `Test-ModuleRunV2PreCommitHardening.ps1`                     | PASS   | Scope scan, sensitive evidence scan, and terminology scan passed.              |
| `Test-ModuleRunV2PrePushReadiness.ps1 -SkipRemoteAheadCheck` | PASS   | Git readiness, evidence path, and audit path passed after state SHA alignment. |

## Drizzle Metadata Note

`drizzle-kit generate` and `drizzle-kit migrate` were not run. The task boundary allowed local migration-file and Drizzle metadata/journal alignment but did not allow env/secret access, live DB connection, or migration execution. The reviewed SQL migration and snapshot/journal were aligned as files only.

## Blocked Remainder

- Local migration execution approval package.
- Local migration execution against dev DB if separately approved.
- Route integration and local route smoke approval/execution.
- Formal draft adapter for `question` and `paper`.
- Actual formal `question`/`paper` draft creation after governed review.
- Organization-scoped adoption.
- Provider/Cost, staging/prod, deployment/release readiness, payment, and external-service gates.

## Final Closeout

Status: `PASS_ADMIN_AI_GENERATION_FORMAL_ADOPTION_DB_SCHEMA_ADAPTER_TDD_NO_MIGRATION_NO_LIVE_DB_NO_FORMAL_WRITE`.
