# Marketing monopoly logistics Provider rerun implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Use the updated runtime RAG catalog to run bounded local Provider small samples for AI出题 and AI组卷 across `marketing`, `monopoly`, and `logistics`.

**Architecture:** Treat this as a local owner-preview acceptance rerun, not a product-source repair. Reuse the existing owner preview resource import scripts, runtime RAG catalog, local acceptance login/session helpers, route-integrated Provider flow, and redacted evidence conventions. If `monopoly` remains weak because of scanned PDFs, stop at evidence and open a separate OCR repair task.

**Tech Stack:** Next.js 16 local dev server, TypeScript import scripts, PostgreSQL local dev target, in-app browser, Qwen through the existing OpenAI-compatible route.

---

## Task

- Task id: `marketing-monopoly-logistics-provider-rerun-2026-07-02`
- Branch: `codex/marketing-monopoly-logistics-provider-rerun`
- Depends on: `owner-preview-resource-pack-addendum-2026-07-02`
- Source: user requested marketing / monopoly / logistics Provider small-sample rerun with the updated runtime RAG catalog, while deferring separate OCR treatment for two scanned monopoly PDFs if needed.

## Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-02-owner-preview-resource-pack-addendum.md`
- `docs/05-execution-logs/evidence/2026-07-02-marketing-monopoly-provider-rerun.md`
- `scripts/db/Import-OwnerPreviewResourcePackage.ps1`
- `scripts/db/Import-OwnerPreviewRuntimeRagResources.ps1`
- `tests/unit/owner-preview-resource-import.test.ts`
- `tests/unit/owner-preview-runtime-rag-resource-import.test.ts`
- `tests/unit/local-acceptance-session-bootstrap.test.ts`

## Scope

- Local-only package discovery and runtime RAG coverage checks for `marketing`, `monopoly`, and `logistics`.
- Execute idempotent runtime RAG import only if dry-run is valid.
- Execute local DB resource import only if the UI/API needs refreshed resource metadata and dry-run is valid.
- Use content-admin AI出题 / AI组卷 as the canonical parameter-rich acceptance surface for the three-profession Provider sample.
- Verify ordinary UI result closure only by status/count/category, not by storing generated content.
- Record only role labels, profession labels, route labels, workflow labels, status categories, error categories, counts, and duration buckets.

## Out Of Scope

- Source/test/runtime code changes.
- OCR repair for scanned monopoly PDFs; this becomes a separate follow-up if `monopoly` remains weak.
- Full 8-role regression rerun; this task focuses on updated resource coverage across three professions.
- Package, lockfile, dependency, schema, migration, seed, e2e, staging/prod/cloud/deploy, Cost Calibration, release readiness, final Pass, PR, force push.
- `.env*` modification or evidence. Existing local runtime may read required local env values, but values must not be printed, recorded, or committed.
- Raw DB rows, internal ids, credentials, cookies, tokens, sessions, localStorage, Authorization headers, Provider payloads, prompts, raw AI input/output, raw DOM, screenshots, traces, or full generated/resource/question/paper/material/chunk content in evidence.

## Execution Steps

- [x] Confirm branch and clean working tree.
- [x] Materialize task in project state, task queue, and task plan.
- [x] Run focused unit tests for import and local acceptance helpers.
- [x] Run catalog import dry-run and record only aggregate counts/status.
- [x] Run runtime RAG import dry-run and record only aggregate counts/status.
- [x] Execute runtime RAG import if dry-run is valid.
- [x] Execute DB resource import only if needed and dry-run is valid.
- [x] Confirm or start local dev server at `http://localhost:3000`.
- [x] Connect to the in-app browser and use the content-admin surface.
- [x] Run at most 6 Provider submits: AI出题 and AI组卷 for `marketing`, `monopoly`, and `logistics`, no retries.
- [x] Record pass/fail/blocked/not_applicable for each profession/function pair.
- [x] Write redacted evidence and adversarial audit review.
- [x] Run validation gates.

## Acceptance Matrix

- `marketing` AI出题: one content-admin Provider sample, visible structured result or safe failure category.
- `marketing` AI组卷: one content-admin Provider sample, visible structured result or safe failure category.
- `monopoly` AI出题: one content-admin Provider sample, visible structured result or safe failure category.
- `monopoly` AI组卷: one content-admin Provider sample, visible structured result or safe failure category; if weak, mark OCR follow-up required.
- `logistics` AI出题: one content-admin Provider sample, visible structured result or safe failure category.
- `logistics` AI组卷: one content-admin Provider sample, visible structured result or safe failure category.

## Provider Budget

- Max Provider submit attempts: 6.
- Max per profession/function: 1.
- Retries: 0.
- Evidence records only executed/not_executed status, status category, failure category, duration bucket, citation/count bucket, and token count bucket if exposed safely.

## Validation

- `npm.cmd run test:unit -- tests/unit/owner-preview-resource-import.test.ts tests/unit/owner-preview-runtime-rag-resource-import.test.ts tests/unit/local-acceptance-session-bootstrap.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-marketing-monopoly-logistics-provider-rerun.md docs/05-execution-logs/evidence/2026-07-02-marketing-monopoly-logistics-provider-rerun.md docs/05-execution-logs/audits-reviews/2026-07-02-marketing-monopoly-logistics-provider-rerun.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId marketing-monopoly-logistics-provider-rerun-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId marketing-monopoly-logistics-provider-rerun-2026-07-02 -SkipRemoteAheadCheck`
