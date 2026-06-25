# Task Plan: organization-admin-runtime-effective-role-source-db-and-browser-verification-approval-2026-06-25

## Task Boundary

- Task id: `organization-admin-runtime-effective-role-source-db-and-browser-verification-approval-2026-06-25`.
- Branch: `codex/org-admin-db-account-browser-rerun-20260625`.
- Task kind: `acceptance_runtime_walkthrough_with_local_db_account_repair`.
- Approval source: current user message on 2026-06-25 approving DB/account-state read-only diagnosis, necessary seed/account repair, and real browser rerun.
- Scope: local development only. Diagnose the real local account state behind the owner-entered `org_standard_admin` and `org_advanced_admin` rows, apply the smallest local seed/account repair if the diagnostic proves it is required, then rerun the real browser organization admin acceptance checks.
- Not approved: `.env*` reads or edits, credential/private account file reads, credential capture or Codex-entered passwords, schema/migration, destructive DB reset/drop/truncate, dependency or lockfile changes, Provider/model/cost work, staging/prod/cloud/deploy, payment/external services, PR/force push, and final standard/advanced MVP Pass.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/01-user-auth.md`.
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-hydration-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-hydration-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-25-organization-admin-runtime-effective-role-source-repair.md`.

## Requirement Decision Map

- Role-separated MVP alignment requires `org_standard_admin` and `org_advanced_admin` to land in a first-class organization admin workspace, not global ops.
- `org_standard_admin` may manage employees and view organization authorization/status only.
- `org_advanced_admin` may additionally access organization training and organization-owned AI question/paper generation entries.
- Organization admin authority must be scoped to the bound `organization`; UI visibility is not an authorization boundary.
- Runtime acceptance remains blocked until the real browser allow/deny behavior passes with redacted evidence.

## Requirement Mapping

| Requirement                    | Planned verification                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Organization admin role source | Read local account-state summaries for the relevant admin rows without recording secrets or raw rows.        |
| Organization binding           | Confirm whether each organization admin has a usable `admin_organization -> organization` binding.           |
| Landing                        | Browser rerun must observe post-login route for both roles.                                                  |
| Organization workspace allow   | Browser rerun must check `/organization/portal` for both roles and advanced routes for `org_advanced_admin`. |
| Unrelated workspace denial     | Browser rerun must check global ops and content surfaces remain denied for organization admins.              |
| Logout                         | Browser rerun must verify visible logout returns to `/login`.                                                |

## Evidence-Only Sources

- Prior runtime rerun evidence documents are used only to recover observed failures and expected route checks.
- Prior source repair evidence is used only to identify what source-level behavior has already been fixed.
- Runtime and DB evidence for this task must be redacted summaries only: role label, account-state class, binding present/missing, command pass/fail, route outcome, and strict row result.

## Conflict Check

- No requirement conflict found. Requirements, traceability, and prior evidence agree that the remaining gap is runtime account-state/browser proof after the `local-session-runtime` source repair.
- The user approval expands the previously blocked DB/seed/browser gates for this task only, local development only.
- `.env*`, credential/private account files, schema/migration, destructive database operations, Provider, staging/prod, payment, external services, and final Pass remain blocked.

## Execution Plan

1. Inspect existing local DB and seed scripts without reading `.env*` or credentials.
2. Run a redacted local DB/account-state diagnostic for organization admin rows.
3. If the diagnostic shows stale/missing local account role or organization binding state, apply the smallest local seed/account repair using approved local development data only.
4. Rerun the diagnostic and record only redacted summaries.
5. Rerun real browser organization admin checks for `org_standard_admin` and `org_advanced_admin`. Owner/manual credential entry is allowed; Codex must not read or type passwords.
6. Write evidence and audit review with pass/fail route summaries, residual risks, and no final MVP Pass claim.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-25-organization-admin-runtime-effective-role-source-db-and-browser-verification-approval.md`.
- `docs/05-execution-logs/evidence/2026-06-25-organization-admin-runtime-effective-role-source-db-and-browser-verification-approval.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-25-organization-admin-runtime-effective-role-source-db-and-browser-verification-approval.md`.
- `src/db/dev-seed.ts` only if a seed source defect is proven and repair is necessary.
- `src/db/dev-seed.test.ts` only if `src/db/dev-seed.ts` changes.

## Blocked Files And Actions

- `.env*`, credential/private account files, `package.json`, lockfiles, `src/db/schema/**`, `drizzle/**`, `e2e/**`, `playwright-report/**`, `test-results/**`, `.next/**`, Provider/staging/prod/payment/external-service files.
- No schema/migration or `drizzle-kit push`.
- No destructive DB reset/drop/truncate/delete beyond a separately approved local destructive task.
- No credential values, session tokens, cookies, localStorage, raw DB rows, database URLs, Authorization headers, or screenshots in committed evidence.

## Validation Commands

- `npm.cmd run test:unit -- src/server/auth/local-session-runtime.test.ts src/db/dev-seed.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-organization-admin-runtime-effective-role-source-db-and-browser-verification-approval.md docs/05-execution-logs/evidence/2026-06-25-organization-admin-runtime-effective-role-source-db-and-browser-verification-approval.md docs/05-execution-logs/audits-reviews/2026-06-25-organization-admin-runtime-effective-role-source-db-and-browser-verification-approval.md src/db/dev-seed.ts src/db/dev-seed.test.ts`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-runtime-effective-role-source-db-and-browser-verification-approval-2026-06-25`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-runtime-effective-role-source-db-and-browser-verification-approval-2026-06-25 -SkipRemoteAheadCheck`

## Closeout Policy

- Local commit: approved by the current task approval if validation passes.
- Merge, push, and cleanup: fresh closeout approval required unless the user explicitly expands this task approval later.
- No final standard/advanced MVP Pass claim.

## Execution Delta

- Manual headed-browser login was attempted first for `org_standard_admin` and timed out after 180 seconds with no post-login evidence.
- A second headed-browser rerun used synthetic local dev seed fixture credentials from `src/db/dev-seed.ts` for the two organization admin fixture rows. Credential values were not printed, persisted in evidence, or copied into docs.
- No `.env*`, private account files, database URLs, cookies, tokens, localStorage, screenshots, traces, raw DB rows, or publicId detail were read or recorded.
- No seed/account write was executed because the only candidate local DB with current org admin schema already had one active `org_standard_admin` row, one active `org_advanced_admin` row, and one organization binding for each.
