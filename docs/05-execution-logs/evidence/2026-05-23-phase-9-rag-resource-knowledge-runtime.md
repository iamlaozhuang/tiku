# Evidence: phase-9-rag-resource-knowledge-runtime

## Metadata

- Task id: `phase-9-rag-resource-knowledge-runtime`
- Branch: `codex/phase-9-rag-resource-knowledge-runtime`
- Base: `master`
- Evidence created at: `2026-05-23T00:00:00+08:00`
- Security review: `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-rag-resource-knowledge-runtime-security-review.md`

## Scope

Allowed files followed:

- task plan, evidence, and security review
- `src/app/api/v1/resources/**`
- `src/app/api/v1/knowledge-nodes/**`
- `src/server/contracts/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- agent state files

Blocked files respected:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `drizzle/**`

## Implementation Summary

- Replaced unavailable resource handlers with protected runtime handlers for `GET /api/v1/resources` and `POST /api/v1/resources/{publicId}/rebuild-vector`.
- Added protected knowledge node runtime handlers for list, create, update, and disable under `/api/v1/knowledge-nodes`.
- Added a RAG resource/knowledge runtime repository for resource listing, resource indexing status updates, knowledge node listing, creation, update, and disablement.
- Added deterministic local resource vector rebuild behavior using existing Markdown chunking; rebuild responses return chunk evidence summaries and do not return raw chunk text.
- Added local deterministic chunk-to-citation retrieval adapter with authorization, profession, level, and `rag_ready` filtering before citation creation.
- Added runtime validation for knowledge node mutation payloads.
- Added `ResourceVectorRebuildResultDto` and focused Phase 9 unit coverage.

## Scope Conflict Handling

- Requirements mention DOCX/PPTX/PDF conversion, object storage, background vector rebuild jobs, real embeddings, real rerank, and pgvector.
- The task queue blocks dependency changes, schema/migration changes, `.env.example`, and `drizzle/**`; the user also forbids real provider/resource connections.
- This task therefore implements the local deterministic runtime boundary, status updates, redaction-safe evidence summaries, and citation behavior. Full conversion, signed downloads, async queueing, persistent chunk/vector schema, real embedding, and real rerank remain deferred.

## TDD Notes

- RED: `npm.cmd run test:unit -- tests/unit/phase-9-rag-resource-knowledge-runtime.test.ts`
  - Failed because `@/server/services/rag-resource-knowledge-runtime` did not exist.
- GREEN: same focused command passed after implementation.
  - `1` file and `3` tests passed.
- Full unit regression passed after implementation.
  - `101` files and `369` tests passed.

## Security Notes

- No dependency, lockfile, `.env.example`, schema, migration, real AI provider, real embedding provider, object storage, production resource, deploy, or PR change.
- No session token, password, secret, API key, raw Markdown, raw chunk text, raw provider payload, long-lived signed URL, or numeric auto-increment id is returned by new runtime DTOs.
- RAG citations are generated only from filtered authorized chunks; unauthorized and non-`rag_ready` chunks are excluded.
- Admin mutations write audit-log requests with redacted metadata summaries.

## Validation

Required commands:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-rag-resource-knowledge-runtime
Select-String -Path 'docs\05-execution-logs\task-plans\2026-05-23-phase-9-rag-resource-knowledge-runtime.md' -Pattern 'dependency introduction gate|human approval|no dependency change'
npm.cmd run test:unit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Results:

- `Test-TaskClaimReadiness.ps1 -TaskId phase-9-rag-resource-knowledge-runtime`: pass.
- `Select-String ... 'dependency introduction gate|human approval|no dependency change'`: pass; task plan contains all dependency gate markers.
- `npm.cmd run test:unit`: pass, `101` files and `369` tests passed.
- `Invoke-QualityGate.ps1`: pass after scoped Prettier formatting.
  - lint: pass.
  - typecheck: pass.
  - test:unit: pass, `101` files and `369` tests passed.
  - format:check: pass.
- `npm.cmd run build`: pass. Next.js compiled successfully and included:
  - `/api/v1/resources`
  - `/api/v1/resources/[publicId]/rebuild-vector`
  - `/api/v1/knowledge-nodes`
  - `/api/v1/knowledge-nodes/[publicId]`
  - `/api/v1/knowledge-nodes/[publicId]/disable`
- `Test-NamingConventions.ps1`: pass; banned terms absent, route folders kebab-case/public-id params, DTO fields camelCase.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory; branch has no upstream and changes are task scoped.

## Residual Risk

- Persistent chunk/vector storage is not implemented because schema/migration changes are blocked.
- Resource file conversion and private file download behavior remain deferred to the later resource/admin UI and acceptance tasks.
- Real rerank and embedding are intentionally not used; local deterministic fusion remains the allowed MVP runtime substitute for this task.

## Git Closeout

- implementationCommit: `e80a96e feat(rag): add resource knowledge runtime`.
- merge: pending.
- postMergeValidation: pending.
- push: pending.
