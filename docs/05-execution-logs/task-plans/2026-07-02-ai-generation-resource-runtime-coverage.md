# 2026-07-02 AI Generation Resource Runtime Coverage Task Plan

## Scope

- Task id: `ai-generation-resource-runtime-coverage-2026-07-02`
- Branch: `codex/ai-generation-grounding-coverage`
- Goal: close the local owner preview runtime RAG coverage gap for AI 出题 / AI组卷 by importing available owner-facing package materials into `.runtime/uploads/dev/resource/catalog.json`.
- Trigger: owner feedback that generated content must be grounded in uploaded package resources and that cross-role walkthrough must not miss UI/debug wording issues.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Current Findings

- Existing source-level grounding gate is shared by admin and student Provider execution paths.
- Existing ordinary UI tests cover visible wording leakage for `本地合约`, `已脱敏`, raw field names, and Provider/debug wording.
- Local private package aggregate coverage currently has `marketing` and `monopoly`; no `logistics` inventory is present.
- Runtime RAG catalog currently has `marketing` level 3 only. `monopoly` package material is available but not in runtime RAG.
- Cross-surface scan must include personal student, organization employee, organization admin, content admin, and ops audit surfaces. Any remaining internal wording in an ops-only audit context must be recorded as an explicit exception or follow-up, not treated as covered by student/content-admin tests.

## Implementation Plan

1. RED: add focused tests for a runtime importer that:
   - dry-runs package coverage without writing runtime files;
   - blocks execute mode without explicit confirmation;
   - imports only supported local text materials into a local runtime catalog;
   - supports DOCX text extraction without adding dependencies;
   - renders only aggregate, redaction-safe stdout.
2. GREEN: add `src/db/owner-preview-runtime-rag-resource-import.ts` and a thin PowerShell wrapper under `scripts/db/`.
3. Reuse existing runtime RAG catalog shape and `buildResourceChunks`; do not create a new RAG retrieval path.
4. Run a static cross-surface scan for both owner-raised risk classes:
   - generation must be package/RAG grounded or blocked when evidence is insufficient;
   - ordinary UI must not render local contract, redaction, raw field-name, Provider payload, or debug/governance wording.
5. Execute dry-run against `D:\tiku-local-private\owner-facing-fixtures`.
6. If dry-run passes, execute local runtime import with explicit confirmation and record aggregate counts only.
7. Re-run focused grounding and UI tests plus project gates.

## Boundaries

- Allowed local runtime write: `.runtime/uploads/dev/resource/**`.
- Allowed private input read: `D:\tiku-local-private\owner-facing-fixtures`, metadata and bounded local parsing only.
- No DB mutation, schema/migration/seed change, dependency/package/lockfile change, staging/prod/cloud/deploy, Cost Calibration, e2e, or release readiness/final Pass.
- No `.env*` read/write in this task.
- Evidence must not contain credentials, sessions, tokens, localStorage, Authorization headers, env values, DB connection strings, raw DB rows, internal numeric ids, PII, raw prompt, Provider payload, raw AI input/output, full generated content, full resource/material/chunk/question/paper content, screenshots, traces, raw DOM, or HTML dumps.

## Validation Commands

```powershell
npm.cmd run test:unit -- tests/unit/owner-preview-runtime-rag-resource-import.test.ts
npm.cmd run test:unit -- src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/student-personal-ai-generation-ui.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Import-OwnerPreviewRuntimeRagResources.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Import-OwnerPreviewRuntimeRagResources.ps1 -Execute -ConfirmOwnerPreviewRuntimeRagImport
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-ai-generation-resource-runtime-coverage.md docs/05-execution-logs/evidence/2026-07-02-ai-generation-resource-runtime-coverage.md docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-resource-runtime-coverage.md tests/unit/owner-preview-runtime-rag-resource-import.test.ts src/db/owner-preview-runtime-rag-resource-import.ts scripts/db/Import-OwnerPreviewRuntimeRagResources.ps1
npm.cmd run lint
npm.cmd run typecheck
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-resource-runtime-coverage-2026-07-02
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-resource-runtime-coverage-2026-07-02 -SkipRemoteAheadCheck
```

## Exit Criteria

- Runtime RAG coverage for available `monopoly` material is imported or a redacted blocker is recorded.
- `logistics` remains explicitly marked blocked by missing local resource package, not silently passed.
- AI 出题 / AI组卷 shared Provider paths still require sufficient grounding before Provider execution.
- Ordinary product UI still hides internal governance/debug wording.
- Cross-role coverage records personal advanced, organization advanced employee, organization advanced admin, content admin, and ops audit surfaces with pass / blocked / exception / follow-up status.
- Evidence records only aggregate counts, commands, statuses, and redacted findings.
