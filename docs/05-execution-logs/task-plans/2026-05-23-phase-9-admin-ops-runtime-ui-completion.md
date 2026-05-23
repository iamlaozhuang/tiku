# Phase 9 Admin Ops Runtime UI Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development during implementation and superpowers:verification-before-completion before delivery. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Phase 9 Admin Ops runtime/UI slice for users, organizations, employees, org_auth, redeem_code, audit_log, and ai_call_log without exposing internal ids or sensitive fields.

**Architecture:** Keep ADR-002 layering: route handlers stay thin, services enforce auth/session/authorization and audit behavior, repositories own database access, mappers/contracts shape external DTOs, and admin UI consumes protected `/api/v1/` endpoints. No schema, dependency, environment, or production-resource changes are allowed.

**Tech Stack:** Next.js App Router, TypeScript, React, Drizzle ORM through existing repositories, Vitest, Playwright, local mock/dev runtime.

---

## Readiness And Required References

- Read `AGENTS.md`.
- Read `docs/03-standards/code-taste-ten-commandments.md`.
- Read ADR files under `docs/02-architecture/adr/`.
- Read `docs/02-architecture/interfaces/phase-9-mvp-acceptance-contract.md`.
- Read `docs/01-requirements/modules/06-admin-ops.md`.
- Read `docs/01-requirements/stories/epic-06-admin-ops.md`.
- Read `docs/04-agent-system/state/project-state.yaml`.
- Read `docs/04-agent-system/state/task-queue.yaml`.
- Read previous evidence `docs/05-execution-logs/evidence/2026-05-23-phase-9-resource-knowledge-admin-ui-completion.md`.
- Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-admin-ops-runtime-ui-completion`.

## Allowed Scope

- Task plan, evidence, and required security review.
- `src/app/(admin)/ops/**`.
- Admin ops API routes under `src/app/api/v1/audit-logs/**`, `ai-call-logs/**`, `employees/**`, `organizations/**`, `org-auths/**`, `redeem-codes/**`, `users/**`.
- `src/server/auth/**`, `src/server/contracts/**`, `src/server/mappers/**`, `src/server/repositories/**`, `src/server/services/**`, `src/server/validators/**`.
- `src/features/admin/**`.
- `tests/unit/**`, `e2e/**`.
- Agent state files.

## Blocked Scope

- No `package.json`, lockfile, `.env.example`, `drizzle/**`, dependency, migration, production AI provider, production credential, deployment, or PR changes.
- Do not expose auto-increment ids in URLs or DTOs.
- Do not output session tokens, passwords, secrets, API keys, raw prompts, raw answers, or provider payloads.
- Do not bypass auth/session/authorization runtime.

## Scope Conflict Strategy

- The requirement asks for full creation/editing flows for organization, employee, org_auth, redeem_code, user reset/enable/disable, and log views.
- The current database/API scope already has protected list APIs and some write boundaries, but several mutation endpoints intentionally return unavailable responses.
- This task will complete the MVP-safe runtime/UI closure by:
  - Keeping unsupported mutations authenticated, explicit, and non-successful.
  - Surfacing disabled or confirmed controls with conflict/unavailable feedback instead of fixture-only success.
  - Adding audit evidence for implemented critical write paths where a service can safely mutate or for read-only log access where logs are intentionally immutable.
  - Recording any remaining unsupported write paths in security review and evidence instead of expanding blocked schema/dependency scope.

## TDD Tasks

### Task 1: Admin Users Runtime And Route Hardening

**Files:**

- Modify: `src/server/services/admin-flow-runtime.ts`
- Modify: `src/server/repositories/admin-flow-runtime-repository.ts`
- Modify: `src/app/api/v1/users/[publicId]/reset-password/route.ts`
- Test: `tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts`

- [ ] Write failing tests proving `/api/v1/users` requires admin session, filters/sorts with `publicId`, excludes `id/password/token`, and reset-password uses `publicId`, denies non-super admins, writes redacted audit metadata, and never returns a password.
- [ ] Run focused unit test and verify RED.
- [ ] Implement route/service/repository changes with the existing session runtime and standard `{ code, message, data }` response envelopes.
- [ ] Run focused unit test and verify GREEN.

### Task 2: Admin Ops UI Runtime Consolidation

**Files:**

- Create: `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
- Modify: `src/app/(admin)/ops/users/page.tsx`
- Modify: `tests/unit/admin-user-org-auth-ops-baseline.test.ts`
- Test: `tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts`

- [ ] Write failing UI tests for loading, empty, unauthorized, error, users, organizations, employees, org_auth, redeem_code, audit_log, ai_call_log, cost summary, filters, sort toggles, publicId rows, redaction, read-only logs, confirmations, and conflict/unavailable messages.
- [ ] Run focused unit test and verify RED.
- [ ] Implement client UI using protected `/api/v1/sessions`, `/api/v1/users`, `/api/v1/organizations`, `/api/v1/employees`, `/api/v1/org-auths`, `/api/v1/redeem-codes`, `/api/v1/audit-logs`, `/api/v1/ai-call-logs`, and `/api/v1/ai-call-logs/summary`.
- [ ] Keep sensitive displays masked; do not render self-increment ids, password, session token, secret, API key, code_hash, raw prompt, or raw answer.
- [ ] Run focused unit test and verify GREEN.

### Task 3: Logs Read-Only And AI Call Summary Verification

**Files:**

- Modify: `src/server/services/admin-ai-audit-log-runtime.ts`
- Modify: `src/server/repositories/admin-ai-audit-log-runtime-repository.ts`
- Test: `tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts`

- [ ] Write failing tests proving audit_log and ai_call_log endpoints have no mutation/delete handlers, AI logs are redacted, filters are accepted, and summary remains cost-only.
- [ ] Run focused unit test and verify RED.
- [ ] Implement only missing query parsing/redaction-safe behavior within existing runtime boundaries.
- [ ] Run focused unit test and verify GREEN.

### Task 4: Browser Flow Coverage

**Files:**

- Modify: `e2e/local-business-flow.spec.ts`

- [ ] Add E2E assertions for `/ops/users` runtime UI, publicId-only rows, filters, read-only log labels, reset-password confirmation, unsupported mutation conflict/unavailable feedback, and sensitive redaction.
- [ ] Run `npm.cmd run test:e2e` after implementation.

### Task 5: Security Review, Evidence, And State

**Files:**

- Create: `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-admin-ops-runtime-ui-completion-security-review.md`
- Create: `docs/05-execution-logs/evidence/2026-05-23-phase-9-admin-ops-runtime-ui-completion.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [ ] Write security review covering auth/session checks, role gates, publicId boundary, read-only logs, audit behavior, conflict/unavailable handling, and sensitive field redaction.
- [ ] Run and record required validation commands:
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-admin-ops-runtime-ui-completion`
  - `npm.cmd run test:unit`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
  - `npm.cmd run build`
  - `npm.cmd run test:e2e`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- [ ] Update task state to closed only after evidence is complete and gates pass.
- [ ] Commit this task as one reviewable commit.
