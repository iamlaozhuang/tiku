# Module Run v2 Registry Path Normalization Plan

**Task id:** `module-run-v2-registry-path-normalization`

**Branch:** `codex/module-run-v2-registry-path-normalization`

**Task kind:** `mechanism_repair`

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- Module Run v2 SOPs under `docs/04-agent-system/sop/`
- Primary autopilot and mechanic automation configs and memory
- Current batch-103 run registry, task plan, evidence, and audit
- `scripts/agent-system/Set-ModuleRunV2RunRegistryFinalizer.ps1`
- `scripts/agent-system/Test-ModuleRunV2StoppedAutomationHygiene.ps1`
- startup, dispatcher, runner, validation-surface, closeout, and recovery self-repair script outputs

## Diagnosis

The latest primary autopilot run stopped on batch-103 after focused implementation validation passed but broad baseline validation failed outside the task scope. That business owner worktree remains dirty and protected by `safeToAdopt: false`; this mechanic must not adopt, commit, clean, or continue that business work.

A mechanism lifecycle defect was found during diagnosis: readiness wrote the initial active run registry using a forward-slash worktree path hash, while the finalizer wrote the terminal stopped registry using a resolved Windows backslash path hash. The same worktree/task can therefore leave both an old `active` registry and a newer `stopped` registry. This can confuse future startup/hygiene classification and violates the registry lifecycle goal that a terminal finalizer supersedes the active record for the owner.

## Scope

Allowed mechanism-only files:

- `scripts/agent-system/Set-ModuleRunV2RunRegistryFinalizer.ps1`
- `scripts/agent-system/Set-ModuleRunV2RunRegistryFinalizer.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2StoppedAutomationHygiene.ps1`
- `scripts/agent-system/Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`
- execution log task plan, evidence, and audit files

Blocked surfaces:

- business implementation files under `src/**`
- batch-103 owner worktree content
- package or lockfiles
- env/secrets
- database schema or migrations
- provider calls
- e2e, deploy, payment, PR, force push, and Cost Calibration Gate

## Implementation Plan

1. Add a failing finalizer smoke proving that the finalizer writes to the same normalized-path registry id used by readiness.
2. Add a failing hygiene smoke proving that an old active registry is a cleanup candidate when a newer terminal registry exists for the same normalized worktree/task.
3. Normalize the finalizer hash input to the same path form that is persisted in `worktreePath`.
4. Teach stopped automation hygiene to classify superseded active registry files safely without touching the dirty owner worktree.
5. Run focused mechanism smokes plus startup/runner/dispatcher/recovery takeover checks, `git diff --check`, `npm.cmd run lint`, and `npm.cmd run typecheck` using existing `D:\tiku\node_modules` only.

## Stop Conditions

Stop without business continuation if repair requires changing batch-103 implementation, adopting or cleaning the dirty c424 worktree, reading env/secrets, installing dependencies, changing package/lockfiles, DB/provider/e2e/deploy/payment/PR/force-push work, or Cost Calibration Gate execution.
