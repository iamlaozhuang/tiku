# Task Plan: phase-11-local-happy-path-student-answer-flow

## Task Claim

- Task id: `phase-11-local-happy-path-student-answer-flow`
- Branch: `codex/phase-11-local-happy-path-student-answer-flow`
- Phase: `phase-11-staging-release-planning`
- Human approval: user explicitly approved claiming this task after the local happy path planning task was merged and pushed.

## Boundary

This task fixes the local student answer happy path for `practice` and `mock_exam`.

This task must not:

- change dependencies, `package.json`, or lockfiles;
- read or output `.env.local`;
- change secrets or env files;
- change schema, migration, or scripts;
- create cloud resources;
- deploy;
- connect to `staging` or `prod`;
- call external providers;
- record secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, or private data.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-local-happy-path-experience-plan.md`

## Observed Problem

Manual local validation from `/home` found:

- `/practice?paperPublicId=paper-dev-theory` can render one single-choice question with no visible options, so answer submission is blocked.
- The visible practice restart action does not restart the practice.
- `/mock-exam?paperPublicId=paper-dev-theory` can render one single-choice question with no visible options, so saving the answer, moving forward, and normal submission are blocked.

## Root-Cause Plan

1. Inspect the runtime paper snapshot shape and compare it with the UI extractors for `practice` and `mock_exam`.
2. Write failing unit tests that reproduce the local runtime snapshot shape before changing production code.
3. Implement the smallest fix that makes runtime snapshot questions render selectable options in both flows.
4. Wire the practice restart action only if the root cause confirms the button is not connected to the existing restart endpoint.
5. Verify the focused unit tests, mapper tests when relevant, full quality gate, naming gate, and git completion gate.

## Allowed Files

- `src/features/student/practice/StudentPracticePage.tsx`
- `src/features/student/mock-exam/StudentMockExamReportPage.tsx`
- `tests/unit/student-practice-ui.test.ts`
- `tests/unit/student-mock-exam-report-ui.test.ts`
- `src/server/mappers/practice-mapper.ts`
- `src/server/mappers/practice-mapper.test.ts`
- `src/server/mappers/mock-exam-mapper.ts`
- `src/server/mappers/mock-exam-mapper.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-local-happy-path-student-answer-flow.md`

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-local-happy-path-student-answer-flow`
- `npm.cmd run test:unit -- tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts`
- `npm.cmd run test:unit -- src/server/mappers/practice-mapper.test.ts src/server/mappers/mock-exam-mapper.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
