# Module Run v2 Closeout Continuity Hardening Plan

## Task

- Task id: `module-run-v2-closeout-continuity-hardening`
- Task kind: `implementation`
- Source story: `user-request-2026-06-09-closeout-continuity-hardening`
- Branch: `codex/module-run-v2-ai-task-provider-planning`

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/05-execution-logs/task-plans/2026-06-08-module-run-v2-ai-task-and-provider-planning.md`
- `docs/05-execution-logs/evidence/2026-06-08-module-run-v2-ai-task-and-provider-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-ai-task-and-provider-planning.md`

## Goal

Close the current mechanism gap where a completed task with valid evidence can seed the next task but cannot safely
auto-closeout. The repaired mechanism must allow guarded local automation to execute approved commit, fast-forward
merge, push, branch cleanup, worktree parking, and immediate startup continuation without weakening hard blocks.

## Scope

### Allowed files

- `scripts/agent-system/Invoke-ModuleRunV2Autopilot.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2Autopilot.Smoke.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2ApprovedCloseout.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2ApprovedCloseout.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.Smoke.ps1`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-08-module-run-v2-ai-task-and-provider-planning.md`
- `docs/05-execution-logs/evidence/2026-06-08-module-run-v2-ai-task-and-provider-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-ai-task-and-provider-planning.md`
- `docs/05-execution-logs/task-plans/2026-06-09-module-run-v2-ai-task-lifecycle-local-contract.md`
- `docs/05-execution-logs/evidence/2026-06-09-module-run-v2-ai-task-lifecycle-local-contract.md`
- `docs/05-execution-logs/audits-reviews/2026-06-09-module-run-v2-ai-task-lifecycle-local-contract.md`
- `docs/05-execution-logs/task-plans/2026-06-09-module-run-v2-closeout-continuity-hardening.md`
- `docs/05-execution-logs/evidence/2026-06-09-module-run-v2-closeout-continuity-hardening.md`
- `docs/05-execution-logs/audits-reviews/2026-06-09-module-run-v2-closeout-continuity-hardening.md`

### Blocked files

- `.env.local`
- `.env.example`
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `src/**`
- `tests/**`
- `e2e/**`
- `src/db/schema/**`
- `drizzle/**`

## Implementation Plan

1. Add explicit closeout approval wording to the completed planning task queue entry so the current breakpoint has a
   durable approval source.
2. Add a dedicated closeout executor script that:
   - verifies current task status is `done` or `closed`;
   - verifies explicit approval for commit / merge / push / cleanup;
   - reruns module closeout and pre-push readiness;
   - creates one focused commit from task-scoped changes;
   - fast-forward merges into `master`;
   - pushes `origin/master`;
   - parks the automation worktree detached at `origin/master`;
   - deletes the merged short-lived branch when safe.
3. Extend autopilot closeout recovery to call the executor only when the current task is explicitly approved for full
   closeout and the dirty files remain task-scoped.
4. Relax unattended closeout recovery only for this exact approved-closeout shape; keep all other dirty closeout states
   as hard blocks.
5. Add smoke coverage for the approved closeout path and update SOP / matrix wording.
6. Carry forward the already-created planning-task durable approval files and seeded next-task placeholder logs into the
   same closeout boundary so the live branch can be closed without cross-task dirty-file drift.

## Risk Defenses

- No provider, env/secret, dependency, schema, migration, deploy, payment, external-service, or Cost Calibration Gate.
- No protected-branch editing; merge occurs only through fast-forward from an approved short-lived branch.
- No force push.
- Branch cleanup only after push succeeds and the worktree is parked away from the branch.
- Keep approval parsing strict: automation acts only when the task records explicit closeout wording.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId module-run-v2-closeout-continuity-hardening -PlannedFiles scripts/agent-system/Invoke-ModuleRunV2Autopilot.ps1,scripts/agent-system/Invoke-ModuleRunV2Autopilot.Smoke.ps1,scripts/agent-system/Invoke-ModuleRunV2ApprovedCloseout.ps1,scripts/agent-system/Invoke-ModuleRunV2ApprovedCloseout.Smoke.ps1,scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1,scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1,scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1,scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.Smoke.ps1,docs/04-agent-system/sop/automated-advancement-governance.md,docs/04-agent-system/sop/task-lifecycle-governance.md,docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml,docs/04-agent-system/state/project-state.yaml,docs/04-agent-system/state/task-queue.yaml,docs/05-execution-logs/task-plans/2026-06-08-module-run-v2-ai-task-and-provider-planning.md,docs/05-execution-logs/evidence/2026-06-08-module-run-v2-ai-task-and-provider-planning.md,docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-ai-task-and-provider-planning.md,docs/05-execution-logs/task-plans/2026-06-09-module-run-v2-ai-task-lifecycle-local-contract.md,docs/05-execution-logs/evidence/2026-06-09-module-run-v2-ai-task-lifecycle-local-contract.md,docs/05-execution-logs/audits-reviews/2026-06-09-module-run-v2-ai-task-lifecycle-local-contract.md,docs/05-execution-logs/task-plans/2026-06-09-module-run-v2-closeout-continuity-hardening.md,docs/05-execution-logs/evidence/2026-06-09-module-run-v2-closeout-continuity-hardening.md,docs/05-execution-logs/audits-reviews/2026-06-09-module-run-v2-closeout-continuity-hardening.md`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2ApprovedCloseout.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2UnattendedReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2Autopilot.Smoke.ps1`
- `git diff --check`
- scoped `prettier --write` and `prettier --check`
- required anchor check for `approvedCloseoutContinuation`, `automationWorktreeParking`, `closeoutRecovery`,
  `implementationAutoSeedGate`, and `Cost Calibration Gate remains blocked`

## Stop Conditions

Stop if the repair requires product code, dependency change, schema / migration work, provider call or config,
env/secret read or write, deploy, payment, external-service action, force push, non-fast-forward merge, or cleanup
outside the approved worktree root.

Cost Calibration Gate remains blocked.
