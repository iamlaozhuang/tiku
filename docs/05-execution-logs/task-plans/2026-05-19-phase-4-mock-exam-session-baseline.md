# Phase 4 Mock Exam Session Baseline Task Plan

## Metadata

- Task id: `phase-4-mock-exam-session-baseline`
- Date: 2026-05-19
- Branch: `codex/phase-4-mock-exam-session`
- Worktree: `F:\tiku\.worktrees\phase-4-mock-exam-session`
- Base: `master` at `4e45057`

## Read Sources

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/01-requirements/stories/`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-4-practice-session-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-practice-session-baseline-security-review.md`

## Scope

Implement the mock exam API baseline for Phase 4:

- Start a new or resume an in-progress `mock_exam` from a published paper in the student's effective `authorization` scope.
- Return mock exam details with server authoritative time fields.
- Save answers without exposing correctness, `standard_answer`, `analysis`, `ai_hint`, or `ai_explanation`.
- Submit a mock exam with unanswered counts allowed and objective scoring calculated synchronously.
- Terminate an active mock exam as `terminated` without scoring or report generation.

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-19-phase-4-mock-exam-session-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-4-mock-exam-session-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-mock-exam-session-baseline-security-review.md`
- `src/app/api/v1/mock-exams/**`
- `src/server/services/**`
- `src/server/repositories/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/validators/**`
- `tests/unit/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Explicit Non-Scope

- No `package.json`, `pnpm-lock.yaml`, or `package-lock.json` changes.
- No `src/db/schema/**` changes.
- No `drizzle/**` changes.
- No `.env.example` changes.
- No dependency, migration, production database, deployment, or secret changes.
- No frontend UI implementation in this task.

## TDD Plan

1. Add mapper and validator tests for `MockExamDto`, answer payload parsing, and submit payload parsing; run them and confirm RED.
2. Implement the minimum contract, mapper, and validator code; rerun targeted tests to GREEN.
3. Add service tests covering start/resume, authorization denial, answer saving without feedback leakage, server deadline auto-submit, manual submit, and termination; confirm RED.
4. Implement repository interface and service logic; rerun targeted tests to GREEN.
5. Add route adapter tests for standard `{ code, message, data }` responses; confirm RED then implement route helpers and API route files.
6. Run full queue validation commands and record evidence.

## Security And Data-Risk Controls

- Every service entry receives explicit `MockExamUserContext`.
- All `publicId` lookups combine current user ownership, session state, and effective `authorization`.
- Student DTOs expose only public identifiers and camelCase fields.
- Answer save responses do not expose correctness, `standardAnswerRichText`, `analysisRichText`, `aiHint`, or `aiExplanation`.
- `terminated` attempts do not score and do not generate `exam_report`.
- Server time is authoritative for `serverNow` and deadline calculations.
- Phase 5 `ai_scoring` and `exam_report` generation are deferred and must not be fabricated.

## Validation Commands

Queue validation:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
Select-String -Path 'src\app\api\v1\mock-exams\**\*.ts' -Pattern 'submit|code|message|data'
Select-String -Path 'src\server\services\*.ts' -Pattern 'mock_exam|server|terminated'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
```

Additional closeout validation:

```powershell
npm.cmd run format:check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

After merge to `master`, rerun task-relevant gates and completion readiness before cleanup and push evidence.
