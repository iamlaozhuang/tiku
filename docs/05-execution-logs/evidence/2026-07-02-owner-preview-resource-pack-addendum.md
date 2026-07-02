# Owner Preview Resource Pack Addendum Evidence

## Boundary

- Task id: `owner-preview-resource-pack-addendum-2026-07-02`
- Branch: `codex/owner-preview-resource-pack-addendum`
- Source input: ignored local `D:\tiku\rawfiles\教材与鉴定点细则`
- Target package: local private `D:\tiku-local-private\owner-facing-fixtures\2026-06-28-rawfiles-curated`
- Evidence mode: aggregate counts, status labels, command results, and redacted summaries only.

## Actions

- Created task materialization in `project-state.yaml`, `task-queue.yaml`, and task plan.
- Added private fixture-pack coverage for `marketing`, `monopoly`, and `logistics`.
- Generated runtime-RAG-friendly Markdown chunks for large extractable sources.
- Converted one legacy monopoly `.doc` source into private `.docx` via local Word COM automation.
- Added private knowledge-node candidate inventory from assessment-point sources. Candidate text remains local private and is not recorded in repo evidence.
- Marked two monopoly scanned PDF sources as requiring OCR before runtime RAG.

## Private Package Result

| Item                                    | Result                               |
| --------------------------------------- | ------------------------------------ |
| Added inventory rows                    | 31                                   |
| Generated Markdown files                | 22                                   |
| Copied or converted DOCX files          | 3                                    |
| Knowledge-node candidate rows           | 2973                                 |
| Skipped source rows                     | 2                                    |
| Marketing PDF pages checked             | 202                                  |
| Marketing PDF non-empty extracted pages | 199                                  |
| Professions with added importable rows  | `logistics`, `marketing`, `monopoly` |

## Dry-Run Validation

### Resource Package Dry-Run

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Import-OwnerPreviewResourcePackage.ps1 -PackageRoot D:\tiku-local-private\owner-facing-fixtures
```

Result:

```text
mode=dry_run
status=dry_run
packageStatus=usable
totalFileCount=101
structuredFileCount=38
sourceDocumentCount=88
questionRowCount=3
resourceInventoryRowCount=93
professionCount=3
levelCount=5
subjectCount=2
knowledgeNodeCount=3
databaseTarget=not_required
```

### Runtime RAG Dry-Run

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Import-OwnerPreviewRuntimeRagResources.ps1 -PackageRoot D:\tiku-local-private\owner-facing-fixtures
```

Result:

```text
mode=dry_run
status=dry_run
inventoryRowCount=93
importableMaterialCount=43
unsupportedMaterialCount=1
skippedMissingFileCount=0
professionCoverage=marketing:37,monopoly:45,logistics:11
```

## Runtime RAG Local Catalog Execution

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Import-OwnerPreviewRuntimeRagResources.ps1 -PackageRoot D:\tiku-local-private\owner-facing-fixtures -Execute -ConfirmOwnerPreviewRuntimeRagImport
```

Result:

```text
mode=execute
status=executed
inventoryRowCount=93
importableMaterialCount=43
unsupportedMaterialCount=1
skippedMissingFileCount=0
professionCoverage=marketing:37,monopoly:45,logistics:11
importedResourceCount=43
importedChunkCount=519
executionSkippedMissingFileCount=0
writtenMarkdownFileCount=43
mergedCatalogResourceCount=54
runtimeCoverage=logistics|all|rag_ready:11,marketing|all|rag_ready:28,monopoly|all|rag_ready:4
```

Note: the existing runtime RAG dry-run renderer still reports `logisticsCoverage=missing_runtime_source` whenever logistics rows exist. The executed runtime coverage line above confirms logistics RAG-ready local resources are present. The label itself should be cleaned up in a later source task if needed.

## Unit Validation

Command:

```powershell
npm.cmd run test:unit -- tests/unit/owner-preview-resource-import.test.ts tests/unit/owner-preview-runtime-rag-resource-import.test.ts
```

Result: pass, 2 files, 10 tests.

## Governance Validation

| Command                                                                                                              | Result |
| -------------------------------------------------------------------------------------------------------------------- | ------ |
| `npm.cmd exec -- prettier --check --ignore-unknown <task docs/state files>`                                          | pass   |
| `git diff --check`                                                                                                   | pass   |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId owner-preview-resource-pack-addendum-2026-07-02`                     | pass   |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId owner-preview-resource-pack-addendum-2026-07-02 -SkipRemoteAheadCheck` | pass   |

## Boundary Checks

- `.env*` read or modified: no.
- Credentials, cookies, sessions, tokens, Authorization headers: not read, not recorded.
- DB connection or mutation: no.
- Resource package DB execute import: no.
- Provider call: no.
- Browser/dev-server/e2e: no.
- Package or lockfile change: no.
- Schema/migration/seed change: no.
- Staging/prod/cloud/deploy: no.
- Release readiness, final Pass, Cost Calibration: not claimed.
- Raw material content, full question/paper/resource/chunk content, prompt, Provider payload, raw AI output in repo evidence: no.
