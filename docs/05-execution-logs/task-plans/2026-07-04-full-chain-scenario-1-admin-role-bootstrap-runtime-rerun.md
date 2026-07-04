# 2026-07-04 Full-chain Scenario 1 Admin Role Bootstrap Runtime Rerun

## Task

- Task id: `full-chain-scenario-1-admin-role-bootstrap-runtime-rerun-2026-07-04`
- Branch: `codex/full-chain-scenario-1-admin-role-bootstrap-runtime-rerun-2026-07-04`
- Goal: prove bootstrap `super_admin` creates `ops_admin` and `content_admin` through the product runtime flow in the isolated local DB.
- Restart point: affected Scenario 1 node after source repair and private input provisioning.

## Approval And Boundary

- Approval source: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`.
- Covered: local app startup, browser/e2e automation, private credentials in memory only, product login, product account creation flow, selector-scoped aggregate DB verification, redacted evidence/audit, commit, fast-forward merge to `master`, push `origin/master`, delete merged short branch, and Scenario 2 continuation.
- Not covered: repository secret values, screenshots, raw DOM, traces, raw DB rows, internal ids, source/test change, schema/migration/seed, Provider, staging/prod/cloud/deploy/payment/external service, Cost Calibration, release readiness, final Pass, or production usability claim.

## Read Gate

Governance and architecture:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `C:/Users/jzzhu/.codex/skills/playwright/SKILL.md`

Scenario SSOT and evidence:

- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-1-admin-input-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-1-admin-input-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-1-admin-account-creation-flow-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-1-admin-account-creation-flow-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`

Runtime source references:

- `src/app/(auth)/login/page.tsx`
- `src/app/(admin)/ops/users/page.tsx`
- `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
- `src/app/api/v1/admin-accounts/route.ts`
- `src/server/services/admin-flow-runtime.ts`
- `src/server/repositories/admin-flow-runtime-repository.ts`
- `e2e/credential-backed-8-role-local-acceptance.spec.ts`
- `e2e/local-full-loop-baseline-accounts-auth-db.spec.ts`

Private input presence:

- Bootstrap credential selector field presence.
- Scenario 1 admin input selector field presence.

## Execution Plan

1. Confirm runtime DB target resolves to `tiku_full_chain_acceptance_20260704_001` without printing the connection string.
2. Start local app on a localhost port with redacted environment output.
3. Run browser automation with credentials read into memory only.
4. Navigate `/login`, log in as `fc_bootstrap_super_admin`, and reach `/ops/users`.
5. Create `ops_admin` and `content_admin` through the visible product surface backed by `/api/v1/admin-accounts`.
6. Perform selector-scoped aggregate DB verification for target roles and forbidden scenario families.
7. Write redacted evidence and audit.

## Validation

- `powershell.exe -NoProfile -Command "<redacted runtime DB target check>"`
- `powershell.exe -NoProfile -Command "<local dev server start with redacted env>"`
- `powershell.exe -NoProfile -Command "<browser product flow with private credentials in memory>"`
- `powershell.exe -NoProfile -Command "<selector-scoped aggregate DB verification>"`
- `npm.cmd exec -- prettier --write --ignore-unknown <changed governance files>`
- `npm.cmd exec -- prettier --check --ignore-unknown <changed governance files>`
- `git diff --check`
- `git diff --name-only -- <blocked repo paths>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-1-admin-role-bootstrap-runtime-rerun-2026-07-04`

## Stop Rules

Stop and split repair/provisioning if login fails, runtime DB target mismatches, private inputs are missing, account-domain collision occurs, authorization bypass is detected, redaction risk appears, dev-server/browser failure cannot be diagnosed inside scope, audit is missing, or execution requires source/test repair, schema/migration/seed, Provider/staging/prod/Cost, dependency change, destructive DB operation, release readiness, final Pass, or production usability claim.

## Stop-on-fail Outcome

- Result: blocked.
- Stop category: source repair required.
- Reason: `/ops/users` reached the page after successful bootstrap login, but the admin account creation panel was not rendered because the bootstrap-only isolated DB makes all operational lists empty and the page does not include the authenticated `super_admin` role context in its ready-state decision.
- Restart rule: after the repair task is merged and pushed, rerun Scenario 1 from the affected `/ops/users` node.

## Evidence Redaction

Evidence may record only task id, branch, route/surface labels, selector labels, role labels, aggregate counts, command names, pass/fail/block, and redacted summary.

Evidence must not record account values, passwords, phone numbers, email addresses, connection strings, tokens, sessions, cookies, `localStorage`, Authorization headers, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payloads, raw prompts, raw AI I/O, full material/question/paper content, plaintext card values, or private fixture contents.
