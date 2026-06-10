# Module Run v2 Autodrive Seed Recovery Hardening Evidence

## Summary

Passed: local mechanism hardening validation completed.

Batch range: Module Run v2 autodrive seed recovery hardening.

Commit: `7750de032c4e418670175f9bd91a90927c7f6a7a` pre-closeout base checkpoint; final task commit is produced by Git closeout.

This mechanism-only task fixes the observed unattended autodrive break where one auto-seed transaction left a dirty detached
Codex worktree and the next six automation runs stopped at startup.

Implemented behavior:

- pre-commit hardening tolerates blank YAML lines and recognizes a bounded auto-seed transaction file set;
- generated auto-seed audit logs preserve `autoDriveLocalImplementationApproval` without PowerShell control characters;
- startup readiness classifies a dirty automation worktree as recoverable when it contains only a staged verified auto-seed transaction;
- dispatcher converts that state into `closeout_recoverable_auto_seed_transaction`;
- recoverable seed closeout can replay seed task blocks into the current queue, commit, fast-forward merge, push, and park/delete verified worktrees through a deterministic script.

## Boundary

- No dependency, package, lockfile, env, secret, provider, schema, migration, Docker DB, deploy, payment, PR, force-push, or Cost Calibration Gate action was performed.
- Real `ec30` validation was read-only: no closeout execution, commit, merge, push, or cleanup was run against it in this evidence pass.
- Cost Calibration Gate remains blocked.
- localFullLoopGate: mechanism-level local full loop passed through smoke coverage, live read-only recovery classification, dispatcher action validation, lint, typecheck, and diff check.
- blockedRemainder: real provider, env/secret, schema/migration, Docker DB, deploy, payment, external-service, PR, force-push, and Cost Calibration Gate remain separately blocked.

## RED/GREEN

RED: The live automation feedback showed `ec30` held only three staged auto-seed files, but startup readiness treated it as an unknown dirty worktree and stopped six subsequent runs.

GREEN: Startup readiness now returns `startupDecision: adopt_recoverable_run` for the same `ec30` worktree, dispatcher returns `agentAction: closeout_recoverable_auto_seed_transaction`, and the closeout script returns `recoverableSeedCloseoutDecision: ready_to_execute` in read-only mode.

## Validation Results

| Command                                                                                                                                                                                       | Result | Evidence                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId module-run-v2-autodrive-seed-recovery-hardening ...` | pass   | Planned files were all task-allowed.                                                                                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2SeedTransactionRecoveryReadiness.Smoke.ps1`                                                   | pass   | `Module Run v2 seed transaction recovery readiness smoke passed`.                                                       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.Smoke.ps1`                                                                 | pass   | `Module Run v2 pre-commit hardening smoke passed`; includes seed transaction scope and blank-line-tolerant parsing.     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1`                                                            | pass   | `Module Run v2 agent action dispatcher smoke passed`; includes recoverable seed closeout action.                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`                                                         | pass   | `Module Run v2 automation startup readiness smoke passed`; includes dirty seed worktree adoption path.                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2RecoverableSeedTransactionCloseout.Smoke.ps1`                                               | pass   | `Module Run v2 recoverable seed transaction closeout smoke passed`; fixture executed branch commit, FF merge, and push. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-ModuleRunV2ImplementationSeed.Smoke.ps1`                                                                  | pass   | `Module Run v2 implementation seed transaction smoke passed`; audit anchor no longer contains control character.        |
| `npm.cmd run lint`                                                                                                                                                                            | pass   | ESLint completed without errors.                                                                                        |
| `npm.cmd run typecheck`                                                                                                                                                                       | pass   | `tsc --noEmit` completed without errors.                                                                                |
| `git diff --check`                                                                                                                                                                            | pass   | Whitespace check completed without output.                                                                              |

## Live ec30 Read-Only Verification

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2SeedTransactionRecoveryReadiness.ps1 -SeedWorktreePath 'C:\Users\jzzhu\.codex\worktrees\ec30\tiku'
```

Result:

- `seedRecoveryDecision: recoverable_seed_transaction`
- `seedModule: authorization-and-access`
- `seedTaskCount: 4`
- `seedRecoveryAction: closeout_recoverable_auto_seed_transaction`
- `seedSelfReviewDecision: passed`

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.ps1 -AllowProtectedBranch
```

Result:

- `startupDecision: adopt_recoverable_run`
- `seedTransactionRecovery: ready`
- `seedTransactionWorktreePath: C:\Users\jzzhu\.codex\worktrees\ec30\tiku`

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AgentActionDispatcher.ps1 -AllowProtectedBranch
```

Result:

- `agentActionDecision: ready`
- `agentAction: closeout_recoverable_auto_seed_transaction`
- `agentActionSeedWorktreePath: C:\Users\jzzhu\.codex\worktrees\ec30\tiku`

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2RecoverableSeedTransactionCloseout.ps1 -SeedWorktreePath 'C:\Users\jzzhu\.codex\worktrees\ec30\tiku'
```

Result:

- `recoverableSeedCloseoutDecision: ready_to_execute`
- `seedModule: authorization-and-access`
- `executeRequested: false`

## Residual State

- `ec30` intentionally remains dirty until the next automation run executes the recoverable seed closeout path after this mechanism hardening is merged and pushed.
- Other clean detached Codex automation worktrees remain non-blocking; stale clean cleanup is handled by existing hygiene routing.
- One unmerged local `codex/*` branch remains advisory-only and is not force-deleted by this task.
- threadRolloverGate: no new thread is required for this mechanism task; the next scheduled Codex automation can continue from durable repository state after merge and push.
- nextModuleRunCandidate: close out the recoverable `authorization-and-access` seed transaction first; only after that should seeded implementation tasks be claimable.

## Next Automation Expected Action

After this commit is merged and pushed, the Codex automation should:

1. run `Invoke-ModuleRunV2AutopilotRunner.ps1`;
2. receive `runnerDecision: adopt_recoverable_run` with `seedTransactionRecovery: ready`;
3. dispatch to `agentAction: closeout_recoverable_auto_seed_transaction`;
4. run `Invoke-ModuleRunV2RecoverableSeedTransactionCloseout.ps1 -SeedWorktreePath <ec30> -Execute -CleanupSeedWorktree` with an authorization statement containing `autoDriveLocalImplementationApproval`, commit, fast-forward merge, push, and cleanup.
