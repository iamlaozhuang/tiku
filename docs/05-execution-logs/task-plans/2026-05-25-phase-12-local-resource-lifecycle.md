# Phase 12 Local Resource Lifecycle Task Plan

## Goal

Close the local/dev resource lifecycle enough for operator validation without cloud storage, schema, migration, dependency, secret, staging, prod, or deployment changes.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/05-execution-logs/evidence/2026-05-25-phase-12-mvp-requirements-runtime-audit.md`

## Scope

Allowed local closure:

- upload controlled local Markdown/txt resource files to ignored `.runtime/` storage;
- parse supported text files into Markdown draft;
- show local resource rows through protected `/api/v1/resources`;
- save Markdown draft, publish, rebuild mock/local chunks, and disable local resources;
- keep evidence redacted: no full教材、完整试卷、OCR 全文、raw prompt/answer/model payload, tokens, secrets, or Authorization headers.

Out of scope and still blocked:

- Tencent Cloud COS, public object storage URL, staging/prod storage;
- dependency/package/lockfile changes;
- schema/migration/script changes;
- `.env.local` read/output/change;
- real provider calls or raw AI payload evidence.

## Implementation Approach

Use the existing route/service boundary and the ignored `.runtime/` directory:

1. Extend local storage helpers to store `resource` files under `dev/resource/{profession}/{yyyymm}/{hash}.{ext}`.
2. Add local catalog handling inside the resource runtime service for local-only resource metadata and Markdown/chunk summaries.
3. Add protected API actions for resource upload, detail/Markdown save, disable, and existing publish/rebuild integration.
4. Update the ops resource UI with an actual upload form, Markdown校对 dialog, disable action, and local-only status messages.
5. Add unit/E2E coverage for upload → draft → publish → rebuild → disabled, ensuring publicId-only API usage and redacted output.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-12-repair-local-resource-lifecycle
npm.cmd run test:unit -- tests/unit/admin-content-knowledge-ops-baseline.test.ts tests/unit/phase-11-local-file-upload-storage-adapter.test.ts tests/unit/phase-11-local-text-document-parser-boundary.test.ts tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts tests/unit/phase-11-local-rag-mock-embedding-pipeline.test.ts
npm.cmd run test:e2e -- e2e/local-business-flow.spec.ts
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
git diff --check
```

## Risk Controls

- Local files are stored only under ignored `.runtime/`.
- API responses expose publicId and redacted summaries, not local absolute paths, object keys, chunk text, embeddings, or hashes unless already safe test assertions require hash-pattern checks.
- Unsupported formats become `conversion_failed`; no OCR or new parser dependency is introduced.
- Any need for schema, migration, dependency, cloud, staging/prod, or secret work pauses for approval.
