# Phase 4 Student Experience Contract Approval Task Plan

> Date: 2026-05-19
> Task id: `phase-4-student-experience-contract-approval`
> Branch: `codex/phase-4-student-experience-contract`
> Worktree: `F:\tiku\.worktrees\phase-4-student-experience-contract`
> Base: `master`

## Goal

Create and approve the Phase 4 student experience contract before schema, API, service, or UI implementation starts.

The contract must define the student-facing boundaries for `practice`, `mock_exam`, `answer_record`, `exam_report`, `mistake_book`, `authorization`, and published paper snapshots.

## User Approval Context

The user explicitly asked to continue according to the established semi-automation mechanism after Phase 4 planning:

```text
OK，按机制设定继续推进
```

This task is high-risk because it sets `authorization`, API, and data contract boundaries, but it is documentation-only and does not change runtime behavior.

## Required Reading Completed

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/interfaces/global-db-api-skeleton.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-4-student-experience-planning.md`

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-19-phase-4-student-experience-contract-approval.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-4-student-experience-contract-approval.md`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-student-experience-contract-approval-security-review.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/**`
- `src/db/schema/**`
- `drizzle/**`
- `.env.example`

## Implementation Plan

1. Create `docs/02-architecture/interfaces/student-experience-contract.md`.
2. Define Phase 4 non-goals and links to Phase 5 AI/RAG.
3. Define domain invariants for authorization, published paper snapshots, practice progress, mock exam sessions, reports, and mistake book visibility.
4. Define database contract candidates without creating schema or migrations.
5. Define REST API contract candidates under `/api/v1/` using public identifiers and standard response shape.
6. Define DTO names and required JSON fields in camelCase.
7. Define state machines for `practice`, `mock_exam`, `exam_report`, and `mistake_book`.
8. Create a dedicated security review artifact with verdict.
9. Create task evidence, update `task-queue.yaml` status, and update `project-state.yaml` handoff.
10. Run all validation commands declared by the queue entry and record the results.

## Risk Controls

- No runtime code in this task.
- No schema or migration in this task.
- Contract must state that student APIs require authenticated student context and effective `authorization`.
- Contract must state that URLs use `publicId`, not internal numeric `id`.
- Student display and reporting must use published paper snapshots, not mutable source `question` rows.
- Historical report visibility must still respect current effective `authorization` as required by the global skeleton.
- AI outputs remain placeholders or pending statuses in Phase 4; actual `ai_scoring`, `ai_explanation`, `ai_hint`, `citation`, and `learning_suggestion` behavior stays in Phase 5.

## Validation Commands

```powershell
Test-Path 'docs\02-architecture\interfaces\student-experience-contract.md'
Select-String -Path 'docs\02-architecture\interfaces\student-experience-contract.md' -Pattern 'practice|mock_exam|answer_record|exam_report|mistake_book|authorization|paper_snapshot'
Select-String -Path 'docs\05-execution-logs\task-plans\2026-05-19-phase-4-student-experience-contract-approval.md' -Pattern 'security review'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
npm.cmd run format:check
```

## Evidence Plan

- Record files changed.
- Record validation outputs.
- Record security review verdict.
- Record queue/status transition and next recommended action.
