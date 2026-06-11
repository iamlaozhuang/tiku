# Standing Push Approval Rule Alignment

## Task

Align governance wording after the primary Codex automation prompt was tuned to use a bounded standing push approval for low-risk Module Run v2 local implementation closeout.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`

## Implementation Plan

- Keep the existing high-risk approval model unchanged.
- Clarify that explicit push approval can be either fresh task-specific approval or a task-scoped `closeoutPolicy` materialized from `standingUnattendedLocalCloseoutApproval`.
- Keep PR creation/update, force push, deploy, env/secret, real provider, payment, external-service, dependency/package/lockfile, destructive DB, authorization model, and Cost Calibration Gate work under fresh approval.
- Preserve `pushRequiresExplicitApproval: true` for script compatibility and add explanatory policy fields instead of renaming it.
- Register this mechanism task in `task-queue.yaml` and point `project-state.yaml` `currentTask` at it so pre-commit scope scanning uses this task's `allowedFiles`.
- Do not activate Codex automation, run the runner, create implementation tasks, or touch product code.

## Validation Plan

- Run `git diff --check`.
- Run `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId standing-push-approval-rule-alignment`.
- Run Prettier check on changed Markdown/YAML files.
- Search for required approval anchors:
  - `standingUnattendedLocalCloseoutApproval`
  - `closeoutPolicy`
  - `push origin/master`
  - `fresh explicit approval`
  - `Cost Calibration Gate`
- Confirm Git branch/status.

## Risk Controls

- This task does not approve a new automation activation.
- This task does not approve high-risk capability execution.
- This task does not alter package, lockfile, schema, migration, source code, env/secret, provider, deploy, payment, or external-service files.
- This task uses a narrow `allowedFiles` list and blocks product code, dependency, database, requirement story, and deployment surfaces.
