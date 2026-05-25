# Task Plan: Phase 11 Local Text Document Parser Boundary

## Task

Implement a local/dev parser boundary for controlled `.txt` and `.md` paper/material files that can consume the local file upload adapter output without introducing dependencies, OCR, PDF/Word parsing, cloud storage, or full-content evidence.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/05-execution-logs/evidence/2026-05-25-phase-11-local-file-upload-storage-adapter.md`

## Scope

Allowed changes:

- `src/rag/**`
- `src/server/services/**`
- `tests/unit/**`
- this task plan and evidence
- agent state and task queue status

Forbidden changes:

- No dependency, package, or lockfile changes.
- No schema, migration, or script changes.
- No `.env.local`, `.env.example`, secret, token, provider payload, raw prompt, raw answer, raw model response, full paper, textbook, OCR, or customer/customer-like private content access or output.
- No staging/prod connection.
- No deployment.
- No cloud, DNS, Tencent Cloud COS, public object storage URL, or external resource change.
- No PDF, Word, OCR, or real provider call.

## TDD Plan

1. Add a failing unit test for parsing an uploaded `.txt` paper asset from ignored runtime storage into a redacted, chunk-ready local parse result.
2. Add a failing unit test proving `.md` front matter/heading content is normalized without retaining raw full content in metadata.
3. Add a failing unit test proving unsupported extensions such as `.pdf` are rejected with a boundary error and no fallback OCR.
4. Implement a small parser service using Node filesystem APIs and deterministic text normalization only.
5. Keep parser output explicit about `local_only`, content type, character/line counts, chunk candidates, and redacted preview.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-local-text-document-parser-boundary`
- `npm.cmd run test:unit -- tests/unit/phase-11-local-text-document-parser-boundary.test.ts`
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Risk Defense

- Read only from caller-supplied ignored local runtime storage paths or object keys resolved under that root.
- Do not put raw full parsed content into evidence, logs, API responses, or metadata.
- Reject unsupported binary/OCR formats explicitly instead of pretending local parser coverage.
- Keep cloud adapter, public URL, and OCR concerns for later approved tasks.
