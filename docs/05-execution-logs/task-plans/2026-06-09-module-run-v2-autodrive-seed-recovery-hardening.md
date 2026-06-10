# Module Run v2 Autodrive Seed Recovery Hardening Plan

## Scope

Turn the observed auto-seed failure into a recoverable unattended lane:

- fix the generated auto-seed audit anchor so future seed transactions do not emit a control character;
- make pre-commit hardening tolerate YAML blank lines and recognize a bounded auto-seed transaction without relying on the closed activation task;
- classify dirty Codex automation worktrees that contain only a staged auto-seed transaction as recoverable instead of unknown dirty state;
- add a deterministic closeout path for the next Codex automation run to adopt the staged seed transaction safely;
- record evidence and audit review for this mechanism-only hardening task.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- current automation thread summaries and dirty `ec30` worktree status

## Planned Files

- `scripts/agent-system/New-ModuleRunV2ImplementationSeed.ps1`
- `scripts/agent-system/New-ModuleRunV2ImplementationSeed.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
- `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2AutomationStartupReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2SeedTransactionRecoveryReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2SeedTransactionRecoveryReadiness.Smoke.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2RecoverableSeedTransactionCloseout.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2RecoverableSeedTransactionCloseout.Smoke.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2AgentActionDispatcher.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-09-module-run-v2-autodrive-seed-recovery-hardening.md`
- `docs/05-execution-logs/audits-reviews/2026-06-09-module-run-v2-autodrive-seed-recovery-hardening.md`

## Risk Controls

- No dependency, package, lockfile, env, secret, provider, schema, migration, Docker DB, deploy, payment, PR, force-push, or Cost Calibration Gate work is in scope.
- Dirty worktree adoption is allowed only when the changed files are exactly `task-queue.yaml` plus generated auto-seed evidence and audit review files, with no unstaged changes.
- Unknown dirty worktrees remain manual stops.
- Closeout execution must require an explicit authorization statement naming commit, fast-forward merge, push, cleanup, and `autoDriveLocalImplementationApproval`.
- Cleanup of the original dirty automation worktree is allowed only after the replayed seed transaction is committed, merged, pushed, and the original staged diff is verified as the same seed transaction.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2SeedTransactionRecoveryReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2RecoverableSeedTransactionCloseout.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1`
- live read-only recovery readiness against `C:\Users\jzzhu\.codex\worktrees\ec30\tiku`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`

## Expected Result

After merge and push, the next Codex automation run should not stop only because `ec30` is dirty. It should classify that worktree as a recoverable seed transaction and receive an explicit closeout action instead.
