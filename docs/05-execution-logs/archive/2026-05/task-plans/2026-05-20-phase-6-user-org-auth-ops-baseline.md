# Task Plan: Phase 6 User Organization Authorization Ops Baseline

## Task Metadata

- Task id: `phase-6-user-org-auth-ops-baseline`
- Phase: `phase-6-admin-ops`
- Branch: `codex/phase-6-user-org-auth-ops-baseline`
- Worktree: `F:\tiku\.worktrees\phase-6-user-org-auth-ops-baseline`
- Source stories:
  - `docs/01-requirements/stories/epic-06-admin-ops.md#us-06-02-用户管理`
  - `docs/01-requirements/stories/epic-06-admin-ops.md#us-06-03-企业组织管理界面`
  - `docs/01-requirements/stories/epic-06-admin-ops.md#us-06-04-企业授权管理界面`
  - `docs/01-requirements/stories/epic-06-admin-ops.md#us-06-05-卡密管理界面`
  - `docs/01-requirements/stories/epic-06-admin-ops.md#us-06-13-后台角色与权限`
- Task plan policy: `required`
- Evidence path: `docs/05-execution-logs/evidence/2026-05-20-phase-6-user-org-auth-ops-baseline.md`
- Security review path: `docs/05-execution-logs/audits-reviews/2026-05-20-phase-6-user-org-auth-ops-baseline-security-review.md`

## Required Sources Read

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/sop/skill-dispatch-matrix.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/ui-code.md`
- `docs/03-standards/glossary.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/05-execution-logs/evidence/2026-05-20-phase-6-admin-shell-common-interaction-baseline.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`

## Scope From Queue

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-20-phase-6-user-org-auth-ops-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-20-phase-6-user-org-auth-ops-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-20-phase-6-user-org-auth-ops-baseline-security-review.md`
- `src/app/(admin)/**`
- `src/app/api/v1/users/**`
- `src/app/api/v1/organizations/**`
- `src/app/api/v1/authorizations/**`
- `src/app/api/v1/redeem-codes/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/models/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `drizzle/**`
- `.env.example`

## Startup State Repair

- Initial claim preflight failed because `task-queue.yaml` still marked `phase-6-admin-shell-common-interaction-baseline` as `validated`.
- The latest evidence file records implementation commit, closeout evidence commit, push, cleanup, and closeout state as `done`.
- Repair action: update only `docs/04-agent-system/state/task-queue.yaml` to align the predecessor status with durable evidence, then rerun claim readiness before business logic changes.

## Implementation Plan

1. Add focused RED tests for admin user, organization, authorization, redeem code, and admin role operation DTO/contract behavior.
2. Add `src/server/contracts/admin-user-org-auth-ops-contract.ts` with camelCase DTOs, public identifiers, list/detail shapes, lifecycle actions, error codes, and no numeric `id` exposure.
3. Add mapper and pure service helpers for in-memory baseline projections over user, organization, employee, authorization, redeem code, and admin role operation snapshots.
4. Add validators for admin list query, safe page/pageSize/sort/filter values, and high-risk action payloads without accepting empty strings as nullable values.
5. Add unavailable route handlers and route exports under the queued `/api/v1/users`, `/api/v1/organizations`, `/api/v1/authorizations`, and `/api/v1/redeem-codes` scopes; keep runtime responses in `{ code, message, data, pagination? }`.
6. Add an admin operations UI baseline under `src/app/(admin)/**` that reuses common interaction patterns and renders loading, empty, error, ready, confirmation, and toast states for the five story groups.
7. Write the required security review artifact covering admin authz, public id handling, clear-text redeem code visibility, DTO redaction, and accepted gaps.
8. Update project state and task queue only after implementation validation confirms the task is ready for closeout.

## Risk Controls

- No dependency, lockfile, migration, `.env.example`, deployment, real secret, or force-push changes.
- No real card secrets or provider secrets; redeem code examples are synthetic and marked as display-only baseline data.
- Admin API routes remain unavailable or baseline-only unless backed by explicit server-side authorization boundaries.
- Public APIs expose `publicId` only and never numeric database `id`.
- JSON fields stay camelCase; database-like row shapes stay internal.
- State-changing operations use service-level permission placeholders and explicit audit/concurrency metadata, not UI-only protection.
- UI uses existing tokens and components; no hardcoded pure black, default Inter, or purple-blue gradient.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-6-user-org-auth-ops-baseline`
- Focused RED/GREEN unit test command for this task.
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
