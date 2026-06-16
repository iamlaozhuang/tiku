# Task Plan: module-run-v2-standing-autonomy-policy-governance

## Scope

- Task id: `module-run-v2-standing-autonomy-policy-governance`
- Branch: `codex/module-run-v2-standing-autonomy-policy`
- Task kind: `governance`
- Goal: materialize the user's 2026-06-16 authorization upgrade into durable Module Run v2 governance, state, queue, evidence, and audit records.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/05-execution-logs/evidence/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`

## Allowed Files

- `docs/04-agent-system/sop/standing-autonomy-policy-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-16-module-run-v2-standing-autonomy-policy-governance.md`
- `docs/05-execution-logs/evidence/2026-06-16-module-run-v2-standing-autonomy-policy-governance.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-module-run-v2-standing-autonomy-policy-governance.md`

## Blocked Files And Work

- No `.env*` read, output, or edit.
- No product source, test, script, schema, migration, package, lockfile, e2e artifact, browser artifact, material, or paper asset change.
- No DB access, provider/model call, quota/cost measurement, dev server, Browser, Playwright, staging/prod/cloud/deploy/payment/external-service action, PR creation, or force push during this governance task.

## Implementation Steps

1. Add a new SOP that defines standing autonomy as a task-scoped authorization model, not an unrestricted permission.
2. Record the SOP path and standing approval block in `project-state.yaml`.
3. Add a closed queue task for this governance change with explicit allowed files, blocked files, validation commands, and closeout policy.
4. Write evidence and audit review that document the approval boundary and preserved hard blocks.
5. Run formatting, lint/typecheck, Git readiness, PreCommit, ModuleCloseout, and PrePush readiness before commit/merge/push.

## Policy Decisions

- Queue tasks remain the unit of work. Standing approval is consumable only when a queued task declares the capability, allowed files, blocked files, validation commands, and evidence path.
- Routine local closeout can proceed through a task `closeoutPolicy` when gates pass.
- Local DB, local schema/migration, local dev-server/browser/e2e, dependency, and provider/model work can be approved by standing policy only when the active task explicitly declares the relevant local capability and redacted evidence rules.
- Fresh approval remains required for real secret/env value access or output, staging/prod/cloud/deploy/payment/external-service, PR creation/update, force push, production/shared-data destructive operations, and Cost Calibration Gate execution.

## Validation Commands

```powershell
npm.cmd exec -- prettier --write docs/04-agent-system/sop/standing-autonomy-policy-governance.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-16-module-run-v2-standing-autonomy-policy-governance.md docs/05-execution-logs/evidence/2026-06-16-module-run-v2-standing-autonomy-policy-governance.md docs/05-execution-logs/audits-reviews/2026-06-16-module-run-v2-standing-autonomy-policy-governance.md
npm.cmd exec -- prettier --check docs/04-agent-system/sop/standing-autonomy-policy-governance.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-16-module-run-v2-standing-autonomy-policy-governance.md docs/05-execution-logs/evidence/2026-06-16-module-run-v2-standing-autonomy-policy-governance.md docs/05-execution-logs/audits-reviews/2026-06-16-module-run-v2-standing-autonomy-policy-governance.md
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId module-run-v2-standing-autonomy-policy-governance
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-standing-autonomy-policy-governance
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId module-run-v2-standing-autonomy-policy-governance -SkipRemoteAheadCheck
```
