# Module Run v2 Pre-Work Pre-Edit Advisory

## Task

- task id: `module-run-v2-pre-work-pre-edit-advisory`
- task kind: `implementation`
- branch: `codex/module-run-v2-pre-work-pre-edit-advisory`
- date: `2026-06-08`
- approval: User confirmed starting hook/automation setup after merging the readiness baseline. This first implementation
  is limited to advisory pre-work/pre-edit scripts and must not modify `.husky/**`.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/03-standards/local-ci.md`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-08-module-run-v2-hook-automation-readiness.md`
- `.husky/pre-commit`
- `package.json`
- `scripts/agent-system/Test-TaskClaimReadiness.ps1`
- `scripts/agent-system/Test-GitCompletionReadiness.ps1`

## Scope

Implement a local advisory PowerShell script for Module Run v2 pre-work and pre-edit checks.

Allowed changes:

- `scripts/agent-system/Test-ModuleRunV2WorkReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2WorkReadiness.Smoke.ps1`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan
- matching evidence and audit review

Blocked changes:

- `.husky/**`
- `package.json`
- lockfiles
- product code under `src/**`
- tests under `tests/**` or `e2e/**`
- schema, migration, `src/db/schema/**`, or `drizzle/**`
- `.env.local`, `.env.example`, provider, env/secret, staging/prod/cloud/deploy, payment, external-service
- Cost Calibration Gate execution

## Script Contract

`scripts/agent-system/Test-ModuleRunV2WorkReadiness.ps1` must:

- accept `-Mode pre-work|pre-edit`;
- accept optional `-TaskId`, defaulting to `project-state.yaml` `currentTask.id`;
- accept optional `-PlannedFiles` for pre-edit advisory classification;
- read `project-state.yaml`, `task-queue.yaml`, and the Module Run v2 matrix;
- report branch, HEAD, current task, task status, allowed files, blocked files, risk types, validation commands;
- report Module Run v2 anchors: `hookIntegrationMatrix`, `automationHandoffPolicy`, `threadRolloverGate`, and
  `Cost Calibration Gate remains blocked`;
- classify planned files as `ADVISORY_ALLOWED_FILE`, `ADVISORY_BLOCKED_FILE`, or `ADVISORY_OUT_OF_SCOPE`;
- exit `0` for advisory findings so it can be piloted manually without blocking work.

The script must not:

- change files;
- stage, commit, push, merge, or delete branches;
- call provider, env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, or migration
  commands;
- read `.env.local`.

## TDD Plan

1. Add `Test-ModuleRunV2WorkReadiness.Smoke.ps1` first.
2. Run the smoke test and confirm it fails because `Test-ModuleRunV2WorkReadiness.ps1` does not exist.
3. Add the smallest advisory script implementation.
4. Run the smoke test again and confirm it passes.
5. Run docs/script validation and final formatting.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-work -TaskId module-run-v2-pre-work-pre-edit-advisory`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId module-run-v2-pre-work-pre-edit-advisory -PlannedFiles scripts/agent-system/Test-ModuleRunV2WorkReadiness.ps1,README.md,.husky/pre-commit`
- `git diff --check`
- scoped `prettier --write` for markdown and YAML files only
- scoped `prettier --check` for markdown and YAML files only
- required anchor check for `Module Run v2`, `pre-work`, `pre-edit`, `ADVISORY_BLOCKED_FILE`,
  `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1
-BaseBranch master`

## Stop Conditions

Stop immediately if:

- the script needs to modify `.husky/**`, `package.json`, lockfiles, product code, schema, migration, or env files;
- the advisory script would block commits or pushes;
- evidence would expose secrets or provider payloads;
- Cost Calibration Gate execution is requested or implied.
