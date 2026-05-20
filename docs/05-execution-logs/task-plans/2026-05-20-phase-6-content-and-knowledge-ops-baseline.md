# Task Plan: Phase 6 Content And Knowledge Ops Baseline

## Task Metadata

- Task id: `phase-6-content-and-knowledge-ops-baseline`
- Phase: `phase-6-admin-ops`
- Branch: `codex/phase-6-content-and-knowledge-ops-baseline`
- Worktree: `F:\tiku\.worktrees\phase-6-content-and-knowledge-ops-baseline`
- Source stories:
  - `docs/01-requirements/stories/epic-06-admin-ops.md#us-06-06-资源与知识库管理界面`
  - `docs/01-requirements/stories/epic-06-admin-ops.md#us-06-08-题库管理界面`
  - `docs/01-requirements/stories/epic-06-admin-ops.md#us-06-09-试卷管理界面`
  - `docs/01-requirements/stories/epic-06-admin-ops.md#us-06-10-知识点树维护界面`
- Task plan policy: `required`
- Evidence path: `docs/05-execution-logs/evidence/2026-05-20-phase-6-content-and-knowledge-ops-baseline.md`
- Security review path: `docs/05-execution-logs/audits-reviews/2026-05-20-phase-6-content-and-knowledge-ops-baseline-security-review.md`

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
- `docs/05-execution-logs/evidence/2026-05-20-phase-6-user-org-auth-ops-baseline.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`

## Scope From Queue

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-20-phase-6-content-and-knowledge-ops-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-20-phase-6-content-and-knowledge-ops-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-20-phase-6-content-and-knowledge-ops-baseline-security-review.md`
- `src/app/(admin)/**`
- `src/app/api/v1/questions/**`
- `src/app/api/v1/papers/**`
- `src/app/api/v1/resources/**`
- `src/app/api/v1/knowledge-nodes/**`
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

## Implementation Plan

1. Add focused RED tests for content and knowledge admin operations across `question`, `paper`, `resource`, and `knowledge_node` DTO/service/route behavior.
2. Add `src/server/contracts/admin-content-knowledge-ops-contract.ts` with camelCase DTOs, public identifiers, list/detail shapes, lifecycle operation metadata, and error codes.
3. Add pure service helpers for safe baseline projections over questions, papers, resources, and knowledge nodes, including unavailable runtime responses for unimplemented persistence-backed operations.
4. Add validators for list query pagination, allowed `sortBy` values, filters, and high-risk operation payloads without accepting empty strings as nullable values.
5. Add route adapters under `/api/v1/questions`, `/api/v1/papers`, `/api/v1/resources`, and `/api/v1/knowledge-nodes` that preserve `{ code, message, data, pagination? }` and keep route handlers thin.
6. Add an admin content operations UI baseline under `src/app/(admin)/**` that reuses existing admin interaction patterns and renders loading, empty, error, ready, confirmation, and toast states for the four story groups.
7. Write the required security review artifact covering admin role boundaries, public id handling, object storage and embedding redaction, manual vector rebuild risk, and accepted gaps.
8. Update project state and task queue only after validation confirms the implementation is ready for closeout.

## Risk Controls

- No dependency, lockfile, migration, `.env.example`, deployment, real secret, or force-push changes.
- No object storage `object_key`, raw embedding, raw chunk payload, provider secret, prompt, model output, or numeric database `id` exposure.
- Admin API routes require service-level role boundary design and do not rely on UI-only protection.
- JSON fields stay camelCase; glossary terms such as `question`, `paper`, `resource`, `knowledge_node`, `knowledge_base`, and `embedding` are preserved.
- State-changing operations remain explicit verb subpaths or baseline unavailable responses until persistence and audit behavior are implemented.
- UI uses existing tokens and components; no pure black, default Inter, hardcoded theme branching, or purple-blue gradient.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-6-content-and-knowledge-ops-baseline`
- Focused RED/GREEN unit test command for this task.
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
