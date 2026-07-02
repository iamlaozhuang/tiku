# Monopoly scanned PDF OCR runtime RAG coverage evidence

## Boundary

- Task id: `monopoly-scanned-pdf-ocr-runtime-rag-coverage-2026-07-02`
- Branch: `codex/monopoly-scanned-pdf-ocr-runtime-rag-coverage`
- Scope: two local private monopoly scanned PDFs, private OCR Markdown outputs, owner-preview resource import, runtime RAG import, and one bounded content AI出题 Provider rerun.
- Explicitly not in scope: AI组卷 question-count structured preview repair, source/runtime/test code changes, dependency changes, schema/migration/seed changes, staging/prod/cloud/deploy, PR, force push, Cost Calibration, release readiness, or final Pass claim.
- Evidence mode: aggregate counts, hash prefixes, page counts, character counts, chunk counts, coverage labels, safe status categories, and duration buckets only.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/001-phase-1-core-business-architecture.md`
- `docs/02-architecture/adr/002-frontend-platform-choice.md`
- `docs/02-architecture/adr/003-authorization-access-control.md`
- `docs/02-architecture/adr/004-question-generation-model.md`
- `docs/02-architecture/adr/005-ai-service-boundary.md`
- `docs/02-architecture/adr/006-frontend-routing-and-layout.md`
- `docs/02-architecture/adr/007-public-id-strategy.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-02-owner-preview-resource-pack-addendum.md`
- `docs/05-execution-logs/evidence/2026-07-02-marketing-monopoly-logistics-provider-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-marketing-monopoly-logistics-provider-rerun.md`

## OCR Result

| Source label          | Page count | Source SHA prefix | OCR part count | OCR char count | First part SHA prefix |
| --------------------- | ---------- | ----------------- | -------------- | -------------- | --------------------- |
| `monopoly_scan_pdf_1` | 426        | `91cbd4a09d73`    | 17             | 730947         | `75b0a93158fa`        |
| `monopoly_scan_pdf_2` | 210        | `9517bc9b46a8`    | 9              | 363739         | `fb59ac751ff1`        |

- Original pypdf text extraction smoke check: first 20 pages returned 0 extracted characters for both source PDFs.
- OCR runtime: local Windows OCR language `zh-Hans-CN`.
- OCR outputs were written only under the ignored local private fixture package.
- OCR outputs, source正文, chunk正文, and full material text were not written into repo evidence.

## Private Package Metadata

- `source-inventory.json` row count after repair: 117.
- Removed skipped scanned-PDF inventory rows: 2.
- Added generated OCR Markdown inventory rows: 26.
- Regenerated `source-coverage.csv`.
- Updated private `resource-pack-manifest.json` and `copied-source-files.json` with aggregate addendum metadata only.

## Import Validation

### Resource Package Dry-Run

```text
ownerPreviewResourceImport
mode=dry_run
status=dry_run
packageStatus=usable
totalFileCount=127
structuredFileCount=64
sourceDocumentCount=114
questionRowCount=3
resourceInventoryRowCount=117
professionCount=3
levelCount=5
subjectCount=2
knowledgeNodeCount=3
databaseTarget=not_required
```

### Runtime RAG Dry-Run

```text
ownerPreviewRuntimeRagImport
mode=dry_run
status=dry_run
inventoryRowCount=117
importableMaterialCount=69
unsupportedMaterialCount=1
skippedMissingFileCount=0
professionCoverage=marketing:37,monopoly:69,logistics:11
logisticsCoverage=missing_runtime_source
```

### Resource Package Execute

```text
ownerPreviewResourceImport
mode=execute
status=executed
packageStatus=usable
totalFileCount=127
structuredFileCount=64
sourceDocumentCount=114
questionRowCount=3
resourceInventoryRowCount=117
professionCount=3
levelCount=5
subjectCount=2
knowledgeNodeCount=3
databaseTarget=local_loopback
importedKnowledgeBaseCount=3
importedKnowledgeNodeCount=3
importedMaterialCount=3
importedQuestionCount=3
importedResourceCount=117
importedPaperCount=3
importedPaperQuestionCount=3
```

### Runtime RAG Execute

```text
ownerPreviewRuntimeRagImport
mode=execute
status=executed
inventoryRowCount=117
importableMaterialCount=69
unsupportedMaterialCount=1
skippedMissingFileCount=0
professionCoverage=marketing:37,monopoly:69,logistics:11
logisticsCoverage=missing_runtime_source
importedResourceCount=69
importedChunkCount=545
executionSkippedMissingFileCount=0
writtenMarkdownFileCount=69
mergedCatalogResourceCount=80
runtimeCoverage=logistics|all|rag_ready:11,marketing|all|rag_ready:28,monopoly|all|rag_ready:30
```

- Known carry-over issue: `logisticsCoverage=missing_runtime_source` remains a stale diagnostic label; this task did not modify runtime import code.

## Runtime RAG Coverage

| Metric                                  | Before | After                     |
| --------------------------------------- | ------ | ------------------------- | --- | --- |
| `monopoly                               | all    | rag_ready` resource count | 4   | 30  |
| Total runtime imported chunk count      | 519    | 545                       |
| OCR runtime resource count contribution | 0      | 26                        |
| OCR runtime chunk count contribution    | 0      | 26                        |

OCR runtime catalog aggregate:

| Source label          | Runtime resource count | Runtime chunk count | First runtime Markdown hash prefix |
| --------------------- | ---------------------- | ------------------- | ---------------------------------- |
| `monopoly_scan_pdf_1` | 17                     | 17                  | `a5c8075ec742`                     |
| `monopoly_scan_pdf_2` | 9                      | 9                   | `9b29378a98ae`                     |

Service-level RAG preflight for the rerun scope:

```text
profession=monopoly
level=3
subject=skill
eligibleResourceCount=30
eligibleChunkCount=164
evidenceStatus=sufficient
citationCount=3
maxScore=1
textHashPrefixes=5c4f14264a77,5c4f14264a77,5c4f14264a77
```

## Provider Rerun

| Role label      | Route/function | Profession | Level | Subject | Attempted | Retry count | Outcome category                  | Duration bucket | Safe visible structure |
| --------------- | -------------- | ---------- | ----- | ------- | --------- | ----------- | --------------------------------- | --------------- | ---------------------- |
| `content_admin` | content AI出题 | `monopoly` | 3     | `skill` | true      | 0           | failed_or_insufficient_safe_error | `gt_60s`        | none                   |

Safe response summary:

```text
httpStatus=200
apiCode=409015
safeMessageCategory=admin_ai_generation_requires_sufficient_grounded_structured_output
providerSubmitAttempts=1
providerRetries=0
rawProviderPayloadRecorded=false
promptRecorded=false
rawAiOutputRecorded=false
```

Interpretation:

- OCR/runtime coverage is no longer the first blocking condition for the sampled monopoly level-3 skill path; service-level retrieval is `sufficient`.
- The bounded route rerun still did not return an acceptable structured `question_set` draft through the content-admin local route.
- No second Provider call was made because the task budget was one rerun attempt with zero retries.
- AI组卷 question-count preview was not modified.

## Residuals

- `MML-RERUN-01`: reframed. OCR/runtime coverage for the two scanned PDFs is complete, but the monopoly AI出题 route sample still fails the safe structured-draft acceptance gate.
- `MML-RERUN-02`: unchanged. AI组卷 question-count preview repair remains out of scope and was not touched.
- `MML-RERUN-03`: unchanged. Runtime import still emits the stale logistics diagnostic label despite aggregate ready coverage.

## Validation

| Command                                                                                                                                                                                        | Result                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `npm.cmd run test:unit -- tests/unit/owner-preview-resource-import.test.ts tests/unit/owner-preview-runtime-rag-resource-import.test.ts tests/unit/local-acceptance-session-bootstrap.test.ts` | pass, 3 files, 16 tests |
| `npm.cmd run lint`                                                                                                                                                                             | pass                    |
| `npm.cmd run typecheck`                                                                                                                                                                        | pass                    |
| `npm.cmd exec -- prettier --write --ignore-unknown <task docs/state files>`                                                                                                                    | pass                    |
| `npm.cmd exec -- prettier --check --ignore-unknown <task docs/state files>`                                                                                                                    | pass                    |
| `git diff --check`                                                                                                                                                                             | pass                    |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId monopoly-scanned-pdf-ocr-runtime-rag-coverage-2026-07-02`                                                                                      | pass                    |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId monopoly-scanned-pdf-ocr-runtime-rag-coverage-2026-07-02 -SkipRemoteAheadCheck`                                                                  | pass                    |

## Boundary Checks

- Source/runtime/test code changed: false.
- Package or lockfile changed: false.
- Schema, migration, or seed changed: false.
- `.env*` modified or values recorded: false.
- Raw DB rows or internal ids recorded: false.
- Provider payload, prompt, or raw AI output recorded: false.
- Full OCR, material, question, paper, or chunk content recorded: false.
- AI组卷 question-count preview repaired: false.
