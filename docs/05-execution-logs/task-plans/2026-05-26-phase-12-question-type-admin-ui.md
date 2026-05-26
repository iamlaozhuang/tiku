# Phase 12 Question Type Admin UI Plan

## Task

- TaskId: `phase-12-question-type-admin-ui`
- Branch: `codex/phase-12-question-type-admin-ui`
- Goal: Add full admin question authoring, list, filter, and display compatibility for `case_analysis` and `calculation`.

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
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-question-type-schema-migration.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-question-type-server-runtime.md`
- Superpowers TDD skill: `C:\Users\jzzhu\.codex\plugins\cache\openai-curated\superpowers\6188456f\skills\test-driven-development\SKILL.md`
- Build Web Apps frontend testing skill: `C:\Users\jzzhu\.codex\plugins\cache\openai-curated\build-web-apps\6188456f\skills\frontend-testing-debugging\SKILL.md`

## Allowed Files

- `src/features/admin/question-material-management/**`
- `tests/unit/admin-question-material-ui.test.ts`
- `e2e/content-action-closures.spec.ts`
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

1. Add RED unit coverage for both new question types in admin UI:
   - question type select contains the two labels;
   - selecting either type hides option editors and shows `standard_answer` plus `scoring_point`;
   - POST body uses `questionOptions: []`, preserves `scoringPoints`, supports `materialPublicId`, knowledge/tag-safe existing fields, and `ai_scoring`;
   - list/filter/display recognizes both types.
2. Adjust `AdminQuestionMaterialManagementClient` so non-option types do not synthesize option rows when switching or editing.
3. Keep the schema task's existing label bridge; do not duplicate labels elsewhere unless the local component needs them.
4. Run the declared unit, E2E, build, lint, typecheck, agent readiness, naming, completion, and diff gates.

## Risk Defense

- Do not touch server runtime, schema, migration, Drizzle meta, dependencies, scripts, env files, cloud/provider/staging/prod configuration, or deployment.
- Do not add formula parsing, numeric tolerance, or step calculation behavior.
- Keep admin UI aligned with server runtime: `case_analysis` and `calculation` are subjective text-answer types with no `questionOptions`.
- Do not record secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, complete papers, complete textbooks, OCR full text, or private/customer-like content in evidence.
- Handoff from server runtime: validator rejects non-empty options for `case_analysis` and `calculation`, so UI must never submit option rows for those types.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts`
- `npm.cmd run test:e2e -- e2e/content-action-closures.spec.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
