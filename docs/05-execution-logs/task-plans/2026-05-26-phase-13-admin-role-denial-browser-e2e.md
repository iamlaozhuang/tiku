# Phase 13 Admin Role Denial Browser E2E Task Plan

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/01-requirements/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-experience-gap-closeout-plan.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-auth-organization-boundary-gap-scan.md`

## Queue Scope

- Task id: `phase-13-admin-role-denial-browser-e2e`
- Source gap: `AUTH-GAP-004`
- Dependency: `phase-13-auth-route-guard-negative-e2e` is already closed.
- Human approval: local follow-up claim only; do not change the permission model unless separately approved.

## Allowed Files

- `e2e/**`
- `tests/unit/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`

## Blocked Files

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/db/schema/**`
- `drizzle/**`

## Task Scope

- Add browser E2E coverage for restricted admin profiles using synthetic local fixtures.
- Verify that `content_admin` receives standard denial on system-ops surfaces and does not see system mutation controls.
- Verify that `ops_admin` receives standard denial on content authoring surfaces and does not see content mutation controls.
- Do not change runtime source, role policy, schema, dependencies, env files, or real data.

## Implementation Plan

1. Add `e2e/admin-role-denial-browser.spec.ts`.
2. Use Playwright route fixtures to provide redaction-safe synthetic `/api/v1/sessions` payloads for `content_admin` and `ops_admin`.
3. Fulfill restricted surface API calls with standard 403 envelopes that match existing server error codes.
4. Assert browser-visible denial behavior, absence of restricted mutation controls, and absence of synthetic token leakage.

## Browser Verification Plan

- Focused: `npm.cmd run test:e2e -- e2e/admin-role-denial-browser.spec.ts`.
- Full: `npm.cmd run test:e2e`.
- Browser paths: `/ops/organizations` as `content_admin`, `/content/questions` as `ops_admin`.

## Code Cross-Check Paths

- `e2e/admin-role-denial-browser.spec.ts`
- `e2e/local-auth-route-guard.spec.ts`
- `src/components/ProtectedRouteGuard/ProtectedRouteGuard.tsx`
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`

## Risk Defense

- Use only synthetic browser fixtures; do not create, delete, or rewrite local business records.
- Do not read or modify `.env.local` or `.env.example`.
- Do not record synthetic token values beyond proving they are hidden from the DOM.
- Do not alter permission model or runtime implementation.
- Record model-config browser denial as deferred if the model management UI is not yet mounted in this task's dependency order.

## Validation Commands

- `npm.cmd run test:e2e`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Sensitive Information Red Lines

- Do not record secret, token, Authorization header, database URL, raw provider payload, raw prompt, raw answer, raw model response, complete paper content, OCR full text, or customer/private data.
