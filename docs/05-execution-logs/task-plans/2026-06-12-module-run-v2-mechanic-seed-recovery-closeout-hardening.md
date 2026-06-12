# Seed Recovery Closeout Hardening

## Task

Implement the reviewed Module Run v2 seed recovery repair plan for recoverable auto-seed transactions.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`

## Implementation Plan

1. Harden `Test-ModuleRunV2SeedTransactionRecoveryReadiness.ps1` so empty staged sets report a hard block, real seed transaction files are accepted, and closeout can read the staged file list from script output.
2. Harden `Invoke-ModuleRunV2RecoverableSeedTransactionCloseout.ps1` so execute mode runs local tooling readiness before queue mutation and replays every readiness-approved seed artifact except `task-queue.yaml`, which remains append-only.
3. Improve local tooling readiness diagnostics for partial `node_modules` installs where `.bin` shims are absent.
4. Extend smoke coverage for empty staged transactions, unstaged/untracked hard blocks, seed task plan and batch template artifacts, preflight-before-mutation, full artifact replay, and missing `.bin` diagnostics.

## Boundaries

- No product code changes.
- No dependency install, package change, lockfile change, schema migration, env or secret change, provider call, deployment, PR, force push, or Cost Calibration Gate work.
- Do not close out or delete `C:\Users\jzzhu\.codex\worktrees\9550\tiku` in this task.

## Validation

- Run the updated PowerShell smoke scripts for seed recovery readiness, recoverable seed closeout, and closeout local tooling readiness.
- Run `git diff --check`.
- Run `npm.cmd run lint` and `npm.cmd run typecheck` only if local tooling is available without dependency installation.
