# Phase 12 Question Type Task Registration Plan

## Task

- TaskId: `phase-12-question-type-task-registration`
- Branch: `codex/phase-12-question-type-task-registration`
- Goal: Register the five approved `case_analysis` / `calculation` implementation subtasks in the semi-automation queue before runtime work begins.

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

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-26-phase-12-question-type-task-registration.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-question-type-task-registration.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

## Implementation Approach

1. Add a queue-registration task with status `pending`.
2. Register five approved subtasks:
   - `phase-12-question-type-ssot-contract`
   - `phase-12-question-type-schema-migration`
   - `phase-12-question-type-server-runtime`
   - `phase-12-question-type-admin-ui`
   - `phase-12-question-type-student-report`
3. Chain dependencies so each subtask starts only after the previous one is closed.
4. Update `project-state.yaml` to point to the registration task and next recommended action.
5. Run local documentation and queue validation, then close the registration task.

## Risk Defense

- Do not touch runtime, schema, migration, dependency, lockfile, script, or env files in this registration task.
- Record the user's explicit implementation approval only as task metadata; actual code changes remain separated by subtask.
- Keep migration task metadata constrained to pure PostgreSQL enum `ADD VALUE` work.
- Keep `case_analysis` and `calculation` scoped to subjective text-answer behavior; no formula parser, tolerance engine, or step calculation engine.
- Do not record secrets, provider payloads, raw prompts, raw answers, raw model responses, complete papers, complete textbooks, OCR full text, or customer/private content.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-12-question-type-task-registration`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
