# Admin AI generation formal adoption DB/schema adapter or route integration approval package evidence

Task id: `admin-ai-generation-formal-adoption-db-schema-adapter-or-route-integration-approval-package-2026-06-26`

## Scope

- Branch: `codex/admin-ai-formal-adoption-db-route-approval-20260626`
- Approval consumed: current user request for a docs/state approval package.
- Implemented scope:
  - approval package document;
  - task plan;
  - evidence and audit review;
  - project-state and task-queue update.
- Execution boundary:
  - Source/test/schema/migration changed: false
  - Live DB connection or mutation: false
  - Local migration execution: false
  - Route integration or route smoke: false
  - Formal `question`/`paper` draft write: false
  - Provider call or credential read: false
  - Env file read/write: false
  - Staging/prod/deploy/payment/external service touched: false
  - Cost Calibration or final Pass claimed: false

## Requirement Mapping

- Formal generated-result isolation remains intact: current generated results stay in `admin_ai_generation_result` as redacted history/read data.
- Governed formal adoption still requires explicit review, validation, attribution, audit, and later approved execution.
- Architecture layering remains route -> service -> repository/adapter; future route work must not directly mutate formal question/paper repositories.
- Future migration work must follow Drizzle migration file review and separate local execution approval.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-contract-and-repository-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-adoption-contract-and-repository-tdd.md`
- Prior logs were used only to confirm completed contract/repository-port scope and blocked remainder.

## Read-Only Source Observations

- `src/server/repositories/admin-ai-generation-formal-adoption-repository.ts` currently creates/reuses a reviewed adoption plan and asserts formal target writes remain blocked.
- `src/server/contracts/admin-ai-generation-result-persistence-contract.ts` models generated-result history as redacted snapshot, digest, masked preview, evidence summary, and formal-adoption blocked status.
- `src/db/schema/ai-rag.ts` has `admin_ai_generation_result` but no adoption companion table.
- `src/server/repositories/question-repository.ts` and `src/server/repositories/paper-draft-repository.ts` expose formal content mutation repositories; they should be reached through a later narrow adapter, not directly from admin AI routes.

## Decision Evidence

| Decision point                    | Result                                                                    | Rationale                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Adoption persistence landing zone | Add `admin_ai_generation_formal_adoption` companion table in a later task | Keeps generated-result history immutable and redacted while preserving adoption provenance and idempotency. |
| Extend generated-result table     | Rejected                                                                  | Mixing formal target state into generated-result history weakens the isolation boundary.                    |
| New backend AI task table         | Rejected                                                                  | Existing `ai_generation_task` plus admin metadata/result tables already cover task lifecycle.               |
| Formal draft adapter now          | Rejected for this package                                                 | Current generated result data is redacted summary data, not enough for formal draft creation.               |
| Local migration and route smoke   | Requires later approval                                                   | This package is decision-only and does not execute DB or route work.                                        |

## Command Results

| Command                                                      | Result                    | Notes                                                                                                                        |
| ------------------------------------------------------------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `npx.cmd prettier --check --ignore-unknown ...`              | `PASS_AFTER_FORMAT_WRITE` | Initial evidence Markdown formatting check failed; scoped `prettier --write` was run on this evidence file and rerun passed. |
| `git diff --check`                                           | `PASS`                    | No whitespace errors.                                                                                                        |
| `Test-ModuleRunV2PreCommitHardening.ps1`                     | `PASS`                    | Scope scan covered six docs/state files; sensitive evidence and terminology scans passed.                                    |
| `Test-ModuleRunV2PrePushReadiness.ps1 -SkipRemoteAheadCheck` | `PASS`                    | Git readiness, evidence path, and audit path passed against accepted ancestor checkpoint.                                    |

## Changed File Inventory

- Added:
  - `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-formal-adoption-db-schema-adapter-or-route-integration-approval-package.md`
  - `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-formal-adoption-db-schema-adapter-or-route-integration-approval-package.md`
  - `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-db-schema-adapter-or-route-integration-approval-package.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-adoption-db-schema-adapter-or-route-integration-approval-package.md`
- Modified:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`

## Blocked Remainder

- Schema/migration file and DB adapter implementation.
- Local migration execution.
- Route integration and local route smoke.
- Formal question/paper draft adapter and live formal draft creation.
- Organization-scoped adoption.
- Provider, credentials, env, staging/prod, deploy, payment, external service, Cost Calibration, release readiness, and final Pass.

## Final Closeout

Result: `PASS_APPROVAL_PACKAGE_PREPARED`.

The approval package decides the future landing zone and execution order only. It does not execute schema/migration, DB, route, Provider, formal question/paper draft write, staging/prod/deploy/payment/external-service, Cost Calibration, release readiness, or final Pass work.
