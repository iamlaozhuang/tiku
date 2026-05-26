# Phase 12 Question Type Server Runtime Plan

## Task

- TaskId: `phase-12-question-type-server-runtime`
- Branch: `codex/phase-12-question-type-server-runtime`
- Goal: Treat `case_analysis` and `calculation` as MVP subjective text-answer question types in server validators, contracts, and runtime services.

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
- `docs/05-execution-logs/task-plans/2026-05-25-phase-12-question-type-schema-expansion.md`
- `docs/05-execution-logs/evidence/2026-05-25-phase-12-question-type-schema-expansion.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-question-type-schema-migration.md`
- Superpowers TDD skill: `C:\Users\jzzhu\.codex\plugins\cache\openai-curated\superpowers\6188456f\skills\test-driven-development\SKILL.md`
- Superpowers verification skill: `C:\Users\jzzhu\.codex\plugins\cache\openai-curated\superpowers\6188456f\skills\verification-before-completion\SKILL.md`

## Allowed Files

- `src/server/models/paper.ts`
- `src/server/validators/question.ts`
- `src/server/validators/question.test.ts`
- `src/server/contracts/question-contract.ts`
- `src/server/contracts/paper-draft-contract.ts`
- `src/server/mappers/question-mapper.ts`
- `src/server/services/question-service.ts`
- `src/server/services/practice-service.ts`
- `src/server/services/mock-exam-service.ts`
- `src/server/services/paper-draft-service.ts`
- `src/server/services/*question*test.ts`
- `src/server/services/*practice*test.ts`
- `src/server/services/*mock*test.ts`
- `src/server/services/*paper-draft*test.ts`
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
- `drizzle/**`
- `scripts/**`

## Implementation Approach

1. Add focused validator tests first for `case_analysis` and `calculation`: accept text-answer metadata with scoring points and reject option payloads for these subjective types.
2. Add or extend service tests so question persistence, practice answering, mock exam subjective scoring, and paper draft publish validation preserve and classify the two new types as subjective text-answer questions.
3. Introduce a small shared server-side helper only if it reduces duplicated subjective type checks without broad refactoring.
4. Update validators and services to route `case_analysis` and `calculation` through the existing subjective path: empty options, `standard_answer`, `scoring_point`, `ai_scoring`, manual scoring compatibility, and `textAnswer`.
5. Leave admin and student UI behavior to the following tasks; this task may only adjust server contracts or mappers when needed for type correctness.

## Risk Defense

- Do not introduce formula parsing, numeric tolerance, step calculation, or answer calculation engines.
- Do not change schema, Drizzle migrations, Drizzle meta, dependency files, scripts, env files, cloud/provider/staging/prod configuration, or deployment behavior.
- Keep mock/practice/report snapshots structurally compatible and do not strip unknown-safe question type values.
- Record only synthetic validation/test descriptions in evidence; do not record raw prompts, raw answers, raw model responses, complete paper content, OCR full text, or customer-like private content.
- Keep changes scoped to the registered server runtime files so `phase-12-question-type-admin-ui` can start from a clear handoff.

## Validation Commands

- `npm.cmd run test:unit -- src/server/validators/question.test.ts src/server/services/question-service.test.ts src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts src/server/services/paper-draft-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
