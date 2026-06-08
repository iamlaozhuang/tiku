# Phase 85 First Implementation Slice Approval Draft Plan

**Task id:** `phase-85-first-implementation-slice-approval-draft`

**Branch:** `codex/phase-85-first-implementation-slice-approval-draft`

**Task kind:** `docs_only`

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-84-code-stage-narrow-scope-approval-decision-record.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-84-code-stage-narrow-scope-approval-decision-record.md`

## Scope

This task drafts the first implementation slice approval template only.

Allowed changes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-85-first-implementation-slice-approval-draft.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-85-first-implementation-slice-approval-draft.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-85-first-implementation-slice-approval-draft.md`

Blocked changes:

- product code, tests, e2e, scripts, schema, migration, dependency, package, lockfile, `.env.local`, or `.env.example`;
- provider, env/secret, staging/prod/cloud/deploy, payment, external-service, `authorization` permission model change, code-stage queue seeding, queue archive move/delete, or Cost Calibration Gate execution;
- implementation task execution or runtime claims for `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, or `ai_call_log`.

## Draft Slice Choice

The first approval draft targets an `authorization` context read-model / service-contract planning slice because it is the lowest-risk prerequisite boundary for advanced edition code-stage work.

This is not approval to implement the slice. The future approval must be explicit before any `src/**`, tests, schema, migration, dependency, provider, env/secret, staging/prod/cloud/deploy, payment, or external-service work starts.

## Approach

1. Draft the approval template for one narrow implementation slice.
2. State what a future approval must name before implementation may start.
3. Preserve architecture boundaries: route handlers / server actions -> service -> repository -> model.
4. Preserve terminology: `authorization`, `personal_auth`, `org_auth`, `redeem_code`, `paper`, `mock_exam`, `audit_log`, and `ai_call_log`.
5. Keep Cost Calibration Gate blocked.

## Validation Commands

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-07-phase-85-first-implementation-slice-approval-draft.md docs\05-execution-logs\evidence\2026-06-07-phase-85-first-implementation-slice-approval-draft.md docs\05-execution-logs\audits-reviews\2026-06-07-phase-85-first-implementation-slice-approval-draft.md`
- `Select-String -Path docs\05-execution-logs\task-plans\2026-06-07-phase-85-first-implementation-slice-approval-draft.md,docs\05-execution-logs\evidence\2026-06-07-phase-85-first-implementation-slice-approval-draft.md,docs\05-execution-logs\audits-reviews\2026-06-07-phase-85-first-implementation-slice-approval-draft.md -Pattern 'approval draft only','first implementation slice','fresh explicit approval','No product implementation approved','authorization','personal_auth','org_auth','redeem_code','paper','mock_exam','audit_log','ai_call_log','route handlers / server actions -> service -> repository -> model','schema','migration','dependency','provider','env/secret','staging/prod','payment','external-service','Cost Calibration Gate remains blocked'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
