# 2026-06-11 Module Run V2 Standing Auto-Seed Consumption Evidence

## Scope

Task: `mechanism-standing-auto-seed-consumption`.

This evidence records runner consumption of `standingUnattendedLocalCloseoutApproval` for low-risk local implementation auto-seeding only.

No provider, env/secret, schema migration, deploy, dependency, PR, force push, or Cost Calibration Gate work is approved by this task.

Cost Calibration Gate remains blocked.

Mechanism anchors: `tiku-module-run-v2-autopilot`, `tiku-module-run-v2-mechanic-2`.

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

Covered scenarios:

- Standing approval + `-PlanOnly` returns `runnerSeverity: auto_recoverable`, emits a standing approval `nextCommand`, and does not change `task-queue.yaml`.
- Standing approval without explicit `-AllowAutoSeed` applies seed transaction in a temp fixture.
- Auto-seed output includes `seedTransactionDecision: seeded`, `standingUnattendedLocalCloseoutApproval: recorded`, `seedSelfReviewDecision: passed`, and `runnerDecision: seed_transaction_applied`.
- Auto-seed still stops at `runnerNextAction: closeout_auto_seed_transaction`.

### Changed files

- `scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
- `docs/05-execution-logs/task-plans/2026-06-11-module-run-v2-mechanic-standing-auto-seed-consumption.md`
- `docs/05-execution-logs/evidence/2026-06-11-module-run-v2-mechanic-standing-auto-seed-consumption.md`
- `docs/05-execution-logs/audits-reviews/2026-06-11-module-run-v2-mechanic-standing-auto-seed-consumption.md`

Validation after final formatting is recorded before commit.

### Final validation

Commands:

```powershell
.\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1
git diff --check
node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1 docs\05-execution-logs\task-plans\2026-06-11-module-run-v2-mechanic-standing-auto-seed-consumption.md docs\05-execution-logs\evidence\2026-06-11-module-run-v2-mechanic-standing-auto-seed-consumption.md docs\05-execution-logs\audits-reviews\2026-06-11-module-run-v2-mechanic-standing-auto-seed-consumption.md
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
