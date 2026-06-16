# Task Plan: Module Run v2 Docs-Only Fast Lane Mechanism

## Task

- Task id: `module-run-v2-docs-only-fast-lane-mechanism`
- Branch: `codex/module-run-v2-docs-only-fast-lane`
- Task kind: mechanism hardening.
- User approval: explicit implementation approval in this thread for the reviewed Module Run v2 Docs-Only Fast Lane plan.

## Read Before Editing

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- Relevant SOP and readiness scripts under `docs/04-agent-system/sop/` and `scripts/agent-system/`
- Recent Module Run v2 evidence and audit records for docs-only and mechanism closeout.

## Scope

Allowed:

- Add the docs-only fast lane governance SOP.
- Add the Module Run v2 evidence template with required closeout anchors.
- Add the docs-only batch readiness script and smoke tests.
- Extend existing Module Run v2 PreCommit, ModuleCloseout, PrePush readiness scripts with explicit batch parameters while preserving default single-task behavior.
- Update `New-TaskEvidence.ps1` to use the new anchors by default and add smoke coverage.
- Update this task's state, queue, evidence, and audit review records.

Blocked:

- Product source implementation.
- Runtime route, service, repository, mapper, contract, model, validator, or UI changes.
- Schema, migration, dependency, package, or lockfile changes.
- DB access, row/private data access, provider/model calls, browser/e2e/dev-server, deploy, payment, external-service, PR, force-push, and Cost Calibration Gate.

## Approach

1. Create task plan/evidence/audit and queue/state entry for this ordinary mechanism task.
2. Write failing smoke coverage first for the new batch readiness script and `New-TaskEvidence` anchor generation.
3. Implement the governance SOP and template.
4. Implement `Test-ModuleRunV2DocsOnlyBatchReadiness.ps1` with `shadow` and `hard_block` modes.
5. Wire explicit `-DocsOnlyBatchId` and `-DocsOnlyBatchMode` parameters into PreCommit, ModuleCloseout, and PrePush, with no behavior change when omitted.
6. Run smoke scripts and full local readiness gates.

## Risk Defenses

- Batch mode is opt-in only.
- Shadow mode exits zero and reports `would_pass` or `would_block`.
- Hard-block mode exits non-zero on blockers.
- Fast lane children are restricted to docs/state/task-plan/evidence/audit paths.
- Any child or batch changed file under product source, tests, mechanism scripts, schema/migration, package/lockfile, e2e artifacts, or protected environment file patterns blocks.
- `needs_recheck` requires `nextTaskPolicy: seeded` with a queued next task or `nextTaskPolicy: intentionally_not_seeded` with a reason.

## Validation

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2DocsOnlyBatchReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-TaskEvidence.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId module-run-v2-docs-only-fast-lane-mechanism`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-docs-only-fast-lane-mechanism`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId module-run-v2-docs-only-fast-lane-mechanism -SkipRemoteAheadCheck`

## Stop Conditions

- Dirty worktree contains unrelated or out-of-scope files.
- Any smoke or readiness gate fails after implementation.
- Batch integration changes default single-task behavior.
- Any blocked gate is required to proceed.
