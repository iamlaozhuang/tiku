# 2026-06-11 Module Run V2 Stop Envelope Normalization Evidence

## Scope

Task: `mechanism-stop-envelope-normalization`.

This evidence records the runner stop envelope repair. It does not approve provider, env/secret, schema migration, deploy, dependency, PR, force push, or Cost Calibration Gate work.

Cost Calibration Gate remains blocked.

Mechanism anchors: `tiku-module-run-v2-autopilot`, `tiku-module-run-v2-mechanic-2`.

## Planned Verification

- `.\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
- `.\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -MaxSteps 1 -PlanOnly -SkipPrimaryRepositoryPostureCheck`
- `git diff --check`
- targeted Prettier check
- `npm run lint`
- `npm run typecheck`

## Results

### Runner smoke

Command:

```powershell
.\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1
```

Result:

```text
Module Run v2 autopilot runner smoke passed
```

The smoke fixture now asserts:

- `runnerDecision: seed_proposal_available`
- `stopTaxonomy: approval_missing`
- `runnerSeverity: approval_required`
- `requiresHuman: true`
- `safeToProceed: false`
- `nextCommand` contains `AutoSeedApprovalStatement`
- `stateWritten: none`
- no `stopTaxonomy: hard_block` appears for seed proposal.

### Current repo PlanOnly diagnostic

Command:

```powershell
.\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -MaxSteps 1 -PlanOnly -SkipPrimaryRepositoryPostureCheck
```

Observed result:

```text
automationRegistrationDecision: stop_for_hard_block
stopTaxonomy: registration_mismatch
runnerDecision: stop_for_hard_block
runnerSeverity: hard_block
requiresHuman: true
safeToProceed: false
nextCommand: inspect runner reason and resolve the hard block before rerun
Why stopped: startup readiness found a hard block
Risk if auto-continued: unsafe or impossible to continue until the hard block is resolved
```

The current real repository run is blocked before seed proposal because local Codex automation TOML currently reports both `tiku-module-run-v2-autopilot` and `tiku-module-run-v2-autopilot-2` as `PAUSED`, while `project-state.yaml` expects `tiku-module-run-v2-autopilot` to be `ACTIVE`. This remains a real registration hard block, not the `seed_proposal_available` false-stop class.

### Changed files

- `scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
- `docs/05-execution-logs/task-plans/2026-06-11-module-run-v2-mechanic-stop-envelope-normalization.md`
- `docs/05-execution-logs/evidence/2026-06-11-module-run-v2-mechanic-stop-envelope-normalization.md`
- `docs/05-execution-logs/audits-reviews/2026-06-11-module-run-v2-mechanic-stop-envelope-normalization.md`

Validation after final formatting is recorded before commit.

### Local dependency readiness

Initial `npm run lint` / `npm run typecheck` failed because `node_modules/.bin/eslint.cmd` and `node_modules/.bin/tsc.cmd` were absent. `pnpm install --frozen-lockfile` first detected an incomplete `node_modules` tree, so `D:\tiku\node_modules` was verified to be inside the repository path, removed, and restored from the existing lockfile.

`package.json` and `pnpm-lock.yaml` remained unchanged.

### Final validation

Commands:

```powershell
.\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1
git diff --check
node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1 docs\05-execution-logs\task-plans\2026-06-11-module-run-v2-mechanic-autodrive-repair-chain.md docs\05-execution-logs\task-plans\2026-06-11-module-run-v2-mechanic-stop-envelope-normalization.md docs\05-execution-logs\evidence\2026-06-11-module-run-v2-mechanic-stop-envelope-normalization.md docs\05-execution-logs\audits-reviews\2026-06-11-module-run-v2-mechanic-stop-envelope-normalization.md
npm run lint
npm run typecheck
```

Results:

```text
Module Run v2 autopilot runner smoke passed
git diff --check: passed with no output
Prettier check: All matched files use Prettier code style
npm run lint: passed
npm run typecheck: passed
```
