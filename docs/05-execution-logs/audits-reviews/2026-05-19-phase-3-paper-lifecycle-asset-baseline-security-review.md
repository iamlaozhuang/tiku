# Phase 3 Paper Lifecycle Asset Baseline Security Review

## Metadata

- Task id: `phase-3-paper-lifecycle-asset-baseline`
- Branch: `codex/phase-3-paper-lifecycle-asset-baseline`
- Base: `master`
- Reviewer: Codex
- Review date: `2026-05-19`
- Verdict: `APPROVE`

## Files Reviewed

- `src/server/contracts/paper-draft-contract.ts`
- `src/server/contracts/paper-asset-contract.ts`
- `src/server/repositories/paper-draft-repository.ts`
- `src/server/repositories/paper-asset-repository.ts`
- `src/server/mappers/paper-asset-mapper.ts`
- `src/server/validators/paper-asset.ts`
- `src/server/services/paper-draft-service.ts`
- `src/server/services/paper-draft-route.ts`
- `src/server/services/paper-asset-service.ts`
- `src/server/services/paper-asset-route.ts`
- `src/app/api/v1/papers/[publicId]/route.ts`
- `src/app/api/v1/papers/[publicId]/archive/route.ts`
- `src/app/api/v1/papers/[publicId]/copy/route.ts`
- `src/app/api/v1/paper-assets/route.ts`
- `src/app/api/v1/paper-assets/[publicId]/route.ts`
- Service and route tests for paper lifecycle and paper assets.

## Risk Types Reviewed

- `authorization`
- `api_contract`
- `data_contract`
- `admin`

## Abuse Cases Considered

- Caller guesses a `paper.publicId` and attempts to archive, copy, or delete without admin authorization.
- Caller attempts to delete a published, archived, or referenced paper.
- Caller attempts to copy a mutable draft paper as if it were a historical published source.
- Caller attempts to infer internal numeric ids through paper lifecycle or paper asset responses.
- Caller attempts to read `paper_asset.object_key` through an API DTO.
- Caller submits invalid `paper_attachment_usage` or malformed paper asset metadata.

## Authorization Boundary Review

- The new live Next.js routes remain wired to unavailable services, so they return standard runtime-unavailable responses until authenticated admin runtime wiring lands.
- Service-level lifecycle and asset methods are baseline domain methods and do not claim live admin enforcement by themselves.
- Accepted gap: actual admin role/session enforcement, audit log write, and answer-record termination are deferred to auth/admin and student workflow integration tasks. This is non-blocking because runtime route wiring is intentionally unavailable.

## API Contract Review

- Route paths use kebab-case plural nouns: `/api/v1/papers` and `/api/v1/paper-assets`.
- Dynamic route parameter is `[publicId]`; no auto-increment `id` is exposed in URLs.
- Response envelope remains `{ code, message, data }`.
- JSON fields use camelCase, including `deletedPaperPublicId`, `copiedFromPaperPublicId`, `paperAttachmentUsage`, and `fileSizeByte`.
- Optional values remain `null`; lists return arrays.

## Data Contract Review

- `paper_asset.object_key` is represented only in repository input/access rows and is not mapped into `PaperAssetDto`.
- `paper_attachment_usage` is validated against registered enum values: `paper_source`, `answer_analysis`, `answer_sheet`, and `other`.
- Lifecycle methods use public identifiers at service boundaries.
- Published paper deletion is blocked at service level; repository hooks keep unreferenced draft deletion as the persistence boundary.
- Copy returns a new draft paper DTO and preserves source paper-level scoring point adjustments in the baseline contract.

## Test Coverage And Accepted Gaps

- Covered by `src/server/services/paper-draft-service.test.ts`:
  - archive published paper
  - reject non-draft delete and referenced draft delete
  - copy archived paper as draft with scoring point preservation
  - reject draft copy
- Covered by `src/server/services/paper-draft-route.test.ts`:
  - public identifier based archive, delete, and copy route handlers
- Covered by `src/server/services/paper-asset-service.test.ts`:
  - list, create, read, and delete paper asset metadata
  - no `objectKey` exposure in DTOs
  - invalid input and missing asset errors
- Covered by `src/server/services/paper-asset-route.test.ts`:
  - standard paper asset route response envelopes
- Accepted gaps:
  - No database-backed transaction test because repository implementation and migration are outside this task.
  - No real admin auth test because live runtime auth wiring is intentionally deferred.
  - No object storage provider validation because provider selection is outside this task.
  - No answer-record termination implementation because Phase 4 answer records are not yet implemented.
  - No audit log assertion because `audit_log` implementation lands later.

## Verdict

`APPROVE`

The baseline is safe to merge as route/service/contract scaffolding. Runtime routes remain unavailable until admin authorization, repository persistence, object storage verification, and audit logging are introduced.
