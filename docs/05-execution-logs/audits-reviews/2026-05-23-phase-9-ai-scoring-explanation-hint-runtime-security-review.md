# Security Review: phase-9-ai-scoring-explanation-hint-runtime

## Scope

- Task: `phase-9-ai-scoring-explanation-hint-runtime`
- Branch: `codex/phase-9-ai-scoring-explanation-hint-runtime`
- Review date: `2026-05-23`
- Runtime areas: `ai_scoring`, `ai_explanation`, `ai_hint` service boundary, `prompt_template` snapshots, `ai_call_log` redaction, student-owned mock exam and mistake book routes.

## Auth And Authorization

- Student mock-exam scoring submit/retry remains behind the existing session resolver and user-owned `mock_exam` lookup.
- `publicId` is still combined with `userPublicId`, ownership, session, and effective authorization checks.
- Mistake-book AI explanation uses the existing authorized mistake-book lookup before generating an explanation.
- No endpoint exposes internal numeric `id` values.

## Provider Boundary

- No real AI provider, SMS, email, payment, object storage, staging, or production credential is used.
- Runtime uses local deterministic runners only.
- Local model snapshots use mock provider/config public identifiers and versioned prompt template keys:
  - `dev_ai_scoring_v1`
  - `dev_ai_explanation_v1`
  - local `hintRunner` remains deterministic in the shared explanation/hint service boundary.

## Prompt And AI Call Logging

- `ai_call_log` append paths reuse existing redaction helpers.
- Request, prompt, user answer, model output, citations, provider request payload, provider response payload, and provider error payload are redacted or reduced to safe metadata before logging.
- The mock provider payload intentionally includes no real credential. Redaction still covers secret-like keys and text payloads.
- API DTOs return prompt template key/version and safe AI result fields only; they do not return raw prompt text, raw user answer, raw model output, API keys, session tokens, passwords, or provider secrets.

## Scoring And Retry Controls

- Successful subjective scoring is not retried by the retry endpoint.
- Retry only processes answer records currently marked `scoring_failed`.
- Unanswered subjective questions are scored as `0.0` without invoking the AI scoring runtime.
- Failed subjective scoring marks the affected answer record `scoring_failed` and the mock exam `scoring_partial_failed`.
- Completed retry updates aggregate scores and can move the mock exam back to `completed`.

## Residual Risks

- The Phase 9 acceptance matrix describes asynchronous queue processing. This task cannot add queue tables or migrations because `drizzle/**` and schema/migration work are blocked. The implemented MVP runtime runs local deterministic scoring synchronously during submit/retry and records this gap for a later approved queue/schema task.
- Full AI hint UX in practice remains outside this task's allowed route files. The deterministic `ai_hint` runner remains available in the shared service boundary, but no new practice endpoint was added because `src/app/api/v1/practices/**` is outside this task's allowed files.
- `ai_call_log` database insertion depends on existing local AI model config and prompt template rows. The repository safely returns a summary even when the AI tables are absent in isolated unit tests, matching prior runtime behavior.

## Decision

Approved for local MVP runtime use under the current task boundary. No dependency, schema, migration, environment, production resource, or real-provider change was introduced.
