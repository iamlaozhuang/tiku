# Security Review: Phase 6 Content And Knowledge Ops Baseline

## Metadata

- Task id: `phase-6-content-and-knowledge-ops-baseline`
- Branch: `codex/phase-6-content-and-knowledge-ops-baseline`
- Base: `master`
- Reviewer: Codex
- Review date: 2026-05-21
- Verdict: `APPROVE`

## Files Reviewed

- `src/server/contracts/admin-content-knowledge-ops-contract.ts`
- `src/server/services/admin-content-knowledge-ops-service.ts`
- `src/server/services/admin-content-knowledge-ops-route.ts`
- `src/app/api/v1/questions/route.ts`
- `src/app/api/v1/papers/route.ts`
- `src/app/api/v1/resources/route.ts`
- `src/app/api/v1/resources/[publicId]/rebuild-vector/route.ts`
- `src/app/api/v1/knowledge-nodes/route.ts`
- `src/app/(admin)/content/ContentKnowledgeOpsBaseline.tsx`
- `src/app/(admin)/content/knowledge-nodes/page.tsx`
- `tests/unit/admin-content-knowledge-ops-baseline.test.ts`

## Risk Types Reviewed

- `admin`
- `api_contract`
- `paper`
- `question`
- `resource`
- `knowledge_node`

## Abuse Cases Considered

- A non-admin or wrong-role admin calls content operation endpoints directly instead of using the UI.
- An `ops_admin` attempts a content-only action such as manual vector rebuild.
- A caller changes a `publicId` to access hidden resource, paper, question, or knowledge node internals.
- A resource response leaks object storage paths, raw embeddings, chunks, provider payloads, or internal numeric ids.
- A UI action gives the impression that manual vector rebuild is safe without confirmation or conflict handling.
- Route handlers drift from the standard `{ code, message, data, pagination? }` API envelope.

## Data Exposure Review

- DTOs expose `publicId` only; no numeric database `id` fields are defined or tested.
- Resource summaries expose `downloadAvailable` and `markdownPreviewAvailable` booleans instead of object storage paths.
- The baseline does not expose raw embeddings, chunk text, object storage keys, provider secrets, prompt text, model output, or raw citations.
- Sample data is synthetic and contains no real secret or production object path.

## Authorization Boundary Review

- The service defines explicit admin roles and allows manual vector rebuild only for `content_admin` or `super_admin`.
- Route handlers remain thin adapters over the service; they do not make UI-only authorization decisions.
- Current app route exports intentionally use the unavailable service, so production runtime calls return a safe `503621` envelope until real authenticated admin context is wired.
- `publicId` is treated as a lookup handle only; it is not used as an authorization mechanism in this baseline.

## API Contract Review

- Route adapters return JSON through `Response.json` with the standard response envelope.
- List responses include `pagination`; unavailable responses include `pagination: null`.
- JSON keys are camelCase.
- Empty optional values use `null`, and list fields use arrays.
- New route folders use kebab-case plural nouns under `/api/v1/`.

## Test Coverage And Accepted Gaps

- Unit coverage verifies list query normalization, error codes, public-id-only summaries, object storage and embedding redaction by absence, standard unavailable runtime response, route adapter pagination, and UI loading/empty/error/confirmation/toast states.
- Accepted gap: real authentication, persistence-backed permission checks, audit log writes, optimistic locking, and vector rebuild job dispatch are not implemented in this baseline. App routes use unavailable services until those runtime concerns are added in later tasks.
- Accepted gap: Browser/IAB verification was not run because this task's queue validation commands do not require rendered UI verification and the user requested avoiding heavy Browser/IAB operations unless needed.

## Verdict

`APPROVE`

The implementation is safe to merge as a baseline because it keeps production runtime unavailable by default, uses public identifiers externally, preserves the standard API envelope, and does not expose internal ids, object storage paths, embeddings, chunks, prompts, model outputs, or secrets.
