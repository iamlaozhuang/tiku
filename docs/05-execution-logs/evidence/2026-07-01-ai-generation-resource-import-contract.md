# 2026-07-01 AI 出题 / AI 组卷本地资源导入合同 Evidence

## 范围

- Task id: `ai-generation-resource-import-contract-2026-07-01`
- Branch: `codex/ai-generation-resource-import-contract`
- Evidence mode: status/count summary only; no raw fixture content.

## 边界确认

- staging/prod/cloud/deploy: not executed.
- Real Provider call: not executed in this task.
- Browser role walkthrough: not executed in this task.
- Source package contents: only structured metadata and test fixtures are used; raw source material/question/paper/chunk content is not recorded.
- Secret-bearing runtime material: not printed, copied, or recorded.
- Local env handling: execute mode used runtime-only local env loading to resolve the DB target; no env value or connection string was printed, copied, or recorded.

## 当前授权

- Approval source: `current_user_unified_bounded_high_risk_authorization_2026_07_01`.
- Applied in this task only to:
  - local private resource package metadata inspection;
  - local importer source/test/script changes;
  - optional local dev DB import after dry-run and execution gate pass.
- Not applied in this task to Provider calls, browser credential entry, dependency changes, schema/migration/seed changes, staging/prod/cloud/deploy, release readiness, final Pass, or Cost Calibration.

## 资源包结构预检

- Candidate root: `D:\tiku-local-private\owner-facing-fixtures`.
- Metadata-only shape observed:
  - `source-inventory.json`: array count 62; keys include coverage and file metadata fields.
  - `copied-source-files.json`: array count 60; keys include coverage and file metadata fields.
  - `resource-pack-manifest.json`: object with manifest counts and source coverage summary.
  - Structured sidecars include CSV/YAML/JSON.
- Raw filenames, full questions, materials, papers, chunks, and extracted document content were not recorded here.

## TDD / 验证记录

| Command                                                                                                                                                   | Result        | Summary                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- tests/unit/owner-preview-resource-import.test.ts`                                                                               | fail_expected | Initial TDD red state before implementation: import target did not exist.                                                                                  |
| `npm.cmd run test:unit -- tests/unit/owner-preview-resource-import.test.ts`                                                                               | pass          | Focused tests cover package validation counts, dry-run offline behavior, execute gates, adapter execution, sanitized adapter failures, and evidence guard. |
| `npm.cmd run typecheck`                                                                                                                                   | pass          | TypeScript compile check passed after implementation and import-key fix.                                                                                   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Import-OwnerPreviewResourcePackage.ps1`                                             | pass          | Dry-run only; package status usable; no DB mutation.                                                                                                       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Import-OwnerPreviewResourcePackage.ps1 -Execute -ConfirmOwnerPreviewResourceImport` | pass          | Local import executed after local DB target validation and explicit confirmation.                                                                          |
| `npm.cmd exec -- prettier --check --ignore-unknown <changed files>`                                                                                       | pass          | All matched files use Prettier code style.                                                                                                                 |
| `npm.cmd run lint`                                                                                                                                        | pass          | ESLint exited 0.                                                                                                                                           |
| `git diff --check`                                                                                                                                        | pass          | No whitespace errors.                                                                                                                                      |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-resource-import-contract-2026-07-01`                                                        | pass          | Scope, sensitive evidence, and terminology scans passed.                                                                                                   |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-resource-import-contract-2026-07-01 -SkipRemoteAheadCheck`                                    | pass          | Git readiness, evidence path, audit path, and closeout passed.                                                                                             |

## Dry-run 摘要

- Package status: `usable`.
- Total file count: 75.
- Structured file count: 15.
- Source document count: 63.
- Question row count: 3.
- Resource inventory row count: 62.
- Profession count: 2.
- Level count: 3.
- Subject count: 2.
- Knowledge node count: 3.
- Database target: not required in dry-run.

## 本地导入摘要

- Mode/status: `execute` / `executed`.
- Database target: local loopback database, database name only recorded.
- Imported knowledge base count: 2.
- Imported knowledge node count: 3.
- Imported material count: 3.
- Imported question count: 3.
- Imported resource count: 62.
- Imported paper count: 3.
- Imported paper question count: 3.
- Re-run behavior: importer is repeatable for owner preview public identifiers and refreshes sample paper sections/questions.

## 过程修正

- Initial direct CLI dry-run exposed a module-resolution issue; fixed without package or tsconfig changes.
- Initial execute attempt exposed that local content rows require a content admin ownership field; importer now resolves that internally and does not output internal ids.
- Initial execute attempt also showed raw DB errors must never escape the CLI. The run path now catches adapter failures and renders only safe failure categories. Raw DB details are not recorded in this evidence.

## 脱敏检查

- Evidence contains only command categories, statuses, and aggregate counts.
- Not recorded: credentials, account secrets, connection strings, raw DB rows, internal numeric identifiers, PII, Provider payloads, prompts, raw AI input/output, full question/paper/material/resource/chunk content, screenshots, traces, raw DOM, localStorage, cookie, session, Authorization header, or `.env*` values.
- Release readiness, final Pass, Cost Calibration, staging/prod/cloud/deploy, and Provider readiness were not claimed.
