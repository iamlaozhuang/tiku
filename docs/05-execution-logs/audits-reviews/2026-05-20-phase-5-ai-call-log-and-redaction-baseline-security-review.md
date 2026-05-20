# Phase 5 AI Call Log And Redaction Baseline Security Review

## Metadata

- Task id: `phase-5-ai-call-log-and-redaction-baseline`
- Branch: `codex/phase-5-ai-call-log-and-redaction-baseline`
- Base: `master`
- Reviewer: Codex
- Review date: 2026-05-20
- Verdict: `APPROVE`

## Files Reviewed

- `src/db/schema/ai-rag.ts`
- `src/db/schema/ai-rag.test.ts`
- `src/server/models/ai-rag.ts`
- `src/server/models/ai-rag.test.ts`
- `src/server/contracts/ai-rag-contract.ts`
- `src/server/mappers/ai-rag-mapper.ts`
- `src/server/mappers/ai-rag-mapper.test.ts`

## Risk Types Reviewed

- `schema`
- `data_contract`
- `secret`
- `ai_call_log_redaction`

## Abuse Cases Considered

- A provider request payload contains `authorization`, `apiKey`, `token`, `cookie`, `password`, `secret`, `session`, or credential-like fields.
- A provider response or error message includes raw prompt text, user answer text, model output text, citation text, or provider secret values.
- A future API DTO accidentally exposes internal numeric `id`, `model_config_id`, or `prompt_template_id`.
- A future scoring/explanation/hint service tries to log raw prompt, answer, model output, citation, or provider payload bodies directly.
- A model configuration API key secret reference leaks through model config snapshots.

## Data Exposure Review

- `ai_call_log` stores only public context identifiers (`user_public_id`, `answer_record_public_id`, `mock_exam_public_id`, `question_public_id`) for user/resource correlation. Numeric primary keys remain internal.
- `model_config_snapshot` uses the existing redaction-safe snapshot and does not include `api_key_secret_ref` or `api_key_last_four`.
- Raw prompt, user answer, model output, and citation content are represented by SHA-256 hash, content length, and redaction reason only.
- Provider request, response, and error payloads pass through recursive redaction before log storage. Secret-like keys are redacted regardless of value type.
- Safe provider metadata such as request ids may remain visible for audit correlation.

## Authorization Boundary Review

- This task adds no route handler, Server Action, or user-facing query. It does not introduce a new authorization decision surface.
- The mapper outputs only API-safe public identifiers and redacted snapshots.
- Future list/detail access to AI call logs must be protected by admin/ops permissions in a later task before any route is added.

## API Contract Review

- DTO fields are camelCase.
- No external DTO exposes numeric auto-increment `id`.
- Optional fields use `null`.
- This task does not add a REST route, so no path contract changes are introduced.
- If later exposed through REST, responses must remain wrapped in `{ code, message, data, pagination? }`.

## AI Call Log Field Boundary

- Safe metadata: `public_id`, public context identifiers, `ai_func_type`, `call_status`, prompt template key/version, token counts, latency, timestamps.
- Repeatability metadata: `model_config_snapshot`, `prompt_template_key`, `prompt_template_version`.
- Redacted payloads: `request_redacted_snapshot`, `response_redacted_snapshot`, `error_redacted_snapshot`, `citation_redacted_snapshot`.
- Forbidden content: raw API keys, env values, authorization headers, cookies, session values, passwords, raw prompts, raw user answers, raw model outputs, and raw citation bodies.

## Test Coverage And Accepted Gaps

- Unit tests cover schema table/columns/indexes, enum values, row shape, DTO mapping, and redaction of prompt/user answer/model output/citation/provider secret payloads.
- Accepted gap: no database migration or integration test is included because this task explicitly forbids migrations and real database changes.
- Accepted gap: no provider SDK error fixture is included because this task explicitly forbids real provider integration.
- Accepted gap: no route authorization test is included because this task adds no route.

## Verdict

`APPROVE`

No blocking security issues were found. Remaining items are non-blocking future-work boundaries for later API/service tasks.
