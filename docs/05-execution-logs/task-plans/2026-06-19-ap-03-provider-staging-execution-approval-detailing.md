# AP-03 Provider Staging Execution Approval Detailing Task Plan

## Task

- Task id: `ap-03-provider-staging-execution-approval-detailing`
- Branch: `codex/ap-03-provider-staging-execution-approval-detailing`
- Approval package: AP-03
- Use case: `UC-GATE-PROVIDER-STAGING-EXECUTION`
- Objective: detail the provider/staging execution approval boundary without reading `.env*`, executing provider/model
  calls, deploying, or touching staging/prod/cloud resources.
- Scope: L0 docs/state/governance only.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-blocked-use-case-acceleration-governance-packet.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-approval-detailing.md`

## Exact Allowed Files

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-03-provider-staging-execution-approval-detailing.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-03-provider-staging-execution-approval-detailing.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-03-provider-staging-execution-approval-detailing.md`

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
- Update project state, task queue, and coverage matrix anchors.
- Define future staging/provider execution approval requirements: resource inventory, command list, quota ceiling,
  rollback owner, acceptance owner, and redaction rules.
- Run docs/state validation gates, local commit, fast-forward merge to `master`, push `origin/master`, and delete the
  merged short branch if gates pass.

Blocked:

- `.env*` read/write, secret/env output, provider credentials, full database URL output.
- Provider/model calls, retries, streaming, provider configuration changes, model changes.
- Staging/prod/cloud/deploy execution, cloud resource creation or mutation, domain/callback changes.
- DB reads/writes, schema/migration, dependency/package/lockfile changes.
- Product source, tests, e2e specs, scripts, payment/external-service work, Cost Calibration Gate, PR, force push, raw
  sensitive evidence.

## Execution Steps

1. Confirm clean `master` aligned with `origin/master`.
2. Create the AP-03 short branch.
3. Materialize AP-03 L0 plan, evidence, audit, queue entry, project-state anchor, and matrix anchor.
4. Keep `UC-GATE-PROVIDER-STAGING-EXECUTION` at `release_blocked`.
5. Record provider/staging/deploy execution as L3 fresh approval only.
6. Run scoped formatting and Module Run v2 gates.
7. Commit, fast-forward merge to `master`, run master gates, push `origin/master`, and clean the merged branch.

## Validation Commands

- `git status --short --branch`
- `git rev-list --left-right --count master...origin/master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-03-provider-staging-execution-approval-detailing.md docs/05-execution-logs/evidence/2026-06-19-ap-03-provider-staging-execution-approval-detailing.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-03-provider-staging-execution-approval-detailing.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-03-provider-staging-execution-approval-detailing.md docs/05-execution-logs/evidence/2026-06-19-ap-03-provider-staging-execution-approval-detailing.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-03-provider-staging-execution-approval-detailing.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-03-provider-staging-execution-approval-detailing`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-03-provider-staging-execution-approval-detailing`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ap-03-provider-staging-execution-approval-detailing`

## Stop Conditions

- Any need to read or write `.env*`, secrets, provider credentials, database URLs, raw rows, raw prompts, raw responses,
  raw model output, provider payloads, staging/prod/cloud data, or private identifiers.
- Any request to execute provider/model calls, staging/prod/cloud/deploy work, DB access, schema/migration, dependency,
  source/test/e2e/script repair, payment/external-service work, Cost Calibration Gate, PR, force push, or destructive DB.
- Any validation failure that cannot be fixed within the exact L0 allowed files.
