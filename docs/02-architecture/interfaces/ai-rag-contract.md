# AI/RAG Contract

## Status

Baseline for Phase 5.

## Purpose

This contract defines the Phase 5 AI/RAG boundary before implementation starts. It protects the existing question paper, student answer, mock exam, and exam report contracts while allowing later tasks to add AI scoring, AI explanation, AI hint, knowledge recommendation, learning suggestion, and RAG retrieval behavior in small verified increments.

This document is normative for Phase 5 planning. It does not add runtime behavior, dependencies, schema, migration files, provider configuration, environment variables, or source code.

## Architectural Boundary

Tiku remains a TypeScript Next.js monolith as accepted in ADR-001 and ADR-002. AI/RAG work must follow the existing layering:

```text
route handlers / server actions -> service -> repository -> model
```

Phase 5 implementation must keep external clients behind REST contracts under `/api/v1/` and must not return database rows directly. Server Actions may be used for Web-only flows, but reusable business behavior belongs in services and project-owned AI/RAG adapters.

Third-party provider naming, SDK response shapes, token accounting, and error payloads must stay behind project-owned boundaries. Project-facing names must use the glossary terms in `docs/03-standards/glossary.yaml`.

## REST And DTO Contract

All Phase 5 REST APIs must keep the global response envelope:

```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "pagination": null
}
```

Rules:

- REST paths use `/api/v1/` and kebab-case plural nouns.
- JSON fields use camelCase.
- Optional fields return `null`, not omitted keys or empty strings.
- Empty lists return `[]`.
- Time fields use ISO 8601.
- Resource nesting is limited to two levels.
- State-changing actions use verb subpaths.
- External URLs, route params, and DTO references must use stable public identifiers such as `publicId`.
- Numeric auto-increment `id` values are internal only and must not appear in external URLs.

## Identifier Boundary

Internal storage may use `id` primary keys. External surfaces must use `publicId` or another approved non-sequential public identifier.

Examples of external-safe references:

- `modelConfigPublicId`
- `promptTemplatePublicId`
- `resourcePublicId`
- `knowledgeBasePublicId`
- `chunkPublicId`
- `citationPublicId`
- `answerRecordPublicId`
- `examReportPublicId`

Numeric `model_config.id`, `prompt_template.id`, `resource.id`, `chunk.id`, `answer_record.id`, and similar internal identifiers must stay inside repositories, models, and audit-safe internal records.

## Model Provider Contract

`model_provider` represents a model vendor or compatible provider boundary. Later implementation must treat provider secrets, endpoint settings, and provider-specific response payloads as server-side only.

Minimum contract boundaries:

- Provider credentials are never returned to clients.
- API key displays use redacted form only, such as the last four characters.
- Provider errors must be normalized before they reach API responses, logs, or UI.
- Provider-specific request and response shapes must be mapped to project-owned types before service code consumes them.
- Provider availability does not imply automatic fallback for every AI function type.

## Model Config Contract

`model_config` represents a project-owned configuration for a specific AI function type.

Minimum contract boundaries:

- Configuration selects provider, model name, enabled state, function mapping, timeout, and retry policy.
- AI scoring must snapshot the selected `model_config` when a scoring task starts. Later configuration changes must not alter in-flight scoring behavior.
- Scoring must not automatically fallback across models unless a later approved task explicitly changes that rule.
- Explanation, hint, knowledge recommendation, and learning suggestion may have fallback policy only when the policy is explicit and logged.
- No secret value may be stored in a snapshot. Snapshots may store provider public metadata, model name, config version, function type, timeout, retry policy, and redaction-safe display values.

## Prompt Template Contract

`prompt_template` represents versioned prompt source owned by the project.

Minimum contract boundaries:

- `ai_scoring`, `ai_explanation`, `ai_hint`, `kn_recommendation`, and `learning_suggestion` use separate prompt templates.
- Each template has a stable key and version.
- Each AI call records the prompt template key and version.
- Prompt template changes do not rewrite historical `ai_call_log`, `exam_report`, or answer results.
- Prompt templates must distinguish trusted system instructions from untrusted user answer, question content, retrieved chunks, and model output.

## Phase 12 Model Configuration Admin Boundary

Phase 12 may implement local/dev redaction-safe management for `model_provider`, `model_config`, and `prompt_template` only inside the existing REST and service layering.

Allowed surfaces:

- `model_provider` metadata CRUD, enable, disable, and credential rotation request shape.
- `model_config` CRUD, enable, disable, explicit function mapping, fallback ordering, and redaction-safe snapshot metadata.
- `prompt_template` metadata, version, function mapping, status, and digest management.
- Local deterministic/mock provider selection and fallback verification.

Blocked surfaces without a later approval:

- No real provider call.
- No `.env.local` or `.env.example` read or write.
- No staging/prod/cloud/provider connection.
- No secret generation, rotation, injection, or cloud secret manager integration.
- No raw prompt, raw answer, raw model response, raw provider payload, raw retrieved chunk, full paper, full textbook, OCR full text, or customer-like private data in evidence, logs, DTOs, or snapshots.

