# Marketing and monopoly Provider rerun evidence

## Task

- Task id: `marketing-monopoly-provider-rerun-2026-07-02`
- Branch: `codex/marketing-monopoly-provider-rerun`

## Redaction Boundary

- Evidence records task ids, role labels, profession labels, route labels, workflow labels, status categories, error categories, counts, duration buckets, command names, and validation summaries only.
- No credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*` values, DB raw rows, internal numeric ids, PII, Provider payloads, prompts, raw AI input/output, raw DOM, screenshots, traces, or full generated/resource/question/paper/material/chunk content.

## Execution Log

- Task opened after `learner-employee-ai-history-closure-2026-07-02` closed.
- Logistics remains excluded because material is missing.
- Source/runtime/test code change: false.
- Resource package dry-run:
  - status: `dry_run`
  - packageStatus: `usable`
  - totalFileCount: 75
  - structuredFileCount: 15
  - sourceDocumentCount: 63
  - questionRowCount: 3
  - resourceInventoryRowCount: 62
  - professionCount: 2
  - levelCount: 3
  - subjectCount: 2
  - knowledgeNodeCount: 3
  - databaseTarget: `not_required`
- Runtime RAG import dry-run:
  - status: `dry_run`
  - inventoryRowCount: 62
  - importableMaterialCount: 14
  - unsupportedMaterialCount: 1
  - skippedMissingFileCount: 0
  - professionCoverage: `marketing=22`, `monopoly=40`, `logistics=0`
  - logisticsCoverage: `missing_package_resources`
- Resource package import execute:
  - status: `executed`
  - databaseTarget: `local_loopback`
  - importedKnowledgeBaseCount: 2
  - importedKnowledgeNodeCount: 3
  - importedMaterialCount: 3
  - importedQuestionCount: 3
  - importedResourceCount: 62
  - importedPaperCount: 3
  - importedPaperQuestionCount: 3
- Runtime RAG import execute:
  - status: `executed`
  - importedResourceCount: 14
  - importedChunkCount: 375
  - writtenMarkdownFileCount: 14
  - mergedCatalogResourceCount: 14
  - runtimeCoverage: `marketing=13`, `monopoly=1`, `logistics=0`
  - logisticsCoverage: `missing_package_resources`
- Localhost dev server:
  - action: targeted local dev server restart
  - result: `http_200`
  - serverLogEnvValuesRecorded: false
- Browser credential handling:
  - local role labels detected: 8
  - credential values recorded in evidence: false
  - cookie/session/token values recorded in evidence: false
- Provider submit attempts:
  - attemptedCount: 8
  - retryCount: 0
  - evidenceIncludesRawGeneratedContent: false

## Role Matrix

| Role label                  | Expected AI出题          | Expected AI组卷          | Provider submit budget | Route outcome                       | Provider outcome                     |
| --------------------------- | ------------------------ | ------------------------ | ---------------------- | ----------------------------------- | ------------------------------------ |
| `personal_standard_student` | denied_or_not_applicable | denied_or_not_applicable | 0                      | login_passed; buttons disabled      | not_applicable                       |
| `personal_advanced_student` | available                | available                | 2                      | login_passed; buttons enabled       | accepted_no_visible_result           |
| `org_standard_employee`     | denied_or_not_applicable | denied_or_not_applicable | 0                      | login_passed; buttons disabled      | not_applicable                       |
| `org_advanced_employee`     | available                | available                | 2                      | login_passed; buttons enabled       | accepted_no_visible_result           |
| `org_standard_admin`        | denied_or_not_applicable | denied_or_not_applicable | 0                      | login_passed; advanced route denied | not_applicable                       |
| `org_advanced_admin`        | available                | available                | 2                      | login_passed; routes available      | question_visible; paper_insufficient |
| `content_admin`             | available                | available                | 2                      | login_passed; routes available      | question_visible; paper_insufficient |
| `ops_admin`                 | not_applicable           | not_applicable           | 0                      | login_passed; ops route available   | not_applicable                       |

## Route Surface Checks

- Standard personal and standard employee roles: AI出题 / AI组卷 controls rendered but disabled.
- Personal advanced and organization advanced employee roles: AI出题 / AI组卷 controls rendered and enabled.
- Standard organization admin: organization portal and AI routes did not expose usable generation actions.
- Advanced organization admin:
  - `/organization/ai-question-generation`: available.
  - `/organization/ai-paper-generation`: available.
  - levels `1-5`: present.
  - marketing and monopoly: present.
  - logistics option still visible despite this task excluding logistics.
- Content admin:
  - `/content/ai-question-generation`: available.
  - `/content/ai-paper-generation`: available.
  - levels `1-5`: present.
  - marketing and monopoly: present.
  - logistics option still visible despite this task excluding logistics.
- Ops admin: `/ops/users` reachable; no AI generation submit surface expected.

## Provider Samples

| Role label                  | Route/function            | Profession selection | Attempted | Outcome category                        | Duration bucket | Safe visible structure |
| --------------------------- | ------------------------- | -------------------- | --------- | --------------------------------------- | --------------- | ---------------------- |
| `personal_advanced_student` | `/ai-generation` / AI出题 | authorization scope  | true      | accepted_or_succeeded_no_visible_result | `lt_10s`        | none                   |
| `personal_advanced_student` | `/ai-generation` / AI组卷 | authorization scope  | true      | accepted_or_succeeded_no_visible_result | `lt_10s`        | none                   |
| `org_advanced_employee`     | `/ai-generation` / AI出题 | authorization scope  | true      | accepted_or_succeeded_no_visible_result | `lt_10s`        | none                   |
| `org_advanced_employee`     | `/ai-generation` / AI组卷 | authorization scope  | true      | accepted_or_succeeded_no_visible_result | `lt_10s`        | none                   |
| `org_advanced_admin`        | organization AI出题       | marketing            | true      | provider_executed_visible_result        | `30_60s`        | question_set `10/10`   |
| `org_advanced_admin`        | organization AI组卷       | monopoly             | true      | failed_or_insufficient_no_provider_call | `lt_10s`        | none                   |
| `content_admin`             | content AI出题            | marketing            | true      | provider_executed_visible_result        | `30_60s`        | question_set `10/10`   |
| `content_admin`             | content AI组卷            | monopoly             | true      | failed_or_insufficient_no_provider_call | `lt_10s`        | none                   |

## Closure Checks

- Backend/admin AI出题 for marketing produced visible transient draft structure with 10/10 question-set count and review actions available.
- Backend/admin AI组卷 for monopoly did not produce visible paper draft; safe UI status indicates insufficient or failed current flow without a Provider execution marker.
- Learner and employee advanced submissions accepted quickly but did not expose visible generated content in ordinary UI after submit; closure remains incomplete for learner/employee surfaces.
- Historical panels remained visible during checked flows; raw rows and identifiers were not captured.

## Residual Findings

- `MM-RERUN-01`: Learner and employee advanced AI出题 / AI组卷 submissions still do not close into visible generated content in ordinary UI.
- `MM-RERUN-02`: Monopoly runtime RAG coverage is thin (`runtimeCoverage=1`) and AI组卷 is blocked or insufficient for both organization and content admin samples.
- `MM-RERUN-03`: Logistics option remains visible in organization/content admin generation forms even though logistics material is absent and excluded from this task.
- `MM-RERUN-04`: Existing failed/insufficient history markers can coexist with a successful visible current draft on history-heavy pages, so UI should make current result status harder to confuse with historical failures.

## Validation

- Focused unit tests: pass, 3 files, 16 tests.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- Scoped Prettier write: pass.
- Scoped Prettier check: pass.
- `git diff --check`: pass.
- Module Run v2 pre-commit hardening: pass.
- Module Run v2 pre-push readiness: pass.
- Provider retries: 0.
- `.env*` modified or value recorded: false.
- Source/test/runtime code modified: false.
- Schema/migration/seed executed: false.
- Dependency/package/lockfile changed: false.
- Staging/prod/cloud/deploy executed: false.
- Release readiness, final Pass, Cost Calibration: not executed or claimed.
