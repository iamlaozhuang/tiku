# Phase 20 Fix RA-06-02 User Management Role Detail Alignment Plan

## Task

- Task id: `phase-20-fix-ra-06-02-user-management-role-detail-alignment`
- Branch: `codex/phase-20-fix-ra-06-02-user-management-role-detail-alignment`
- Source finding: `F-RA-06-02-001`
- Scope: local user-management role/detail UI/runtime/test/evidence only.

## Read Sources

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`

## Problem Statement

RA-06-02 is partial because user-management role/detail behavior is misaligned with the `ops_admin` requirement and lacks full user detail evidence. Existing code covers user list and super-admin-only reset/disable/enable mutations, but US-06-02 says the operations admin manages user accounts and can view detail, disable/enable accounts, and reset passwords.

## Implementation Plan

1. Add RED tests for `ops_admin` reading `GET /api/v1/users/{publicId}` detail with user summary, enterprise binding, and authorization summaries while keeping numeric ids and secrets out of the response.
2. Add RED tests proving `ops_admin` can reset passwords and disable/enable ordinary users through publicId-only routes, with redacted audit metadata and session revocation where required; `content_admin` remains denied.
3. Add RED UI test for the `/ops/users` surface showing a user detail panel from the detail API and exposing role-appropriate user lifecycle actions without leaking secrets or numeric ids.
4. Implement the smallest local runtime contract:
   - `AdminUserDetailDto` in `src/server/contracts/admin-user-org-auth-ops-contract.ts`.
   - `getUserDetail(publicId)` in admin user runtime service/repository boundaries.
   - `GET /api/v1/users/[publicId]` route under the existing admin flow runtime.
   - UI detail action/panel in `AdminOpsManagement`.
5. Align user-management mutation permissions with US-06-02: `ops_admin` may operate user account lifecycle/password reset for ordinary users; admin account creation, role assignment, and admin account security policy remain outside this task and stay reserved for RA-06-13/super-admin surfaces.
6. Add Security Review section to evidence because this task includes `auth_permission_model` and admin user detail behavior.
7. Run task validation and local CI gates, record outputs in evidence, then perform the approved commit/merge/push/cleanup sequence if gates pass.

## Boundaries

Allowed files follow the queue RA-06 anchor:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `src/**`
- `tests/**`
- `e2e/**`

Blocked:

- `.env.local`
- `.env.example`
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`
- staging/prod/cloud/deploy/real provider/external service configuration
- destructive data operations

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-06-02-user-management-role-detail-alignment`
- RED targeted unit test command for admin user detail route/UI.
- GREEN targeted unit test command for admin user detail route/UI.
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`

## Risk Defense

- `auth_permission_model`: allow `ops_admin` to read user detail and perform US-06-02 user lifecycle/password reset operations; keep admin-account creation, role assignment, admin account security policy, model configuration, and other non-user-management domains outside this task.
- `api_contract`: use standard `{ code, message, data, pagination? }`, camelCase JSON, nullable fields as `null`, and public identifiers only.
- `evidence_integrity`: evidence records command outcomes and redaction boundaries, not secrets, tokens, raw provider payloads, passwords, or numeric internal ids.
- No schema/migration/dependency/env/cloud/provider/destructive operation is approved or needed for this task.
