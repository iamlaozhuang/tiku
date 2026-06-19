# AP-02 Ops Auth Quota Cost Calibration Approval Detailing Task Plan

## Task

- Task id: `ap-02-ops-auth-quota-cost-calibration-approval-detailing`
- Branch: `codex/ap-02-ops-auth-quota-cost-calibration-approval-detailing`
- Approval package: AP-02
- Use case: `UC-ADV-OPS-AUTH-QUOTA`
- Objective: detail the cost/quota approval boundary for ops authorization quota governance without running provider,
  payment, external-service, database, or Cost Calibration Gate work.
- Scope: L0 docs/state/governance only.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-blocked-use-case-acceleration-governance-packet.md`

## Exact Allowed Files

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-02-ops-auth-quota-cost-calibration-approval-detailing.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-approval-detailing.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-02-ops-auth-quota-cost-calibration-approval-detailing.md`

## Blocked Files

- `.env*`
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `src/**`
- `e2e/**`
- `tests/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`
- `playwright-report/**`
- `test-results/**`

## Approval Boundary

Allowed:

- Create this task plan, evidence, and audit review.
- Update `project-state.yaml`, `task-queue.yaml`, and `local-experience-coverage-matrix.yaml`.
- Define the quota ledger, cost measurement source, redacted evidence rules, and fresh approval text needed before any
  executable AP-02 release gate.
- Run docs/state validation gates, local commit, fast-forward merge to `master`, push `origin/master`, and delete the
  merged short branch if gates pass.

Blocked:

- Provider/model calls, provider retry, provider streaming, provider configuration changes.
- `.env*` read/write, secret/env output, full database URL output.
- Cost Calibration Gate execution, real cost measurement, payment or external-service execution.
- DB reads/writes, destructive DB work, raw SQL.
- Product source, tests, e2e specs, scripts, schema, migrations, package files, lockfiles, dependency changes.
- PR, force push, staging/prod/cloud/deploy, formal adoption, screenshots, traces, raw sensitive evidence.

## Execution Steps

1. Confirm clean `master` aligned with `origin/master`.
2. Create the AP-02 short branch.
3. Materialize AP-02 L0 plan, evidence, audit, queue entry, project-state anchor, and matrix anchor.
4. Record the next AP-02 executable step as L3 fresh approval only.
5. Preserve `release_blocked` status for `UC-ADV-OPS-AUTH-QUOTA`.
6. Run scoped formatting and Module Run v2 gates.
7. Commit, fast-forward merge to `master`, run master gates, push `origin/master`, and clean the merged branch.

## Validation Commands

- `git status --short --branch`
- `git rev-list --left-right --count master...origin/master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-02-ops-auth-quota-cost-calibration-approval-detailing.md docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-approval-detailing.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-02-ops-auth-quota-cost-calibration-approval-detailing.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-02-ops-auth-quota-cost-calibration-approval-detailing.md docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-approval-detailing.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-02-ops-auth-quota-cost-calibration-approval-detailing.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-02-ops-auth-quota-cost-calibration-approval-detailing`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-02-ops-auth-quota-cost-calibration-approval-detailing`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ap-02-ops-auth-quota-cost-calibration-approval-detailing`

## Stop Conditions

- Any need to read `.env*`, provider credentials, database URLs, raw rows, raw prompts, raw model output, payment data, or
  private identifiers.
- Any request to execute provider/model calls, payment/external-service work, real cost measurement, Cost Calibration
  Gate, DB access, staging/prod/deploy, schema/migration, dependency, source/test/e2e/script repair, PR, or force push.
- Any validation failure that cannot be fixed within the exact L0 allowed files.
