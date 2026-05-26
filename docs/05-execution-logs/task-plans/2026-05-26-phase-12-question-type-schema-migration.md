# Phase 12 Question Type Schema Migration Plan

## Task

- TaskId: `phase-12-question-type-schema-migration`
- Branch: `codex/phase-12-question-type-schema-migration`
- Goal: Add `case_analysis` and `calculation` to the Drizzle `question_type` schema enum and generate a safe PostgreSQL enum migration.

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
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-question-type-ssot-contract.md`
- Drizzle skill: `C:\Users\jzzhu\.codex\skills\drizzle-orm-expert\SKILL.md`
- TDD skill: `C:\Users\jzzhu\.codex\plugins\cache\openai-curated\superpowers\6188456f\skills\test-driven-development\SKILL.md`

## Allowed Files

- `src/db/schema/paper.ts`
- `src/db/schema/paper.test.ts`
- `drizzle/20260526000100_add_question_type_case_analysis_calculation.sql`
- `drizzle/meta/_journal.json`
- `drizzle/meta/0002_snapshot.json`
- `src/components/admin/QuestionMaterialManagement/AdminQuestionMaterialManagement.tsx`
- `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`
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
- `scripts/**`

## Implementation Approach

1. Write `src/db/schema/paper.test.ts` first, asserting `questionTypeValues` equals the seven MVP values.
2. Run the focused test and record RED failure.
3. Add `case_analysis` and `calculation` to `questionTypeValues` in `src/db/schema/paper.ts`.
4. Create a PostgreSQL migration with only:
   - `ALTER TYPE "public"."question_type" ADD VALUE IF NOT EXISTS 'case_analysis';`
   - `ALTER TYPE "public"."question_type" ADD VALUE IF NOT EXISTS 'calculation';`
5. Update Drizzle meta by copying the latest snapshot shape and extending only `public.question_type.values`, then add a matching `_journal.json` entry.
6. If typecheck fails because the expanded schema type makes existing exhaustive UI label maps incomplete, add only the two missing labels as a bridge change and leave all admin UI behavior work to `phase-12-question-type-admin-ui`.
7. Run focused and full declared gates.

## Risk Defense

- Do not run `drizzle-kit generate` because this repo's `drizzle.config.ts` reads `.env.local`, which is forbidden in this turn.
- Do not connect to any database or run any migration.
- Stop if migration contains `DROP`, `DELETE`, `TRUNCATE`, enum recreation, or data rewrite.
- Do not add formula parsing, numeric tolerance, or step calculation logic.
- Do not implement admin UI form/filter behavior in this task; only exhaustive labels may be added if required by typecheck.
- Do not touch dependency files, lockfiles, scripts, env files, provider/cloud/staging/prod resources, or deployment.
- Do not record secrets, raw provider payloads, raw prompts, raw answers, raw model responses, complete papers, complete textbooks, OCR full text, or private/customer-like content.

## Handoff To Admin UI Task

- `phase-12-question-type-schema-migration` may add `case_analysis` / `calculation` labels in the two existing admin UI label maps only to keep `QuestionType` exhaustive after schema expansion.
- `phase-12-question-type-admin-ui` must still implement and verify the actual admin authoring behavior: selectable options, subjective form path, empty `questionOptions`, scoring points, list/filter/display behavior, and E2E coverage.

## Validation Commands

- `npm.cmd run test:unit -- src/db/schema/paper.test.ts`
- `rg -n "DROP|DELETE|TRUNCATE|ALTER TYPE.*ADD VALUE|case_analysis|calculation" drizzle`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
