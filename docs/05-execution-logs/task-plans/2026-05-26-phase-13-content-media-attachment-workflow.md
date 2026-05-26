# Phase 13 Content Media Attachment Workflow Task Plan

**Task id:** `phase-13-content-media-attachment-workflow`

**Branch:** `codex/phase-13-content-media-attachment-workflow`

**Date:** 2026-05-26

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/global-db-api-skeleton.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-admin-experience-gap-scan.md`
- `docs/05-execution-logs/evidence/2026-05-25-phase-11-paper-asset-local-boundary-closeout.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-experience-gap-closeout-plan.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Queue Scope

### allowedFiles

- `src/features/admin/**`
- `src/app/api/v1/paper-assets/**`
- `src/server/services/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `tests/unit/**`
- `e2e/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`

### blockedFiles

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/db/schema/**`
- `drizzle/**`

## Task Range

Close `ADM-GAP-003` by replacing question/material rich-text image insertion that writes `local-image-placeholder` with a managed local `paper_asset` metadata-reference boundary that does not expose object keys, raw OCR, or full content.

This task must not introduce real upload/storage, schema changes, dependencies, staging/prod/cloud connections, or object storage config.

## Implementation Plan

1. Update unit tests first so image helper assertions fail on `local-image-placeholder` and require a managed local `paper_asset` reference plus redaction-safe helper copy.
2. Add a small admin UI helper that inserts a deterministic, local-only managed media reference into rich text.
3. Ensure inserted markup carries only a non-secret `paperAssetPublicId` style public reference and never includes object keys, storage paths, OCR text, or raw content.
4. Keep table helper behavior unchanged.
5. Add/adjust e2e assertions for the browser-visible content authoring helper where useful.

## Browser Validation Plan

Run Playwright on localhost and verify existing content authoring routes still load and write actions remain wired. The primary browser path is `/login` -> `/content/questions` and `/content/materials`, with existing content action closure coverage.

## Code Cross-Check Paths

- `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`
- `src/server/contracts/paper-asset-contract.ts`
- `src/server/mappers/paper-asset-mapper.ts`
- `src/server/services/paper-asset-service.ts`
- `tests/unit/admin-question-material-ui.test.ts`
- `e2e/content-action-closures.spec.ts`

## Risk Defense

- Do not implement real file-byte upload, object storage, OCR, malware scanning, or public URL creation.
- Do not expose object keys or storage paths in UI, evidence, or API JSON.
- Keep the helper local/dev metadata-reference only, aligned with the existing `paper_asset` metadata boundary.
- Preserve existing create/edit save flows and rich text length checks.

## Validation Commands

- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Sensitive Information Red Lines

- Do not read, modify, or output `.env.local` or `.env.example`.
- Do not connect to staging, prod, cloud, or a real provider.
- Do not record secrets, tokens, Authorization headers, database URLs, object keys, raw prompt, raw answer, raw model response, raw provider payload, full paper content, full teaching material, OCR full text, or private customer-like data.
