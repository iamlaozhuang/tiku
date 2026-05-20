# Phase 5 AI/RAG Contract And Threat Model Baseline Security Review

## Metadata

- Task id: `phase-5-ai-rag-contract-and-threat-model-baseline`
- Branch: `codex/phase-5-ai-rag-contract-and-threat-model-baseline`
- Base: `master`
- Reviewer: Codex
- Review date: 2026-05-20
- Verdict: `APPROVE`

## Files Reviewed

- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/05-execution-logs/task-plans/2026-05-20-phase-5-ai-rag-contract-and-threat-model-baseline.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/05-execution-logs/evidence/2026-05-20-phase-5-ai-rag-entry-gate-and-task-queue-seeding.md`

## Risk Types Reviewed

- `ai_rag_contract`
- `threat_model`
- `security_review_gate`
- Secret and environment handling
- External provider error handling
- AI call logging and redaction
- RAG authorization filtering
- Citation and `evidence_status` integrity
- Prompt template versioning
- Model config snapshotting
- Public identifier and API contract safety

## Abuse Cases Considered

- A student or employee changes a public identifier to retrieve chunks outside their effective authorization scope.
- An expired, cancelled, disabled, or not-yet-started authorization still permits RAG retrieval or AI calls against protected resources.
- Provider error payloads leak API keys, headers, raw prompts, user answers, retrieved chunks, or internal stack details into API responses or logs.
- `ai_call_log` becomes a raw data sink for prompts, model outputs, citations, user answers, or provider payloads.
- Model output fabricates citations or supplies a forged `evidence_status`.
- Prompt injection enters through question text, user answers, converted resources, retrieved chunks, or provider output.
- A prompt template update changes scoring interpretation without historical version traceability.
- A model config change alters in-flight scoring behavior after the student submits an answer.
- External URLs expose auto-increment `id` values.

## Data Exposure Review

The contract requires `ai_call_log` to store redaction-safe metadata by default and explicitly blocks raw secrets, provider API keys, password hashes, session internals, bearer tokens, unredacted provider errors, raw prompts, raw user answers, raw model outputs, raw citations, and raw retrieved chunks unless a later task defines a safe retention policy and passes security review.

The contract keeps provider credentials server-side and requires redacted display values only. It also requires external DTOs and URLs to use stable public identifiers rather than numeric database ids.

## Authorization Boundary Review

The contract requires RAG authorization filtering before retrieved content enters prompts. It also requires authorization expiry, cancellation, disabled accounts, and not-yet-started authorization states to be handled before AI calls use corresponding content.

The critical ordering is explicit: determine effective scope, filter resources and chunks, retrieve or discard unauthorized candidates, construct prompts only from authorized chunks, then build citations from authorized metadata.

## API Contract Review

The contract preserves:

- `/api/v1/` path versioning.
- Kebab-case plural REST paths.
- CamelCase JSON fields.
- Standard response envelope `{ code, message, data, pagination? }`.
- ISO 8601 time values.
- `null` for optional empty fields and `[]` for empty lists.
- External public identifiers such as `publicId`.
- No auto-increment primary keys in external URLs.

## Required Security Controls For Later Tasks

- Secret/env handling: later provider tasks must keep secrets server-side, never write real keys, and redact any display values.
- Provider errors: later AI provider adapters must normalize and redact provider payloads before API response, log, or UI exposure.
- Logging redaction: prompts, user answers, model outputs, citations, chunks, and provider errors require explicit redaction or a separate approved retention design.
- RAG authorization: retrieval must filter by profession, level, resource status, and effective authorization scope before prompt construction.
- Evidence integrity: `evidence_status` must be server-computed and must not be trusted from client input or raw model output.
- Prompt templates: later prompt work must version templates and record the key/version for each AI call.
- Model config: later model config work must snapshot redaction-safe config metadata at call start.
- Public identifiers: later route and DTO work must use public identifiers externally and keep numeric ids internal.

## Test Coverage And Accepted Gaps

This task is documentation and contract-only. No runtime behavior, schema, migrations, provider integration, source files, or tests are changed. Runtime tests are therefore not added in this task.

Accepted gaps for this task:

- No automated enforcement of the new AI/RAG contract exists yet.
- No provider adapter redaction tests exist yet.
- No RAG authorization tests exist yet.
- No `evidence_status` retrieval tests exist yet.

These gaps are non-blocking because follow-up queue tasks are scoped to implement the corresponding schema, contracts, services, tests, and security reviews.

## Verdict

`APPROVE`

The reviewed changes define security requirements and do not introduce runtime behavior. The contract includes the required controls for secret/env handling, provider error redaction, AI call log redaction, RAG authorization filtering, anti-fabrication behavior for `evidence_status`, prompt template versioning, model config snapshotting, and public identifier safety.
