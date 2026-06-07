# Phase 71 Advanced Personal AI Generation Implementation Planning

**Task id:** `phase-71-advanced-personal-ai-generation-implementation-planning`

**Branch:** `codex/phase-71-personal-ai-generation-planning`

**Task kind:** `implementation_planning`

## Approval Boundary

The user approved serial advancement of Phase 69-78 under `local_auto_candidate`.

This task is planning-only. It does not approve direct implementation, formal content write-path changes, dependency, schema, migration, provider, env/secret, staging/prod/cloud/deploy, payment, external-service work, or Cost Calibration Gate execution.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-personal-ai-generation-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-mvp-implementation-breakdown.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-70-advanced-ai-task-domain-implementation-planning.md`

## Scope

Allowed files are limited to state, queue, this task plan, evidence, and audit review.

Blocked files and surfaces include `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, `drizzle/**`, package or lockfiles, scripts, env/secret files, provider runtime files, formal content write paths, staging/prod/cloud/deploy, payment, external-service, and Cost Calibration Gate execution.

## Planning Output

Future implementation should be split into separately approved code-stage tasks:

1. Personal AI content contract and model:
   - Define personal AI generated question and AI learning `paper` DTOs.
   - Keep generated learning content separate from formal `question`, formal `paper`, and formal `mock_exam`.
2. Validation and constraints:
   - Validate first-release question types, subject, difficulty, count, `knowledge_node`, and generation constraints.
   - Reject unsupported types without provider calls.
3. Service orchestration:
   - Require Phase 69 advanced `authorization` context and Phase 70 AI task domain.
   - Submit generation tasks asynchronously without waiting for model output.
4. Mapper and redaction:
   - Map owner-only generated content DTOs with public ids, camelCase fields, explicit `null`, and no raw prompts or provider payloads.
5. Optional route/Web surfaces:
   - Add REST and student UI surfaces only after separate implementation approval.
   - Include Loading, Empty, Error, Permission Blocked, Expired Hidden, and owner-only states if UI is approved.
6. Tests:
   - Prove generated question is not formal `question`.
   - Prove generated AI learning `paper` is not formal `mock_exam`.
   - Prove owner-only access and redaction.

## Risk Defenses

- Do not write AI generated content into formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`.
- Do not expose raw prompt, raw generated content, provider payload, secret, token, plaintext `redeem_code`, full `paper` content, or numeric ids in ordinary DTOs or evidence.
- Real provider calls remain blocked.
- Cost Calibration Gate remains blocked pending fresh explicit approval.

## Validation Commands

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-07-phase-71-advanced-personal-ai-generation-implementation-planning.md docs\05-execution-logs\evidence\2026-06-07-phase-71-advanced-personal-ai-generation-implementation-planning.md docs\05-execution-logs\audits-reviews\2026-06-07-phase-71-advanced-personal-ai-generation-implementation-planning.md`
- `Select-String -Path docs\05-execution-logs\task-plans\2026-06-07-phase-71-advanced-personal-ai-generation-implementation-planning.md,docs\05-execution-logs\evidence\2026-06-07-phase-71-advanced-personal-ai-generation-implementation-planning.md,docs\05-execution-logs\audits-reviews\2026-06-07-phase-71-advanced-personal-ai-generation-implementation-planning.md -Pattern 'Implementation Task Proposal','authorization','paper','mock_exam','question','ai_call_log','redeem_code','formal content','Cost Calibration Gate remains blocked'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Stop Conditions

Stop if direct implementation, formal content write-path changes, provider execution, dependency, schema, migration, env/secret, staging/prod/cloud/deploy, payment, external-service work, Cost Calibration Gate execution, or sensitive evidence becomes necessary.
