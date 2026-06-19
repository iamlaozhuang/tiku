# AP-02 Ops Auth Quota Cost Calibration Release Gate Fresh Approval Required Task Plan

## Task

- Task id: `ap-02-ops-auth-quota-cost-calibration-release-gate-fresh-approval-required`
- Branch: `codex/ap-02-ops-auth-quota-cost-calibration-release-gate-fresh-approval-required`
- Approval package: AP-02-L3-RELEASE-GATE-FRESH-APPROVAL
- Use case: `UC-ADV-OPS-AUTH-QUOTA`
- Objective: materialize the minimal AP-02 L3 release gate fresh approval text and stop before any L3 execution.
- Scope: L0 docs/state/governance only.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-local-summary-execution.md`

## Exact Allowed Files

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-02-ops-auth-quota-cost-calibration-release-gate-fresh-approval-required.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-release-gate-fresh-approval-required.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-02-ops-auth-quota-cost-calibration-release-gate-fresh-approval-required.md`

## Blocked Files

- `.env*`
- `package.json`
- `package-lock.yaml`
- `package-lock.json`
- `pnpm-lock.yaml`
- `src/**`
- `tests/**`
- `e2e/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`
- deploy/cloud/payment/provider config files
- any file not explicitly listed in allowed files

## Approval Boundary

Allowed:

- Create this task plan, evidence, and audit review.
- Update `project-state.yaml`, `task-queue.yaml`, and `local-experience-coverage-matrix.yaml`.
- Output the minimal fresh approval text needed before any AP-02 L3 release gate execution.
- Run docs/state validation gates, local commit, fast-forward merge to `master`, push `origin/master`, and delete the
  merged short branch if gates pass.

Blocked:

- Provider/model calls, Cost Calibration Gate, payment/external-service execution, DB read/write, `.env*`, staging/prod
  /cloud/deploy, schema/migration, dependency/package/lockfile changes, source/test/e2e/script changes, PR, force push,
  destructive DB, and sensitive evidence.

## Minimal Fresh Approval Text

```text
Fresh approve AP-02 L3 release gate decision only.

Decision:
- Keep AP-02 release blocked; or
- Authorize a separate exact-scope AP-02 L3 execution package.

No provider/model call, Cost Calibration Gate, payment/external-service execution, DB read/write, .env* access,
staging/prod/cloud/deploy, schema/migration, dependency/package/lockfile change, source/test/e2e/script repair, PR,
force push, destructive DB, or sensitive evidence collection is approved unless the follow-up approval explicitly names:
- exact allowedFiles;
- exact blockedFiles;
- exact commands;
- redaction rules;
- rollback;
- stop conditions.
```

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-02-ops-auth-quota-cost-calibration-release-gate-fresh-approval-required.md docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-release-gate-fresh-approval-required.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-02-ops-auth-quota-cost-calibration-release-gate-fresh-approval-required.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-02-ops-auth-quota-cost-calibration-release-gate-fresh-approval-required.md docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-release-gate-fresh-approval-required.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-02-ops-auth-quota-cost-calibration-release-gate-fresh-approval-required.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-02-ops-auth-quota-cost-calibration-release-gate-fresh-approval-required`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-02-ops-auth-quota-cost-calibration-release-gate-fresh-approval-required`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ap-02-ops-auth-quota-cost-calibration-release-gate-fresh-approval-required`

## Stop Conditions

- Any request to execute provider/model calls, Cost Calibration Gate, payment/external-service, DB read/write, `.env*`,
  staging/prod/cloud/deploy, schema/migration, dependency/package/lockfile, source/test/e2e/script repair, PR, force
  push, destructive DB, or sensitive evidence.
- Any validation failure that cannot be fixed within the exact L0 allowed files.
