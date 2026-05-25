# Evidence: Phase 11 Local File Upload Storage Adapter

## Status

`closed`

## Scope Boundary

This task implements local/dev real file upload for `paper_asset` into ignored runtime storage.

Forbidden actions not performed:

- no staging/prod connection;
- no deployment;
- no cloud resource, DNS, Tencent Cloud COS, or public object storage URL change;
- no dependency, package, lockfile, schema, migration, script, or environment file change;
- no `.env.local` read or output;
- no OCR or real provider call;
- no secret value, token, Authorization header, database URL, raw provider payload, raw prompt, raw answer, raw model response, full paper, full textbook, OCR full text, or customer/customer-like private content recorded.

## TDD Record

| Step            | Command                                                                                                                                                         | Result | Notes                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| Claim readiness | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-local-file-upload-storage-adapter` | pass   | Task was pending and dependency was closed.                                                            |
| RED storage     | `npm.cmd run test:unit -- tests/unit/phase-11-local-file-upload-storage-adapter.test.ts tests/unit/admin-paper-ui.test.ts`                                      | fail   | Expected: missing `local-paper-asset-storage` module and old metadata-only UI text.                    |
| GREEN focused   | `npm.cmd run test:unit -- tests/unit/phase-11-local-file-upload-storage-adapter.test.ts tests/unit/admin-paper-ui.test.ts`                                      | pass   | 2 files passed, 7 tests passed.                                                                        |
| GREEN full      | `npm.cmd run test:unit`                                                                                                                                         | pass   | 123 files passed, 454 tests passed.                                                                    |
| Build retry     | `npm.cmd run build`                                                                                                                                             | pass   | First run failed on ignored `.next/dev/types/routes.d.ts` cache corruption; removed `.next` and reran. |

## Validation Commands

| Command                                                                                                                             | Result | Notes                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- tests/unit/phase-11-local-file-upload-storage-adapter.test.ts tests/unit/admin-paper-ui.test.ts`          | pass   | 2 files passed, 7 tests passed.                                                                   |
| `npm.cmd run test:unit`                                                                                                             | pass   | 123 files passed, 454 tests passed.                                                               |
| `npm.cmd run test:e2e`                                                                                                              | pass   | 15 tests passed.                                                                                  |
| `npm.cmd run build`                                                                                                                 | pass   | First run failed on ignored `.next` cache corruption; after clearing ignored cache, build passed. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                      | pass   | Required project files and skill capability checks passed.                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`                             | pass   | lint, typecheck, unit, and format:check passed after formatting this task evidence and test file. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                         | pass   | Naming convention scan completed.                                                                 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master` | pass   | Inventory completed before final staging; rerun expected after closeout metadata update.          |
| `git diff --check`                                                                                                                  | pass   | No whitespace errors.                                                                             |

## Implementation Summary

- Added a local/dev `paper_asset` storage adapter that writes bytes under ignored `.runtime/uploads/dev/paper-asset/{profession}/{yyyymm}/{sha256}.{ext}`.
- Kept absolute local file paths out of API DTOs and evidence; only metadata flows through the existing `paper_asset` service.
- Added multipart handling for `POST /api/v1/paper-assets`, while preserving JSON metadata fallback for existing tests and routes.
- Updated the admin paper asset form to choose a real local file and submit multipart `FormData` without creating COS objects, public URLs, OCR output, or cloud resources.

## Git Closeout

- Branch: `codex/phase-11-local-file-upload-storage-adapter`
- Commit: recorded in final delivery after commit creation; not embedded here to avoid self-changing amend noise.

## Repository Hygiene Closeout Checklist

| Check                                                                              | Result |
| ---------------------------------------------------------------------------------- | ------ |
| Only allowed task files changed                                                    | pass   |
| No package or lockfile change                                                      | pass   |
| No schema, migration, or script change                                             | pass   |
| No `.env.local` or `.env.example` change                                           | pass   |
| No staging/prod, deployment, cloud, DNS, COS, public URL, or object storage change | pass   |
| No secret/token/raw provider/full content recorded                                 | pass   |

## Taste Compliance Self-Check

- Frontend visual taste: pass; changed an existing compact form, no decorative or card nesting changes.
- Loading/empty/error states: pass; existing submit/error flow preserved, with a no-file validation message.
- Interaction feedback: pass; successful metadata registration message remains visible.
- Tailwind class order: pass by `format:check`/lint.
- Backend/API contract: pass; response DTO still excludes `objectKey` and absolute local paths.
- N+1/SQL/schema: pass; no query shape, schema, migration, or repository contract change beyond existing create input.
- Naming discipline: pass; `paper_asset`, `paperAttachmentUsage`, `objectKey`, and `profession` terms follow glossary.
- Clean logic: pass; storage adapter is isolated behind a small service and route multipart reader.
- Secret hygiene: pass; no `.env.local`, token, provider payload, prompt, answer, or model response recorded.
- Environment isolation: pass; runtime bytes write only to ignored `.runtime/uploads`; no staging/prod/cloud/COS/public URL action.
