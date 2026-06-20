# AP-06 Online Payment Execution Fresh Approval Required Task Plan

## Task

- Task id: `ap-06-online-payment-execution-fresh-approval-required`
- Branch: `codex/ap-06-online-payment-execution-fresh-approval-required`
- Approval package: AP-06-ONLINE-PAYMENT-FRESH-APPROVAL
- Use case: `UC-FUTURE-ONLINE-PAYMENT`
- Objective: materialize minimal AP-06 online payment/external-service execution fresh approval text and stop before any
  L3 execution.
- Scope: L0 docs/state/governance only.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-06-online-payment-provider-boundary-detailing.md`

## Exact Allowed Files

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-06-online-payment-execution-fresh-approval-required.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-06-online-payment-execution-fresh-approval-required.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-06-online-payment-execution-fresh-approval-required.md`

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
- Output the minimal fresh approval text needed before any AP-06 online payment/external-service execution.
- Run docs/state validation gates, local commit, fast-forward merge to `master`, push `origin/master`, and delete the
  merged short branch if gates pass.

Blocked:

- Payment/external-service calls, payment provider configuration mutation, `.env*`, dependency/package/lockfile changes,
  DB read/write, schema/migration, staging/prod/cloud/deploy, Cost Calibration Gate, source/test/e2e/script changes, PR,
  force push, destructive DB, payment payloads, webhook bodies, invoice content, settlement files, and sensitive evidence.

## Minimal Fresh Approval Text

```text
Fresh approve AP-06 online payment/external-service execution decision only.

Decision:
- Keep online payment/external-service execution blocked; or
- Authorize a separate exact-scope AP-06 online payment execution package.

No payment/external-service call, payment provider configuration mutation, .env* access,
dependency/package/lockfile change, DB read/write, schema/migration, staging/prod/cloud/deploy, Cost Calibration Gate,
source/test/e2e/script repair, PR, force push, destructive DB, or sensitive evidence collection is approved unless the
follow-up approval explicitly names:
- exact allowedFiles;
- exact blockedFiles;
- exact commands and whether each is docs-only, local-only, sandbox, dry-run, or mutating;
- provider boundary: provider name, sandbox/live mode, SDK/API boundary, callback/webhook policy;
- money-movement ceiling: max transaction count, max amount, refund/invoice/settlement/reconciliation boundary;
- dependency/env/deploy boundary;
- redaction rules;
- rollback owner, acceptance owner, rollback decision point;
- stop conditions.
```

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-06-online-payment-execution-fresh-approval-required.md docs/05-execution-logs/evidence/2026-06-19-ap-06-online-payment-execution-fresh-approval-required.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-06-online-payment-execution-fresh-approval-required.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-06-online-payment-execution-fresh-approval-required.md docs/05-execution-logs/evidence/2026-06-19-ap-06-online-payment-execution-fresh-approval-required.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-06-online-payment-execution-fresh-approval-required.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-06-online-payment-execution-fresh-approval-required`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-06-online-payment-execution-fresh-approval-required`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ap-06-online-payment-execution-fresh-approval-required`

## Stop Conditions

- Any request to execute payment/external-service calls, payment provider configuration mutation, `.env*`,
  dependency/package/lockfile, DB read/write, schema/migration, staging/prod/cloud/deploy, Cost Calibration Gate,
  source/test/e2e/script repair, PR, force push, destructive DB, or sensitive evidence.
- Any validation failure that cannot be fixed within the exact L0 allowed files.
