# Monopoly scanned PDF OCR runtime RAG coverage

## Task

- Task id: `monopoly-scanned-pdf-ocr-runtime-rag-coverage-2026-07-02`
- Branch: `codex/monopoly-scanned-pdf-ocr-runtime-rag-coverage`
- Goal: OCR the two previously skipped monopoly scanned PDF sources into the local private owner-preview fixture pack, refresh runtime RAG coverage, then rerun only the failed monopoly AI 出题 Provider sample.

## Scope

- Source input: ignored local `D:\tiku\rawfiles\教材与鉴定点细则\专卖资料`.
- Target fixture pack: local private `D:\tiku-local-private\owner-facing-fixtures\2026-06-28-rawfiles-curated`.
- Allowed work:
  - metadata and extractability inspection for the two skipped monopoly scanned PDFs;
  - local OCR output stored only in the private fixture pack;
  - source inventory, manifest, coverage, resource-package import, and runtime RAG refresh for monopoly-only coverage repair;
  - one bounded localhost content-admin monopoly AI 出题 Provider sample after runtime RAG refresh.
- Blocked work:
  - fixing AI 组卷 question-count preview;
  - source/runtime/test code changes;
  - dependency, package, or lockfile changes;
  - schema, migration, seed, staging/prod/cloud/deploy, PR, force push, release readiness, final Pass, Cost Calibration.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-02-owner-preview-resource-pack-addendum.md`
- `docs/05-execution-logs/evidence/2026-07-02-marketing-monopoly-logistics-provider-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-marketing-monopoly-logistics-provider-rerun.md`
- `scripts/db/Import-OwnerPreviewResourcePackage.ps1`
- `scripts/db/Import-OwnerPreviewRuntimeRagResources.ps1`
- `src/db/owner-preview-resource-import.ts`
- `src/db/owner-preview-runtime-rag-resource-import.ts`

## Root Cause Frame

- Observed symptom: previous monopoly AI 出题 Provider sample returned a safe failure instead of a visible structured question set.
- Current hypothesis: runtime RAG had only 4 monopoly ready resources because two monopoly PDF sources were scanned and skipped, so grounding coverage for the sampled monopoly request stayed weak.
- Minimal verification: after OCR and runtime import, monopoly runtime ready coverage must increase, the OCR-derived resources must chunk successfully, and a single monopoly AI 出题 sample must return a safe visible structure or a clearly categorized remaining failure.

## Implementation Plan

1. Identify the two previously skipped monopoly scanned PDFs from private fixture-pack metadata and confirm their hashes/page counts without writing raw content to repo docs.
2. Use existing local tooling where available to OCR each PDF into private `.md` or `.txt` material files; do not introduce packages or commit OCR text.
3. Update private fixture inventory and manifest metadata so the OCR outputs become extractable runtime RAG materials.
4. Run resource-package and runtime RAG dry-runs, then execute the approved local imports only after dry-run output is usable.
5. Rerun only the monopoly AI 出题 content-admin sample through localhost, with at most one submitted attempt and no retry unless an infrastructure retry is explicitly needed and recorded.
6. Write redacted evidence and adversarial audit review, recording only counts, hash prefixes, character counts, chunk counts, coverage, attempt count, duration bucket, and status categories.
7. Run focused tests, lint, typecheck, Prettier, git diff check, and Module Run v2 pre-commit/pre-push gates before commit, fast-forward merge, push, and branch cleanup.

## Evidence Redaction

- Allowed: file count, PDF labels, hash prefixes, page counts, OCR character counts, generated private file counts, inventory deltas, runtime resource and chunk counts, coverage labels, command results, duration buckets, success/failure categories.
- Forbidden: credentials, cookies, tokens, sessions, Authorization headers, `.env*` values, DB raw rows, internal numeric ids, PII, Provider payloads, prompts, raw AI input/output, full OCR text, full material/chunk/question/paper content, screenshots, traces, raw DOM, localStorage.

## Validation

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Import-OwnerPreviewResourcePackage.ps1 -PackageRoot D:\tiku-local-private\owner-facing-fixtures
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Import-OwnerPreviewRuntimeRagResources.ps1 -PackageRoot D:\tiku-local-private\owner-facing-fixtures
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Import-OwnerPreviewResourcePackage.ps1 -PackageRoot D:\tiku-local-private\owner-facing-fixtures -Execute -ConfirmOwnerPreviewResourceImport
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Import-OwnerPreviewRuntimeRagResources.ps1 -PackageRoot D:\tiku-local-private\owner-facing-fixtures -Execute -ConfirmOwnerPreviewRuntimeRagImport
npm.cmd run test:unit -- tests/unit/owner-preview-resource-import.test.ts tests/unit/owner-preview-runtime-rag-resource-import.test.ts tests/unit/local-acceptance-session-bootstrap.test.ts
npm.cmd run lint
npm.cmd run typecheck
npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-monopoly-scanned-pdf-ocr-runtime-rag-coverage.md docs/05-execution-logs/evidence/2026-07-02-monopoly-scanned-pdf-ocr-runtime-rag-coverage.md docs/05-execution-logs/audits-reviews/2026-07-02-monopoly-scanned-pdf-ocr-runtime-rag-coverage.md
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-monopoly-scanned-pdf-ocr-runtime-rag-coverage.md docs/05-execution-logs/evidence/2026-07-02-monopoly-scanned-pdf-ocr-runtime-rag-coverage.md docs/05-execution-logs/audits-reviews/2026-07-02-monopoly-scanned-pdf-ocr-runtime-rag-coverage.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId monopoly-scanned-pdf-ocr-runtime-rag-coverage-2026-07-02
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId monopoly-scanned-pdf-ocr-runtime-rag-coverage-2026-07-02 -SkipRemoteAheadCheck
```
