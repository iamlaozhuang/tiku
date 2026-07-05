# 2026-07-05 AI Question Learning Session UI Loop Plan

## Task

- Task id: `ai-question-learning-session-ui-loop-2026-07-05`
- Branch: `codex/ai-question-learning-session-ui-2026-07-05`
- Goal: wire learner AI question generated drafts into an in-page isolated learning session experience for personal advanced students and organization advanced employees.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- AI generation and advanced edition SSOT documents read for the active goal.
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `tests/unit/student-personal-ai-generation-ui.test.ts`
- `src/server/contracts/personal-ai-generation-learning-session-contract.ts`
- `src/server/services/personal-ai-generation-learning-session-service.ts`

## Scope

- In scope:
  - Learner UI for current AI question draft practice start, objective option selection, answer submission, and feedback display.
  - Personal advanced and organization advanced employee UI coverage through existing tests.
  - Clear isolated AI learning wording and formal-write blocked boundary.
- Out of scope:
  - DB persistence, API route changes, Provider execution, AI scoring, formal practice, answer_record, exam_report, mistake_book, schema/migration/seed, dependencies, browser/e2e, staging/prod, release readiness, and final production claims.

## Implementation Plan

1. Add RED UI assertions to existing visible draft tests for practice start, answer selection, submit, and feedback.
2. Implement an in-page learning session view from parsed question-set drafts only when the current result is sufficiently grounded.
3. Keep paper summary-only and insufficient grounding flows disabled.
4. Run focused UI test, typecheck, lint, scoped prettier, diff checks, Module Run v2 gates, evidence/audit update, commit, fast-forward merge, push, and cleanup.

## Stop Rules

- Stop if closure requires DB persistence, Provider execution, env secrets, schema changes, formal practice/mistake_book writes, or browser/e2e.
- Stop if UI would imply generated drafts are official questions or official practice records.
