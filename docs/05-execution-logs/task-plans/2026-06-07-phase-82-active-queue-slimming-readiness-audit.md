# Phase 82 Active Queue Slimming Readiness Audit Plan

**Task id:** `phase-82-active-queue-slimming-readiness-audit`

**Branch:** `codex/phase-82-active-queue-slimming-readiness-audit`

**Task kind:** `docs_only`

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-81-next-docs-only-batch-planning.md`

## Scope

This task audits whether the active queue is ready for a future slimming/archive task.

Allowed changes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-82-active-queue-slimming-readiness-audit.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-82-active-queue-slimming-readiness-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-82-active-queue-slimming-readiness-audit.md`

Blocked changes:

- archive file creation, queue entry move/delete, `task-history-index.yaml` creation or update;
- product code, tests, e2e, scripts, schema, migration, dependency, package, lockfile, `.env.local`, or `.env.example`;
- provider, env/secret, staging/prod/cloud/deploy, payment, external-service, authorization permission model change, or Cost Calibration Gate execution.

## Audit Approach

1. Count active queue tasks and terminal tasks.
2. Compare the active queue against Archive Eligibility and Active Queue Size Signals.
3. Identify whether a later archive execution task would be useful.
4. Preserve the rule that Phase 82 performs readiness audit only and no archive move.
5. Keep Phase 83 pending for the next serial task.

## Validation Commands

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-07-phase-82-active-queue-slimming-readiness-audit.md docs\05-execution-logs\evidence\2026-06-07-phase-82-active-queue-slimming-readiness-audit.md docs\05-execution-logs\audits-reviews\2026-06-07-phase-82-active-queue-slimming-readiness-audit.md`
- `Select-String -Path docs\05-execution-logs\task-plans\2026-06-07-phase-82-active-queue-slimming-readiness-audit.md,docs\05-execution-logs\evidence\2026-06-07-phase-82-active-queue-slimming-readiness-audit.md,docs\05-execution-logs\audits-reviews\2026-06-07-phase-82-active-queue-slimming-readiness-audit.md -Pattern 'Archive Eligibility','active queue','readiness audit','no archive move','local_auto_candidate','authorization','paper','mock_exam','redeem_code','audit_log','ai_call_log','Cost Calibration Gate remains blocked'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
