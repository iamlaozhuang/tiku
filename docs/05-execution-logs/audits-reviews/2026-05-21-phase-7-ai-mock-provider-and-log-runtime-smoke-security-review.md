# Security Review: Phase 7 AI Mock Provider And Log Runtime Smoke

## Metadata

- Task id: `phase-7-ai-mock-provider-and-log-runtime-smoke`
- Branch: `codex/phase-7-ai-mock-provider-and-log-runtime-smoke`
- Base: `master`
- Reviewer: Codex
- Review date: 2026-05-21

## Files Reviewed

- `src/ai/mock-provider.ts`
- `src/app/api/v1/ai-call-logs/**`
- `src/app/api/v1/model-configs/route.ts`
- `src/server/repositories/admin-ai-audit-log-runtime-repository.ts`
- `src/server/services/admin-ai-audit-log-runtime.ts`
- `src/server/services/ai-mock-provider-runtime.ts`
- `tests/unit/phase-7-ai-mock-provider-and-log-runtime-smoke.test.ts`

## Risk Types Reviewed

- `ai_call_log`
- `model_config`
- `secret`
- `external_service_config`
- `api_contract`
- `local_runtime`

## Abuse Cases Considered

- A request without an admin session reads model configs or AI call logs.
- A `content_admin` reads operations AI log summaries outside the intended operations boundary.
- A client changes query parameters to expose numeric database ids or raw internal rows.
- A mock provider payload includes secret-shaped keys, raw prompts, raw answers, or raw model output.
- A model config mutation route enables or disables provider configuration without a dedicated permission task.
- A real provider SDK, API key, environment variable, or network call is introduced before mock-provider evidence exists.

## Data Exposure Review

- Admin AI log route DTOs expose public identifiers and redaction-safe summaries only.
- Raw prompts, raw answers, model output, provider request payloads, provider response payloads, provider errors, bearer tokens, session tokens, passwords, and API keys are converted to redacted hash/length/status snapshots before log persistence.
- Model config listing returns `apiKeyDisplay` only and returns `null` for the local mock provider secret display.
- Numeric database `id` values remain internal to repository SQL.

## Authorization Boundary Review

- `GET /api/v1/model-configs`, `GET /api/v1/ai-call-logs`, and `GET /api/v1/ai-call-logs/summary` require an authenticated admin session.
- AI/model log reads are limited to `super_admin` and `ops_admin`.
- `content_admin` is denied for AI/model log operations surfaces.
- Provider-affecting `enable` and `disable` model config routes remain on the unavailable baseline.

## API Contract Review

- Responses use `{ code, message, data, pagination? }`.
- JSON keys are camelCase.
- Route paths remain `/api/v1/model-configs`, `/api/v1/ai-call-logs`, and `/api/v1/ai-call-logs/summary`.
- External URLs do not expose auto-increment primary keys.

## Test Coverage And Accepted Gaps

- Unit tests cover unauthenticated denial, `content_admin` denial, mock provider execution, `ai_call_log` append behavior, model config listing, AI log listing, AI log summary, and response redaction.
- This task does not add schema or migration files because `drizzle/**` is explicitly blocked by the queue entry.
- This task does not wire a student-facing learning-suggestion route because the queue scope only allows AI call log/model config routes and `src/server/**`; the local E2E readiness task remains responsible for full request-path evidence.

## Verdict

- Verdict: `APPROVE`
