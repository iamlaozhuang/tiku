# Phase 4 Mock Exam Report UI Baseline Task Plan

## Metadata

- Task id: `phase-4-mock-exam-report-ui-baseline`
- Branch: `codex/phase-4-mock-exam-report-ui-baseline`
- Base: `master`
- Worktree: `F:\tiku\.worktrees\phase-4-mock-exam-report-ui-baseline`
- Plan date: 2026-05-20
- Note: `task-queue.yaml` still lists the historical 2026-05-19 plan path, but the active human instruction requires this 2026-05-20 task plan path.

## Read Sources

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
- `docs/05-execution-logs/evidence/2026-05-19-phase-4-practice-ui-baseline.md`

## Queue Scope

- Dependencies:
  - `phase-4-mock-exam-session-baseline`
  - `phase-4-exam-report-baseline`
  - `phase-4-mistake-book-baseline`
  - `phase-4-practice-ui-baseline`
- Allowed files:
  - `docs/05-execution-logs/task-plans/2026-05-19-phase-4-mock-exam-report-ui-baseline.md`
  - `docs/05-execution-logs/evidence/2026-05-19-phase-4-mock-exam-report-ui-baseline.md`
  - `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-mock-exam-report-ui-baseline-security-review.md`
  - `src/app/(student)/**`
  - `src/components/student/**`
  - `src/features/student/**`
  - `src/server/contracts/**`
  - `tests/unit/**`
  - `e2e/**`
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
- Active instruction override:
  - Create this plan at `docs/05-execution-logs/task-plans/2026-05-20-phase-4-mock-exam-report-ui-baseline.md`.
- Blocked files:
  - `package.json`
  - `pnpm-lock.yaml`
  - `package-lock.json`
  - `src/db/schema/**`
  - `drizzle/**`
  - `.env.example`
- Risk types:
  - `student`
  - `authorization`
  - `frontend`
- Security review required: `true`
- Security review path: `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-mock-exam-report-ui-baseline-security-review.md`

## Implementation Boundaries

- Do not change dependencies, lockfiles, package scripts, schema, migrations, or env templates.
- Do not change `src/db/schema/**`, `drizzle/**`, or `.env.example`.
- Build a fixture-backed UI baseline only.
- Do not fake real server authorization, session ownership, AI scoring, AI hints, or AI explanations.
- Use existing DTO contracts from `src/server/contracts/mock-exam-contract.ts` and `src/server/contracts/exam-report-contract.ts`.
- If contract additions are unavoidable, keep them under `src/server/contracts/**` with camelCase DTO fields.
- Do not expose numeric database ids in URLs, query strings, DOM ids, `data-id`, or visible public UI.
- Keep mock exam behavior distinct from `practice`; do not reuse practice naming for mock exam semantics.

## TDD Plan

1. Add `tests/unit/student-mock-exam-report-ui.test.ts` first.
2. Run the targeted test and record RED. Expected RED should be missing module/route behavior, not a typo.
3. Implement the smallest fixture-backed mock exam and exam report UI needed for GREEN.
4. Re-run targeted tests, then full unit tests.

Test coverage must include:

- Mock exam renders paper title, remaining time, progress, and public `mockExamPublicId` without numeric id exposure.
- Objective answer selection in `mock_exam` mode does not reveal `standardAnswer` or `analysis` before submit.
- Next question, answer card/question navigation, and submit confirmation state.
- Submitted/completed state shows report entry.
- Exam report renders total score, accuracy or score summary, question results, mistake book entry, and learning suggestion placeholder.
- `scoring`, `scoring_partial_failed`, and `completed` report states.
- Loading, error, authorization expired, and empty states.
- URLs and DOM-visible identifiers use public ids only.

## Browser/IAB Verification Plan

- Use the Browser skill and `iab` backend first.
- If Browser tooling is unavailable, record discovery path and fallback reason before any fallback.
- Start a local dev server on an available port.
- Verify at least one mock exam flow and one exam report flow:
  - Load mock exam by `mockExamPublicId`.
  - Select an answer and confirm no answer/analysis leakage before submit.
  - Navigate by next/question card.
  - Open submit confirmation and reach report/completed state.
  - Load report by public id and verify summary, question result, mistake-book entry, and placeholders.
- Record URL, visible state, interactions, console/log result, screenshot status, and tab cleanup.

## Security Review Plan

- Create `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-mock-exam-report-ui-baseline-security-review.md`.
- Review files touched, `student`/`authorization`/`frontend` risks, public identifier handling, data exposure, and DTO contract usage.
- Verdict must be `APPROVE` only if no standard answer/analysis leakage or numeric id exposure remains.

## Evidence And Validation Plan

- Write `docs/05-execution-logs/evidence/2026-05-19-phase-4-mock-exam-report-ui-baseline.md`.
- Record RED/GREEN outputs, all validation command results, Browser/IAB evidence, security review verdict, file changes, accepted gaps, and git status.
- Run queue validation:
  - `npm.cmd run lint`
  - `npm.cmd run typecheck`
  - `npm.cmd run test:unit`
  - `npm.cmd run build`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- Run mechanism validation:
  - `npm.cmd run format:check`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Closeout Boundaries

- Update `phase-4-mock-exam-report-ui-baseline` to `done` only after implementation, verification, evidence, and security review.
- Set `project-state.yaml` current task back to idle/null and `nextRecommendedAction` to `phase-4-student-experience-readiness-evidence`.
- Local commit target: `feat(student): add mock exam report UI baseline`.
- Local merge, push, PR, deployment, and cleanup require separate explicit approval.
