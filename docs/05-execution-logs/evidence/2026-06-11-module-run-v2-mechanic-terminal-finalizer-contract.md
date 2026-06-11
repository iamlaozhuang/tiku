# Module Run V2 Terminal Finalizer Contract Evidence

## Scope

Task 3 adds durable terminal envelope fields to the run registry finalizer and validates no-write terminal paths.

Anchors: `tiku-module-run-v2-autopilot`, `tiku-module-run-v2-mechanic-2`.

## Commands

- `.\scripts\agent-system\Set-ModuleRunV2RunRegistryFinalizer.Smoke.ps1`
  - Result: `Module Run v2 run registry finalizer smoke passed`
- `.\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
  - Result: `Module Run v2 autopilot runner smoke passed`
- `git diff --check`
  - Result: passed with no whitespace errors.
- `node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown docs/04-agent-system/sop/automated-advancement-governance.md docs/04-agent-system/state/autodrive-control-schema.yaml scripts/agent-system/Set-ModuleRunV2RunRegistryFinalizer.ps1 scripts/agent-system/Set-ModuleRunV2RunRegistryFinalizer.Smoke.ps1 docs/05-execution-logs/task-plans/2026-06-11-module-run-v2-mechanic-terminal-finalizer-contract.md docs/05-execution-logs/evidence/2026-06-11-module-run-v2-mechanic-terminal-finalizer-contract.md docs/05-execution-logs/audits-reviews/2026-06-11-module-run-v2-mechanic-terminal-finalizer-contract.md`
  - Result: `All matched files use Prettier code style!`
- `npm run lint`
  - Result: passed.
- `npm run typecheck`
  - Result: passed.

## Result

Passed. The finalizer now emits and persists `severity`, `requiresHuman`, `nextCommand`, `riskIfAutoContinued`,
`stateWritten`, `noWriteReason`, and `resumePointer`. No-write terminal exits emit `stateWritten: none` and a
human-readable no-write reason.

## Safety

- No provider, env, schema migration, deploy, dependency, PR, force push, or Cost Calibration Gate action was executed.
- `Cost Calibration Gate remains blocked`.
