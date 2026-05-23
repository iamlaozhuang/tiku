# Task Plan: phase-9-rag-resource-knowledge-runtime

## Metadata

- Task id: `phase-9-rag-resource-knowledge-runtime`
- Branch: `codex/phase-9-rag-resource-knowledge-runtime`
- Date: `2026-05-23`
- Base branch: `master`
- Required security review: `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-rag-resource-knowledge-runtime-security-review.md`

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-9-mvp-acceptance-contract.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-ai-knowledge-model-config-runtime.md`

## Queue Scope

Allowed files:

- this task plan, task evidence, and security review
- `src/app/api/v1/resources/**`
- `src/app/api/v1/knowledge-nodes/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/models/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `drizzle/**`

Dependency policy:

- No dependency change.
- The dependency introduction gate is not used because this task will rely on existing local deterministic code and current repository utilities.
- No human approval exists for dependency, migration, external provider, or environment changes.

## Implementation Strategy

1. Add RED unit coverage for resource lifecycle, deterministic chunking/indexing, RAG retrieval, citation mapping, `evidence_status`, and knowledge node runtime behavior.
2. Reuse existing service/repository/route layering from ADR-002. Route handlers stay thin and call service functions.
3. Keep all RAG behavior local and deterministic:
   - Markdown chunking by headings and paragraphs.
   - Local keyword/token scoring as the vector-service substitute.
   - Deterministic rerank/fusion fallback metadata instead of external rerank.
   - Citation objects generated only from returned chunks.
4. Enforce authorization and scope filtering through service inputs and existing auth/session patterns:
   - RAG filters by `profession`, `level`, and resource status.
   - Student authorization scope must be supplied by the caller or existing auth boundary.
   - No URL or DTO exposes auto-increment ids.
5. Implement resource lifecycle transitions without schema or migration changes:
   - Use current in-memory/runtime repository pattern where database support is not yet in scope.
   - Treat full file conversion, object storage, signed download URLs, and real vector index writes as deferred if blocked by queue scope.
6. Implement knowledge node runtime within existing contracts:
   - Public ids only.
   - Create/update/move/disable behavior with audit-ready metadata where repository support exists.
   - No delete path.

## Scope Conflict Handling

- Requirements mention DOCX/PPTX/PDF conversion, private object storage, async indexing, and pgvector-backed retrieval.
- The queue blocks dependency and schema/migration changes and forbids real provider/resource connections.
- This task will implement runtime contracts, deterministic local chunking/retrieval, state validation, route/service behavior, and tests. Full conversion pipelines, persistent vector migrations, object storage signed URLs, background queues, and real embedding providers remain deferred.

## TDD Plan

- RED: add `tests/unit/phase-9-rag-resource-knowledge-runtime.test.ts` for missing runtime behavior.
- GREEN: implement minimal service/repository/contracts/routes needed to pass the focused test.
- REFACTOR: align naming, DTO shape, and helper boundaries after tests pass.
- Full validation follows task-queue commands.

## Security Plan

- Validate attacker-controlled input at route/service boundary.
- Fail closed on protected runtime paths.
- Return standard API response envelopes.
- Do not expose numeric ids, secrets, session tokens, file paths, raw provider payloads, or long-lived signed URLs.
- Do not call real AI, embedding, rerank, object storage, or production services.
- Write the required security review after implementation and before completion.

## Required Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-rag-resource-knowledge-runtime
Select-String -Path 'docs\05-execution-logs\task-plans\2026-05-23-phase-9-rag-resource-knowledge-runtime.md' -Pattern 'dependency introduction gate|human approval|no dependency change'
npm.cmd run test:unit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```
