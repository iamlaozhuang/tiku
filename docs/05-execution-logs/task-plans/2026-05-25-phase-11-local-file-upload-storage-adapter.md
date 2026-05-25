# Task Plan: Phase 11 Local File Upload Storage Adapter

## Task

Implement local/dev real file upload for `paper_asset` using ignored runtime filesystem storage, while keeping the API DTO free of local paths and keeping cloud/object storage blocked.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/05-execution-logs/evidence/2026-05-25-phase-11-paper-asset-local-boundary-closeout.md`
- `docs/05-execution-logs/evidence/2026-05-25-phase-11-local-runtime-capability-queue-seeding.md`

## Scope

Allowed changes:

- `.gitignore`
- `src/app/api/v1/paper-assets/**`
- `src/features/admin/paper-management/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/models/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- `e2e/**` only if needed
- this task plan and evidence
- agent state and task queue status

Forbidden changes:

- No dependency, package, or lockfile changes.
- No schema, migration, or script changes.
- No `.env.local`, `.env.example`, secret, token, provider payload, raw prompt, raw answer, raw model response, full paper, textbook, OCR, or customer/customer-like private content access or output.
- No staging/prod connection.
- No deployment.
- No cloud, DNS, Tencent Cloud COS, public object storage URL, or external resource change.
- No OCR or real provider call.

## TDD Plan

1. Add a failing storage unit test proving a real `File` writes bytes under `.runtime/uploads/dev/paper-asset/...`, computes hash, and returns metadata without an absolute path.
2. Add a failing admin UI test proving the paper asset form uses a real file input and sends multipart `FormData`.
3. Implement the local filesystem adapter and multipart request reader.
4. Update the admin form to choose a file and submit multipart data.
5. Verify JSON metadata fallback remains compatible for existing tests.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-local-file-upload-storage-adapter`
- `npm.cmd run test:unit -- tests/unit/phase-11-local-file-upload-storage-adapter.test.ts tests/unit/admin-paper-ui.test.ts`
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Risk Defense

- Store bytes only under ignored `.runtime/uploads/`.
- Keep `objectKey` relative and redaction-safe; never expose absolute local paths through DTOs.
- Keep COS/public URL/storage credential work blocked for future cloud adapter tasks.
- Do not record uploaded file contents in evidence.