### Redaction-Safe DTO Rules

External DTOs must use public identifiers and camelCase fields.

`ModelProviderSummaryDto` and `ModelProviderDetailDto` may include:

- `publicId`
- `providerKey`
- `displayName`
- `status`
- `isEnabled`
- `secretStatus`
- `maskedSecret`
- `lastRotatedAt`
- `createdAt`
- `updatedAt`

They must not include credential values, environment variable values, provider headers, provider payloads, numeric ids, or internal secret references that can be dereferenced by a client.

`ModelConfigSummaryDto` and `ModelConfigDetailDto` may include:

- `publicId`
- `providerPublicId`
- `providerDisplayName`
- `modelName`
- `modelAlias`
- `functionType`
- `status`
- `isEnabled`
- `fallbackPriority`
- `timeoutMs`
- `retryLimit`
- `configVersion`
- `snapshotPolicy`
- `createdAt`
- `updatedAt`

`PromptTemplateSummaryDto` and `PromptTemplateDetailDto` may include:

- `publicId`
- `templateKey`
- `version`
- `functionType`
- `status`
- `isEnabled`
- `title`
- `description`
- `bodyDigest`
- `bodyPreviewMasked`
- `createdAt`
- `updatedAt`

`bodyPreviewMasked` is a UI-safe marker, not a prompt preview. Full prompt body storage or display remains separately gated until a task defines a safe retention and review policy.

### Secret Input And Masking Rules

Secret-like input may appear only in create or explicit rotate/update request payloads and only as short-lived server input. The value must be discarded after server-side validation/storage handling and must not appear in API responses, logs, evidence, snapshots, tests, or frontend persisted state.

Implementation tests may use synthetic fake values only. Test names, snapshots, and evidence must not include realistic keys or tokens.

### Fallback And Snapshot Rules

Fallback order is a project-owned policy, not provider behavior. It must be explicit per `functionType`, deterministic, and auditable.

`ai_scoring` must not silently fallback. It may use fallback only when the selected `model_config` version enables an explicit ordered policy and records the redaction-safe fallback chain.

Every AI call that uses `model_config` must snapshot:

- `modelConfigPublicId`
- `configVersion`
- `providerPublicId`
- `providerDisplayName`
- `modelName` or `modelAlias`
- `functionType`
- `fallbackPriority`
- `promptTemplatePublicId`
- `promptTemplateKey`
- `promptTemplateVersion`

Snapshots must not include secret values, raw prompt bodies, raw answers, raw model responses, raw provider payloads, or raw retrieved chunks.

## AI Call Log Contract

`ai_call_log` exists for auditability, troubleshooting, and repeatability. It must not become a raw sensitive data sink.

Red lines:

- Do not log real secrets, provider API keys, password hashes, session internals, or bearer tokens.
- Do not log unredacted provider error payloads.
- Do not log raw prompts, raw user answers, raw model outputs, raw citations, or raw retrieved chunks unless a later task explicitly defines a safe retention policy and passes security review.
- Do not expose `ai_call_log` records directly to student or ordinary admin APIs.

Allowed baseline metadata:

- AI function type.
- Redacted model provider display name.
- Model name or alias.
- `model_config` version or snapshot public reference.
- `prompt_template` key and version.
- Call status using `ai_call_status`.
- Token counts and latency when available.
- Redacted error code/category.
- `evidence_status`.
- Public references to the triggering answer, question, resource, or report when authorization allows it.

## RAG Data Contract

RAG terms follow the glossary:

- `resource`: uploaded or converted learning material.
- `knowledge_base`: a logical corpus boundary for retrieval.
- `chunk`: a retrieval-ready content slice.
- `embedding`: vector representation for search.
- `citation`: a redaction-safe reference shown to users.
- `evidence_status`: `sufficient`, `weak`, or `none`.

Minimum contract boundaries:

- Only published and RAG-ready resources may participate in retrieval.
- Disabled resources must not participate in retrieval.
- Resource state and vector state must be explicit; failed conversion or failed indexing cannot silently appear as valid RAG evidence.
- Chunk metadata must include enough redaction-safe context to build citations: resource public reference, resource title, section path, profession, level when applicable, and chunk order.
- Embedding dimensions and provider details must be verified by later implementation before real vector operations are enabled.

## RAG Authorization Boundary

RAG authorization filtering must happen before retrieved content enters an AI prompt.

Required order:

1. Determine the caller and effective authorization scope.
2. Filter eligible `resource`, `knowledge_base`, and `chunk` candidates by profession, level, resource status, and authorization scope.
3. Run keyword/vector retrieval only over authorized candidates, or discard unauthorized candidates before rerank if the storage engine cannot pre-filter.
4. Build the prompt context only from authorized chunks.
5. Build user-visible citations only from authorized, redaction-safe citation metadata.

