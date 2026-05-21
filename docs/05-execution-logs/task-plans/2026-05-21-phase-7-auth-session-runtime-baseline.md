# Task Plan: Phase 7 Auth Session Runtime Baseline

## Metadata

- Task id: `phase-7-auth-session-runtime-baseline`
- Branch: `codex/phase-7-auth-session-runtime-baseline`
- Base branch: `master`
- Plan date: 2026-05-21
- Scope: P0 auth session runtime baseline for `GET /api/v1/sessions` and `POST /api/v1/sessions`.

## Required Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/sop/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-21-phase-7-dev-database-migration-and-seed-baseline.md`

## Queue Scope

Allowed implementation files:

- `src/app/api/v1/sessions/**`
- `src/server/auth/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`

Allowed process files:

- this task plan
- task evidence
- security review artifact
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `drizzle/**`
- `.env.example`

## Implementation Approach

1. Keep the runtime slice narrow: only replace the unavailable session route wiring for `GET /api/v1/sessions` and `POST /api/v1/sessions`.
2. Do not add registration, broader authorization listing, student paper runtime, admin runtime, audit logging, AI logging, or schema/migration changes.
3. Add RED unit tests for a local session runtime factory that proves:
   - seeded credential login creates a single active opaque bearer session through the existing service contract;
   - `GET /api/v1/sessions` resolves the current user context without returning the session token;
   - inactive or expired sessions/users resolve to the existing standard unauthorized response.
4. Implement the minimum local adapters behind existing boundaries:
   - local PostgreSQL connection loader using `.env.local` only at runtime;
   - auth/session adapter backed by `auth_account` and `auth_session`;
   - user repository backed by `user`, `admin`, `employee`, and `organization` read joins.
5. Wire `src/app/api/v1/sessions/route.ts` to the real local session runtime.

## Risk Controls

- Use existing `postgres` and `better-auth` dependencies only; no dependency changes.
- Do not expose numeric database `id` values in route params or DTOs.
- Treat `publicId` only as a DTO lookup handle, not an authorization decision.
- Do not return password hashes, auth account rows, auth session row ids, session token on `GET`, raw cookies, or internal database rows.
- Keep API responses in `{ code, message, data }` envelope with camelCase JSON fields.
- Create the required security review artifact before merge with verdict.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-7-auth-session-runtime-baseline`
- Focused RED/GREEN unit tests for the new runtime files.
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
