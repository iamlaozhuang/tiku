# Phase 8 Admin Org Auth Redeem UI Task Plan

## Metadata

- Task id: `phase-8-admin-org-auth-redeem-ui`
- Branch: `codex/phase-8-admin-org-auth-redeem-ui`
- Base: `master`
- Created at: `2026-05-22T23:11:24+08:00`

## Required Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/02-architecture/interfaces/phase-8-product-surface-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-22-phase-8-admin-organization-org-auth-runtime.md`
- `docs/05-execution-logs/evidence/2026-05-22-phase-8-admin-redeem-code-runtime.md`

## Scope

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-22-phase-8-admin-org-auth-redeem-ui.md`
- `docs/05-execution-logs/evidence/2026-05-22-phase-8-admin-org-auth-redeem-ui.md`
- `src/app/(admin)/**`
- `src/features/admin/**`
- `tests/unit/**`
- `e2e/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `drizzle/**`

## Implementation Plan

1. Follow TDD: add a focused unit test for the admin organization, `org_auth`, employee, and `redeem_code` UI behavior before production code.
2. Add a client-side admin feature module under `src/features/admin/org-auth-redeem/` that:
   - reads the local session token from `localStorage` without rendering it;
   - validates the admin session through `/api/v1/sessions`;
   - loads `/api/v1/organizations`, `/api/v1/org-auths`, `/api/v1/employees`, and `/api/v1/redeem-codes` through bearer-authenticated REST APIs;
   - renders explicit loading, empty, unauthorized, and error states;
   - renders only public identifiers and API-provided masked `codeDisplay`;
   - never renders numeric ids, `code_hash`, plaintext card codes, passwords, session tokens, secrets, or API keys.
3. Add admin route pages:
   - `/ops/organizations` for organization, `org_auth`, and employee visibility.
   - `/ops/redeem-codes` for masked `redeem_code` visibility.
4. Extend E2E coverage only for the new admin pages and API redaction checks, then run `npm.cmd run test:e2e` because E2E changes are in scope.
5. Update task queue and project state through the task lifecycle, keeping changes task-scoped.

## Risk Controls

- No dependency, schema, migration, `.env.example`, production resource, or external service change.
- UI consumes existing runtime/API boundaries and does not bypass auth/session.
- API URLs use existing `/api/v1/*` route handlers and public identifiers only.
- Admin UI stays read-only; mutation controls are not activated in this task.
- Security review is not required by queue metadata, but evidence will include a data exposure and auth boundary self-check because the task touches admin authorization UI.

## Validation Plan

- `npm.cmd run test:unit -- tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts` for RED and GREEN evidence.
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npm.cmd run test:e2e`