Changing public identifiers, route params, profession, level, organization, or authorization scope must not allow cross-scope retrieval. Authorization expiry, cancellation, disabled accounts, and not-yet-started authorization states must be handled before AI calls are allowed to use corresponding content.

## Evidence Status Contract

`evidence_status` has exactly these values:

- `sufficient`: enough authorized evidence was retrieved for the AI function to cite sources.
- `weak`: some authorized evidence was retrieved, but confidence or coverage is insufficient.
- `none`: no usable authorized evidence was retrieved.

Downstream behavior:

- `sufficient`: AI output may include citations derived from authorized citation metadata.
- `weak`: AI output may explain uncertainty and must show an evidence warning; it must not overstate citations.
- `none`: AI output must not fabricate citations. Explanation, hint, scoring, and learning suggestion flows must either omit citations or show an explicit insufficient evidence message.

`evidence_status` is system-computed. Client input and model output must not be trusted as the source of truth for it.

## AI Function Input And Output Boundaries

### `ai_scoring`

Inputs:

- Question public reference.
- Student answer content from the authorized answer record.
- Standard answer and scoring points when available.
- Authorized RAG context when available.
- Snapshotted `model_config`.
- Versioned `prompt_template`.

Outputs:

- Total score bounded by question max score.
- Scoring point hit result and reason.
- Overall comment and improvement suggestion.
- Redaction-safe citations.
- `evidence_status`.
- Model and prompt metadata needed for audit.

Rules:

- Empty subjective answer scores zero without calling AI.
- Successful scoring is stable for the same answer submission unless a later approved re-score workflow exists.
- AI returned scores must be normalized and validated server-side.

### `ai_explanation`

Inputs:

- Question, answer, teacher `analysis`, standard answer, and authorized RAG context.

Outputs:

- Explanation text.
- Redaction-safe citations.
- `evidence_status`.
- Model and prompt metadata.

Rules:

- Failure must not block practice flow.
- RAG weakness must be visible; citations must not be fabricated.

### `ai_hint`

Inputs:

- Subjective question, current student answer, scoring points when available, and authorized RAG context.

Outputs:

- Improvement direction without directly revealing the final answer.
- Redaction-safe citations when evidence allows.
- `evidence_status`.

Rules:

- Hint content must not leak secrets, internal rubrics beyond allowed scoring points, or unauthorized resource text.

### `kn_recommendation`

Inputs:

- Question content, profession, level, subject, teacher metadata when available, and current knowledge tree.

Outputs:

- Zero to five recommended `knowledge_node` candidates.
- Confidence label.
- Recommendation status suitable for teacher confirmation.

Rules:

- Empty knowledge tree returns an empty recommendation list, not an error.
- Stale recommendations must be discarded when the question is edited or disabled before completion.

### `learning_suggestion`

Inputs:

- Exam report or practice history public reference.
- Authorized answer records and knowledge node snapshot data.
- Redaction-safe AI/RAG summary inputs.

Outputs:

- Learning suggestions.
- Weak knowledge node references when available.
- Redaction-safe citations when evidence allows.
- `evidence_status`.

Rules:

- Historical reports use snapshots and must not be silently recalculated from later knowledge tree changes.

## Threat Model Baseline

### Assets

- Provider credentials and model configuration.
- Prompt templates and versions.
- Student answer content.
- Scoring results and exam reports.
- Knowledge resources, chunks, embeddings, and citations.
- Authorization state and organization scope.
- AI call logs and audit logs.

### Trust Boundaries

- Client to REST route handler.
- Route handler or Server Action to service.
- Service to repository and database.
- AI/RAG service to external model provider.
- Retrieval service to resource, chunk, embedding, and citation storage.
- Logging and audit sinks.

### Abuse Cases

- Cross-organization or expired-authorization RAG retrieval.
- Provider error payload leaking secrets or raw prompts.
- `ai_call_log` storing raw sensitive user answers or model outputs without review.
- Model output fabricating citations or overriding `evidence_status`.
- Prompt injection through question content, user answers, converted resources, or retrieved chunks.
- Prompt template changes breaking repeatability of scoring.
- Model config changes altering in-flight scoring tasks.
- External URLs exposing numeric internal ids.

### Required Mitigations

- Filter RAG content by authorization before prompt construction.
- Normalize and redact provider errors.
- Record prompt template version and model config snapshot metadata for every AI call.
- Treat model output as untrusted and validate all structured fields.
- Compute `evidence_status` server-side.
- Use public identifiers for external API boundaries.
- Keep raw secrets and credentials server-side only.
- Require security review for later schema, service, API, logging, or external provider tasks.

## Deferred Work

This baseline intentionally defers:

- Database schema and migrations.
- Source code implementation.
- Provider SDK or Vercel AI SDK integration.
- Real prompt templates.
- Real embedding generation.
- pgvector enablement.
- RAG chunking implementation.
- Admin UI for model configuration.
- Browser/IAB verification.
