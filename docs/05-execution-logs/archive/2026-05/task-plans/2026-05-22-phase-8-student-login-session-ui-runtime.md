# Phase 8 Student Login Session UI Runtime Task Plan

## Task

Claim and implement `phase-8-student-login-session-ui-runtime`.

## Branch

`codex/phase-8-student-login-session-ui-runtime`

Phase 8 queue seed PR #27 is integrated into `master` at `54ce0e4`.
This branch is rebased on the updated `master`.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/02-architecture/interfaces/phase-8-product-surface-contract.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/project-state.yaml`

## Current Finding

- `src/app/(auth)/login/page.tsx` is still a placeholder page.
- `src/app/api/v1/sessions/route.ts` already exposes `GET` and `POST` through `createLocalSessionRouteHandlers`.
- `src/server/auth/local-session-runtime.ts` already loads `.env.local`, uses the local PostgreSQL runtime, verifies passwords, creates single active sessions, and resolves current sessions.
- `e2e/local-business-flow.spec.ts` currently logs in through browser `fetch('/api/v1/sessions')`, not through form interaction.

## Implementation Approach

- Keep the existing `/api/v1/sessions` runtime boundary.
- Replace the login placeholder with a client-capable login UI that posts to `/api/v1/sessions`.
- Store only the returned session token in browser-owned local state needed for the local MVP flow; do not render or log the token.
- Add role-aware next-step navigation for student and admin users based on the returned user context.
- Preserve standard API response handling and show explicit invalid credential/runtime unavailable states.
- Add browser/E2E coverage for student and admin login through the UI, while keeping API/database checks as helper evidence only.

## Implementation Result

- Replaced the placeholder login page with a client-side form that posts to `/api/v1/sessions`.
- Added loading, invalid credential, locked account, runtime unavailable, and disabled-submit states.
- Redirected student users to `/home` and admin-role users to `/ops/users` based on returned user context.
- Updated local business flow E2E to use visible form interaction for student and admin login.
- Added unit tests for login UI state and role-aware redirect behavior.

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-22-phase-8-student-login-session-ui-runtime.md`
- `docs/05-execution-logs/evidence/2026-05-22-phase-8-student-login-session-ui-runtime.md`
- `docs/05-execution-logs/audits-reviews/2026-05-22-phase-8-student-login-session-ui-runtime-security-review.md`
- `src/app/(auth)/login/**`
- `src/app/api/v1/sessions/**`
- `src/server/auth/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- `e2e/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `drizzle/**`

## Security Controls

- Do not expose session tokens in visible UI, logs, screenshots, evidence payloads, or serialized admin/student response assertions.
- Do not add CAPTCHA, external login, SMS, email, real 2FA, or real provider dependencies.
- Do not weaken lockout, invalid credential, or session expiry behavior.
- Do not add production/staging secrets or environment variables.
- Keep security review evidence before closing the implementation task.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-8-student-login-session-ui-runtime`
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `npm.cmd run build`
- `npm.cmd run test:e2e`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
