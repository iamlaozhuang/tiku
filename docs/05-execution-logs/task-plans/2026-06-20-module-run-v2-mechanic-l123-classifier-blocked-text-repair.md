# Module Run V2 Mechanic L123 Classifier Blocked Text Repair Plan

## Task

- Branch: `codex/l123-classifier-blocked-text-repair`.
- Scope: repair the L123 classifier so blocked/non-execution text does not misclassify low-risk local implementation
  tasks as L3 execution.
- Immediate unblock target: `batch-228-ops-governance-and-retention-operations-facing-authorization-and-quota-go`.

## Readiness Inputs

- Read `AGENTS.md`.
- Read `docs/03-standards/code-taste-ten-commandments.md`.
- Read all ADRs under `docs/02-architecture/adr/`.
- Reproduced current blocker:
  `Test-ModuleRunV2L123AccelerationReadiness.ps1 -TaskId batch-228-ops-governance-and-retention-operations-facing-authorization-and-quota-go`
  returns `l123_l3_approval_only` with `l3_high_risk_execution_blocked`.
- Reviewed `scripts/agent-system/Test-ModuleRunV2L123AccelerationReadiness.ps1` and its smoke test.

## Root Cause

The classifier scans the full queue task block for L3 keywords. Seeded local implementation tasks include high-risk words
inside negative/blocked text such as `nonGoals`, `blockedFiles`, `blockedAgentActions`, capabilities marked `blocked`,
and approval statements that explicitly deny provider/env/schema/deploy/dependency work. Those negative guardrails are
being treated as positive execution scope.

## Implementation Strategy

1. Add a smoke test fixture where a local implementation task contains high-risk terms only in blocked/non-goal fields.
2. Verify the new smoke test fails before changing implementation.
3. Add a small helper that builds classifier input from positive execution fields only.
4. Keep L3 approval-package classification intact for true L3 task ids/titles and approval packages.
5. Run L123 smoke, targeted batch-228 readiness, lint, typecheck, `git diff --check`, and hardening gates.
6. Commit mechanism fix, FF merge to `master`, push, and clean up the short branch before claiming batch-228.

## Allowed Files

- `scripts/agent-system/Test-ModuleRunV2L123AccelerationReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2L123AccelerationReadiness.Smoke.ps1`
- `docs/05-execution-logs/task-plans/2026-06-20-module-run-v2-mechanic-l123-classifier-blocked-text-repair.md`
- `docs/05-execution-logs/evidence/2026-06-20-module-run-v2-mechanic-l123-classifier-blocked-text-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-20-module-run-v2-mechanic-l123-classifier-blocked-text-repair.md`

## Blocked Files And Capabilities

- No `.env*`, package or lockfile changes.
- No source product code under `src/**`.
- No tests outside the L123 smoke script.
- No schema, migration, DB read/write, provider/model call, deploy, payment, PR, force-push, destructive DB, or Cost
  Calibration Gate execution.
- No sensitive evidence.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2L123AccelerationReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2L123AccelerationReadiness.ps1 -TaskId batch-228-ops-governance-and-retention-operations-facing-authorization-and-quota-go`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1`
