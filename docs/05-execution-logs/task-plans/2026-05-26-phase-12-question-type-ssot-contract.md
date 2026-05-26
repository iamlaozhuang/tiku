# Phase 12 Question Type SSOT Contract Plan

## Task

- TaskId: `phase-12-question-type-ssot-contract`
- Branch: `codex/phase-12-question-type-ssot-contract`
- Goal: Align the question paper interface contract with the MVP question type SSOT for `case_analysis` and `calculation`.

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
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/interfaces/question-paper-contract.md`

## Allowed Files

- `docs/02-architecture/interfaces/question-paper-contract.md`
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
- `src/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

## Implementation Approach

1. Verify requirements and glossary already list the seven MVP question types:
   - `single_choice`
   - `multi_choice`
   - `true_false`
   - `fill_blank`
   - `short_answer`
   - `case_analysis`
   - `calculation`
2. Update `docs/02-architecture/interfaces/question-paper-contract.md` so `question_type` lists the same seven values.
3. Update queue/state/evidence for this subtask only.

## Risk Defense

- No runtime, schema, migration, UI, test, dependency, lockfile, script, env, provider, staging/prod, cloud, deployment, or destructive data operation.
- This task only aligns SSOT and contract documentation.
- No formula parser, numeric tolerance, or step calculation engine is introduced.
- No sensitive/raw content is recorded.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-12-question-type-ssot-contract`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
