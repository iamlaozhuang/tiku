# 2026-07-01 AI 出题 / AI 组卷资料支撑走查 Evidence

## 范围

- Task id: `ai-generation-data-backed-walkthrough-2026-07-01`
- Branch: `codex/ai-generation-data-backed-walkthrough`
- Evidence mode: status/count summary only; no raw fixture content.

## 边界确认

- staging/prod/cloud/deploy: not executed.
- Real Provider call: not executed in this task.
- Source/schema/migration/seed/dependency changes: not executed.
- Secret-bearing runtime material: not read or recorded.

## 资源包发现

- Candidate root: `D:\tiku-local-private\owner-facing-fixtures`.
- Discovery mode: metadata only; file contents were not recorded.
- Candidate summary:
  - Directory count: 48.
  - File count: 75.
  - Total size: 20.66 MB.
  - Max relative depth: 6.
  - Extension counts: PDF 41, DOCX 18, CSV 5, YAML 4, JSON 3, MD 3, PPTX 1.
  - Structured metadata footprint: CSV/YAML/JSON/MD exists and is small enough for a future importer contract review.
- Candidate usability: `partially_usable`.
  - The package appears suitable as a local private owner-preview source bundle.
  - This task did not read full resource, material, question, paper, or chunk content.
  - This task did not import the package because no existing project-level bulk import contract was found.

## 本地 DB 安全预检

- Existing safe reset path found: `scripts\db\Reset-OwnerPreviewEmptyBaseline.ps1`.
- Dry-run command executed: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Reset-OwnerPreviewEmptyBaseline.ps1`.
- Dry-run result: passed.
- Dry-run output shape:
  - Mode/status: `dry_run`.
  - Preserved role count: 8 role labels only.
  - Preserved baseline groups: owner preview role principals, personal authorization skeleton, organization authorization
    skeleton, organization employee bindings.
  - Clear plan table-group count: 6 groups covering volatile authorization state, learning flow, AI generation flow,
    content authoring, RAG content, and ops logs.
  - DB target: not required in dry-run.
- Existing dev seed path found: `scripts\db\Seed-DevDatabase.ps1`.
  - Prior redacted project evidence shows the seed can prepare minimal local synthetic data.
  - Static scan shows this seed reads local env internally to obtain DB configuration, so this task did not execute it.
- Existing resource import path: not found as a dedicated local CLI or task contract for the private D drive package.
- Existing API-level smoke evidence found:
  - Knowledge/RAG maintenance smoke can create `knowledge_node`, upload a Markdown `resource`, publish, and rebuild vector
    through localhost API.
  - AI generation smoke can exercise content and organization AI generation request routes with redacted results.
  - Those smokes are not a bulk private-package import mechanism and were not executed in this task.

## 数据准备 / 导入结果

- Data preparation result: `dry_run_only`.
- Resource package import: not executed.
- DB reset: not executed.
- Dev seed: not executed.
- Real Provider: not executed.
- Browser/runtime login: not executed.
- Reason import was not executed:
  - The private resource package exists, but the repository currently exposes no scoped importer that maps the package into
    `profession`/`level`/`subject`/`knowledge_node`/`question`/`paper`/`material`/`resource` coverage with dry-run,
    validation, and redacted count evidence.
  - Reusing ad hoc SQL, manual DB writes, or API calls without an importer contract would risk raw content leakage and
    non-repeatable setup.

## 覆盖矩阵

| Surface                                   | Status  | Evidence summary                                                                    |
| ----------------------------------------- | ------- | ----------------------------------------------------------------------------------- |
| Resource package exists                   | pass    | Private local package discovered by metadata only.                                  |
| Package has structured sidecars           | pass    | CSV/YAML/JSON/MD files are present.                                                 |
| Package has source documents              | pass    | PDF/DOCX/PPTX files are present.                                                    |
| Existing safe empty reset                 | pass    | Owner preview empty baseline dry-run passed without DB target.                      |
| Existing minimal dev seed                 | partial | Existing seed path found; not executed due env-reading and minimal synthetic scope. |
| Dedicated package import CLI              | fail    | No reusable importer contract found.                                                |
| Data-backed AI 出题 / AI 组卷 walkthrough | blocked | Needs importer/seed contract before reliable role matrix and Provider sample.       |

## 验证记录

| Command                                                                                                    | Result | Summary                                                          |
| ---------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Reset-OwnerPreviewEmptyBaseline.ps1` | pass   | Dry-run only; no DB connection or mutation.                      |
| Resource metadata count scan                                                                               | pass   | Count/size/extension/depth summary only; no content captured.    |
| Existing script/path inventory                                                                             | pass   | Found reset and dev seed; no dedicated D drive package importer. |
| `npm.cmd exec -- prettier --check --ignore-unknown <changed governance files>`                             | pass   | All matched files use Prettier code style.                       |
| `npm.cmd run lint`                                                                                         | pass   | ESLint exited 0.                                                 |
| `npm.cmd run typecheck`                                                                                    | pass   | `tsc --noEmit` exited 0.                                         |
| `git diff --check`                                                                                         | pass   | No whitespace errors.                                            |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-data-backed-walkthrough-2026-07-01`          | pass   | Scope, sensitive evidence, and terminology scans passed.         |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-data-backed-walkthrough-2026-07-01`            | pass   | Git readiness, evidence path, audit path, and closeout passed.   |

## 脱敏检查

- Evidence contains only path/status/count summaries.
- Not recorded: credentials, account secrets, connection strings, raw DB rows, internal numeric identifiers, PII, Provider
  payloads, prompts, raw AI input/output, full question/paper/material/resource/chunk content, screenshots, traces, raw DOM,
  localStorage, cookie, session, Authorization header, or `.env*` values.
- Release readiness, final Pass, Cost Calibration, staging/prod/cloud/deploy, and Provider readiness were not claimed.

## 后续承接

- Recommended next task: `ai-generation-resource-import-contract-2026-07-01`.
- Purpose: create or repair a local owner-preview importer contract with dry-run, local DB protection, package validation,
  structured mapping, and redacted aggregate counts before rerunning the eight-role AI 出题 / AI 组卷 matrix.
