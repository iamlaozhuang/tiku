# Phase 74 Advanced Ops Authorization Quota Implementation Planning

**Task id:** `phase-74-advanced-ops-auth-quota-implementation-planning`

**Branch:** `codex/phase-74-ops-auth-quota-planning`

**Task kind:** `implementation_planning`

## Read Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-ops-auth-quota-implementation-plan.md`

## Scope

This task records planning only for operations-side `authorization`, `redeem_code`, quota package, quota ledger, purchase-style grant, bonus grant, `manual_adjustment`, `audit_log`, and `ai_call_log` governance.

It does not approve or implement product code, dependency, schema, migration, provider, env/secret, staging/prod/cloud/deploy, payment, external-service, or Cost Calibration Gate work.

## Implementation Task Proposal

Future implementation should be split into separately approved code-stage tasks:

1. Ops authorization/quota contract and validator:
   - Define DTOs for `personal_auth`, `org_auth`, `redeem_code`, quota package, quota ledger, purchase-style grant, bonus grant, `manual_adjustment`, filters, and audit summary.
   - Validate required grant and adjustment fields without inventing production quota defaults.
2. Append-only quota ledger model:
   - Define operation types including `purchase_grant`, `bonus_grant`, `manual_adjustment`, reservation, finalization, release, and authorization governance actions.
   - Require corrections through new `manual_adjustment` entries instead of mutating old ledger business meaning.
3. Ops service boundary:
   - Require platform operations admin context and `canManageAuthorizationQuota`.
   - Orchestrate purchase-style grant, bonus grant, `manual_adjustment`, `authorization`, and `redeem_code` summary workflows.
4. Redaction mapper:
   - Return public ids and camelCase DTO fields.
   - Exclude plaintext `redeem_code`, numeric ids, prompt text, provider payloads, secrets, tokens, raw AI input/output, and employee sensitive details.
5. Audit and AI task quota boundary:
   - Write `audit_log` summaries for ops governance actions.
   - Keep AI task reservation/finalization/release integration at a boundary that can be implemented after separate approval.
   - Treat `ai_call_log` as redacted operational evidence only.
6. Optional route/Web surfaces:
   - Add route and admin UI only under a separately approved implementation task.
   - Exclude payment UI, external-service confirmation, provider configuration, production quota default entry, and deployment.

## Acceptance Planning Notes

- Ordinary ops reads return summaries only.
- One-time plaintext `redeem_code` display, if ever needed, requires a controlled response boundary and must not appear in evidence or logs.
- Purchase-style grant is an ops registration flow, not payment, refund, invoice, reconciliation, or external-service confirmation.
- Missing production quota defaults must block AI capability instead of using placeholder values.

## Validation Plan

- `git diff --check`
- Scoped Prettier check for task files and state files.
- Required anchor check for `authorization`, `personal_auth`, `org_auth`, `redeem_code`, quota ledger, `purchase_grant`, `bonus_grant`, `manual_adjustment`, `audit_log`, `ai_call_log`, payment, external-service, and Cost Calibration Gate.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`
