# AI Generation Bounded Monopoly Question Provider Rerun After Plaintext Acceptance Repair Plan

## Task Boundary

- Task id: `ai-generation-bounded-monopoly-question-provider-rerun-after-plaintext-acceptance-repair-2026-07-02`
- Branch: `codex/ai-generation-bounded-monopoly-question-provider-rerun-after-plaintext-acceptance-repair`
- Scope: one bounded local content-admin Provider rerun for `monopoly` / level `3` / `skill` / AI出题.
- Provider limit: at most `1` submit attempt, `0` retries.
- Blocked: source/test/runtime code edits, AI组卷 question-count preview repair, browser UI repair, direct DB query or mutation by agent, private OCR/material read or write, dependency/package/lockfile changes, schema/migration/seed, staging/prod/cloud/deploy, PR, force push, release readiness, final Pass, and Cost Calibration.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-02-monopoly-scanned-pdf-ocr-runtime-rag-coverage.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-monopoly-question-structured-acceptance-diagnosis.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-monopoly-question-structured-acceptance-diagnosis.md`

## Requirement Mapping

- `UC-ADV-CONTENT-ADMIN-AI-GENERATION`: content admins must receive reviewable structured AI出题 draft output when grounding is sufficient.
- Admin ops AI draft/review boundary remains unchanged: generated drafts are review artifacts and are not adopted into formal `question` records.
- This task validates the shared parser repair against the previously failing monopoly content-admin Provider slice only.

## Execution Steps

1. Confirm localhost availability.
2. Create a local `content_admin` acceptance session without recording credential, cookie, token, session, Authorization header, or localStorage values.
3. POST one bounded content AI出题 request through `/api/v1/content-ai-generation-requests`.
4. Record only role label, route/function, profession, level, subject, attempt count, retry count, outcome category, duration bucket, structured preview count, and safe failure category if any.
5. Stop after one Provider attempt; do not retry or expand scope.
6. Run focused deterministic tests, lint, typecheck, scoped Prettier, diff check, and Module Run v2 gates.

## Acceptance Standards

- Provider submit attempts are `1` or fewer and Provider retries are `0`.
- `content_admin` `monopoly` level `3` `skill` AI出题 returns visible acceptable structured preview `question_set 10/10`.
- Evidence records only redacted status/category/count/duration metadata.
- No raw Provider payload, prompt, AI output, generated question, generated paper, material, resource, chunk, credential, cookie, token, session, Authorization header, localStorage, `.env*` value, raw DB row, internal id, or PII is recorded.
- No source/test code, dependency, schema, migration, seed, staging/prod/cloud/deploy, AI组卷 repair, release readiness, final Pass, or Cost Calibration action is executed.
