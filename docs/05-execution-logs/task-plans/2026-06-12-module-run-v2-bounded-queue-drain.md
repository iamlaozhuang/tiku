# Module Run v2 Bounded Queue Drain Task Plan

## Goal

Implement a bounded queue drain mechanism so the primary Module Run v2 automation can continue across multiple low-risk batches in one wake without weakening existing quality gates.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`

## Implementation Approach

1. Add a read-only queue drain eligibility gate that classifies task-level `drainPolicy`.
2. Add a bounded queue drain supervisor that consumes existing runner and dispatcher decisions, writes only repo-external drain manifests, and never bypasses existing startup, schema, validation, closeout, pre-push, or pre-commit gates.
3. Update the control schema, governance SOP, operating manual, and source-of-truth index with the new protocol.
4. Use TDD: write Smoke tests first, watch them fail because the new scripts are missing, then implement the minimal scripts and docs changes.

## Safety Boundaries

- No local automation activation and no TOML mutation.
- No product runtime, REST/API, DB schema, migration, dependency, lockfile, env, secret, provider, deploy, payment, or Cost Calibration Gate changes.
- Missing `drainPolicy` defaults to no drain.
- Product code remains `single_task_only` for this phase.
- High-risk fields with `drainEligible: true` hard-block instead of silently downgrading.
- Drain run manifests are written to `%USERPROFILE%\.codex\tiku\drain-runs`, not the repository.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2QueueDrainEligibility.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2QueueDrainSupervisor.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveControlLoopAcceptance.ps1`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run format:check`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`

## Review Fix Plan

Follow-up review found three implementation gaps to fix before closeout:

1. `Test-ModuleRunV2QueueDrainEligibility.ps1` task block parsing must only split top-level task items under `tasks:`. Nested task-local list items such as `reviewOutputs: - id:` must not truncate the task block.
2. `Invoke-ModuleRunV2QueueDrainSupervisor.ps1` changed-line budget must include unstaged diff, staged diff, and untracked file content so `MaxChangedLines` is a real drain fuse.
3. `Invoke-ModuleRunV2QueueDrainSupervisor.ps1` closeout recovery must resolve `queueDrainNextTask` from project-state `currentTask.id` when runner output omits `runnerNextTask`.

TDD additions before implementation:

- Add an eligibility smoke fixture with nested `- id:` inside a task block; expected result is `queueDrainEligibilityDecision: eligible`.
- Add supervisor smoke coverage for staged-only and untracked-only large line changes; expected result is `queueDrainDecision: hard_block`.
- Add supervisor smoke coverage for `closeout_recovery` without `runnerNextTask`; expected result includes `queueDrainNextTask` from project-state.

Safety remains unchanged: no product code, no dependency or lockfile change, no env/secret/provider/deploy/payment/schema/migration work, no automation activation, and Cost Calibration Gate remains blocked.

## Second Review Fix Plan

Second follow-up review found two remaining gaps to fix before closeout:

1. `Test-ModuleRunV2QueueDrainEligibility.ps1` must normalize YAML list values before matching high-risk `riskTypes`. Quoted values such as `"env_secret"` and line-commented values such as `env_secret # local secret risk` must still match the blocked risk list.
2. `Invoke-ModuleRunV2QueueDrainSupervisor.ps1` must distinguish repository-contained manifest paths from same-prefix sibling paths. A manifest root such as `C:\Temp\repo-sibling` must not be treated as inside `C:\Temp\repo`.

TDD additions before implementation:

- Add eligibility smoke fixtures for quoted and line-commented high-risk `riskTypes`; expected result is `queueDrainEligibilityDecision: stop_for_hard_block`.
- Add supervisor smoke coverage for a same-prefix sibling manifest root while running inside a temporary git repo; expected result is zero-exit `queueDrainDecision: idle` and a manifest file written outside the repo.

Implementation scope:

- Add a small YAML scalar normalization helper used by list parsing only.
- Replace prefix-only repository path containment with a relative-path boundary check.
- Keep all previous hard gates and Cost Calibration Gate behavior unchanged.
