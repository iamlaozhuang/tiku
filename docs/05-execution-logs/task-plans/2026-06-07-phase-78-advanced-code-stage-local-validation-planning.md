# Phase 78 Advanced Code Stage Local Validation Planning

**Task id:** `phase-78-advanced-code-stage-local-validation-planning`

**Branch:** `codex/phase-78-local-validation-planning`

**Task kind:** `local_verification`

## Read Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-mvp-implementation-breakdown.md`

## Scope

This task records a local-first validation strategy for future advanced edition code-stage tasks. It does not approve product implementation, dependency, schema, migration, real provider calls, env/secret, staging/prod/cloud/deploy, payment, external-service, or Cost Calibration Gate work.

## Local Validation Matrix

Future code-stage tasks should map their risk to these local validation levels:

1. L1 static and repository hygiene:
   - `git diff --check`
   - Scoped Prettier check for touched files.
   - `npm.cmd run lint`
   - `npm.cmd run typecheck`
   - Git completion readiness inventory against `master`.
2. L2 unit and contract validation:
   - Unit tests for contracts, validators, mappers, services, and repositories.
   - API response shape checks for `{ code, message, data, pagination? }`.
   - camelCase DTO field checks and `null` optional field checks.
3. L3 local provider-agnostic integration:
   - Mocked AI task lifecycle tests without real provider calls.
   - Local quota reservation/finalization/release tests without production point defaults.
   - Local `authorization`, `personal_auth`, `org_auth`, organization scope, and owner visibility checks.
4. L4 redaction and evidence safety:
   - `audit_log`, `ai_call_log`, DTO, and evidence denylist checks.
   - Verify prompt, raw AI input/output, provider payload, secret, token, database URL, plaintext `redeem_code`, employee subjective answer text, and full `paper` content are absent.
5. L5 optional local browser/e2e:
   - Use only when future route/Web tasks are separately approved.
   - Keep flows local and fixture-backed.
   - Do not navigate staging/prod, call real provider, read env/secret, invoke payment, or use external-service.

## Domain Validation Notes

- `authorization` context tasks must prove blocked capability states for missing, expired, or wrong-scope authorization.
- Personal AI generated question and learning `paper` tasks must prove no formal `question`, formal `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` write path.
- Organization training tasks must prove draft/publish/takedown/version and employee submission rules locally.
- Organization analytics tasks must prove summary-only outputs and no export route or command.
- Operations tasks must prove `redeem_code` redaction, append-only quota ledger, `audit_log`, and role capability checks.
- Retention tasks must prove `expired_hidden`, recovery window, `audit_log`, `ai_call_log`, and redaction behavior locally.

## Blocked Validation Modes

- staging/prod validation remains blocked.
- Real provider validation remains blocked.
- env/secret creation, inspection, or mutation remains blocked.
- Payment and external-service validation remain blocked.
- Cost Calibration Gate execution remains blocked.

Cost Calibration Gate remains blocked pending fresh explicit approval.

## Validation Plan

- `git diff --check`
- Scoped Prettier check for task files and state files.
- Required anchor check for local validation levels, `authorization`, `paper`, `mock_exam`, `audit_log`, `ai_call_log`, staging/prod, real provider, env/secret, payment, external-service, and Cost Calibration Gate.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`
