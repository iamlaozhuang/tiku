# Security Review: Phase 5 AI Scoring Service Baseline

## Metadata

- Task id: `phase-5-ai-scoring-service-baseline`
- Branch: `codex/phase-5-ai-scoring-service-baseline`
- Base: `master`
- Reviewer: Codex
- Review date: `2026-05-20`
- Verdict: `APPROVE`

## Files Reviewed

- `src/server/services/ai-scoring-service.ts`
- `src/server/services/ai-scoring-service.test.ts`
- `docs/05-execution-logs/task-plans/2026-05-20-phase-5-ai-scoring-service-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-20-phase-5-ai-scoring-service-baseline.md`

## Risk Types Reviewed

- `api_contract`
- `ai_scoring`
- `external_service`
- `answer_record`
- `exam_report`

## Abuse Cases Considered

- Replaying the same successful answer record to trigger repeated scoring.
- Retrying a failed subjective scoring attempt past the configured maximum.
- Using a fallback model config for subjective scoring and silently changing scoring criteria.
- Logging raw prompts, user answers, model outputs, provider payloads, citations, or chunk text.
- Fabricating citations when RAG evidence is `weak` or `none`.
- Introducing a real provider call, secret, environment variable, dependency, migration, pgvector usage, or embedding storage in the baseline task.

## Data Exposure Review

- The service returns public identifiers only; it does not introduce numeric database `id` exposure.
- AI call log drafts use `createAiCallLogRedactedSnapshots` for prompt, user answer, model output, provider payloads, and citation content.
- `citationRedactedSnapshot` stores redacted citation snapshots plus retrieval evidence summary fields such as public IDs, hashes, counts, and `evidenceStatus`; it does not store raw chunk text.
- The implementation does not write secrets, read environment variables, or create provider configuration.

## Authorization Boundary Review

- The service consumes an already-filtered `RagRetrievalResultDto`; authorization filtering remains owned by the RAG retrieval baseline.
- The scoring baseline does not add route handlers or authenticated API entrypoints.
- Existing successful results are reused to prevent duplicate scoring side effects for the same answer record.
- Retry logic only operates on the provided scoring context and does not broaden access to answer records or exam reports.

## API Contract Review

- No REST route was added or changed.
- Exported service-facing fields use camelCase.
- Status-like values are lower snake_case strings.
- No public URL or DTO exposes an auto-increment primary key.
- Optional result fields use `null` where the value is intentionally absent.

## AI/RAG Boundary Review

- No real model provider integration is present; the service only calls an injected `AiScoringRunner`.
- Subjective scoring rejects `fallbackModelConfigPublicId` to preserve scoring consistency.
- `modelConfigSnapshot` and prompt template version are copied into every result and log draft.
- RAG citations are returned only when `evidenceStatus` is `sufficient`; `weak` and `none` do not fabricate citations.

## Test Coverage And Accepted Gaps

- Covered by `src/server/services/ai-scoring-service.test.ts`:
  - unanswered answer shortcut;
  - idempotent successful result;
  - 0.5-point rounding and total cap;
  - weak/none citation behavior;
  - failure and retry limit boundaries;
  - fallback model rejection.
- Accepted gap: this baseline is pure service logic and does not verify persistence transactions, async queue behavior, or authenticated route authorization because the task explicitly excludes database migrations and real provider integration.

## Verdict

`APPROVE`
