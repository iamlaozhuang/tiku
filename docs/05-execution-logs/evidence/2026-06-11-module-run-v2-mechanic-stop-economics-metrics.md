# Module Run V2 Stop Economics Metrics Evidence

## Scope

Task 7 adds read-only stop economics metrics for `tiku-module-run-v2-autopilot` and `tiku-module-run-v2-mechanic-2`.

## Commands

- `.\scripts\agent-system\Get-ModuleRunV2StopEconomics.Smoke.ps1`
  - Result: `Module Run v2 stop economics smoke passed`
- `.\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
  - Result: `Module Run v2 autopilot runner smoke passed`
- `git diff --check`
  - Result: passed with no whitespace errors.
- `node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown <changed files>`
  - Result: `All matched files use Prettier code style!`
- `npm run lint`
  - Result: passed.
- `npm run typecheck`
  - Result: passed.

## Result

Passed. The read-only summarizer reports `falseStopCandidateCount`, `hardBlockCount`,
`approvalReuseCandidateCount`, `handoffCompletenessCount`, and `meanRunnerSteps` from run registry JSON plus optional
terminal envelope text.

## Safety

- The summarizer reads fixtures, run registry JSON, and terminal envelope text only.
- No provider, env, schema, deploy, dependency, PR, force push, real seed apply, queue write, or project-state write was executed.
- `Cost Calibration Gate remains blocked`.
