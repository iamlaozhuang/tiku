# Phase 86 Human Approval Checklist Plan

**Task id:** `phase-86-human-approval-checklist`

**Branch:** `codex/phase-86-human-approval-checklist`

**Task kind:** `docs_only`

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-85-first-implementation-slice-approval-draft.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-85-first-implementation-slice-approval-draft.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-85-first-implementation-slice-approval-draft.md`

## Scope

This task expands the Phase 85 first implementation slice approval draft into a human approval checklist only.

Allowed changes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-86-human-approval-checklist.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-86-human-approval-checklist.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-86-human-approval-checklist.md`

Blocked changes:

- product code, tests, e2e, scripts, schema, migration, dependency, package, lockfile, `.env.local`, or `.env.example`;
- provider, env/secret, staging/prod/cloud/deploy, payment, external-service, `authorization` permission model change, code-stage queue seeding, queue archive move/delete, or Cost Calibration Gate execution;
- implementation task execution or runtime claims for `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, or `ai_call_log`.

## Checklist Target

The checklist targets the Phase 85 proposed slice:

- slice: `advanced-authorization-context-read-model-contract`
- module: `authorization` context
- future task kind: `implementation` only after fresh explicit approval

This checklist is not approval. It only defines the minimum human decision points required before the proposed slice can become executable.

## Approach

1. Convert the Phase 85 approval draft into a human approval checklist.
2. Require exact allowed files, blocked files, validation commands, and evidence redaction constraints.
3. Keep schema, migration, dependency, provider, env/secret, staging/prod/cloud/deploy, payment, external-service, `authorization` permission model changes, and Cost Calibration Gate excluded unless separately approved.
4. Preserve architecture boundary: route handlers / server actions -> service -> repository -> model.
5. Preserve project terms: `authorization`, `personal_auth`, `org_auth`, `redeem_code`, `paper`, `mock_exam`, `audit_log`, and `ai_call_log`.

## Validation Commands

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-07-phase-86-human-approval-checklist.md docs\05-execution-logs\evidence\2026-06-07-phase-86-human-approval-checklist.md docs\05-execution-logs\audits-reviews\2026-06-07-phase-86-human-approval-checklist.md`
- `Select-String -Path docs\05-execution-logs\task-plans\2026-06-07-phase-86-human-approval-checklist.md,docs\05-execution-logs\evidence\2026-06-07-phase-86-human-approval-checklist.md,docs\05-execution-logs\audits-reviews\2026-06-07-phase-86-human-approval-checklist.md -Pattern 'human approval checklist','checklist is not approval','advanced-authorization-context-read-model-contract','fresh explicit approval','No product implementation approved','authorization','personal_auth','org_auth','redeem_code','paper','mock_exam','audit_log','ai_call_log','route handlers / server actions -> service -> repository -> model','schema','migration','dependency','provider','env/secret','staging/prod','payment','external-service','Cost Calibration Gate remains blocked'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
