# Security Review: Phase 5 RAG Resource And Knowledge Schema Baseline

## Verdict

APPROVE

## Scope Reviewed

- Drizzle schema baseline for `knowledge_base`, `resource`, `knowledge_node`, and `knowledge_node_resource`.
- TypeScript model exports and pure helpers for resource status transitions, RAG eligibility, and knowledge node snapshots.
- API DTO contracts and mappers for public-facing RAG resource and knowledge data.
- Task plan, evidence, and agent state updates.

## Findings

No blocking findings.

## Review Notes

### Secret And Env Handling

- No `.env.example`, `.env*`, secret reference, or provider credential changes were introduced.
- The task adds no external provider configuration and does not read or log `process.env`.

### Schema Boundary

- The schema declares table/type baselines only. No migration file under `drizzle/**` was created or edited.
- Auto-increment `id` remains storage-only. DTO mappers expose `publicId` and relation public identifiers instead of numeric IDs.
- Resource status is explicit via `resource_status`; `conversion_failed`, `draft`, `uploaded`, and `disabled` are not RAG eligible in model helpers.

### Migration And pgvector Boundary

- No migration execution or generated SQL is included.
- No pgvector extension, vector column, embedding column, or vector index was introduced. Vector/chunk implementation remains reserved for `phase-5-rag-chunking-baseline`.

### Resource Payload Safety

- Raw `markdown_content` is represented in the internal storage row but intentionally not mapped to `ResourceDto`.
- DTOs expose `markdownContentHash` only, plus metadata needed for review/status flows.
- File paths remain metadata fields; this task does not implement upload, filesystem access, or download routes.

### Knowledge Node Safety

- `knowledge_node` supports disable rather than delete; no `deleted_at` field or hard-delete API was introduced.
- `assertKnowledgeNodeDepth` enforces the Phase 5 max depth of 5 for future service-layer use.
- `createKnowledgeNodeSnapshot` returns public/camelCase fields and omits storage IDs.

### API Contract Safety

- DTO fields are camelCase and route-facing identifiers are public identifiers.
- No API route handler or auth boundary was added in this task, so no new request-facing surface is exposed.
- Future retrieval and recommendation tasks must enforce authorization filtering before reading resources/chunks.

## Non-Blocking Comments

- `markdown_content` is acceptable in the internal schema baseline because Markdown editing is a requirement, but any future logs, API responses, or AI payload snapshots must avoid storing or returning raw content unless explicitly reviewed.
- `disabled -> rag_ready` is allowed only as a state-machine baseline for the documented fast restore case where chunks/vectors still exist. Future services must verify backing chunk/vector availability before using that transition.
