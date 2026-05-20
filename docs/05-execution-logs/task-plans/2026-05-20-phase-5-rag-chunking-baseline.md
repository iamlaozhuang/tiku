# Phase 5 RAG Chunking Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for RED-GREEN implementation and superpowers:verification-before-completion before any completion claim. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a pure, deterministic Markdown chunking baseline for RAG resources without model provider calls, embeddings, pgvector, migrations, or dependency changes.

**Architecture:** Keep chunking in `src/rag/` as project-owned pure functions. Expose only safe chunk contracts from `src/server/contracts/` and keep resource lifecycle decisions in `src/server/models/ai-rag.ts` / `src/server/services/` so future indexing can compose this baseline without leaking raw chunk text into logs or evidence.

**Tech Stack:** TypeScript, Vitest, existing Next.js monolith, existing Drizzle-backed domain types. No new packages.

---

## Normative Sources Read

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
- `docs/05-execution-logs/evidence/2026-05-20-phase-5-rag-resource-and-knowledge-schema-baseline.md`

## Queue Scope

- Task id: `phase-5-rag-chunking-baseline`
- Branch/worktree: `codex/phase-5-rag-chunking-baseline` at `F:\tiku\.worktrees\phase-5-rag-chunking-baseline`
- Allowed files:
  - `docs/05-execution-logs/task-plans/2026-05-20-phase-5-rag-chunking-baseline.md`
  - `docs/05-execution-logs/evidence/2026-05-20-phase-5-rag-chunking-baseline.md`
  - `src/rag/**`
  - `src/server/contracts/**`
  - `src/server/models/**`
  - `src/server/services/**`
  - `tests/unit/**`
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
- Blocked files:
  - `package.json`
  - `pnpm-lock.yaml`
  - `package-lock.json`
  - `drizzle/**`
  - `.env.example`

## Chunking Boundary

- Input accepts resource metadata and Markdown content already produced by the resource conversion pipeline.
- Only resources with `resource_status = published` or `resource_status = rag_ready` are chunkable by default; retrieval participation remains out of scope and should still require `rag_ready` in the later retrieval task.
- `disabled`, failed, draft, uploaded, converting, and indexing resources return a skipped result with no chunks.
- Output chunks include stable `chunkIndex`, deterministic `chunkPublicId`, `resourcePublicId`, `resourceTitle`, `profession`, `level`, `headingPath`, text hash, and character length.
- Chunk text may be returned to the caller for indexing, but evidence/log summaries must use counts and hashes only.
- Chunking is a pure function: no database writes, no embeddings, no provider calls, no migrations.

## TDD Plan

### Task 1: RED Test For Chunk Contracts And Pure Behavior

**Files:**

- Create: `src/rag/chunking.test.ts`
- Create later: `src/rag/chunking.ts`

- [ ] Write failing tests that import `createRagChunks`, `defaultRagChunkingConfig`, `shouldChunkResource`, and `summarizeRagChunksForEvidence` from `src/rag/chunking.ts`.
- [ ] Cover heading path retention, stable ordering, stable chunk index, chunk size and overlap, paragraph merge/split behavior, and text hash summaries.
- [ ] Cover disabled and not `rag_ready` / not `published` boundary by asserting skipped results with no chunks.
- [ ] Run `npm.cmd run test:unit -- src/rag/chunking.test.ts`.
- [ ] Expected RED: module or exported functions are missing.

### Task 2: GREEN Implementation For Chunking Module

**Files:**

- Create: `src/rag/chunking.ts`
- Modify if needed: `src/server/contracts/ai-rag-contract.ts`

- [ ] Implement config and input/output types with project glossary names.
- [ ] Parse Markdown headings (`#` through `######`) and retain ordered heading path metadata.
- [ ] Merge short paragraphs up to `targetChunkSize`.
- [ ] Split long blocks at word boundaries with `chunkOverlapSize` context.
- [ ] Generate deterministic chunk IDs from `resourcePublicId`, `contentHash`, and `chunkIndex`.
- [ ] Return evidence summaries containing counts, indexes, hashes, and metadata only; never raw chunk text.
- [ ] Run the RED test again and confirm GREEN.

### Task 3: Service Boundary For Resource Status

**Files:**

- Create: `src/server/services/rag-chunking-service.ts`
- Create: `src/server/services/rag-chunking-service.test.ts`
- Modify if needed: `src/server/models/ai-rag.ts`

- [ ] Write failing service tests proving only `published` or `rag_ready` resources with Markdown content are chunked.
- [ ] Implement a thin service wrapper that calls the pure chunker and maps skipped reasons.
- [ ] Keep service free of repositories, database writes, embeddings, or external calls.
- [ ] Run `npm.cmd run test:unit -- src/rag/chunking.test.ts src/server/services/rag-chunking-service.test.ts`.

### Task 4: Evidence, State, And Queue Closeout

**Files:**

- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`
- Create/modify: `docs/05-execution-logs/evidence/2026-05-20-phase-5-rag-chunking-baseline.md`

- [ ] Record RED and GREEN commands without raw chunk text.
- [ ] Update task status through validation and final done state.
- [ ] Set `handoff.nextRecommendedAction` to the next pending queue task after `phase-5-rag-chunking-baseline`.
- [ ] Run required validation commands and append summaries.
- [ ] Confirm blocked files have no diff.

## Risk Controls

- Security review metadata is not triggered for this queue task, but data-contract risks are handled by keeping evidence redacted and avoiding API routes, auth filtering, database writes, provider calls, embeddings, pgvector, migrations, dependency changes, and `.env.example` edits.
- Chunk text must not be copied into evidence; evidence may include hashes, counts, and test names only.
- Any future retrieval authorization filtering remains out of scope and belongs to `phase-5-rag-evidence-status-retrieval-baseline`.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-5-rag-chunking-baseline`
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npm.cmd run build`
- `git diff --name-only`
- `git diff --name-only -- package.json pnpm-lock.yaml package-lock.yaml drizzle/** .env.example`
