# Security Review: Phase 5 RAG Evidence Status Retrieval Baseline

## Metadata

- Task id: `phase-5-rag-evidence-status-retrieval-baseline`
- Branch: `codex/phase-5-rag-evidence-status-retrieval-baseline`
- Base: `master`
- Reviewer: Codex
- Review date: 2026-05-20
- Verdict: `APPROVE`

## Files Reviewed

- `src/rag/retrieval.ts`
- `src/rag/retrieval.test.ts`
- `src/server/services/rag-retrieval-service.ts`
- `src/server/services/rag-retrieval-service.test.ts`
- `src/server/contracts/ai-rag-contract.ts`
- `src/server/models/ai-rag.ts`

## Risk Types Reviewed

- `authorization`
- `api_contract`
- `evidence_status`
- `pgvector_boundary`

## Abuse Cases Considered

- An unauthorized resource receives the highest retrieval score.
- A non-`rag_ready` resource attempts to participate in retrieval.
- A student requests a different `profession` or `level`.
- No chunks match but a downstream AI call expects citations.
- Raw citation or chunk text leaks into execution evidence or logs.
- A future vector implementation bypasses current filtering.

## Data Exposure Review

- AI-ready service output includes only chunk text from authorized and eligible citations.
- Evidence summaries include public identifiers, indexes, text hashes, query hash, score metadata, and counts only.
- Numeric database `id` fields are not exposed.
- No secret, provider payload, prompt, model output, user answer, raw query, citation text, or chunk text is written to evidence.

## Authorization Boundary Review

- `authorizedResourcePublicIds` filtering happens before citation selection and before service output returns AI-ready `chunkText`.
- Unauthorized candidates are discarded even when their score is higher than all authorized candidates.
- `resourceStatus` filtering uses `isResourceRagEligible`, which currently allows only `rag_ready`.
- `profession` and `level` filters run before ranking and top-three selection.

## API Contract Review

- Added DTO fields use camelCase.
- DTOs use public identifiers and do not expose auto-increment ids.
- No REST route was added, so the standard `{ code, message, data, pagination? }` response envelope was not changed.
- Optional scalar fields in the new retrieval evidence summary use `null` rather than empty string.

## Pgvector And Dependency Boundary

- No pgvector schema, embedding storage, vector column, migration, dependency, lockfile, or `.env.example` change was introduced.
- Retrieval uses supplied candidate scores only as a deterministic baseline.
- `fallbackReason: "rerank_unavailable_fusion_sort"` documents the non-rerank baseline behavior.

## Test Coverage And Accepted Gaps

- Covered by unit tests:
  - Authorization filtering before AI-ready output.
  - `rag_ready` participation boundary.
  - `profession` and `level` filtering.
  - Top-three citation selection.
  - `sufficient`, `weak`, and `none` status behavior.
  - Evidence summary redaction.
- Accepted gaps:
  - No database-backed repository integration because this task forbids migrations and does not introduce embedding storage.
  - No real vector or rerank provider test because this task explicitly excludes real model/provider integration.
