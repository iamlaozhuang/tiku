# Phase 7 Admin Flow Runtime Smoke Task Plan

## Metadata

- Task id: `phase-7-admin-flow-runtime-smoke`
- Branch: `codex/phase-7-admin-flow-runtime-smoke`
- Base branch: `master`
- Queue status at claim: `pending -> claimed`
- Task plan policy: `required`
- Dependency changes: not allowed and not intended.

## Required Reading Completed

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest handoff evidence: `docs/05-execution-logs/evidence/2026-05-21-phase-7-student-flow-runtime-smoke.md`

## Scope

Allowed implementation scope:

- `src/app/api/v1/users/**`
- `src/app/api/v1/questions/**`
- `src/app/api/v1/papers/**`
- `src/app/api/v1/audit-logs/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- `e2e/**`
- allowed execution logs and state files named by the queue entry

Blocked scope:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `drizzle/**`
- `.env.example`

## Implementation Plan

1. Write RED unit tests in `tests/unit/phase-7-admin-flow-runtime-smoke.test.ts`.
   - Assert unauthenticated admin API access returns a standard unauthorized envelope.
   - Assert a `super_admin` session can list seeded users, questions, papers, and audit logs through public ids only.
   - Assert the admin flow does not expose numeric `id`, password/session internals, or unavailable runtime messages.
2. Run the focused RED test command:
   - `npm.cmd run test:unit -- tests/unit/phase-7-admin-flow-runtime-smoke.test.ts`
   - Expected first failure: missing `@/server/services/admin-flow-runtime`.
3. Implement the minimal runtime service/repository boundary.
   - Add `src/server/services/admin-flow-runtime.ts` for request-scoped admin session resolution and runtime route handlers.
   - Add `src/server/repositories/admin-flow-runtime-repository.ts` for Drizzle-backed read-only admin smoke repositories.
   - Reuse existing admin operation DTO contracts and standard API response helpers.
   - Keep deferred routes unavailable: broad CRUD, reset-password, resource vector rebuild, model config mutation, AI call log summary.
4. Wire only the task-scoped API routes:
   - `GET /api/v1/users`
   - `GET /api/v1/questions`
   - `GET /api/v1/papers`
   - `GET /api/v1/audit-logs`
5. Create the required security review artifact at `docs/05-execution-logs/audits-reviews/2026-05-21-phase-7-admin-flow-runtime-smoke-security-review.md`.
6. Run GREEN and focused regression checks.
7. Run task validation commands from the queue and record evidence:
   - `Test-TaskClaimReadiness.ps1`
   - `npm.cmd run test:unit`
   - `Invoke-QualityGate.ps1`
   - `npm.cmd run build`
   - `Test-NamingConventions.ps1`
   - `Test-GitCompletionReadiness.ps1 -BaseBranch master`
8. Update task state through `implemented`, `validated`, `committed`, merge/push closeout, and `closed` only after the matching evidence exists.

## Risk Defense

- Admin authorization: runtime routes must resolve an authenticated admin session and require `super_admin`, `ops_admin`, or `content_admin` before returning admin data.
- Public id boundary: DTOs must expose public identifiers only; numeric database `id` values stay inside repositories.
- API response contract: every route returns `{ code, message, data, pagination? }`.
- No schema expansion: `audit_log` persistence is not added in this task because schema/migration files are blocked; `GET /api/v1/audit-logs` may return an empty local-runtime list until the queued audit-log runtime baseline adds persistence.
- No horizontal expansion: only narrow read-view smoke routes are moved off unavailable runtime.
- No dependency changes: package and lock files remain untouched.
