# Module Run V2 Diagnostic Noise Budget Evidence

## Scope

Task 5 updates `Get-TikuNextAction.ps1` for `tiku-module-run-v2-autopilot` and `tiku-module-run-v2-mechanic-2`.

## Commands

- `.\scripts\agent-system\Get-TikuNextAction.Smoke.ps1`
  - Result: `Tiku next-action diagnostic smoke passed`
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

Passed. Default next-action diagnostics now fold history first-item details into counts plus `notBlockingCurrentRun`.
`-VerboseHistory` restores `legacy_done_first`, `evidenceMissingFirst`, and `queueMatrixDriftFirst`.

## Safety

- No queue, project-state, provider, env, schema, deploy, dependency, PR, force push, or seed apply action was executed.
- `Cost Calibration Gate remains blocked`.
