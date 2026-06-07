# Phase 75 Advanced Retention Log Governance Implementation Planning

**Task id:** `phase-75-advanced-retention-log-governance-implementation-planning`

**Branch:** `codex/phase-75-retention-log-governance-planning`

**Task kind:** `implementation_planning`

## Read Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-retention-log-governance-implementation-plan.md`

## Scope

This task records planning only for advanced edition retention, `expired_hidden`, recovery, hard-delete approval, controlled snapshot exception, `audit_log`, `ai_call_log`, and evidence redaction governance.

It does not approve or implement product code, dependency, schema, migration, provider, env/secret, staging/prod/cloud/deploy, payment, external-service, hard-delete executor, sensitive snapshot display, or Cost Calibration Gate work.

## Implementation Task Proposal

Future implementation should be split into separately approved code-stage tasks:

1. Contract, model, and validator:
   - Define explicit retention domains for AI generated practice, organization training draft, organization training published, formal `question`/`paper` draft, `audit_log`, and `ai_call_log`.
   - Model 90-day AI learning retention, 90-day organization training draft retention, long-term published organization training retention, 30-day recovery window, 1095-day `audit_log`, and 180-day `ai_call_log`.
2. Retention candidate and ordinary visibility service:
   - Mark eligible content as `expired_hidden` without deletion.
   - Hide `expired_hidden` content from ordinary student, employee, organization admin, and content management entrances.
   - Keep formal `question` and `paper` drafts delegated to existing formal content rules.
3. Recovery governance:
   - Allow recovery only within the configured recovery window.
   - Require operator, reason, target public id, target domain, and redacted current snapshot.
   - Re-run `authorization`, organization scope, owner, and redaction checks before ordinary visibility resumes.
4. Hard-delete approval guard:
   - Require approval record, reason, operator, target public id, target domain, and redacted impact summary.
   - Keep physical hard-delete executor blocked until a separately approved task.
5. Controlled snapshot exception guard:
   - Require reason, operator, time-limited scope, target public id, and `audit_log`.
   - Keep sensitive snapshot and raw content display blocked unless separately approved.
6. Log retention and redaction:
   - Apply 1095-day `audit_log` retention and 180-day `ai_call_log` retention.
   - Reject or redact prompt, raw AI input/output, provider payload, secret, token, database URL, plaintext `redeem_code`, employee subjective answer text, disallowed personal AI content, and numeric ids.

## Validation Plan

- `git diff --check`
- Scoped Prettier check for task files and state files.
- Required anchor check for `expired_hidden`, recovery, hard-delete, controlled snapshot, `audit_log`, `ai_call_log`, `redeem_code`, provider payload, sensitive snapshot, and Cost Calibration Gate.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`
