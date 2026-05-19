# Phase 3 Material Library Baseline Security Review

## Review Metadata

- Task id: `phase-3-material-library-baseline`
- Branch: `codex/phase-3-material-library-baseline`
- Base: `master`
- Reviewer: Codex
- Review date: `2026-05-19`
- Verdict: `APPROVE`

## Files Reviewed

- `src/app/api/v1/materials/**`
- `src/server/contracts/material-contract.ts`
- `src/server/mappers/material-mapper.ts`
- `src/server/repositories/material-repository.ts`
- `src/server/services/material-route.ts`
- `src/server/services/material-route.test.ts`
- `src/server/services/material-service.ts`
- `src/server/services/material-service.test.ts`
- `src/server/validators/material.ts`

## Risk Types Reviewed

- `authorization`
- `api_contract`
- `data_contract`
- `admin`

## Abuse Cases Considered

- Calling material routes without admin context.
- Guessing or changing `publicId` values to access or mutate material.
- Editing a locked material after it has been referenced by published paper snapshots.
- Sending malformed JSON or oversized `contentRichText`.
- Trying to expose internal numeric `id` through DTO mapping.

## Authorization Boundary Review

- Runtime Next.js route files are wired to `createUnavailableMaterialService()` and return a standard `503201` response until authenticated admin runtime wiring is implemented.
- This means the current committed route surface does not yet perform data reads or writes without admin checks.
- The service/repository boundary documents material operations for later admin runtime integration.
- Follow-up task must inject authenticated admin context before enabling real repository-backed mutations.

## Data Exposure Review

- `MaterialAccessRow.id` remains repository-internal and is not mapped to API DTOs.
- API DTOs expose `publicId`, `title`, `contentRichText`, `profession`, `level`, `subject`, `status`, `isLocked`, `lockedAt`, `createdAt`, and `updatedAt`.
- No session, password, token, admin phone, storage key, or internal numeric id is returned.
- Empty optional values use `null`, not empty strings.

## API Contract Review

- Route paths use `/api/v1/materials` and `[publicId]` route params.
- Route folders use kebab-case plural nouns.
- API response shape remains `{ code, message, data, pagination? }`.
- JSON fields are camelCase.
- Material list uses pagination metadata.

## Test Coverage

- RED verified: targeted material tests failed before implementation because `material-service` and `material-route` were missing.
- GREEN verified: targeted material service/route tests pass after implementation.
- Full unit suite is covered in task evidence.

## Accepted Gaps

- No database-backed material repository implementation in this baseline.
- No authenticated admin resolver is wired yet.
- No `audit_log` write is emitted yet; the approved contract allows explicitly queueing this until the audit module lands.
