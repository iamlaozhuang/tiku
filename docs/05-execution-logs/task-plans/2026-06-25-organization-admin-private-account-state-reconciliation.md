# Task Plan: organization-admin-private-account-state-reconciliation-2026-06-25

## Task Boundary

- Task id: `organization-admin-private-account-state-reconciliation-2026-06-25`.
- Branch: `codex/org-admin-private-account-reconcile-20260625`.
- Approval source: current user serial approval on 2026-06-25 for task 2 after task 1 closeout.
- Scope: local-only private/old owner-entered `org_standard_admin` and `org_advanced_admin` account-state diagnosis, necessary targeted account role/binding repair, and manual browser rerun.
- Not approved: `.env*`, private credential/account files, Codex credential entry, credential capture, token/cookie/localStorage capture, raw DB row evidence, schema/migration, destructive DB reset/drop/truncate, bulk ops admin reclassification, dependency changes, Provider, staging/prod, payment, external services, PR/force push, and final MVP Pass.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/05-execution-logs/evidence/2026-06-25-organization-admin-runtime-effective-role-source-db-and-browser-verification-approval.md`.
- `src/server/contracts/user-auth/session-boundary.ts`.
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`.
- `src/server/auth/local-session-runtime.ts`.

## Requirement Mapping

| Requirement                | Planned verification                                                                                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Private org admin identity | Owner manually logs in; Codex observes only sanitized session role, binding presence, and a short non-secret account correlation token if needed for local DB update. |
| Role source                | Confirm session `adminRoles` for each private account.                                                                                                                |
| Organization binding       | Confirm session organization binding is present or missing.                                                                                                           |
| Targeted repair            | If and only if an exact local account can be safely identified, update only that account's `admin_role` and/or `admin_organization` binding.                          |
| Browser rerun              | After any repair, rerun the same route allow/deny matrix.                                                                                                             |

## Execution Plan

1. Confirm local repo and server state.
2. Run manual headed browser observation for the private `org_standard_admin` and `org_advanced_admin` accounts. Owner enters credentials.
3. If login succeeds and the session already shows correct org role/binding, record pass and no DB write.
4. If login succeeds but session shows stale `ops_admin` or missing binding, correlate to exactly one local account row using approved local DB diagnostics without recording secret values.
5. Apply the smallest targeted local account-state repair only if account identity is exact and unambiguous.
6. Rerun manual browser observation.
7. Write evidence/audit, validate, commit, merge, push, and cleanup before starting task 3.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-25-organization-admin-private-account-state-reconciliation.md`.
- `docs/05-execution-logs/evidence/2026-06-25-organization-admin-private-account-state-reconciliation.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-25-organization-admin-private-account-state-reconciliation.md`.

## Blocked Files And Actions

- `.env*`, private credential/account files, `package.json`, lockfiles, `src/db/schema/**`, `drizzle/**`, `e2e/**`, scripts, Provider/staging/prod/payment/external-service files.
- No schema/migration or destructive DB reset/drop/truncate.
- No broad update of `ops_admin` rows without exact private account identity.
- No credential, token, cookie, localStorage, raw DB row, database URL, screenshot, or trace in evidence.

## Validation Commands

- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-organization-admin-private-account-state-reconciliation.md docs/05-execution-logs/evidence/2026-06-25-organization-admin-private-account-state-reconciliation.md docs/05-execution-logs/audits-reviews/2026-06-25-organization-admin-private-account-state-reconciliation.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-private-account-state-reconciliation-2026-06-25`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-private-account-state-reconciliation-2026-06-25 -SkipRemoteAheadCheck`
