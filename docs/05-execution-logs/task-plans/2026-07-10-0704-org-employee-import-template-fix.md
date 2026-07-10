# 2026-07-10 0704 Org Employee Import Template Fix Plan

## Scope

- taskId: `0704-org-employee-import-template-fix-2026-07-10`
- branch: `codex/0704-org-employee-import-template-fix`
- task type: priority implementation repair
- goal: close the employee roster import capability gap found by `0704-org-employee-import-acceptance-2026-07-10`

## Read Baseline

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-1-operations-and-super-admin.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-org-employee-import-acceptance-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-10-0704-org-employee-import-acceptance-audit.md`

## Private Readiness

- private index path: `D:\tiku-local-private\acceptance\0704-role-credential-index.private.md`
- mode: metadata-only
- required result: 9 core role labels found
- credential values: not output, not written, not committed

## Implementation Plan

1. Add a no-dependency roster file upload entry for spreadsheet-compatible CSV/TSV files in the operations employee import panel.
2. Add a downloadable CSV template with only `phone`, `name`, and optional `initialPassword` fields.
3. Extend pre-submit preview with inherited authorization and quota-impact categories derived from selected organization and loaded `org_auth` summaries.
4. Keep import templates blocked if they contain `profession`, `level`, `edition`, `orgAuthScopePublicId`, or employee-level authorization fields.
5. Extend import rejection reason contract and UI labels for safe categories that the current service or future repository can return.
6. Raise the no-dependency import row ceiling to the documented first-release 500 rows.
7. Add targeted tests for template download, file upload parsing, preview categories, safe reason labels, and row ceiling.

## Boundaries

- No dependency, package, lockfile, schema, migration, seed, DB, Provider, env/secret, staging/prod/deploy, screenshot, raw DOM, or Cost Calibration action.
- No credential, password, session, token, DB row, internal numeric id, raw employee row, plaintext `redeem_code`, raw Prompt, Provider payload, raw AI output, full question, paper, material, resource, or chunk in evidence.
- Browser/dev-server execution remains blocked by the queued task; validation uses targeted unit/contract tests only.

## Validation Commands

- `corepack pnpm@10.26.1 vitest run tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-20-ra-01-04-employee-import.test.ts tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts src/server/validators/employee-account.test.ts src/server/services/employee-account-service.test.ts src/server/services/employee-account-route.test.ts`
- `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/project-state.yaml docs/05-execution-logs/task-plans/2026-07-10-0704-org-employee-import-template-fix.md docs/05-execution-logs/evidence/2026-07-10-0704-org-employee-import-template-fix-evidence.md docs/05-execution-logs/audits-reviews/2026-07-10-0704-org-employee-import-template-fix-audit.md src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx src/server/contracts/admin-user-org-auth-ops-contract.ts src/server/services/admin-organization-org-auth-runtime.ts src/server/validators/employee-account.ts src/server/validators/employee-account.test.ts src/server/services/employee-account-service.ts src/server/services/employee-account-service.test.ts src/server/services/employee-account-route.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-20-ra-01-04-employee-import.test.ts tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts`
- `git diff --check`
- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-org-employee-import-template-fix-2026-07-10`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-org-employee-import-template-fix-2026-07-10 -SkipRemoteAheadCheck`

## Adversarial Review Focus

- Role boundary: employee import remains platform `ops_admin` / `super_admin` owned.
- Data boundary: import rows do not carry employee-level authorization scopes.
- Authorization boundary: employee capability comes from active `org_auth`, not imported fields or cached UI state.
- Sensitive data: generated initial passwords appear only in the one-time result window and never in evidence.
- Standard/advanced boundary: imported employees do not manually receive `edition`; standard/advanced capability is inherited from org authorization.
