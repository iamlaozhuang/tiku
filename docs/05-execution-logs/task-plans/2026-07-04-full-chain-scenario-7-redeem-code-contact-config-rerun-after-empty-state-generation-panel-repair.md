# 2026-07-04 Full-Chain Scenario 7 Redeem Code Contact Config Rerun After Empty-State Generation Panel Repair

Status: active

## Task

- Task id: `full-chain-scenario-7-redeem-code-contact-config-rerun-after-empty-state-generation-panel-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-7-redeem-code-contact-config-rerun-after-empty-state-generation-panel-repair-2026-07-04`
- Source blocker: `full-chain-scenario-7-redeem-code-contact-config-2026-07-04`
- Prerequisite repair: `full-chain-scenario-7-redeem-code-empty-state-generation-panel-repair-2026-07-04`
- Restart node: Scenario 7 `redeem_code` generation node after the empty-list surface repair.
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Actor selector label: `fc_ops_admin_created_by_super_admin`
- Scenario selector label: `fc_scenario_7_redeem_code_contact_config`

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-02-ops-authorization-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-provider-cost-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-7-redeem-code-contact-config.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-7-redeem-code-contact-config.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-7-redeem-code-contact-config.md`
- `docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-7-redeem-code-empty-state-generation-panel-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-7-redeem-code-empty-state-generation-panel-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-7-redeem-code-empty-state-generation-panel-repair.md`
- `docs/05-execution-logs/evidence/phase-20-fix-ra-01-09-contact-config-runtime.md`
- `docs/05-execution-logs/evidence/2026-07-02-redeem-code-edition-plaintext-decision-doc-update.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-redeem-code-edition-plaintext-decision-doc-update.md`
- `src/app/(auth)/login/page.tsx`
- `src/app/api/v1/sessions/route.ts`
- `src/app/api/v1/redeem-codes/route.ts`
- `src/app/api/v1/redeem-codes/[publicId]/route.ts`
- `src/app/api/v1/contact-configs/route.ts`
- `src/server/auth/session-route.ts`
- `src/server/auth/session-cookie.ts`
- `src/server/auth/local-session-runtime.ts`
- `src/server/services/admin-redeem-code-runtime.ts`
- `src/server/repositories/admin-redeem-code-runtime-repository.ts`
- `src/server/validators/redeem-code.ts`
- `src/server/services/redeem-code-route.ts`
- `src/server/services/redeem-code-authorization-service.ts`
- `src/server/repositories/redeem-code-authorization-repository.ts`
- `src/server/services/contact-config-service.ts`
- `src/server/contracts/contact-config-contract.ts`
- `src/server/contracts/redeem-code-reference-contract.ts`
- `src/db/schema/auth.ts`
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- `src/features/admin/contact-config/AdminContactConfigPage.tsx`
- `tests/unit/phase-8-admin-redeem-code-runtime.test.ts`
- `tests/unit/phase-20-ra-01-09-contact-config-runtime.test.ts`
- `tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts`
- `C:/Users/jzzhu/.codex/skills/playwright/SKILL.md`

Private files are read only for selector lookup and private card handoff. Private values must not be copied into repo files, command output, or chat.

## Boundaries

- Allowed repo files: state, queue, this plan, evidence, and audit only.
- Allowed private input: `D:/tiku-local-private/acceptance/full-chain-isolated-db-account-plan-2026-07-04.md`.
- Allowed private output: `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/redeem-code/full-chain/redeem-code-selector-pack-2026-07-04.json`.
- Product runtime mutations: Scenario 7 single-card `redeem_code` generation only through supported product runtime.
- Card selector labels:
  - `fc_redeem_code_standard_activation`
  - `fc_redeem_code_advanced_activation`
  - `fc_redeem_code_edition_upgrade`
- Contact config scope: active readiness and ops surface access only; do not claim persistent contact mutation beyond current runtime behavior.
- Browser rule: run minimal hydrated/interactable login smoke before any product DB write, then keep API session, browser login form-state, and permission/surface boundary evidence separate.
- DB rule: selector-scoped read-only aggregate verification only; no raw rows, internal ids, destructive operations, schema, migration, or seed.
- Evidence rule: task id, branch, route/surface labels, selector labels, role labels, aggregate counts, command names, pass/fail/block, and redacted summaries only.

## Runtime Steps

1. Verify clean task branch, target DB label, runtime target alignment, and private selector presence without printing private values.
2. Start the local app with a redacted process-only runtime environment targeting `tiku_full_chain_acceptance_20260704_001`.
3. Run minimal browser login smoke on `login_surface` with hydrated/interactable readiness before private credential fill.
4. Log in as `fc_ops_admin_created_by_super_admin`.
5. Open `/ops/contact-config` and `/ops/redeem-codes` to verify ops-only contact/card surfaces.
6. Generate exactly one `personal_standard_activation`, one `personal_advanced_activation`, and one `edition_upgrade` card through the visible generation form and confirmation dialog.
7. Store plaintext values only in the approved private selector pack.
8. Verify non-ops and unauthenticated boundary surfaces do not expose global card creation or plaintext card surfaces.
9. Run selector-scoped aggregate DB verification by type/status count only.
10. Stop task-owned runtime, update evidence/audit/state/queue, and enter closeout freeze.

## Stop Rules

Stop and split repair/provisioning if any of these occur:

- Login readiness fails, DB target mismatches, private selector input is unavailable, or account-domain conflict appears.
- Generation controls are unreachable, disabled after valid input, or cannot submit the three explicit `redeem_code_type` values.
- Product runtime cannot create exactly one card for each required type.
- Plaintext card values cannot be captured only into the approved private file, or any evidence redaction risk appears.
- `content_admin`, organization admins, learners, or unauthenticated users can access global card creation or plaintext card surfaces.
- Source repair, schema/migration/seed, dependency change, Provider, staging/prod, Cost Calibration, destructive DB, release readiness, final Pass, or production usability claim is needed.

## Closeout Gates

- `powershell.exe -NoProfile -Command "<redacted Scenario 7 private selector and DB target preflight>"`
- `powershell.exe -NoProfile -Command "<local app startup with redacted process-only runtime env>"`
- `node - <redacted Scenario 7 hydrated browser login, contact readiness, card generation, private handoff, and permission boundary>"`
- `docker compose exec -T tiku-postgres psql <redacted selector-scoped aggregate verification>`
- `npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-7-redeem-code-contact-config-rerun-after-empty-state-generation-panel-repair.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-7-redeem-code-contact-config-rerun-after-empty-state-generation-panel-repair.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-7-redeem-code-contact-config-rerun-after-empty-state-generation-panel-repair.md`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-7-redeem-code-contact-config-rerun-after-empty-state-generation-panel-repair.md docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-7-redeem-code-contact-config-rerun-after-empty-state-generation-panel-repair.md docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-7-redeem-code-contact-config-rerun-after-empty-state-generation-panel-repair.md`
- `git diff --check`
- `git diff --name-only -- package.json package-lock.yaml package-lock.json pnpm-lock.yaml pnpm-workspace.yaml src tests e2e src/db/schema drizzle migrations seed scripts compose.yaml playwright-report test-results .next .runtime .env*`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-7-redeem-code-contact-config-rerun-after-empty-state-generation-panel-repair-2026-07-04`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-chain-scenario-7-redeem-code-contact-config-rerun-after-empty-state-generation-panel-repair-2026-07-04 -SkipRemoteAheadCheck`
