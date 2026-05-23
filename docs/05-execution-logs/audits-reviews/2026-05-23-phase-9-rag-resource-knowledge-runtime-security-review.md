# Security Review: phase-9-rag-resource-knowledge-runtime

## Scope

- `src/app/api/v1/resources/**`
- `src/app/api/v1/knowledge-nodes/**`
- RAG resource/knowledge route handlers, repositories, validators, contracts, and unit tests.

## Review Result

No critical or high security findings were introduced in this task.

## Controls Verified

- Auth/session boundary: resource and knowledge node runtime handlers require an admin session and `content_admin` or `super_admin` before listing or mutating protected RAG resources.
- Authorization boundary: non-content admins fail closed with standard error envelopes and redacted audit log metadata.
- Identifier boundary: public route params and DTOs use `publicId`; no auto-increment `id` is returned by new runtime responses.
- RAG privacy boundary: rebuild responses include chunk counts, hashes, and heading paths only; raw Markdown/chunk text is not returned by the resource rebuild route.
- Citation boundary: local retrieval returns citations only from filtered chunks; unauthorized, non-`rag_ready`, wrong-profession, and wrong-level candidates are excluded before citation creation.
- Dependency boundary: no dependency, lockfile, `.env.example`, migration, real AI provider, real embedding provider, object storage, or production resource change.
- Input validation: knowledge node create/update payloads are runtime-validated before repository calls.
- Logging boundary: audit log metadata uses redacted summaries and does not include request bodies, session tokens, raw Markdown, provider payloads, or secrets.

## Residual Risk

- Chunk persistence uses the current runtime boundary; no new chunk table, vector table, or migration was introduced because `drizzle/**` and dependency/schema changes are blocked.
- DOCX/PPTX/PDF conversion, private object storage downloads, background queue execution, real embedding, real rerank, and pgvector indexing remain deferred to a future approved task.
- Route Handler CSRF hardening remains dependent on the existing same-site/session model and broader platform controls; this task did not introduce a new CSRF framework because dependency and auth model changes are out of scope.

## Evidence

- Focused RED failed before implementation because `rag-resource-knowledge-runtime` did not exist.
- Focused GREEN passed after implementation: `tests/unit/phase-9-rag-resource-knowledge-runtime.test.ts`.
- Full required validation results are recorded in `docs/05-execution-logs/evidence/2026-05-23-phase-9-rag-resource-knowledge-runtime.md`.
