# Phase 7 Audit Log Runtime Baseline Task Plan

## Metadata

- Task id: `phase-7-audit-log-runtime-baseline`
- Branch: `codex/phase-7-audit-log-runtime-baseline`
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
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest handoff evidence: `docs/05-execution-logs/evidence/2026-05-21-phase-7-admin-flow-runtime-smoke.md`

## Scope

Allowed implementation scope:

- `docs/05-execution-logs/task-plans/2026-05-21-phase-7-audit-log-runtime-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-21-phase-7-audit-log-runtime-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-21-phase-7-audit-log-runtime-baseline-security-review.md`
- `src/app/api/v1/audit-logs/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- `e2e/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked scope:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `drizzle/**`
- `.env.example`

## Implementation Plan

1. Write RED unit tests in `tests/unit/phase-7-audit-log-runtime-baseline.test.ts`.
   - Assert `GET /api/v1/audit-logs` rejects non-admin sessions using the standard error envelope.
   - Assert `content_admin` cannot read audit logs because audit views are an operations/super-admin surface.
   - Assert `super_admin` can perform the safe audit-log list action, which appends a redaction-safe `audit_log` entry and returns public-id-only DTOs.
   - Assert the response does not expose numeric `id`, bearer tokens, password text, raw request bodies, or session internals.
2. Run the focused RED command:
   - `npm.cmd run test:unit -- tests/unit/phase-7-audit-log-runtime-baseline.test.ts`
   - Expected first failure: current audit-log route returns an empty list and has no append-audit behavior.
3. Implement the minimal runtime boundary.
   - Extend `AdminAuditLogRuntimeRepository` with an append method for redaction-safe audit log entries.
   - Update `createAdminFlowRuntimeRouteHandlers().auditLogs.collection.GET` to require `super_admin` or `ops_admin`, append a safe `audit_log.list` entry, and then list audit logs.
   - Keep the API envelope and DTO names from `admin-ai-audit-log-ops-contract.ts`.
   - Keep `ai_call_log`, `model_config`, and provider behavior out of scope for the next queued task.
4. Implement the default repository read/write path in `src/server/repositories/admin-flow-runtime-repository.ts`.
   - Use the existing local runtime database connection boundary.
   - Read and write only redaction-safe audit fields: actor public id, role, action type, target resource type, target public id, result status, metadata summary, request IP, and created time.
   - Do not expose or persist bearer tokens, password hashes, provider secrets, raw request bodies, raw prompts, or raw answers.
   - Because schema and migration files are blocked for this task, handle a missing physical `audit_log` table as an empty local-runtime list while preserving the repository path for environments where the table exists.
5. Create the required security review artifact at `docs/05-execution-logs/audits-reviews/2026-05-21-phase-7-audit-log-runtime-baseline-security-review.md`.
6. Run GREEN and focused regression checks.
7. Run task validation commands from the queue and record evidence:
   - `Test-TaskClaimReadiness.ps1`
   - `npm.cmd run test:unit`
   - `Invoke-QualityGate.ps1`
   - `npm.cmd run build`
   - `Test-NamingConventions.ps1`
   - `Test-GitCompletionReadiness.ps1 -BaseBranch master`
8. Update task state through `implemented`, `validated`, `committed`, merge/push closeout, and `closed` only after matching evidence exists.

## Risk Defense

- Admin authorization: audit log reads require `super_admin` or `ops_admin`; `content_admin` is denied for this operations surface.
- API contract: every route returns `{ code, message, data, pagination? }`.
- Public identifier boundary: DTOs expose `publicId` only and never expose database `id`.
- Redaction: audit metadata is a summary string and must not include bearer tokens, raw request bodies, passwords, secrets, prompts, answers, or provider payloads.
- Schema boundary: this task does not modify `src/db/**` or `drizzle/**` because they are outside the allowed scope and `drizzle/**` is explicitly blocked.
- No dependency changes: package and lock files remain untouched.
- No horizontal expansion: this task only addresses `GET /api/v1/audit-logs` and audit-log append/read boundaries.
