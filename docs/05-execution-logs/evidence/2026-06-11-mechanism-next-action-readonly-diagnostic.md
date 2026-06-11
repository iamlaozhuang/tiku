# Mechanism Next Action Read-Only Diagnostic Evidence

## Task

- id: `mechanism-next-action-readonly-diagnostic`
- branch: `codex/mechanism-serial-governance`
- result: pass
- closeout: local commit pending at evidence write time

## Scope Confirmation

Changed surfaces are limited to the approved diagnostic scripts, source-of-truth index, task queue, project-state current task metadata, task plan, evidence, and audit review.

Blocked surfaces remain untouched: product code, tests, e2e, dependencies, lockfiles, schema, migrations, env/secret, provider calls, deployment, PR, force push, and Cost Calibration Gate.

## Validation Output

### Smoke

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1
```

Output:

```text
Tiku next-action diagnostic smoke passed
```

Smoke assertion includes fixture hash checks for `project-state.yaml`, `task-queue.yaml`, and `advanced-edition-domain-module-run-matrix.yaml`, proving the diagnostic path is read-only.

### Repository Diagnostic

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1
```

Output:

```text
repository: branch=codex/mechanism-serial-governance; head=ecf8916d; dirty=true
currentTask: mechanism-next-action-readonly-diagnostic(closed)
queueDecision: executable_task_found_with_dirty_worktree
nextActionDecision: executable_task_found_with_dirty_worktree
nextExecutableTask: mechanism-status-and-drift-diagnostics
blockedGates: dependency_change:blocked_without_approval; env_secret:blocked_without_approval; provider_call:blocked_without_task_approval; schema_migration:blocked_without_task_approval; deploy:blocked_without_approval; push_pr_force_push:blocked_without_fresh_approval; Cost Calibration Gate remains blocked
validationNeeded: 4 command(s) for mechanism-status-and-drift-diagnostics
recommendedAction: close_current_changes_before_next_task:mechanism-status-and-drift-diagnostics
stopReason: dirty_worktree_advisory
diagnosticOnly: true
Cost Calibration Gate remains blocked
```

Interpretation: the script correctly sees task 2 as closed, task 3 as next executable, and reports dirty worktree as an advisory to finish the current closeout before starting task 3.

### Diff Check

Command:

```powershell
git diff --check
```

Output: pass, no whitespace errors.

## Defects Found And Repaired

- Initial PowerShell parse failure from variable interpolation before `:`. Repaired with `${...}` delimiters.
- Initial smoke fixture was dirty because state fixture files were created after the fixture baseline commit. Repaired by committing fixture state before running the diagnostic.
- Empty `ArrayList` binding was rejected for the dependency blocker accumulator. Repaired with `AllowEmptyCollection`.

## Required Anchors

- repository:
- currentTask:
- queueDecision:
- nextActionDecision:
- nextExecutableTask:
- blockedGates:
- validationNeeded:
- recommendedAction:
- stopReason:
- diagnosticOnly: true
- authorization
- paper
- mock_exam
- redeem_code
- audit_log
- ai_call_log
- Cost Calibration Gate remains blocked

## Closeout Notes

- The diagnostic is intentionally read-only and does not claim, clean, branch, merge, push, or mutate durable state.
- Remote push remains unapproved for this serial task group.
- Next local task after commit: `mechanism-status-and-drift-diagnostics`.
