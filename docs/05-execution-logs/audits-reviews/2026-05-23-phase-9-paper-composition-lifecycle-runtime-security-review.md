# Security Review: phase-9-paper-composition-lifecycle-runtime

## Metadata

- Task id: `phase-9-paper-composition-lifecycle-runtime`
- Branch: `codex/phase-9-paper-composition-lifecycle-runtime`
- Base: `master`
- Reviewer: Codex
- Review date: `2026-05-23`
- Verdict: `APPROVE`

## Files Reviewed

- `src/app/api/v1/papers/**`
- `src/app/api/v1/paper-assets/**`
- `src/server/repositories/paper-draft-repository.ts`
- `src/server/repositories/paper-asset-repository.ts`
- `src/server/services/paper-draft-service.ts`
- `src/server/services/paper-asset-service.ts`
- `src/server/services/paper-composition-lifecycle-runtime.ts`
- `tests/unit/phase-9-paper-composition-lifecycle-runtime.test.ts`

## Risk Types Reviewed

- `paper`
- `paper_asset`
- `publish_lock`
- `audit_log`
- `api_contract`

## Abuse Cases Considered

- Anonymous caller reads paper detail or mutates paper/paper_asset APIs.
- `ops_admin` attempts to create or mutate content paper lifecycle objects.
- Caller changes `{publicId}` or `{paperQuestionPublicId}` to operate on another paper question.
- Caller attempts to publish an incomplete draft paper.
- Caller archives a draft or deletes a published/referenced paper.
- Caller creates a paper_asset that returns `objectKey` or a long-lived file URL.
- Audit metadata leaks request bodies, session tokens, object storage keys, passwords, secrets, or API keys.
- Published paper mutation bypasses the publish lock and edits composition after release.

## Data Exposure Review

- Route parameters remain public identifiers; no external URL exposes numeric database `id`.
- Paper DTOs use camelCase and expose `publicId`, paper metadata, paper_section/question_group/question snapshots, scores, and timestamps only.
- Paper_asset DTOs expose file metadata and `fileHash`, but not `objectKey`, storage URLs, signed URLs, session tokens, secrets, or request bodies.
- Audit entries store actor public id, role, action type, target resource type/public id, result status, request IP, and a fixed redacted metadata summary.
- Unit tests assert serialized paper/paper_asset payloads and audit entries do not contain numeric `id`, internal FK names, session token, object key path, or `secret`.

## Authorization Boundary Review

- New runtime route handlers call `sessionService.getCurrentSession` before returning detail data or mutating paper/paper_asset state.
- Admin identity must include `adminPublicId` and a recognized admin role.
- Paper lifecycle mutation is restricted to `super_admin` and `content_admin`.
- `ops_admin` receives `403621 Admin permission denied` on mutation and a redacted audit failure entry is written.
- Existing service-level state checks remain active:
  - only draft paper can be composed;
  - only draft paper can be published;
  - only published paper can be archived;
  - only unreferenced draft paper can be deleted;
  - only published/archived paper can be copied.
- Repository writes resolve `created_by_admin_id` / `updated_by_admin_id` from authenticated admin public id on the server side, not from client input.

## API Contract Review

- REST routes remain under `/api/v1/`.
- Paths remain kebab-case plural nouns.
- JSON keys remain camelCase.
- Response envelopes remain `{ code, message, data, pagination? }`.
- Optional fields remain `null`; empty lists remain `[]`.
- Action routes use verb subpaths: `publish`, `archive`, `copy`.
- No dependency, schema, migration, `.env.example`, object storage, signed URL, external provider, SMS, email, payment, deployment, or production-resource change was introduced.

## Test Coverage And Accepted Gaps

- Unit tests added for:
  - unauthenticated paper detail rejection;
  - non-content-admin paper mutation rejection and redacted audit failure;
  - paper create/question-add/publish/archive/copy runtime behavior with public identifiers only;
  - paper_asset create/list/delete runtime behavior without exposing object keys or secrets.
- Existing paper and paper_asset service/route tests continue to pass in focused regression.
- Accepted gap: no Docker-backed DB integration test was added; repository behavior is validated through service/runtime contracts, typecheck, and final quality gates.
- Accepted gap: real file upload/download and temporary object storage URL security are deferred because this task intentionally avoids storage provider integration.
- Accepted gap: `GET /api/v1/papers` collection remains on existing admin read-view runtime for UI compatibility; lifecycle detail and mutations are live through the new protected runtime.

## Verdict

`APPROVE`. The implementation replaces unavailable paper lifecycle and paper_asset metadata routes with authenticated, role-checked, public-id-only runtime behavior; preserves publish/archive/copy state boundaries; writes redaction-safe audit logs for mutations; and avoids external storage/provider/schema/dependency changes. Residual gaps are scoped to later queued tasks and do not block this task.
