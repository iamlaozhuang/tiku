# AP-02 Ops Auth Quota Cost Calibration L1 Local Summary Fresh Approval Required Task Plan

## Task

- Task id: `ap-02-ops-auth-quota-cost-calibration-l1-local-summary-fresh-approval-required`
- Branch: `codex/ap-02-ops-auth-quota-cost-calibration-l1-local-summary-fresh-approval-required`
- Approval package: AP-02-L1-LOCAL-SUMMARY-FRESH-APPROVAL
- Use case: `UC-ADV-OPS-AUTH-QUOTA`
- Objective: materialize the AP-02 L1 local summary fresh approval text and stop before source/test execution.
- Scope: L0 docs/state/governance only.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-l2-exact-scope-package.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-fresh-approval-required.md`

## Exact Allowed Files

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-local-summary-fresh-approval-required.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-local-summary-fresh-approval-required.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-local-summary-fresh-approval-required.md`

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
- Output the exact fresh approval text needed before AP-02 L1 local summary execution.
- Run docs/state validation gates, local commit, fast-forward merge to `master`, push `origin/master`, and delete the
  merged short branch if gates pass.

Blocked:

- Current source/test/e2e/script changes and focused unit execution.
- Provider/model calls, Cost Calibration Gate, payment/external-service, DB read/write, `.env*`, staging/prod/cloud,
  deploy, schema/migration, dependency/package/lockfile changes, PR, force push, destructive DB, and sensitive evidence.

## Future Execution Stop Point

The next execution task is `ap-02-ops-auth-quota-cost-calibration-l1-local-summary-execution`, but it is not approved by
this plan. It must receive explicit fresh approval that names exact allowed files, blocked files, commands, rollback, and
redaction rules.

## Validation Commands

- `git status --short --branch`
- `git rev-list --left-right --count master...origin/master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-local-summary-fresh-approval-required.md docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-local-summary-fresh-approval-required.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-local-summary-fresh-approval-required.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-local-summary-fresh-approval-required.md docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-local-summary-fresh-approval-required.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-local-summary-fresh-approval-required.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-02-ops-auth-quota-cost-calibration-l1-local-summary-fresh-approval-required`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-02-ops-auth-quota-cost-calibration-l1-local-summary-fresh-approval-required`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ap-02-ops-auth-quota-cost-calibration-l1-local-summary-fresh-approval-required`

## Stop Conditions

- Any request to edit source/tests/e2e/scripts in this task.
- Any need for provider/model call, Cost Calibration Gate, payment/external-service, DB read/write, `.env*`,
  staging/prod/cloud/deploy, schema/migration, dependency/package/lockfile, PR, force push, destructive DB, or sensitive
  evidence.
- Any validation failure that cannot be fixed within the exact L0 allowed files.
