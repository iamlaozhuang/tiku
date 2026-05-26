# Phase 13 Auth Route Guard Negative E2E Task Plan

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/01-requirements/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-experience-gap-closeout-plan.md`

## Queue Scope

- Task id: `phase-13-auth-route-guard-negative-e2e`
- Source gaps: `AUTH-GAP-001`, `AUTH-GAP-002`
- Dependency: `phase-12-experience-gap-closeout-plan` is already closed.
- Human approval: current local follow-up claim only; use synthetic/local data only.

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

- Add negative browser coverage for unauthenticated student routes beyond the current representative `/home` check.
- Add negative browser coverage for a stale/invalid local session token on a protected student route.
- Do not change the auth permission model, runtime source, API shape, schema, dependencies, or env files.

## Implementation Plan

1. Extend `e2e/local-auth-route-guard.spec.ts` with deterministic student route cases for `/practice`, `/mock-exam`, `/exam-report`, `/mistake-book`, `/profile`, and `/redeem-code`.
2. Add an invalid local session test that verifies the session boundary is called, the user is redirected to `/login`, protected chrome is not rendered, and the synthetic token is not visible in the DOM.
3. Keep assertions focused on browser-visible behavior and standard guard outcomes.

## Browser Verification Plan

- Use Playwright against localhost through `npm.cmd run test:e2e -- e2e/local-auth-route-guard.spec.ts`.
- Then run the full queue validation command `npm.cmd run test:e2e`.
- Browser paths: `/practice?paperPublicId=paper-dev-theory`, `/mock-exam?paperPublicId=paper-dev-theory`, `/exam-report`, `/mistake-book`, `/profile`, `/redeem-code`, and `/home` with an invalid synthetic token.

## Code Cross-Check Paths

- `e2e/local-auth-route-guard.spec.ts`
- `tests/unit/protected-route-guard-ui.test.ts`
- `src/components/ProtectedRouteGuard/ProtectedRouteGuard.tsx`
- `src/components/StudentAppLayout/StudentAppLayout.tsx`
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`

## Risk Defense

- Use only local synthetic credentials/tokens and do not record Authorization headers.
- Do not read or modify `.env.local` or `.env.example`.
- Do not change `src/**` runtime files for this coverage task.
- Do not expose numeric ids; use existing public-id route/query examples only.
- If a runtime behavior gap appears, stop and record it instead of changing blocked auth model files without approval.

## Validation Commands

- `npm.cmd run test:e2e`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Sensitive Information Red Lines

- Do not record secret, token, Authorization header, database URL, raw provider payload, raw prompt, raw answer, raw model response, complete paper content, OCR full text, or customer/private data.
