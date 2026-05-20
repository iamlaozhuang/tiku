# Task Plan: Phase 6 Admin Shell Common Interaction Baseline

## Task Metadata

- Task id: `phase-6-admin-shell-common-interaction-baseline`
- Phase: `phase-6-admin-ops`
- Branch: `codex/phase-6-admin-shell-common-interaction-baseline`
- Worktree: `F:\tiku\.worktrees\phase-6-admin-shell-common-interaction-baseline`
- Source story: `docs/01-requirements/stories/epic-06-admin-ops.md#us-06-01-后台通用交互`
- Task plan policy: `required`
- Evidence path: `docs/05-execution-logs/evidence/2026-05-20-phase-6-admin-shell-common-interaction-baseline.md`

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
- `docs/05-execution-logs/evidence/2026-05-20-phase-6-admin-ops-contract-and-threat-model-baseline.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`

## Scope From Queue

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-20-phase-6-admin-shell-common-interaction-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-20-phase-6-admin-shell-common-interaction-baseline.md`
- `src/app/(admin)/**`
- `src/components/admin/**`
- `src/hooks/**`
- `src/server/contracts/**`
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

1. Add a reusable admin interaction contract in `src/server/contracts` for pagination, sorting, filtering refresh, bulk confirmation, dangerous action confirmation, toast feedback, and concurrency conflict copy.
2. Add reusable admin UI helpers/components under `src/components/admin` that express the common list states and toolbar behavior without introducing data fetching, new dependencies, schema changes, or runtime secrets.
3. Add a small hook under `src/hooks` only if state transitions for pagination, sorting, filters, confirmation, or toast queue need reusable pure logic.
4. Wire the admin route group or existing admin pages only within `src/app/(admin)/**` if needed to expose the common baseline.
5. Add unit tests first for the contract/hook behavior and UI state model; verify the new tests fail before implementation, then make the minimal implementation pass.
6. Write evidence with command results, scope guards, and an inline security review section because the queue flags `admin` and `api_contract` risk but does not allow a dedicated `audits-reviews` file.

## Risk Controls

- No dependency, lockfile, migration, `.env.example`, deployment, real secret, or force-push changes.
- API JSON terms must remain `camelCase`; registered glossary terms such as `admin`, `paper`, `question`, `authorization`, and `redeem_code` must be preserved.
- UI uses existing Tailwind v4 tokens and CSS variables; no pure black, default Inter, or hardcoded theme branching.
- Admin shell is desktop-first and must include loading, empty, error, and success-state affordances.
- Dangerous and bulk actions must require explicit confirmation metadata and use existing red/danger tokens.
- Conflict behavior must expose the required refresh-and-retry message without implementing database locking in this common interaction task.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-6-admin-shell-common-interaction-baseline`
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
