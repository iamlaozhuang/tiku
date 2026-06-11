# Evidence: Standing Push Approval Rule Alignment

## Scope

- Task: align push approval wording with the existing durable `standingUnattendedLocalCloseoutApproval` mechanism.
- Branch: `codex/standing-push-approval-rule-alignment`.
- Result: governance wording now treats a task-scoped `closeoutPolicy` materialized from `standingUnattendedLocalCloseoutApproval` as explicit push approval for eligible low-risk Module Run v2 auto-seeded implementation tasks.

## Changed Surfaces

- `AGENTS.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-11-standing-push-approval-rule-alignment.md`
- `docs/05-execution-logs/evidence/2026-06-11-standing-push-approval-rule-alignment.md`
- `docs/05-execution-logs/audits-reviews/2026-06-11-standing-push-approval-rule-alignment.md`

The primary local Codex automation prompt was also updated outside the repository to use the canonical anchor `standingUnattendedLocalCloseoutApproval`; it remains `PAUSED`.

## Boundary

- No product source code was changed.
- No package, lockfile, schema, migration, env/secret, provider, deploy, payment, or external-service file was changed.
- No automation runner was executed.
- No automation was activated.
- No PR was created or updated; no push was performed by this task.
- PR creation/update, force push, deploy, env/secret, real provider, payment, external-service, dependency/package/lockfile, destructive DB, authorization model, unapproved schema/migration/e2e, and Cost Calibration Gate work remain blocked without fresh explicit approval.

## Pre-Commit Scope Repair

The first local `git commit` attempt was blocked by `Test-ModuleRunV2PreCommitHardening.ps1` because `project-state.yaml`
still pointed at `full-autodrive-dry-run`, whose `allowedFiles` did not cover this rule-alignment task. The repair was to
register `standing-push-approval-rule-alignment` in `task-queue.yaml`, update `project-state.yaml` `currentTask`, and keep
this task's `closeoutPolicy` local-commit-only with merge and push disabled.

## Validation

| Command                                                                                                                                                                                                                                                                                                                | Result | Notes                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------ |
| `git diff --check`                                                                                                                                                                                                                                                                                                     | pass   | No whitespace errors.                                                    |
| `node .\node_modules\prettier\bin\prettier.cjs --check AGENTS.md docs\04-agent-system\operating-manual.md docs\04-agent-system\sop\automation-loop.md docs\04-agent-system\state\advanced-edition-domain-module-run-matrix.yaml docs\05-execution-logs\task-plans\2026-06-11-standing-push-approval-rule-alignment.md` | pass   | All matched files use Prettier code style.                               |
| `Select-String ... -Pattern 'standingUnattendedLocalCloseoutApproval','closeoutPolicy','push origin/master','fresh explicit approval','Cost Calibration Gate'`                                                                                                                                                         | pass   | Required anchors present in changed governance files.                    |
| `Select-String C:\Users\jzzhu\.codex\automations\tiku-module-run-v2-autopilot\automation.toml -Pattern 'standingUnattendedLocalCloseoutApproval','standingUnattendedLowRiskPushApproval','status = "PAUSED"'`                                                                                                          | pass   | Canonical anchor present; old alias absent; automation remains `PAUSED`. |

## Final Validation

| Command                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Result | Notes                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------- |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | pass   | No whitespace errors.                                                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId standing-push-approval-rule-alignment`                                                                                                                                                                                                                                                                                                                                                                                                                                          | pass   | Scanned 9 staged files; all matched task `allowedFiles`; no sensitive evidence issues. |
| `node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown AGENTS.md docs\04-agent-system\operating-manual.md docs\04-agent-system\sop\automation-loop.md docs\04-agent-system\state\advanced-edition-domain-module-run-matrix.yaml docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-11-standing-push-approval-rule-alignment.md docs\05-execution-logs\evidence\2026-06-11-standing-push-approval-rule-alignment.md docs\05-execution-logs\audits-reviews\2026-06-11-standing-push-approval-rule-alignment.md` | pass   | All matched files use Prettier code style.                                             |
| `Select-String -Path AGENTS.md,docs\04-agent-system\operating-manual.md,docs\04-agent-system\sop\automation-loop.md,docs\04-agent-system\state\advanced-edition-domain-module-run-matrix.yaml,docs\04-agent-system\state\project-state.yaml,docs\04-agent-system\state\task-queue.yaml,docs\05-execution-logs\evidence\2026-06-11-standing-push-approval-rule-alignment.md -Pattern 'standingUnattendedLocalCloseoutApproval','closeoutPolicy','push origin/master','fresh explicit approval','Cost Calibration Gate'`                                                                                         | pass   | Required anchors present in changed governance/state/evidence files.                   |
| `Select-String C:\Users\jzzhu\.codex\automations\tiku-module-run-v2-autopilot\automation.toml -Pattern 'standingUnattendedLocalCloseoutApproval','standingUnattendedLowRiskPushApproval','status = "PAUSED"'`                                                                                                                                                                                                                                                                                                                                                                                                  | pass   | Canonical anchor present; old alias absent; automation remains `PAUSED`.               |
