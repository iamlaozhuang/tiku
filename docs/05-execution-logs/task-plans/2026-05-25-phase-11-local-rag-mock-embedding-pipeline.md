# Task Plan: Phase 11 Local RAG Mock Embedding Pipeline

## Task

Implement a deterministic local/mock RAG embedding pipeline that consumes parsed local text documents, produces chunk metadata and mock embeddings, and verifies citation retrieval without real providers, cloud vector stores, dependency changes, or raw-content evidence.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/05-execution-logs/evidence/2026-05-25-phase-11-local-text-document-parser-boundary.md`

## Scope

Allowed changes:

- `src/rag/**`
- `src/server/services/**`
- `src/server/contracts/**` only if needed
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
- No cloud vector store, Tencent Cloud COS, public object storage URL, or external resource change.
- No real provider call.

## TDD Plan

1. Add a failing unit test proving parsed local markdown produces deterministic chunks, mock embeddings, and redaction-safe evidence.
2. Add a failing unit test proving citation retrieval can use the local pipeline chunks without leaking unauthorized chunks into evidence.
3. Add a failing unit test proving skipped parser results do not create embeddings or citations.
4. Implement a small deterministic embedding service using hash-derived vectors and existing chunk/retrieval services.
5. Keep raw chunk text internal to retrieval; evidence records only counts, hashes, publicIds, dimensions, and statuses.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-local-rag-mock-embedding-pipeline`
- `npm.cmd run test:unit -- tests/unit/phase-11-local-rag-mock-embedding-pipeline.test.ts`
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Risk Defense

- Deterministic embeddings are local mock vectors only and must not be represented as provider output.
- Evidence must not include raw chunk text, prompt text, model output, or embedding vector values.
- Retrieval authorization filters must remain effective before citations are returned.
- Keep cloud vector store and real provider integration for separately approved tasks.
