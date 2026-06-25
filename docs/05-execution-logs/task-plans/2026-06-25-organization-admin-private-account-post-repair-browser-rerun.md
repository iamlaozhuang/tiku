# Task Plan: organization-admin-private-account-post-repair-browser-rerun-2026-06-25

## Task Boundary

- Task id: `organization-admin-private-account-post-repair-browser-rerun-2026-06-25`.
- Branch: `codex/org-admin-post-repair-rerun-20260625`.
- Approval source: current user approval on 2026-06-25.
- Scope: local real browser post-repair rerun for the old/private `org_standard_admin` and `org_advanced_admin` accounts. Owner enters credentials manually.
- Not approved: `.env*`, credential/private account files, Codex credential entry, DB write/seed/schema, source or e2e file changes, screenshots/traces, Provider, staging/prod, payment, external services, PR/force push, and final MVP Pass.

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
- `docs/05-execution-logs/evidence/2026-06-25-organization-admin-private-account-state-reconciliation.md`.
- `docs/05-execution-logs/evidence/2026-06-25-default-tiku-db-organization-admin-schema-seed-alignment.md`.
- `src/server/contracts/user-auth/session-boundary.ts`.
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`.

## Route Matrix

- `/organization/portal`
- `/organization/organization-training`
- `/organization/organization-analytics`
- `/organization/ai-question-generation`
- `/organization/ai-paper-generation`
- `/ops/users`
- `/ops/redeem-codes`
- `/content/papers`
- logout back to `/login`

## Execution Plan

1. Confirm local server availability.
2. Open headed browser and ask owner to manually log into old/private `org_standard_admin`.
3. Record sanitized session role/binding/landing and route matrix.
4. Logout and repeat for old/private `org_advanced_admin`.
5. Write redacted evidence/audit, validate docs gates, commit, merge, push, and cleanup.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-25-organization-admin-private-account-post-repair-browser-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-25-organization-admin-private-account-post-repair-browser-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-25-organization-admin-private-account-post-repair-browser-rerun.md`.

## Validation Commands

- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-organization-admin-private-account-post-repair-browser-rerun.md docs/05-execution-logs/evidence/2026-06-25-organization-admin-private-account-post-repair-browser-rerun.md docs/05-execution-logs/audits-reviews/2026-06-25-organization-admin-private-account-post-repair-browser-rerun.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-private-account-post-repair-browser-rerun-2026-06-25`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-private-account-post-repair-browser-rerun-2026-06-25 -SkipRemoteAheadCheck`
