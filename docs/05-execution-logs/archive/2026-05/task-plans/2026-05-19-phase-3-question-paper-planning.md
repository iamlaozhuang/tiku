# Task Plan: phase-3-question-paper-planning

## Goal

Create the Phase 3 question/paper execution queue before implementation starts, with clear dependencies, file boundaries, risk gates, validation commands, and evidence paths.

## Required Reading

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/01-requirements/stories/`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-user-auth-readiness.md`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-0-2-mechanism-review.md`
- `docs/05-execution-logs/evidence/2026-05-19-agent-mechanism-hardening.md`

## Scope

- Task id: `phase-3-question-paper-planning`
- Branch: `codex/phase-3-question-paper-planning`
- Base: `master`

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-19-phase-3-question-paper-planning.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-3-question-paper-planning.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/**`
- `drizzle/**`
- `.env.example`

## Planning Decisions

1. Phase 3 starts with a docs-only contract and schema/migration approval task because `question`, `material`, `paper`, `paper_section`, `question_group`, `question_option`, `scoring_point`, `paper_asset`, public identifiers, and admin APIs are data-contract and authorization-sensitive.
2. No business implementation, Drizzle migration generation, package change, or runtime source edit is in scope for this planning task.
3. Queue tasks are ordered so schema and contract work precedes service/API work; service/API work precedes admin UI; all implementation precedes readiness evidence.
4. Tasks touching `schema`, `migration`, `authorization`, `api_contract`, `data_contract`, `admin`, or public route contracts include `securityReviewRequired: true` and a review artifact path under `docs/05-execution-logs/audits-reviews/`.
5. External URLs must use public identifiers such as `[publicId]`; numeric auto-increment `id` remains internal.
6. REST route paths use `/api/v1/` with kebab-case plural nouns, and API JSON fields remain camelCase.

## Phase 3 Queue Shape

The queue will add:

1. `phase-3-question-paper-planning`
2. `phase-3-question-paper-contract-approval`
3. `phase-3-question-paper-schema-baseline`
4. `phase-3-material-library-baseline`
5. `phase-3-question-library-baseline`
6. `phase-3-paper-draft-composition-baseline`
7. `phase-3-paper-publish-snapshot-baseline`
8. `phase-3-paper-lifecycle-asset-baseline`
9. `phase-3-admin-question-material-ui-baseline`
10. `phase-3-admin-paper-ui-baseline`
11. `phase-3-question-paper-readiness-evidence`

## Risk Gate

- Dependency change: no.
- Database migration: planning records an approval task only; no migration is generated in this task.
- Auth or permission model: planning only, but downstream admin/content tasks require security review.
- Secret or environment change: no.
- Destructive data operation: no.
- Push: not allowed without explicit user approval.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
npm.cmd run format:check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

## Evidence Plan

- Record read sources and recovery observations.
- Record the Phase 3 queue entries and why each high-risk task has a security review gate.
- Record exact validation command outputs.
- Record Git inventory, commit evaluation, and push decision.
- Include the required taste compliance checklist before handoff.
