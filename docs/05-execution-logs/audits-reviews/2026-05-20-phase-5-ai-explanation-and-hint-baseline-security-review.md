# Security Review: Phase 5 AI Explanation And Hint Baseline

## Metadata

- Task id: `phase-5-ai-explanation-and-hint-baseline`
- Branch: `codex/phase-5-ai-explanation-and-hint-baseline`
- Base: `master` at `5609041`
- Reviewer: Codex
- Review date: 2026-05-20
- Verdict: `APPROVE`

## Files Reviewed

- `src/server/services/ai-explanation-hint-service.ts`
- `src/server/services/ai-explanation-hint-service.test.ts`
- `docs/05-execution-logs/task-plans/2026-05-20-phase-5-ai-explanation-and-hint-baseline.md`
- `docs/04-agent-system/state/task-queue.yaml`

## Risk Types Reviewed

- `api_contract`
- `ai_explanation`
- `ai_hint`
- `external_service`
- `evidence_status`

## Abuse Cases Considered

- A caller attempts to use weak or empty RAG evidence and still display fabricated citations.
- A provider runner returns a hint that directly includes the `standardAnswer`.
- A provider failure includes raw learner answer, standard answer, prompt, model output, citation text, or provider payload details.
- A fallback model config is present for explanation or hint and accidentally triggers real provider routing.
- A future route consumes this service and treats an AI failure as a blocking answer-flow exception.

## Data Exposure Review

- AI call log drafts are created through `createAiCallLogRedactedSnapshots`.
- Prompt snapshots, user answers, request context, model output, provider payloads, provider errors, and citations are redacted before log draft output.
- `citationRedactedSnapshot` contains redacted citation snapshots plus evidence summary metadata, not raw `chunkText`.
- The service does not write prompt text, user answer text, model output text, provider request payload text, provider response payload text, or provider error text to log snapshots.

## Authorization Boundary Review

- The service accepts `RagRetrievalResultDto` produced by the existing retrieval boundary.
- It does not query resources, widen authorization scope, or bypass resource filtering.
- For `weak` or `none` evidence, the service returns an empty external `citations` list and an insufficient-evidence message.

## API Contract Review

- This task does not create or change route handlers.
- Service result fields use camelCase and project glossary terms: `ai_explanation`, `ai_hint`, `evidenceStatus`, `citations`, `modelConfigSnapshot`, and `promptTemplateVersion`.
- No external URL or DTO exposes numeric database `id`.

## Test Coverage And Accepted Gaps

- Unit tests cover automatic wrong-answer explanation, manual correct-answer explanation, weak evidence citation suppression, failed explanation non-blocking behavior, subjective hint answer-withholding behavior, failed hint non-blocking behavior, snapshot locking, and log redaction.
- Accepted gap: persistence and authenticated route enforcement are not implemented in this baseline because the task is service-first and provider-free.
- Accepted gap: fallback model provider resolution is not implemented; fallback identifiers remain locked in `modelConfigSnapshot` for future adapter work.

## Verdict

`APPROVE`

The implementation stays within the provider-free baseline boundary, avoids secret/env/dependency/migration changes, does not fabricate citations, and redacts AI call log snapshots.
