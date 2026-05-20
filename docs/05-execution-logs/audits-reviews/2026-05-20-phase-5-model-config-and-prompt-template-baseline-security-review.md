# Phase 5 Model Config And Prompt Template Baseline Security Review

## Metadata

- Task id: `phase-5-model-config-and-prompt-template-baseline`
- Branch: `codex/phase-5-model-config-and-prompt-template-baseline`
- Base: `master`
- Reviewer: Codex
- Review date: 2026-05-20
- Verdict: `APPROVE`

## Files Reviewed

- `src/db/schema/ai-rag.ts`
- `src/db/schema/ai-rag.test.ts`
- `src/db/schema/index.ts`
- `src/server/models/ai-rag.ts`
- `src/server/models/ai-rag.test.ts`
- `src/server/contracts/ai-rag-contract.ts`
- `src/server/validators/ai-rag.ts`
- `src/server/validators/ai-rag.test.ts`
- `src/ai/prompts/templates.ts`
- `src/ai/prompts/templates.test.ts`
- `docs/02-architecture/interfaces/ai-rag-contract.md`

## Risk Types Reviewed

- `schema`
- `secret`
- `external_service_config`
- `prompt_template`

## Abuse Cases Considered

- A provider API key is stored directly in source, docs, test fixtures, DTOs, or logs.
- Public DTOs expose numeric database ids or provider secret references.
- A scoring `model_config` silently falls back to a different model and changes scoring standards.
- A model config snapshot stores API key material or provider secret references.
- Prompt templates are not versioned, making later AI calls unreproducible.
- Prompt template content mixes trusted instructions with untrusted user answers or RAG chunks without later validation.
- Invalid timeout or retry settings create runaway provider calls.

## Data Exposure Review

No real secrets, placeholder API keys, environment names, or provider credentials were added. The provider schema stores only `api_key_secret_ref` and `api_key_last_four`; DTO contracts expose only `apiKeyLastFour`, not the secret reference. `normalizeModelProviderInput` derives last-four display metadata from transient input and does not return the raw API key.

`createModelConfigSnapshot` returns provider/config/template metadata needed for repeatability and deliberately omits `apiKeySecretRef` and `apiKeyLastFour`.

## Authorization Boundary Review

This task does not add routes, repositories, authenticated behavior, or RAG retrieval. Later admin-facing provider/config management must require super admin authorization before any model provider or model config data is returned or changed.

## API Contract Review

The DTO file uses camelCase fields and public identifiers such as `publicId`, `modelProviderPublicId`, and `fallbackModelConfigPublicId`. It does not expose numeric database `id` fields. No REST route is introduced in this task, so the runtime response envelope remains unchanged.

## Prompt Template Review

Prompt templates are static definitions under `src/ai/prompts/`, each with a stable key, `aiFuncType`, version, content, hash, required variables, and active flag. Baseline templates cover `ai_scoring`, `ai_explanation`, `ai_hint`, `kn_recommendation`, and `learning_suggestion` through the approved `ai_func_type` values.

The templates are not executed and do not include raw user data. Later AI call implementation must treat question content, user answers, RAG chunks, and model output as untrusted variables.

## Model Config Review

`model_config` includes function type, provider reference, model name, display name, version, enabled flag, timeout, retry count, and optional fallback reference. Validator logic rejects fallback for `scoring` while allowing explicit fallback for non-scoring functions.

## Test Coverage And Accepted Gaps

Covered by unit tests:

- Schema table names, columns, indexes, and `ai_func_type` values.
- Row type boundary stays snake_case.
- Model config snapshots omit secret fields.
- Provider input returns last-four metadata without raw API key retention.
- Scoring fallback is rejected.
- Prompt template definitions are versioned and registered for each AI function.

Accepted gaps:

- No database migration is generated in this task.
- No real provider adapter, secret manager, or environment variable is implemented.
- No admin route or authorization check is implemented.
- No prompt execution, AI SDK call, or provider error redaction runtime exists yet.

These gaps are non-blocking because the task is a baseline contract/schema/model step and follow-up tasks cover call logging, provider execution, and AI services.

## Verdict

`APPROVE`

The changes establish a typed baseline without introducing real secrets, provider calls, dependency changes, migrations, routes, or external service configuration.
