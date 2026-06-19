# AP-02 Ops Auth Quota Cost Calibration Fresh Approval Required Task Plan

## Task

- Task id: `ap-02-ops-auth-quota-cost-calibration-fresh-approval-required`
- Branch: `codex/ap-02-ops-auth-quota-cost-calibration-fresh-approval-required`
- Approval package: AP-02
- Use case: `UC-ADV-OPS-AUTH-QUOTA`
- Objective: materialize the AP-02 next-step seed requested by local diagnostics without executing cost, provider,
  payment, DB, env, source, test, e2e, schema, migration, dependency, deploy, PR, or force-push work.
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
- `docs/05-execution-logs/evidence/2026-06-19-ap-02-ap-11-fresh-approval-decision-pack.md`

## Exact Allowed Files

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-02-ops-auth-quota-cost-calibration-fresh-approval-required.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-fresh-approval-required.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-02-ops-auth-quota-cost-calibration-fresh-approval-required.md`

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
- `docs/01-requirements/**`
- `docs/02-architecture/**`
- `docs/03-standards/**`
- `playwright-report/**`
- `test-results/**`

## Approval Boundary

Allowed:

- Create this task plan, evidence, and audit review.
- Update `project-state.yaml`, `task-queue.yaml`, and `local-experience-coverage-matrix.yaml`.
- Convert the AP-02 local diagnostic "seed required" state into a closed L0 queue item with exact next-step approval
  text.
- Run docs/state validation gates, local commit, fast-forward merge to `master`, push `origin/master`, and delete the
  merged short branch if gates pass.

Blocked:

- Provider/model calls, provider retry, provider streaming, provider configuration, and raw provider payload handling.
- `.env*` read/write, secret/env output, database URL output, DB reads/writes, raw rows, raw SQL, or destructive DB work.
- Cost Calibration Gate execution, payment/external-service execution, real cost measurement, staging/prod/cloud/deploy,
  schema/migration, dependency/package/lockfile changes, product source changes, tests/e2e/script repair, PR, force
  push, formal adoption, screenshots, traces, DOM dumps, generated export payloads, and sensitive evidence.

## Execution Steps

1. Confirm clean `master` aligned with `origin/master`.
2. Create the AP-02 short branch.
3. Materialize the AP-02 fresh-approval-required seed as plan, evidence, audit, queue entry, project-state anchor, and
   matrix anchor.
4. Preserve `UC-ADV-OPS-AUTH-QUOTA` as `release_blocked`.
5. Record the next safe package as `ap-02-ops-auth-quota-cost-calibration-l1-l2-exact-scope-package`.
6. Run scoped formatting and Module Run v2 gates.
7. Commit, fast-forward merge to `master`, run master gates, push `origin/master`, and clean the merged branch.

## Validation Commands

- `git status --short --branch`
- `git rev-list --left-right --count master...origin/master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-02-ops-auth-quota-cost-calibration-fresh-approval-required.md docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-fresh-approval-required.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-02-ops-auth-quota-cost-calibration-fresh-approval-required.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-02-ops-auth-quota-cost-calibration-fresh-approval-required.md docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-fresh-approval-required.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-02-ops-auth-quota-cost-calibration-fresh-approval-required.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-02-ops-auth-quota-cost-calibration-fresh-approval-required`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-02-ops-auth-quota-cost-calibration-fresh-approval-required`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ap-02-ops-auth-quota-cost-calibration-fresh-approval-required`

## Stop Conditions

- Any need to read `.env*`, provider credentials, database URLs, raw rows, raw prompts, raw model output, raw provider
  payloads, payment data, private identifiers, raw question content, OCR input, generated exports, or cleartext
  `redeem_code`.
- Any request to execute provider/model calls, payment/external-service work, real cost measurement, Cost Calibration
  Gate, DB access, staging/prod/deploy, schema/migration, dependency, source/test/e2e/script repair, PR, force push, or
  destructive DB work.
- Any validation failure that cannot be fixed within the exact L0 allowed files.
