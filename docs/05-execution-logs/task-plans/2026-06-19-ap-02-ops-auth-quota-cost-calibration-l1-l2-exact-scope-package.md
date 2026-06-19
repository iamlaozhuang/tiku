# AP-02 Ops Auth Quota Cost Calibration L1/L2 Exact-Scope Package Task Plan

## Task

- Task id: `ap-02-ops-auth-quota-cost-calibration-l1-l2-exact-scope-package`
- Branch: `codex/ap-02-ops-auth-quota-cost-calibration-l1-l2-exact-scope-package`
- Approval package: AP-02-L1-L2-EXACT-SCOPE
- Use case: `UC-ADV-OPS-AUTH-QUOTA`
- Objective: create a docs-only exact-scope package for a possible future AP-02 local L1/L2 task without executing that
  task.
- Scope: L0 docs/state/governance only.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-fresh-approval-required.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-approval-detailing.md`
- `package.json` script names only.

## Exact Allowed Files

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-l2-exact-scope-package.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-l2-exact-scope-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-l2-exact-scope-package.md`

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
- Name future AP-02 L1/L2 candidate files and commands for user review.
- Run docs/state validation gates, local commit, fast-forward merge to `master`, push `origin/master`, and delete the
  merged short branch if gates pass.

Blocked:

- Any current source/test/e2e/script edit or runtime execution beyond normal lint/typecheck validation.
- Provider/model calls, Cost Calibration Gate, payment/external-service execution, DB read/write, `.env*`, staging/prod,
  deploy, schema/migration, dependency/package/lockfile changes, PR, force push, destructive DB, and sensitive evidence.

## Future L1/L2 Candidate Scope

The following is not executed by this task. It is the minimum scope that would need a separate fresh approval before any
local L1/L2 AP-02 task starts.

Candidate allowed files:

- `src/server/services/ops-governance-authorization-quota-summary-service.ts`
- `src/server/services/ops-governance-authorization-quota-summary-service.test.ts`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/<future-ap02-l1-l2-task>.md`
- `docs/05-execution-logs/evidence/<future-ap02-l1-l2-task>.md`
- `docs/05-execution-logs/audits-reviews/<future-ap02-l1-l2-task>.md`

Candidate commands:

- `npm.cmd run test:unit -- src/server/services/ops-governance-authorization-quota-summary-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId <future-ap02-l1-l2-task>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId <future-ap02-l1-l2-task>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId <future-ap02-l1-l2-task>`

Candidate blocked files:

- `.env*`
- `package.json`
- lockfiles
- `src/db/schema/**`
- `drizzle/**`
- `e2e/**`
- deploy/cloud/payment/provider config files
- any file not named in candidate allowed files

## Stop Conditions

- Any need for provider/model call, Cost Calibration Gate, payment/external-service, DB read/write, `.env*`, staging/prod
  deploy, schema/migration, dependency/package/lockfile, PR, force push, or destructive DB work.
- Any need to expose secrets, database URLs, raw DB rows, raw prompts, raw responses, raw model output, provider payloads,
  payment data, private identifiers, raw question content, OCR input, generated exports, or cleartext `redeem_code`.
- Any validation failure that cannot be fixed within the exact L0 allowed files.
