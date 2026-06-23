# Acceptance Role Separated Account Scope Approval Plan

## Task

- taskId: `acceptance-role-separated-account-scope-approval-2026-06-23`
- branch: `codex/role-separated-account-coverage-batch-20260623`
- taskKind: `acceptance_scope_approval_package`
- phase: `standard-advanced-mvp-role-separated-account-coverage-batch-2026-06-23`
- status: `closed`
- result: `pass_scope_approval_package_prepared_no_account_or_runtime_executed`

## References Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-coverage-batch-plan.md`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-coverage-batch-seed.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Scope

Prepare the exact role-separated account coverage approval package. This task explains what needs to be checked, which
roles are mandatory, what evidence is allowed, and what is still blocked.

This task does not inspect passwords, create accounts, mutate fixtures, run seeds, start a dev server, use a browser, run
Playwright, connect to a database, call Provider/model services, calibrate cost, deploy staging/prod, or claim final
acceptance `Pass`.

## Approval Package

- packageId: `ROLE_SEPARATED_ACCOUNT_SCOPE_2026_06_23`
- packagePath: `docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-scope-approval-package.md`
- nextTaskBlockedUntilApproval: `acceptance-role-separated-account-inventory-2026-06-23`

## Planned Files

- Create:
  - `docs/05-execution-logs/task-plans/2026-06-23-acceptance-role-separated-account-scope-approval.md`
  - `docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-scope-approval-package.md`
  - `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-scope-approval.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-role-separated-account-scope-approval.md`
- Modify:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`

## Validation Commands

```powershell
npx.cmd prettier --write --ignore-unknown docs/05-execution-logs/task-plans/2026-06-23-acceptance-role-separated-account-scope-approval.md docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-scope-approval-package.md docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-scope-approval.md docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-role-separated-account-scope-approval.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml
npx.cmd prettier --check --ignore-unknown docs/05-execution-logs/task-plans/2026-06-23-acceptance-role-separated-account-scope-approval.md docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-scope-approval-package.md docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-scope-approval.md docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-role-separated-account-scope-approval.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-role-separated-account-scope-approval-2026-06-23
```

## Stop Conditions

- User approval is needed before inventory, account action, fixture change, seed execution, database work, browser runtime,
  Playwright, Provider, Cost Calibration, staging, production, payment, external service, PR, force push, or final
  acceptance `Pass`.
- Evidence would require secrets, passwords, cookies, raw localStorage, database URLs, Authorization headers, `.env*`,
  Provider payloads, raw prompts, raw AI outputs, raw answer content, full paper content, or staging/prod data.
