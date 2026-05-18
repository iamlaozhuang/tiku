# Task Plan: phase-3-question-paper-contract-approval

## Goal

Define and approve the Phase 3 question/paper contract before any schema, migration, API route, service, repository, or admin UI implementation starts.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/glossary.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/global-db-api-skeleton.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-3-question-paper-planning.md`

## Scope

- Task id: `phase-3-question-paper-contract-approval`
- Branch: `codex/phase-3-question-paper-contract-approval`
- Temporary stacked base: `codex/phase-3-question-paper-planning`
- Final intended base after planning lands: `master`

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-19-phase-3-question-paper-contract-approval.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-3-question-paper-contract-approval.md`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-3-question-paper-contract-approval-security-review.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/**`
- `drizzle/**`
- `.env.example`

## Implementation Plan

1. Create `docs/02-architecture/interfaces/question-paper-contract.md` with the approved entity, schema, route, DTO, authorization, snapshot, and migration boundaries for Phase 3.
2. Create a dedicated security review artifact because this task covers schema, migration, authorization, API contract, data contract, and admin risk types.
3. Create evidence recording scope, human approval status, validation, security review verdict, Git closeout, and taste self-check.
4. Update `project-state.yaml` to claim this task while in progress, then reset it to idle after validation.
5. Mark `phase-3-question-paper-contract-approval` as done after validation and leave downstream implementation tasks pending.

## Human Approval And Risk Gate

- User instruction on 2026-05-19: "开始推进任务，必要时可以用子代理推进。"
- This is approval to proceed with the queue task and create the contract approval artifact.
- This is not approval to modify `package.json`, lockfiles, runtime source, schema files, `drizzle/**`, environment files, or to generate migrations.
- Future `database_migration`, dependency, deploy, merge, or push actions still require their own explicit approval and evidence.

## Security Review

Security review required: yes.

Triggered risk types:

- `schema`
- `migration`
- `authorization`
- `api_contract`
- `data_contract`
- `admin`

Review artifact:

- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-3-question-paper-contract-approval-security-review.md`

## Validation Commands

```powershell
Test-Path 'docs\02-architecture\interfaces\question-paper-contract.md'
Select-String -Path 'docs\02-architecture\interfaces\question-paper-contract.md' -Pattern 'question|paper|material|paper_section|question_group|question_option|scoring_point|paper_asset|authorization'
Select-String -Path 'docs\05-execution-logs\task-plans\2026-05-19-phase-3-question-paper-contract-approval.md' -Pattern 'human approval|security review'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
npm.cmd run format:check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

## Evidence Plan

- Record read sources and existing code observations.
- Record the contract decisions and intentional non-decisions.
- Record the dedicated security review verdict.
- Record each validation command with exit status and key output.
- Record local commit decision, merge skipped, push skipped, and stacked base status.
