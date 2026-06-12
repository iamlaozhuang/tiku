# Seed Recovery Closeout Hardening Evidence

## Scope

Implemented mechanism-only hardening for Module Run v2 recoverable auto-seed transactions.

No product code, dependency, package, lockfile, schema, migration, env, secret, provider, deploy, PR, force-push, or Cost Calibration Gate work was performed.

Fresh local tooling repair approval: user replied `批准恢复本地 node_modules 工具链`.

Mechanic repair anchors:

- Primary automation id: `tiku-module-run-v2-autopilot`.
- Historical mechanic id remains inactive: `tiku-module-run-v2-mechanic-2`.

## Changes Verified

- Seed recovery readiness no longer throws when the staged seed transaction set is empty.
- Seed recovery readiness reports staged, unstaged, and untracked files.
- Seed recovery readiness accepts task plan and generated evidence/audit files as recoverable seed transaction artifacts.
- Seed recovery readiness now derives seed task ids from the staged `task-queue.yaml` diff instead of the full historical queue.
- Recoverable seed closeout runs local tooling readiness before queue mutation in execute mode.
- Recoverable seed closeout replays only the seed task ids reported by recovery readiness, preventing historical seeded tasks from being reprocessed.
- Recoverable seed closeout replays all readiness-approved seed transaction artifacts except `task-queue.yaml`, which remains append-only.
- Local tooling readiness now distinguishes missing `node_modules` from missing `node_modules\.bin`.

## Validation Commands

| Command                                                                                                                                                                                               | Result  | Notes                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2SeedTransactionRecoveryReadiness.Smoke.ps1`                                                           | pass    | Covered empty staged hard block, unstaged/untracked hard block, task plan artifact, and batch template artifacts. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2CloseoutLocalToolingReadiness.Smoke.ps1`                                                              | pass    | Covered absent package, missing `.bin`, tooling command failure, and ready state.                                 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2RecoverableSeedTransactionCloseout.Smoke.ps1`                                                       | pass    | Covered preflight-before-mutation and full seed artifact replay.                                                  |
| `git diff --check`                                                                                                                                                                                    | pass    | No whitespace errors.                                                                                             |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2CloseoutLocalToolingReadiness.ps1 -RepositoryPath .`                                                  | blocked | Current task worktree has no `node_modules`; lint/typecheck were not run.                                         |
| `git -C C:\Users\jzzhu\.codex\worktrees\9550\tiku add -- <seed transaction files>`                                                                                                                    | pass    | Staged the existing personal-learning-ai seed transaction files for recovery validation.                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2SeedTransactionRecoveryReadiness.ps1 -SeedWorktreePath C:\Users\jzzhu\.codex\worktrees\9550\tiku`     | pass    | Returned `recoverable_seed_transaction` for `personal-learning-ai` with 4 staged seed task ids.                   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2RecoverableSeedTransactionCloseout.ps1 -SeedWorktreePath C:\Users\jzzhu\.codex\worktrees\9550\tiku` | pass    | Dry-run returned `ready_to_execute` for the staged `personal-learning-ai` seed transaction.                       |
| Codex app `automation_update` view for `tiku-module-run-v2-autopilot`                                                                                                                                 | pass    | Rendered the primary ACTIVE automation card in the app.                                                           |
| `node D:\tiku\node_modules\typescript\bin\tsc --noEmit`                                                                                                                                               | pass    | Direct TypeScript entrypoint passed from this worktree.                                                           |
| `node D:\tiku\node_modules\eslint\bin\eslint.js <changed ps1 files>`                                                                                                                                  | blocked | Existing `D:\tiku\node_modules` is incomplete; eslint failed to resolve `@babel/core`.                            |
| `node D:\tiku\node_modules\prettier\bin\prettier.cjs --write docs/05-execution-logs/evidence/2026-06-12-seed-recovery-closeout-hardening.md`                                                          | pass    | Formatted this evidence file only.                                                                                |
| `corepack pnpm install --frozen-lockfile --ignore-scripts` in `D:\tiku`                                                                                                                               | blocked | Existing `node_modules` was corrupt; failed opening `@babel/parser\package.json`.                                 |
| `corepack pnpm install --frozen-lockfile --ignore-scripts --force` in `D:\tiku`                                                                                                                       | pass    | Rebuilt local `node_modules`; no `package.json` or `pnpm-lock.yaml` changes.                                      |
| `corepack pnpm install --frozen-lockfile --ignore-scripts` in this worktree                                                                                                                           | pass    | Restored local worktree `node_modules`; no `package.json` or `pnpm-lock.yaml` changes.                            |
| `npm.cmd run lint`                                                                                                                                                                                    | pass    | ESLint completed successfully after tooling repair.                                                               |
| `npm.cmd run typecheck`                                                                                                                                                                               | pass    | TypeScript completed successfully after tooling repair.                                                           |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2CloseoutLocalToolingReadiness.ps1 -RepositoryPath .`                                                  | pass    | Closeout local tooling readiness passed lint and typecheck.                                                       |

## Local Tooling Gap

The local tooling gap was repaired after fresh user approval. `npm.cmd run lint`, `npm.cmd run typecheck`, and closeout local tooling readiness now pass in this worktree.

## Post-Merge Local Master Validation

After local fast-forward merge to `D:\tiku` `master`, without pushing remote:

| Command                                                                                                                                              | Result | Notes                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------ |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2SeedTransactionRecoveryReadiness.Smoke.ps1`          | pass   | Seed recovery readiness smoke passed.      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2CloseoutLocalToolingReadiness.Smoke.ps1`             | pass   | Tooling readiness smoke passed.            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2RecoverableSeedTransactionCloseout.Smoke.ps1`      | pass   | Recoverable seed closeout smoke passed.    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2CloseoutLocalToolingReadiness.ps1 -RepositoryPath .` | pass   | Ran `npm.cmd run lint` and `typecheck`.    |
| `git diff --check`                                                                                                                                   | pass   | No whitespace errors after local closeout. |

Cost Calibration Gate remains blocked.
