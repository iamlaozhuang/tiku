# Task Plan: batch-142-personal-learning-ai-persistent-history-security-review

## Baseline

- Branch: `codex/batch-142-personal-learning-ai-persistent-history-security-review`
- Baseline HEAD/master/origin/master: `e5e1f1fb2fd41394a3a3a142a309b7bd64f2343c`
- Pre-edit readiness: passed; no tracked, staged, or untracked changes before this plan/status update.
- Dependency: `batch-141-personal-learning-ai-ui-server-backed-history-after-submit` is `closed` / `pass`.

## Governance Read

- `AGENTS.md` project instructions supplied in the session.
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-12-batch-141-personal-learning-ai-ui-server-backed-history-after-submit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-141-personal-learning-ai-ui-server-backed-history-after-submit.md`
- Skill considered: `codex-security:security-diff-scan`. Its full artifact workflow is not applicable because batch-142
  is explicitly L0 docs-only and allowedFiles prohibit scan artifact/report outputs outside the queued governance files.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-12-batch-142-personal-learning-ai-persistent-history-security-review.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-142-personal-learning-ai-persistent-history-security-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-142-personal-learning-ai-persistent-history-security-review.md`

## Blocked Files And Capabilities

- Blocked files: `.env.local`, `.env.example`, package/lockfiles, `src/**`, `tests/**`, `e2e/**`, `drizzle/**`,
  `playwright-report/**`, and `test-results/**`.
- Product source edits, schema/migration, provider calls, e2e execution, generated-content persistence, dependency/env/
  secret/deploy/payment/external-service work, PR, force-push, and Cost Calibration Gate execution remain blocked.

## Review Plan

1. Perform read-only review of the persistent personal AI request history surfaces introduced by batches 137-141:
   schema/migration, mapper, repository, GET/POST route service, app route adapter, UI integration, and existing tests.
2. Verify session ownership controls: GET ignores client-supplied ownership ids and POST normalizes actor/owner/quota
   public ids from session context before persistence.
3. Verify public ids only: API DTOs and UI history surfaces do not expose internal numeric primary keys or database rows.
4. Verify `ai_call_log` and provider/redaction boundaries: only public log references may surface, raw prompts, provider
   payloads, raw answers, raw model responses, generated content, session material, secrets, and stack strings remain
   blocked/redacted.
5. Verify formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and `mistake_book` write paths remain
   untouched by this persistence/history track.
6. Write evidence and audit only, then run the declared docs-only validation commands and Module Run v2 scripts.

## Validation Plan

- `git diff --check`
- `Select-String -Path docs/05-execution-logs/evidence/2026-06-12-batch-142-personal-learning-ai-persistent-history-security-review.md,docs/05-execution-logs/audits-reviews/2026-06-12-batch-142-personal-learning-ai-persistent-history-security-review.md -Pattern 'session ownership','public ids only','ai_call_log','Cost Calibration Gate remains blocked'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-142-personal-learning-ai-persistent-history-security-review`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-142-personal-learning-ai-persistent-history-security-review`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-142-personal-learning-ai-persistent-history-security-review`

## Risk Controls

- Do not edit source, tests, e2e, schema, migrations, package/lockfile, env, provider, generated-content, deploy, payment,
  or external-service files.
- Keep evidence redacted; do not record secrets, bearer tokens, database URLs, raw prompts, raw answers, provider
  payloads, raw model responses, generated content, or internal numeric ids from live data.
- Treat this task as audit-only; any implementation finding that needs code changes must be deferred to a new queued task.
