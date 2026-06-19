# AP-02 Ops Auth Quota Cost Calibration L1 Local Summary Execution Task Plan

## Task

- Task id: `ap-02-ops-auth-quota-cost-calibration-l1-local-summary-execution`
- Branch: `codex/ap-02-ops-auth-quota-cost-calibration-l1-local-summary-execution`
- Use case: `UC-ADV-OPS-AUTH-QUOTA`
- Objective: execute the fresh-approved local L1 authorization quota summary validation without crossing L3 gates.
- Scope: local service summary and focused unit validation only.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-local-summary-fresh-approval-required.md`
- `src/server/services/ops-governance-authorization-quota-summary-service.ts`
- `src/server/services/ops-governance-authorization-quota-summary-service.test.ts`

## Fresh Approval

User approved AP-02 L1 local summary execution only with exact allowed files and commands. This task does not approve
provider/model calls, Cost Calibration Gate, payment/external-service execution, DB read/write, `.env*` access,
staging/prod/cloud/deploy, schema/migration, dependency/package/lockfile changes, PR, force push, destructive DB, or
sensitive evidence collection.

## Exact Allowed Files

- `src/server/services/ops-governance-authorization-quota-summary-service.ts`
- `src/server/services/ops-governance-authorization-quota-summary-service.test.ts`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-local-summary-execution.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-local-summary-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-local-summary-execution.md`

## Blocked Files

- `.env*`
- `package.json`
- `package-lock.yaml`
- `package-lock.json`
- `pnpm-lock.yaml`
- `src/db/schema/**`
- `drizzle/**`
- `e2e/**`
- `tests/**`
- `scripts/**`
- deploy/cloud/payment/provider config files
- any file not explicitly listed in allowed files

## Implementation Plan

1. Confirm the service is a local read-model-only summary and does not require DB, env, provider, payment, export, OCR,
   deploy, migration, package, or Cost Calibration Gate execution.
2. Run the approved focused unit command against
   `src/server/services/ops-governance-authorization-quota-summary-service.test.ts`.
3. If the focused unit fails and the failure is repairable within the two approved service/test files, use RED/GREEN
   evidence and repair within scope only.
4. If source/test repair would require files outside the approval or any L3 capability, stop and report the required
   fresh approval.
5. Record redacted evidence, audit review, queue, project-state, and coverage matrix updates.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/ops-governance-authorization-quota-summary-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `npx.cmd prettier --write --ignore-unknown src/server/services/ops-governance-authorization-quota-summary-service.ts src/server/services/ops-governance-authorization-quota-summary-service.test.ts docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-local-summary-execution.md docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-local-summary-execution.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-local-summary-execution.md`
- `npx.cmd prettier --check --ignore-unknown src/server/services/ops-governance-authorization-quota-summary-service.ts src/server/services/ops-governance-authorization-quota-summary-service.test.ts docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-local-summary-execution.md docs/05-execution-logs/evidence/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-local-summary-execution.md docs/05-execution-logs/audits-reviews/2026-06-19-ap-02-ops-auth-quota-cost-calibration-l1-local-summary-execution.md`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-02-ops-auth-quota-cost-calibration-l1-local-summary-execution`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-02-ops-auth-quota-cost-calibration-l1-local-summary-execution`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ap-02-ops-auth-quota-cost-calibration-l1-local-summary-execution`

## Redaction

Evidence may record only command names, pass/fail, file paths, counts, and sanitized aggregate behavior. It must not
include secrets, `.env*` values, database URLs, raw DB rows, raw prompts, raw responses, raw model output, provider
payloads, raw errors, Authorization headers, tokens, payment data, private identifiers, raw question content, OCR input,
generated exports, or cleartext `redeem_code`.

## Rollback

Revert the task commit or restore the exact allowed files from `master`. Do not run DB rollback, migration rollback,
provider cleanup, payment cleanup, deploy rollback, or external-service cleanup without separate fresh approval.

## Stop Conditions

- Need for provider/model call, Cost Calibration Gate, payment/external-service execution, DB read/write, `.env*`
  access, staging/prod/cloud/deploy, schema/migration, dependency/package/lockfile change, e2e/browser runtime, PR,
  force push, destructive DB, or sensitive evidence.
- Need for source/test repair outside the two approved service/test files.
- Any validation failure that cannot be resolved within the exact approved L1 scope.
