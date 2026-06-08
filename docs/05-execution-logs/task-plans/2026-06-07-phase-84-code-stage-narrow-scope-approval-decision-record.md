# Phase 84 Code Stage Narrow Scope Approval Decision Record Plan

**Task id:** `phase-84-code-stage-narrow-scope-approval-decision-record`

**Branch:** `codex/phase-84-code-stage-narrow-scope-approval-decision-record`

**Task kind:** `docs_only`

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-83-code-stage-approval-request-pack.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-83-code-stage-approval-request-pack.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-83-code-stage-approval-request-pack.md`

## Scope

This task creates a docs-only approval decision record for the next code-stage boundary.

Allowed changes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-84-code-stage-narrow-scope-approval-decision-record.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-84-code-stage-narrow-scope-approval-decision-record.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-84-code-stage-narrow-scope-approval-decision-record.md`

Blocked changes:

- product code, tests, e2e, scripts, schema, migration, dependency, package, lockfile, `.env.local`, or `.env.example`;
- provider, env/secret, staging/prod/cloud/deploy, payment, external-service, `authorization` permission model change, code-stage implementation, code-stage queue seeding, queue archive move/delete, or Cost Calibration Gate execution;
- runtime claims for `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, or `ai_call_log`.

## Approach

1. Record the current decision: Phase 84 does not approve product implementation or code-stage queue seeding.
2. Define the minimum fields a future narrow-scope code-stage approval must name.
3. Separate work that may continue under `local_auto_candidate` from work that requires fresh explicit approval.
4. Preserve blocked-gate wording for schema, migration, dependency, provider, env/secret, staging/prod, payment, external-service, and Cost Calibration Gate.
5. Update state and queue only for Phase 84.

## Validation Commands

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-07-phase-84-code-stage-narrow-scope-approval-decision-record.md docs\05-execution-logs\evidence\2026-06-07-phase-84-code-stage-narrow-scope-approval-decision-record.md docs\05-execution-logs\audits-reviews\2026-06-07-phase-84-code-stage-narrow-scope-approval-decision-record.md`
- `Select-String -Path docs\05-execution-logs\task-plans\2026-06-07-phase-84-code-stage-narrow-scope-approval-decision-record.md,docs\05-execution-logs\evidence\2026-06-07-phase-84-code-stage-narrow-scope-approval-decision-record.md,docs\05-execution-logs\audits-reviews\2026-06-07-phase-84-code-stage-narrow-scope-approval-decision-record.md -Pattern 'Approval Decision Record','narrow-scope','fresh explicit approval','No product implementation approved','local_auto_candidate','authorization','paper','mock_exam','redeem_code','audit_log','ai_call_log','schema','migration','dependency','provider','env/secret','staging/prod','payment','external-service','Cost Calibration Gate remains blocked'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
