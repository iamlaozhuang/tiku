# 2026-07-04 Full-chain Scenario 5 Employee Import Harness Repair Plan

## Scope

- Task id: `full-chain-scenario-5-employee-import-harness-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-5-employee-import-harness-repair-2026-07-04`
- Source blocked task: `full-chain-scenario-5-advanced-org-package-2026-07-04`
- Approval boundary: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`
- Task type: docs-only harness repair and focused source-contract verification.

## Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-06-29-full-acceptance-org-advanced-employee-workflow.md`
- `docs/01-requirements/traceability/2026-06-29-fix-ops-admin-employee-import-entry-state.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-5-advanced-org-package.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-5-advanced-org-package.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-5-advanced-employee-input-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-5-advanced-employee-input-provisioning.md`
- `src/app/api/v1/employees/import/route.ts`
- `src/server/services/admin-organization-org-auth-runtime.ts`
- `src/server/validators/employee-account.ts`
- `tests/unit/phase-20-ra-01-04-employee-import.test.ts`
- `src/server/validators/employee-account.test.ts`
- `src/server/services/employee-account-route.test.ts`

## Root Cause

Scenario 5 stopped because the acceptance harness used the existing-user binding request shape:
`{ employees: [{ userPublicId, organizationPublicId }] }`.

For new employee account import, the product route accepts CSV/TSV import via `content` and `sourceFormat`. The focused
unit test already covers `sourceFormat: "csv"` with header `phone,name,initialPassword,organizationPublicId`, and covers
rejection of authorization-scope headers.

## Repair Decision

The repair is not a product source change. It is a harness contract correction:

- Future Scenario 5 rerun must build an in-memory CSV with header `phone,name,initialPassword,organizationPublicId`.
- The CSV rows must come from the approved private advanced employee input plus the target organization public selector
  resolved in memory during the runtime flow.
- The product request shape must be `{ content: <csv>, sourceFormat: "csv" }`.
- The rerun evidence may record selector labels, aggregate counts, command names, and pass/fail/block only.
- No private CSV content, account values, phone, password, organization public id, session, token, raw DOM, screenshot,
  trace, raw DB row, internal id, or Provider material may be recorded.

## Validation Plan

- `npm.cmd run test:unit -- tests/unit/phase-20-ra-01-04-employee-import.test.ts src/server/validators/employee-account.test.ts`
- `npm.cmd exec -- prettier --write --ignore-unknown <scoped docs>`
- `npm.cmd exec -- prettier --check --ignore-unknown <scoped docs>`
- `git diff --check`
- `git diff --name-only -- <blocked paths>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-5-employee-import-harness-repair-2026-07-04`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-chain-scenario-5-employee-import-harness-repair-2026-07-04 -SkipRemoteAheadCheck`

## Stop Rules

Stop if the source contract or tests contradict the CSV/`sourceFormat` repair, if validation fails, if a product source
change becomes necessary, if DB/browser/runtime is needed inside this repair task, or if any redaction boundary is at
risk.

## Next Task

After closeout, rerun Scenario 5 from the employee import node, preserving the already product-created advanced
`org_auth` and `org_advanced_admin` proof.
