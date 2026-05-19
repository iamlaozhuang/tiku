# Phase 4 Practice UI Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for UI behavior changes. Steps use checkbox (`- [ ]`) syntax for tracking.

**Task id:** `phase-4-practice-ui-baseline`

**Goal:** Implement the mobile-first student practice UI baseline for Phase 4 using existing `practice` DTO contracts, local fixture data, explicit practice states, and public identifiers only.

**Architecture:** Keep the route under the `(student)` app group and place reusable UI logic in `src/features/student/practice`. The page remains a frontend baseline over the existing practice API contract; runtime data hydration and real authenticated repository wiring are deferred. Component state handles selected answers, immediate objective feedback, subjective placeholder states, and restart/continue affordances without calling Phase 5 AI services.

**Tech Stack:** Next.js App Router, React client component, TypeScript DTO types, Tailwind design tokens, lucide-react icons, Vitest and Testing Library.

---

## Required Context Read

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/01-requirements/stories/`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-4-student-home-ui-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-student-home-ui-baseline-security-review.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-4-practice-session-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-practice-session-baseline-security-review.md`

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-19-phase-4-practice-ui-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-4-practice-ui-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-practice-ui-baseline-security-review.md`
- `src/app/(student)/**`
- `src/components/student/**`
- `src/features/student/**`
- `src/server/contracts/**`
- `tests/unit/**`
- `e2e/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files And Non-Goals

- Do not modify `package.json`, `pnpm-lock.yaml`, or `package-lock.json`.
- Do not modify `src/db/schema/**`, `drizzle/**`, or `.env.example`.
- Do not implement real authenticated data fetching, repository wiring, AI explanation, AI hint, AI scoring, mock exam UI, exam report UI, or mistake book browsing.
- Do not expose numeric database `id` values in DOM attributes, query strings, routes, or fixture data.
- Do not hard-code colors outside existing design token utility classes.

## Planned Files

- Create `src/features/student/practice/StudentPracticePage.tsx`
- Create `src/app/(student)/practice/page.tsx`
- Create `tests/unit/student-practice-ui.test.ts`
- Create `docs/05-execution-logs/evidence/2026-05-19-phase-4-practice-ui-baseline.md`
- Create `docs/05-execution-logs/audits-reviews/2026-05-19-phase-4-practice-ui-baseline-security-review.md`
- Modify `docs/04-agent-system/state/project-state.yaml`
- Modify `docs/04-agent-system/state/task-queue.yaml`

## Implementation Tasks

### Task 1: Red Test For Practice UI Baseline

- [ ] Add `tests/unit/student-practice-ui.test.ts`.
- [ ] Test that the practice page renders the selected paper name, progress, current question, public practice id, and no numeric `data-id`.
- [ ] Test objective answer flow: selecting an option, submitting, showing correctness, `standardAnswerRichText`, `analysisRichText`, `mistakeBookPublicId`, disabled second submission for objective questions, and next-question navigation.
- [ ] Test subjective skill flow: material/group content is visible, text answer can be submitted, AI statuses are `null`/unavailable placeholders, and the UI offers "AI 提示并重答一次" as disabled Phase 5 affordance plus "直接查看评分" placeholder.
- [ ] Test loading, error, expired authorization, and empty snapshot states.
- [ ] Run `npm.cmd run test:unit -- tests/unit/student-practice-ui.test.ts` and confirm it fails because the target module does not exist.

### Task 2: Implement Practice UI Component

- [ ] Create `StudentPracticePage.tsx` as a client component.
- [ ] Use `PracticeDto` and `PracticeAnswerFeedbackDto` types from `src/server/contracts/practice-contract.ts`.
- [ ] Keep fixture data in camelCase DTO shape with `paperSnapshot.paperSections[].paperQuestions[]`.
- [ ] Render one objective theory question at a time with selected-state buttons and immediate feedback after submission.
- [ ] Render skill/material group content with collapsible material area and subjective text answer.
- [ ] Provide explicit loading, error, empty, and authorization-expired states.
- [ ] Use existing design tokens and `active:scale-[0.98]` on clickable controls.
- [ ] Run targeted test and confirm it passes.

### Task 3: Route Wiring

- [ ] Create `src/app/(student)/practice/page.tsx`.
- [ ] Read `paperPublicId` from `searchParams` and pass it to the fixture-backed practice page so `/practice?paperPublicId=...` from home has a real destination.
- [ ] Render a matching unavailable state when the fixture does not contain the requested `paperPublicId`.
- [ ] Run targeted test again.

### Task 4: Evidence, Security Review, And State

- [ ] Create security review with verdict `APPROVE` only if public identifier, data exposure, authorization-state messaging, and Phase 5 AI non-invocation boundaries are explicit.
- [ ] Mark `phase-4-practice-ui-baseline` as `done`.
- [ ] Update `project-state.yaml` next recommended action to `claim_phase_4_mock_exam_report_ui_baseline`.
- [ ] Write evidence with RED/GREEN output, validation output, browser verification, accepted gaps, commit/merge/push/cleanup results.

## Validation Commands

Run exactly the queue-declared commands:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
```

Also run:

```powershell
npm.cmd run format:check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

For frontend verification, run a local dev server, verify `/practice?paperPublicId=paper-marketing-theory-002` and a skill practice route in Browser/IAB when available, and record visible state checks plus console result.

## Risk Defenses

- UI fixture is explicitly a baseline and does not claim server authorization enforcement.
- No API route or service behavior changes are introduced in this task.
- Practice UI displays `standardAnswerRichText` and `analysisRichText` only after local answer submission.
- Mock exam answer-hiding rules are not reused in practice UI; mock exam UI remains deferred.
- AI explanation and AI hint affordances are disabled or nullable placeholders; no AI result is fabricated.
- Public identifiers (`publicId`, `paperPublicId`, `answerRecordPublicId`, `mistakeBookPublicId`) are used for DOM and navigation; numeric internal ids are absent.
