# Queue Matrix Drift Readonly Audit Plan

## Scope

- Task id: `queue-matrix-drift-readonly-audit`
- Branch: `codex/queue-matrix-drift-audit`
- Task kind: `docs_state_readonly_audit`
- User request: first perform the recommended queue/matrix drift audit; if it closes cleanly, continue to the L123
  packet-limit governance sync.

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `scripts/agent-system/Get-TikuNextAction.ps1`

## Approach

1. Confirm `master` is clean and aligned with `origin/master`.
2. Run `Get-TikuNextAction.ps1 -VerboseHistory` and capture the exact queue decision, non-terminal count, and drift
   summary.
3. Enumerate the matrix drift ids using the same high-level diagnostics and compare them to `task-history-index.yaml`.
4. Record whether the 20 active non-terminal queue entries are executable, blocked, or pending.
5. Materialize only docs/state/log evidence and conclude whether to seed, close, or keep blocked.

## Risk Defense

- No `.env*` files are read or modified.
- No product source, test, e2e, script, DB, provider/model, schema/migration, dependency/package/lockfile, deploy,
  payment, OCR, export, external-service, PR, force-push, destructive DB, or Cost Calibration Gate work is authorized.
- This task cannot close historical product tasks or promote blocked approval packages to pending.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npx.cmd prettier --write --ignore-unknown <changed docs/state/log files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state/log files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId queue-matrix-drift-readonly-audit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId queue-matrix-drift-readonly-audit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId queue-matrix-drift-readonly-audit`
