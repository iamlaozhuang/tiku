# Module Run v2 Hook Automation Hardening Sequence Plan

## Scope

- task id: `module-run-v2-hook-automation-hardening-sequence`
- branch: `codex/module-run-v2-hook-automation-hardening-sequence`
- task kind: `implementation`
- purpose: advance the approved hook/automation sequence after pre-commit hardening.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- existing `.husky/pre-commit`
- existing Module Run v2 pre-commit hardening script
- existing Git completion readiness script

## Work Items

1. Pilot the existing pre-commit hardening scanner on this normal queued implementation task and record the result.
2. Add a `pre-push` hard-block wrapper and wire it through `.husky/pre-push`.
3. Add a module-closeout hard-block wrapper for evidence, audit, validation, rollover, and next task recommendation checks.

## Boundaries

Allowed surfaces:

- `.husky/pre-push`
- `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.Smoke.ps1`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan, evidence, and audit review

Forbidden surfaces:

- package and lockfiles
- product code
- tests/e2e
- schema or migration files
- `src/db/schema/**`
- `drizzle/**`
- `.env.local`
- `.env.example`
- provider, env/secret, staging/prod/cloud/deploy, payment, external-service configuration
- Cost Calibration Gate execution

## TDD Targets

- Pre-push smoke test must first fail before the pre-push script exists.
- Module-closeout smoke test must first fail before the closeout script exists.
- Each script must then pass focused tests for both pass and hard-block cases.

## Validation Matrix

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId module-run-v2-hook-automation-hardening-sequence`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId module-run-v2-hook-automation-hardening-sequence`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-hook-automation-hardening-sequence`
- `git diff --check`
- scoped `prettier --write`
- scoped `prettier --check`
- required anchor check for `Module Run v2`, `pre-push`, `module-closeout`, `threadRolloverGate`,
  `nextModuleRunCandidate`, and `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Stop Conditions

Stop and report if any of these are required:

- dependency or package script changes;
- schema, migration, repository, API route, Server Action, product code, or e2e changes;
- env/secret/provider/staging/prod/cloud/deploy/payment/external-service access;
- Cost Calibration Gate execution;
- hook behavior that would block a clean fast-forward master push for this approved task.
