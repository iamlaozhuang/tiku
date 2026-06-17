# Mechanism Runner Profile WorkPacket LocalFullFlow Consumption Evidence

## Summary

- taskId: `mechanism-runner-profile-workpacket-localfullflow-consumption`
- branch: `codex/mechanism-runner-profile-consumption`
- scope: runner profile/workPacket catalog consumption and local full-flow capability gate hardening.
- result: passed

## Changed Files

- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-17-mechanism-runner-profile-workpacket-localfullflow-consumption.md`
- `docs/05-execution-logs/evidence/2026-06-17-mechanism-runner-profile-workpacket-localfullflow-consumption.md`
- `docs/05-execution-logs/audits-reviews/2026-06-17-mechanism-runner-profile-workpacket-localfullflow-consumption.md`
- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2LocalCapabilityGate.ps1`
- `scripts/agent-system/Test-ModuleRunV2LocalCapabilityGate.Smoke.ps1`

## Implementation Evidence

- Batch range: mechanism runner profile/workPacket/localFullFlow single-task batch.
- RED: local capability gate and runner smoke initially exposed bounded issues in local-only host parsing and runner startup parameter passing.
- GREEN: local capability gate smoke, autopilot runner smoke, static validation, lint, and typecheck passed after scoped fixes.
- Commit: `d0a2b19d` is the pre-commit branch base; final local commit is pending closeout.
- localFullLoopGate: not executed; this task defines and verifies local full-flow readiness gates only.
- Added next-action output for `workPacketId`, `workPacketScope`, and `catalogMaxTasksPerPacket`.
- Updated runner to pass `ExecutionProfileCatalogPath` to next-action and seed transaction.
- Updated runner to report `runnerWorkPacketId`, `runnerWorkPacketScope`, `runnerCatalogMaxTasksPerPacket`, and `runnerEffectiveMaxSteps`.
- Capped runner effective loop budget by catalog `workPacket.maxTasksPerPacket` when a positive profile limit is present.
- Strengthened `localFullFlowGate` use-capability readiness to require `executionProfile: local_full_flow`, `validationPolicy: local_full_flow`, `localFullFlowGate: approved_localhost_only`, explicit validation commands, and localhost-only URL targets.
- Added smoke coverage for runner workPacket budget reporting and local full-flow gate rejection/approval.

## Focused Diagnostics

- `Test-ModuleRunV2LocalCapabilityGate.Smoke.ps1`: passed after verifying missing profile rejection, blocked non-local target rejection, and localhost-only approval.
- `Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`: passed after verifying ready-set/workPacket output and effective max-step cap.
- `Get-TikuNextAction.ps1`: passed with current task `mechanism-runner-profile-workpacket-localfullflow-consumption(in_progress)`, `catalogMaxTasksPerPacket: 6`, and `workPacketId: mechanism-tuning-final-behavior-2026-06-17`.

## Validation

- `git diff --check`: passed.
- `node_modules/.bin/prettier.cmd --check docs/04-agent-system/state/autodrive-control-schema.yaml docs/04-agent-system/state/execution-profiles.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-17-mechanism-runner-profile-workpacket-localfullflow-consumption.md docs/05-execution-logs/evidence/2026-06-17-mechanism-runner-profile-workpacket-localfullflow-consumption.md docs/05-execution-logs/audits-reviews/2026-06-17-mechanism-runner-profile-workpacket-localfullflow-consumption.md`: passed.
- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.Smoke.ps1`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-TaskEvidence.Smoke.ps1`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.ps1 -TaskId mechanism-runner-profile-workpacket-localfullflow-consumption`: passed.

## Boundary

- No product source code changed.
- No schema, drizzle, package, lockfile, or dependency changes.
- No `.env*` access, output, summary, or edit.
- No provider/model calls, provider configuration, quota, cost, or Cost Calibration Gate work.
- No staging, production, cloud, deploy, payment, or external service access.
- No dev server, Browser, Playwright, or e2e execution.
- No PR or force push.

## Blocked Remainder

- threadRolloverGate: no rollover required; continue with commit, fast-forward merge, push, and cleanup for this task.
- nextModuleRunCandidate: perform final mechanism tuning completion audit after this branch is integrated.
- This task strengthens local full-flow readiness only; it does not run a local full-flow demo.
- Product task seeding remains out of scope for mechanism tuning.
- Cost Calibration Gate remains blocked.
