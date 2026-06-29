# Verify AI Provider Error Snapshot Redaction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to execute this plan in the current
> session. Use codex-security:fix-finding for security closure, use superpowers:test-driven-development before any
> production source change, and use superpowers:verification-before-completion before claiming completion.

## Task

- Task id: `verify-ai-provider-error-snapshot-redaction-2026-06-29`
- Branch: `codex/verify-ai-provider-redaction-20260629`
- Source finding: `sec-redlog-002` from `security-data-redaction-log-boundary-inventory-2026-06-29`
- Goal: prove provider error, prompt, answer, payload, generated output, and complete business-content snapshots remain
  redacted or hashed across AI scoring, AI explanation, AI hint, and knowledge recommendation paths.

## Governance Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest related task plan, evidence, acceptance, audit, and traceability for:
  - `detail-optimization-security-review-kickoff-2026-06-29`
  - `security-data-redaction-log-boundary-inventory-2026-06-29`
  - `fix-route-error-envelope-question-paper-student-experience-2026-06-29`

## Scope

Allowed writable files:

- `src/server/models/ai-rag.ts`
- `src/server/services/ai-scoring-service.ts`
- `src/server/services/ai-explanation-hint-service.ts`
- `src/server/services/knowledge-recommendation-service.ts`
- `src/server/models/ai-rag.test.ts`
- `src/server/services/ai-scoring-service.test.ts`
- `src/server/services/ai-explanation-hint-service.test.ts`
- `src/server/services/knowledge-recommendation-service.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-verify-ai-provider-error-snapshot-redaction.md`
- `docs/05-execution-logs/task-plans/2026-06-29-verify-ai-provider-error-snapshot-redaction.md`
- `docs/05-execution-logs/evidence/2026-06-29-verify-ai-provider-error-snapshot-redaction.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-verify-ai-provider-error-snapshot-redaction.md`
- `docs/05-execution-logs/acceptance/2026-06-29-verify-ai-provider-error-snapshot-redaction.md`

Implementation preference:

- Prefer focused regression-test proof only.
- Change production source only if the new regression proves a current leak.
- If production source changes, keep it limited to existing AI/RAG snapshot helpers or the three scoped services.

Blocked actions:

- No staging, production, cloud, deployment, release readiness, final Pass, or Cost Calibration.
- No database connection, mutation, schema, migration, seed, raw row access, or DB evidence capture.
- No Provider or AI call, provider configuration, model configuration, prompt capture, or raw AI input/output evidence.
- No browser runtime, dev server, raw DOM, screenshots, traces, or HTML report capture.
- No account login, private account read, credential, cookie, token, session, localStorage, Authorization header, env
  file, or connection-string access.
- No package or lockfile changes, dependency introduction, dependency removal, or dependency upgrade.
- No PR creation and no force-push.

## Regression Plan

1. Inspect existing AI/RAG snapshot and service tests to avoid duplicate coverage.
2. Add focused service-level regression assertions for failure paths:
   - AI scoring runner failure.
   - AI explanation runner failure.
   - AI hint runner failure.
   - Knowledge recommendation runner failure.
3. Assert the AI call log draft stores structured redacted snapshots for provider errors and request context.
4. Assert serialized AI call log drafts omit synthetic sensitive markers from prompts, answers, provider payloads, provider
   errors, generated output, and complete business content.
5. Keep assertion failure output boolean or structural where practical so command output does not print raw synthetic
   payload material.

## Evidence Rules

Record only:

- File paths, test names, commands, pass/fail status, counts, and redacted assertion summaries.
- Commit hash, branch names, merge target, push target, and cleanup result.

Do not record:

- Raw Provider payloads, prompts, AI input/output, provider error payload text, stack traces, generated output text, raw DB
  rows, internal IDs, PII, email, phone, plaintext redeem_code, env values, credentials, cookies, tokens, sessions,
  localStorage, Authorization headers, raw DOM, screenshots, traces, or complete question/paper/material/resource/chunk
  content.

## Validation Commands

```powershell
npx.cmd prettier --write --ignore-unknown src/server/models/ai-rag.ts src/server/services/ai-scoring-service.ts src/server/services/ai-explanation-hint-service.ts src/server/services/knowledge-recommendation-service.ts src/server/models/ai-rag.test.ts src/server/services/ai-scoring-service.test.ts src/server/services/ai-explanation-hint-service.test.ts src/server/services/knowledge-recommendation-service.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-verify-ai-provider-error-snapshot-redaction.md docs/05-execution-logs/task-plans/2026-06-29-verify-ai-provider-error-snapshot-redaction.md docs/05-execution-logs/evidence/2026-06-29-verify-ai-provider-error-snapshot-redaction.md docs/05-execution-logs/audits-reviews/2026-06-29-verify-ai-provider-error-snapshot-redaction.md docs/05-execution-logs/acceptance/2026-06-29-verify-ai-provider-error-snapshot-redaction.md
npx.cmd prettier --check --ignore-unknown src/server/models/ai-rag.ts src/server/services/ai-scoring-service.ts src/server/services/ai-explanation-hint-service.ts src/server/services/knowledge-recommendation-service.ts src/server/models/ai-rag.test.ts src/server/services/ai-scoring-service.test.ts src/server/services/ai-explanation-hint-service.test.ts src/server/services/knowledge-recommendation-service.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-verify-ai-provider-error-snapshot-redaction.md docs/05-execution-logs/task-plans/2026-06-29-verify-ai-provider-error-snapshot-redaction.md docs/05-execution-logs/evidence/2026-06-29-verify-ai-provider-error-snapshot-redaction.md docs/05-execution-logs/audits-reviews/2026-06-29-verify-ai-provider-error-snapshot-redaction.md docs/05-execution-logs/acceptance/2026-06-29-verify-ai-provider-error-snapshot-redaction.md
npm run test:unit -- src/server/models/ai-rag.test.ts src/server/services/ai-scoring-service.test.ts src/server/services/ai-explanation-hint-service.test.ts src/server/services/knowledge-recommendation-service.test.ts
npm run lint
npm run typecheck
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId verify-ai-provider-error-snapshot-redaction-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId verify-ai-provider-error-snapshot-redaction-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId verify-ai-provider-error-snapshot-redaction-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

- Local commit: approved by active thread task materialization.
- Fast-forward merge to `master`: approved by active thread task materialization after validation passes.
- Push `origin/master`: approved by active thread task materialization after validation passes.
- Cleanup short branch: approved by active thread task materialization after merge and push.
