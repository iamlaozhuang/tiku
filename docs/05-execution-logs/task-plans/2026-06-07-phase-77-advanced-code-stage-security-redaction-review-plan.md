# Phase 77 Advanced Code Stage Security Redaction Review Plan

**Task id:** `phase-77-advanced-code-stage-security-redaction-review-plan`

**Branch:** `codex/phase-77-security-redaction-review-plan`

**Task kind:** `security_review`

## Read Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-retention-log-governance-implementation-plan.md`
- Local `security-best-practices` skill overview.

## Scope

This task records future security review coverage for advanced edition code-stage tasks. It does not execute product code changes, dependency changes, schema/migration changes, provider calls, env/secret reads, staging/prod/cloud/deploy actions, payment, external-service, or Cost Calibration Gate work.

## Security Review Coverage

Future implementation security reviews should include:

1. Permission boundary review:
   - Verify advanced feature entry requires valid `authorization`, effective `personal_auth` or `org_auth`, and role capability checks.
   - Verify operations authorization and quota actions require platform operations admin context and `canManageAuthorizationQuota`.
   - Verify forbidden/not-found behavior does not leak object existence outside the caller scope.
2. Public id and numeric id review:
   - Verify external URLs, DTOs, logs, and evidence use public id values.
   - Verify numeric id values are not exposed in route paths, ordinary DTOs, `audit_log`, `ai_call_log`, or evidence.
3. `redeem_code` redaction review:
   - Verify ordinary reads never return plaintext `redeem_code`.
   - Verify import/create flows, if separately approved, use a controlled one-time display boundary and do not persist plaintext values in logs or evidence.
4. `audit_log` and `ai_call_log` review:
   - Verify entries contain redacted summaries only.
   - Verify prompt, raw AI input/output, provider payload, secret, token, database URL, plaintext `redeem_code`, employee subjective answer text, and disallowed personal AI content are rejected or redacted.
5. Evidence redaction review:
   - Verify task evidence contains only public ids, timestamps, reason categories, redacted summaries, and validation command output.
   - Verify evidence excludes Authorization headers, env values, DB URLs, provider payloads, raw prompts, raw model responses, and full `paper` content.
6. Separation review:
   - Verify personal AI generated question and learning `paper` do not enter formal `question`, formal `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`.
   - Verify organization training and organization analytics do not expose employee sensitive detail or export flows without separate approval.

## Validation Plan

- `git diff --check`
- Scoped Prettier check for task files and state files.
- Required anchor check for security review coverage, `authorization`, `canManageAuthorizationQuota`, `redeem_code`, `audit_log`, `ai_call_log`, redaction, public id, numeric id, provider payload, and Cost Calibration Gate.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`
