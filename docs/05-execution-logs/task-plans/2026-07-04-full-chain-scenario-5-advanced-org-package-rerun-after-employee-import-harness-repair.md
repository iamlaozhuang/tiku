# 2026-07-04 Full-chain Scenario 5 Advanced Org Package Rerun After Employee Import Harness Repair Plan

## Task

- Task id: `full-chain-scenario-5-advanced-org-package-rerun-after-employee-import-harness-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-5-advanced-org-package-rerun-after-employee-import-harness-repair-2026-07-04`
- Goal: rerun Scenario 5 from the employee import node after harness repair, preserving the advanced `org_auth` and
  `org_advanced_admin` product-created baseline already proven in the blocked Scenario 5 package.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-5-advanced-org-package.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-5-advanced-org-package.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-5-employee-import-harness-repair-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-5-employee-import-harness-repair-rerun.md`
- `src/app/(auth)/login/page.tsx`
- `src/app/api/v1/sessions/route.ts`
- `src/app/api/v1/employees/import/route.ts`
- `src/app/api/v1/org-auths/route.ts`
- `src/app/api/v1/admin-accounts/route.ts`
- `src/server/auth/session-cookie.ts`
- `src/server/services/admin-organization-org-auth-runtime.ts`
- `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`
- `src/server/contracts/admin-user-org-auth-ops-contract.ts`
- `src/server/services/admin-flow-runtime.ts`
- `src/features/admin/organization-portal/AdminOrganizationPortalPage.tsx`
- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx`
- `C:/Users/jzzhu/.codex/skills/playwright/SKILL.md`
- `C:/Users/jzzhu/.codex/plugins/cache/openai-bundled/browser/26.623.101652/skills/control-in-app-browser/SKILL.md`

Private files are allowed for in-memory use only:

- `D:/tiku-local-private/acceptance/full-chain-isolated-db-account-plan-2026-07-04.md`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/employee-import/advanced-employee-import-selector.json`
- `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/employee-import/advanced-employee-import.csv`

## Runtime Scope

- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Actor selector label: `fc_ops_admin_created_by_super_admin`
- Scenario selector label: `fc_scenario_5_advanced_org_package`
- Advanced org admin selector label: `fc_org_advanced_admin_created_by_ops`
- Advanced employee selector label: `fc_org_advanced_employee_batch`
- Restart node: `scenario_5_employee_import_node`
- Preserve already-created Scenario 5 advanced `org_auth` and `org_advanced_admin`; do not recreate them.
- Build employee import CSV in memory by combining private CSV rows with the resolved target organization public label/id.

## Evidence Rules

Allowed evidence: task id, branch, route/surface labels, selector labels, role labels, aggregate counts, command names,
pass/fail/block, and redacted summaries.

Forbidden evidence: credentials, account private values, phone, email, connection strings, tokens, sessions, cookies,
localStorage, Authorization headers, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payloads, raw
Prompt, raw AI I/O, full materials, questions, papers, employee answers, plaintext card values, or private fixture
contents.

## Validation

1. Verify private selector shape and target DB readiness without values.
2. Start local app against `tiku_full_chain_acceptance_20260704_001`.
3. Establish product runtime session for `ops_admin` through the approved local login/session flow.
4. Verify existing advanced `org_auth`, advanced admin, and binding aggregates.
5. Import six advanced employees through `/api/v1/employees/import` using `content` plus `sourceFormat`.
6. Verify advanced employee aggregate counts.
7. Establish `org_advanced_admin` session and check advanced organization surfaces without Provider execution.
8. Check standard org admin denied advanced surfaces and advanced org admin denied global ops/content surfaces.
9. Stop local runtime, then run scoped formatting, diff, Module Run v2 hardening, and pre-push readiness.

## Stop Rules

Stop and split repair/provisioning on login failure, DB target mismatch, private input missing/malformed, account-domain
conflict, employee import reject rows, permission bypass, redaction risk, source repair need, schema/migration/seed need,
Provider/staging/prod/Cost need, destructive DB action, dependency/lockfile change, or release/final/production claim
pressure.

## Stop Outcome

- Result: `blocked_requires_source_repair_login_input_state_binding`
- Passed before stop: explicit isolated DB startup, product API sessions, Scenario 5 employee import, and
  selector-scoped aggregate verification.
- Blocked node: browser/e2e login surface state binding. Valid input values did not enable submit, so advanced
  organization surface and role-boundary checks must wait for a source repair.
- Next required task: `full-chain-login-input-state-binding-repair-2026-07-04`
