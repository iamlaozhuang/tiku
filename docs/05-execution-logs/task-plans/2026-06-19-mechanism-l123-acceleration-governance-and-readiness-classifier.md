# Mechanism L123 Acceleration Governance And Readiness Classifier Task Plan

## Task

- Task id: `mechanism-l123-acceleration-governance-and-readiness-classifier`
- Branch: `codex/mechanism-l123-acceleration-governance`
- Source story: user requested implementation of the L1/L2/L3 acceleration mechanism plan.
- Target: accelerate seed/approval-package handling without weakening L3 gates.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2SerialAutodriveExecutor.ps1`
- `scripts/agent-system/Test-ModuleRunV2LocalCapabilityGate.ps1`

## Scope

Allowed files:

- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2SerialAutodriveExecutor.ps1`
- `scripts/agent-system/Test-ModuleRunV2L123AccelerationReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2L123AccelerationReadiness.Smoke.ps1`
- `scripts/agent-system/New-ModuleRunV2L123ApprovalPackage.ps1`
- `scripts/agent-system/New-ModuleRunV2L123ApprovalPackage.Smoke.ps1`
- `docs/05-execution-logs/task-plans/2026-06-19-mechanism-l123-acceleration-governance-and-readiness-classifier.md`
- `docs/05-execution-logs/evidence/2026-06-19-mechanism-l123-acceleration-governance-and-readiness-classifier.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-mechanism-l123-acceleration-governance-and-readiness-classifier.md`

## Explicit Non-Goals

- No product source, test, e2e, schema, migration, package, or lockfile change.
- No `.env*` read or write.
- No DB read or write.
- No provider/model call.
- No payment, OCR, export, file generation, or external-service execution.
- No staging/prod/cloud/deploy.
- No Cost Calibration Gate execution.
- No PR, force push, destructive DB operation, or sensitive evidence collection.

## Implementation Plan

1. Add L123 acceleration policy defaults to `execution-profiles.yaml` and `project-state.yaml`, with `proposal_only` as
   the default mode.
2. Add `Test-ModuleRunV2L123AccelerationReadiness.ps1` as a read-only classifier for L0 approval packages, L1/L2 exact
   scope, and L3 approval-only work.
3. Add `New-ModuleRunV2L123ApprovalPackage.ps1` with dry-run default and `-Apply` support for docs/state approval-only
   packages.
4. Wire `Get-TikuNextAction.ps1` to surface L123 diagnostics without changing existing next-action decisions.
5. Wire `Invoke-ModuleRunV2AutopilotRunner.ps1` to apply approval packages only when `l123AccelerationMode` is
   `docs_state_apply`; keep default behavior proposal-only.
6. Wire `Invoke-ModuleRunV2SerialAutodriveExecutor.ps1` to hard-stop L1/L2 claim/validation when exact-scope readiness
   fails.
7. Add smoke tests for AP-11 classification, L3 approval-only classification, L1/L2 missing exact-scope fields,
   high-risk allowed files, dry-run no mutation, and fixture apply.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2L123AccelerationReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-ModuleRunV2L123ApprovalPackage.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npx.cmd prettier --write --ignore-unknown <changed docs/state/log files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state/log files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId mechanism-l123-acceleration-governance-and-readiness-classifier`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId mechanism-l123-acceleration-governance-and-readiness-classifier`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId mechanism-l123-acceleration-governance-and-readiness-classifier`

## Stop Conditions

- Any need to read `.env*`, execute provider/model calls, DB operations, schema/migration, dependency changes,
  staging/prod/cloud/deploy, payment/OCR/export/external services, or Cost Calibration Gate.
- Any readiness or generator path that would treat L3 as executable.
- Any smoke test requiring product source/test/e2e modification.
- Any evidence path that could expose secret, token, database URL, raw row, raw prompt, raw response, provider payload,
  private identifier, or sensitive content.
