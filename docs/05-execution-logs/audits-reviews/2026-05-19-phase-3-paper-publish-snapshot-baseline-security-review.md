# Phase 3 Paper Publish Snapshot Baseline Security Review

## Metadata

- Task id: `phase-3-paper-publish-snapshot-baseline`
- Branch: `codex/phase-3-paper-publish-snapshot-baseline`
- Base: `master`
- Reviewer: Codex
- Review date: `2026-05-19`
- Verdict: `APPROVE`

## Files Reviewed

- `src/server/contracts/paper-draft-contract.ts`
- `src/server/repositories/paper-draft-repository.ts`
- `src/server/services/paper-draft-service.ts`
- `src/server/services/paper-draft-route.ts`
- `src/server/services/paper-draft-service.test.ts`
- `src/server/services/paper-draft-route.test.ts`
- `src/app/api/v1/papers/[publicId]/publish/route.ts`
- `docs/05-execution-logs/task-plans/2026-05-19-phase-3-paper-publish-snapshot-baseline.md`

## Risk Types Reviewed

- `authorization`
- `api_contract`
- `data_contract`
- `admin`

## Abuse Cases Considered

- Caller guesses a `paper.publicId` and attempts to publish a paper without admin authorization.
- Caller attempts to publish an already published or archived paper.
- Caller attempts to publish a structurally incomplete draft paper.
- Caller attempts to publish a paper whose source `question` or `material` references cannot be locked.
- Caller attempts to infer internal numeric ids through publish response DTOs.
- Caller attempts to alter `questionSnapshot`, `standardAnswerRichText`, `analysisRichText`, or `scoringPoints` during publish.

## Authorization Boundary Review

- The new live Next.js route remains wired to `createUnavailablePaperDraftService()`, so it returns the standard runtime-unavailable response until authenticated admin runtime wiring lands.
- The service-level publish method is a baseline domain method and does not claim live admin enforcement by itself.
- Accepted gap: actual admin role/session enforcement and audit log write are deferred to the auth/admin integration task. This is non-blocking because runtime route wiring is intentionally unavailable.

## API Contract Review

- Route path is `POST /api/v1/papers/{publicId}/publish`.
- Dynamic route parameter is `[publicId]`; no auto-increment `id` is exposed in URLs.
- Response envelope remains `{ code, message, data }`.
- JSON fields use camelCase: `lockedQuestionPublicIds`, `lockedMaterialPublicIds`, `publishedAt`, `paperStatus`.
- Optional values remain `null`; lists return arrays.

## Data Contract Review

- Publish validation uses existing paper question snapshots as the published user-visible source.
- Source locking is represented through repository input using source `question` public ids and material public ids from snapshots.
- Numeric ids remain internal inside repository access rows and are not mapped to API DTOs.
- Publish validation covers missing score, total score mismatch, no counting question, empty `paper_section`, subjective `scoring_point` total mismatch, and source lock failure.
- Published snapshot immutability is covered by a service test that verifies existing `questionSnapshot` content remains unchanged during publish.

## Test Coverage And Accepted Gaps

- Covered by `src/server/services/paper-draft-service.test.ts`:
  - successful publish
  - source question/material lock public ids
  - missing paper
  - non-draft publish conflict
  - publish validation failures
  - source lock failure
  - snapshot immutability
- Covered by `src/server/services/paper-draft-route.test.ts`:
  - public identifier based publish route handler response
- Accepted gaps:
  - No database-backed transaction test because repository implementation and migration are outside this task.
  - No real admin auth test because live runtime auth wiring is intentionally deferred.
  - No audit log assertion because `audit_log` implementation lands later.

## Verdict

`APPROVE`

The baseline is safe to merge as route/service/contract scaffolding. Runtime publish remains unavailable until admin authorization, transactional repository implementation, and audit logging are introduced.
