# Marketing monopoly logistics Provider rerun evidence

## Task

- Task id: `marketing-monopoly-logistics-provider-rerun-2026-07-02`
- Branch: `codex/marketing-monopoly-logistics-provider-rerun`

## Redaction Boundary

- Evidence records task ids, role labels, profession labels, route labels, workflow labels, status categories, error categories, counts, duration buckets, command names, and validation summaries only.
- No credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*` values, DB raw rows, internal numeric ids, PII, Provider payloads, prompts, raw AI input/output, raw DOM, screenshots, traces, or full generated/resource/question/paper/material/chunk content.

## Execution Log

- Task opened after `owner-preview-resource-pack-addendum-2026-07-02` closed.
- Source/runtime/test code change: false.
- Localhost dev server:
  - result: `http_200`
  - serverLogEnvValuesRecorded: false
- Browser credential handling:
  - content-admin local acceptance session used.
  - credential values recorded in evidence: false.
  - cookie/session/token values recorded in evidence: false.
- Resource package dry-run:
  - status: `dry_run`
  - packageStatus: `usable`
  - totalFileCount: 101
  - structuredFileCount: 38
  - sourceDocumentCount: 88
  - questionRowCount: 3
  - resourceInventoryRowCount: 93
  - professionCount: 3
  - levelCount: 5
  - subjectCount: 2
  - knowledgeNodeCount: 3
  - databaseTarget: `not_required`
- Runtime RAG import dry-run:
  - status: `dry_run`
  - inventoryRowCount: 93
  - importableMaterialCount: 43
  - unsupportedMaterialCount: 1
  - skippedMissingFileCount: 0
  - professionCoverage: `marketing=37`, `monopoly=45`, `logistics=11`
- Runtime RAG import execute:
  - status: `executed`
  - importedResourceCount: 43
  - importedChunkCount: 519
  - writtenMarkdownFileCount: 43
  - mergedCatalogResourceCount: 43
  - runtimeCoverage: `marketing=28`, `monopoly=4`, `logistics=11`
- Resource package DB import execute:
  - status: `executed`
  - databaseTarget: `local_loopback`
  - importedKnowledgeBaseCount: 3
  - importedKnowledgeNodeCount: 3
  - importedMaterialCount: 3
  - importedQuestionCount: 3
  - importedResourceCount: 93
  - importedPaperCount: 3
  - importedPaperQuestionCount: 3
- Provider submit attempts:
  - attemptedCount: 6
  - retryCount: 0
  - contentAdminRouteOnly: true
  - evidenceIncludesRawGeneratedContent: false

## Provider Samples

| Role label      | Route/function | Profession selection | Attempted | Outcome category                  | Duration bucket | Safe visible structure        |
| --------------- | -------------- | -------------------- | --------- | --------------------------------- | --------------- | ----------------------------- |
| `content_admin` | content AI出题 | `marketing`          | true      | provider_executed_visible_result  | `30_60s`        | question_set `10/10`          |
| `content_admin` | content AI组卷 | `marketing`          | true      | provider_executed_visible_result  | `30_60s`        | paper_draft section_count `1` |
| `content_admin` | content AI出题 | `monopoly`           | true      | failed_or_insufficient_safe_error | `gt_60s`        | none                          |
| `content_admin` | content AI组卷 | `monopoly`           | true      | provider_executed_visible_result  | `30_60s`        | paper_draft section_count `2` |
| `content_admin` | content AI出题 | `logistics`          | true      | provider_executed_visible_result  | `gt_60s`        | question_set `10/10`          |
| `content_admin` | content AI组卷 | `logistics`          | true      | provider_executed_visible_result  | `30_60s`        | paper_draft section_count `2` |

## UI Closure Checks

- `content AI出题` history panel:
  - filterSeparatedByGenerationKind: true
  - defaultSort: requested time descending
  - pageSummary: first page visible, paginated
  - visibleRowCount: 10
  - safeEvidenceLabelsPresent: true
- `content AI组卷` history panel:
  - filterSeparatedByGenerationKind: true
  - defaultSort: requested time descending
  - pageSummary: first page visible, paginated
  - visibleRowCount: 10
  - safeEvidenceLabelsPresent: true

## Residual Findings

- `MML-RERUN-01`: 专卖 AI出题 remains weak after the updated runtime RAG catalog. The UI returns a safe failure category instead of a visible structured question set. Open a separate OCR task for the two scanned monopoly PDFs, then rerun this sample.
- `MML-RERUN-02`: AI组卷 can now produce visible paper drafts for all three professions, but the safe structured summary still cannot identify total question count in the sampled paper drafts. This should be repaired in a later structured-preview/count-contract task if product acceptance requires exact paper quantity visibility.
- `MML-RERUN-03`: Runtime RAG import output still includes a stale logistics diagnostic label even while aggregate runtime coverage shows logistics resources are ready. Treat this as diagnostic wording inconsistency, not a Provider blocker.

## Validation

- Focused unit tests: pass, 3 files, 16 tests.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- Scoped Prettier write: pass.
- Scoped Prettier check: pass.
- `git diff --check`: pass.
- Module Run v2 pre-commit hardening: pass.
- Module Run v2 pre-push readiness: pass after synchronizing local project-state master/origin SHA anchors.
- Provider retries: 0.
- `.env*` modified or value recorded: false.
- Source/test/runtime code modified: false.
- Schema/migration/seed executed: false.
- Dependency/package/lockfile changed: false.
- Staging/prod/cloud/deploy executed: false.
- Release readiness, final Pass, Cost Calibration: not executed or claimed.
