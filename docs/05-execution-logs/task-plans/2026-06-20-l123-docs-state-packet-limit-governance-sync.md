# L123 Docs State Packet Limit Governance Sync Plan

## Scope

- Task id: `l123-docs-state-packet-limit-governance-sync`
- Branch: `codex/l123-packet-limit-governance`
- Task kind: `docs_state_governance`
- User request: after the queue/matrix drift audit closes cleanly, permanently set the L123 docs-state approval package
  packet limit to 10.

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

1. Confirm the prior queue/matrix drift audit is closed and pushed.
2. Update `docs/04-agent-system/state/execution-profiles.yaml` so both L123 policy and docs-state work-packet cap are
   set to 10.
3. Record the governance boundary in `task-queue.yaml`, `project-state.yaml`, evidence, and audit review.
4. Run `Get-TikuNextAction.ps1` to confirm the catalog reports `catalogMaxTasksPerPacket: 10`.
5. Run scoped formatting, whitespace, lint, typecheck, and Module Run v2 closeout gates.

## Risk Defense

- This is a docs/state governance change only.
- The limit change affects packet count, not action permissions.
- `exact_scope_local_auto_execute`, source/test/e2e repair, L3 execution, provider/model calls, DB work, env/secret
  access, schema/migration, dependency changes, deploy, payment, OCR, export, external-service actions, PR, force push,
  destructive DB, and Cost Calibration Gate remain blocked.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1`
- `npx.cmd prettier --write --ignore-unknown <changed docs/state/log files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state/log files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId l123-docs-state-packet-limit-governance-sync`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId l123-docs-state-packet-limit-governance-sync`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId l123-docs-state-packet-limit-governance-sync`
