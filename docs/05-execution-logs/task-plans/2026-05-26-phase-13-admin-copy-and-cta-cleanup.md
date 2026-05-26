# Phase 13 Admin Copy And CTA Cleanup Task Plan

**Task id:** `phase-13-admin-copy-and-cta-cleanup`

**Branch:** `codex/phase-13-admin-copy-and-cta-cleanup`

**Date:** 2026-05-26

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/global-db-api-skeleton.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/01-requirements/modules/01-admin-user-auth.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-admin-experience-gap-scan.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-auth-organization-boundary-gap-scan.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-experience-gap-closeout-plan.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Queue Scope

### allowedFiles

- `src/features/admin/**`
- `src/components/admin/**`
- `tests/unit/**`
- `e2e/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`

### blockedFiles

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/db/schema/**`
- `drizzle/**`

## Task Range

Fix the Phase 12 admin copy and CTA gaps:

- `ADM-GAP-001`: production/local admin pages still show staging-only required-role copy.
- `ADM-GAP-002`: ops pages use prominent CTAs that detour to `/ops/users` instead of the inline org_auth/redeem_code forms.
- `ADM-GAP-004`: content paper page shows a prominent disabled top action toolbar for row-only actions.
- `AUTH-GAP-003`: shared admin unauthorized copy says content backend even on non-content admin surfaces.

No API behavior, schema, dependency, package, env, provider, cloud, staging, or prod changes are in scope.

## Implementation Plan

1. Update failing unit/e2e expectations first for production/local admin copy and CTA behavior.
2. Make `AdminUnauthorizedState` context-neutral.
3. Replace staging-only labels with local/production readiness wording while preserving stable test ids.
4. Change ops entry CTAs to target the inline sections instead of `/ops/users`.
5. Remove or simplify the disabled top-level paper toolbar so the page directs users to row-level actions without prominent disabled command buttons.
6. Keep all existing runtime handlers and REST calls unchanged.

## Browser Validation Plan

Run Playwright on localhost and verify:

- `/ops/organizations` and `/ops/redeem-codes` no longer show staging-only copy and their primary CTA targets stay on-page.
- `/content/questions` no longer shows staging-only copy.
- `/content/papers` does not expose prominent disabled top-level row action buttons before row context; row-level actions remain visible.
- Existing route guard and content action e2e flows still pass.

## Code Cross-Check Paths

- `src/features/admin/content-admin-runtime.tsx`
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- `src/features/admin/paper-management/AdminPaperManagementClient.tsx`
- `tests/unit/admin-content-knowledge-ops-baseline.test.ts`
- `tests/unit/admin-user-org-auth-ops-baseline.test.ts`
- `tests/unit/admin-paper-ui.test.ts`
- `e2e/staging-required-role-flows.spec.ts`
- `e2e/content-action-closures.spec.ts`

## Risk Defense

- Preserve `data-testid` values unless a test deliberately validates replacement behavior.
- Do not change API URLs, DTOs, mutation handlers, auth guards, or database calls.
- Avoid adding new abstractions beyond small copy/CTA adjustments.
- Keep disabled-state improvements limited to the top-level paper action toolbar; row-level guarded actions remain unchanged.

## Validation Commands

- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Sensitive Information Red Lines

- Do not read, modify, or output `.env.local` or `.env.example`.
- Do not connect to staging, prod, cloud, or a real provider.
- Do not record secrets, tokens, Authorization headers, database URLs, raw prompt, raw answer, raw model response, raw provider payload, full paper content, full teaching material, OCR full text, or private customer-like data.
