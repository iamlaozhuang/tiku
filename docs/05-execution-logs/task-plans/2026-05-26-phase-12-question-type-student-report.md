# Phase 12 Question Type Student Report Plan

## Task

- TaskId: `phase-12-question-type-student-report`
- Branch: `codex/phase-12-question-type-student-report`
- Goal: Make student practice, mock exam, exam report, and mistake_book surfaces compatible with `case_analysis` and `calculation` as subjective text-answer question types.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-question-type-server-runtime.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-question-type-admin-ui.md`
- Superpowers TDD skill: `C:\Users\jzzhu\.codex\plugins\cache\openai-curated\superpowers\6188456f\skills\test-driven-development\SKILL.md`
- Build Web Apps frontend testing skill: `C:\Users\jzzhu\.codex\plugins\cache\openai-curated\build-web-apps\6188456f\skills\frontend-testing-debugging\SKILL.md`

## Allowed Files

- `src/features/student/practice/**`
- `src/features/student/mock-exam/**`
- `src/features/student/mistake-book/**`
- `tests/unit/student-practice-ui.test.ts`
- `tests/unit/student-mock-exam-report-ui.test.ts`
- `tests/unit/student-mistake-book-ui.test.ts`
- `src/server/services/practice-service.test.ts`
- `src/server/services/mock-exam-service.test.ts`
- `e2e/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`

## Blocked Files

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

## Implementation Approach

1. Add focused RED tests for student UI:
   - practice runtime snapshots with `case_analysis` and `calculation` render as subjective text-answer questions and submit `textAnswer`;
   - mock exam runtime snapshots with the two types render as text-answer questions and save `textAnswer`;
   - exam report detail safely displays the two types in question result snapshots/statistics when present;
   - mistake_book displays labels and text answers safely without adding new objective-only filters.
2. Update student practice/mock question type normalization and subjective/text routing.
3. Update mistake_book question type labels and safe display; keep filters limited to existing supported backend filters unless current backend explicitly supports the new types.
4. Keep report compatibility snapshot-driven and avoid introducing scoring engines or formula parsing.

## Risk Defense

- Do not touch schema, migration, Drizzle meta, dependencies, scripts, env files, cloud/provider/staging/prod configuration, or deployment.
- Do not add formula parsing, numeric tolerance, step calculation, or calculation-specific scoring logic.
- Do not record raw answers in evidence; tests use synthetic local fixtures, and evidence records only behavior summaries.
- Preserve existing redaction rules for secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw model responses, complete papers, complete textbooks, OCR full text, and private/customer-like content.
- Do not force `case_analysis` / `calculation` into objective mistake_book filters unless the existing backend path clearly supports those filters.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts tests/unit/student-mistake-book-ui.test.ts`
- `npm.cmd run test:unit -- src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
