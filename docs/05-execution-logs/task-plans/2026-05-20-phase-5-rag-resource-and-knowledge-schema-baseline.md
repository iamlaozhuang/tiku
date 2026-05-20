# Phase 5 RAG Resource And Knowledge Schema Baseline Plan

## Task

- Task id: `phase-5-rag-resource-and-knowledge-schema-baseline`
- Branch: `codex/phase-5-rag-resource-and-knowledge-schema-baseline`
- Phase: `phase-5-ai-rag`
- Evidence path: `docs/05-execution-logs/evidence/2026-05-20-phase-5-rag-resource-and-knowledge-schema-baseline.md`
- Security review path: `docs/05-execution-logs/audits-reviews/2026-05-20-phase-5-rag-resource-and-knowledge-schema-baseline-security-review.md`

## Read Standards

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/sop/skill-dispatch-matrix.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/ui-code.md`
- `docs/03-standards/glossary.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/05-execution-logs/evidence/2026-05-20-phase-5-ai-call-log-and-redaction-baseline.md`

## Scope

- Add Drizzle schema baseline for `knowledge_base`, `resource`, `knowledge_node`, and the resource-to-node association table.
- Add enum values for resource type, resource status, and knowledge node status using glossary terms.
- Add TypeScript model helpers for resource status transitions, RAG eligibility, and knowledge node snapshots.
- Add DTO contracts and API mappers that expose only public identifiers and camelCase fields.
- Keep implementation inside existing allowed boundaries: `src/db/schema/**`, `src/server/models/**`, `src/server/contracts/**`, `src/server/mappers/**`, state files, plan/evidence/security review.

## Out Of Scope

- No real model provider integration.
- No secret or environment variable changes.
- No database migration files or migration execution.
- No pgvector dependency or embedding column introduction.
- No chunking, retrieval, rerank, authorization filter, upload endpoint, conversion worker, or route handler implementation.
- No dependency or lockfile changes.

## TDD Plan

1. Extend schema tests to assert new table names, enum values, required columns, indexes, and association naming.
2. Extend model tests to assert snake_case row shape, status transition guards, RAG eligibility, max knowledge depth guard, and snapshot safety.
3. Extend mapper tests to assert API DTO camelCase fields, public identifier usage, nullable fields, and hidden numeric IDs.
4. Run the targeted tests before implementation to confirm red.
5. Implement the smallest schema/model/contract/mapper baseline that turns the tests green.

## Risk Controls

- Schema boundary: declare tables and type-safe rows only; no migration file is generated in this task.
- Data contract boundary: API DTOs must not expose auto-increment numeric IDs.
- Migration boundary: `drizzle/**` remains untouched; build/typecheck validate compile shape only.
- pgvector boundary: no vector type, extension, or embedding storage is introduced in this task.
- Resource safety: `conversion_failed`, `draft`, `uploaded`, and `disabled` must not be considered RAG eligible.
- Knowledge tree safety: helper enforces max depth 5 for future service use; disabled nodes are represented but not deleted.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-5-rag-resource-and-knowledge-schema-baseline`
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npm.cmd run build`
- Scope checks for allowed files and blocked files.
