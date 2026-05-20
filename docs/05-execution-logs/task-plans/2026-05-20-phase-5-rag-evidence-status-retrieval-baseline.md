# Task Plan: Phase 5 RAG Evidence Status Retrieval Baseline

## Task

- Task id: `phase-5-rag-evidence-status-retrieval-baseline`
- Branch: `codex/phase-5-rag-evidence-status-retrieval-baseline`
- Phase: `phase-5-ai-rag`
- Source stories:
  - `docs/01-requirements/stories/epic-05-rag-knowledge.md#us-05-01-混合检索与-rerank`
  - `docs/01-requirements/stories/epic-05-rag-knowledge.md#us-05-02-rag-命中状态与权限过滤`

## Required Reading

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
- `docs/05-execution-logs/evidence/2026-05-20-phase-5-rag-chunking-baseline.md`

## Confirmed Queue Boundary

- `phase-5-rag-chunking-baseline` is `done`.
- `project-state.yaml` handoff points to `phase-5-ai-rag / phase-5-rag-evidence-status-retrieval-baseline`.
- Current task was `pending` with dependencies complete before claim.
- Security review is required by queue metadata.
- Dependency approval is not triggered; no dependency, lockfile, migration, pgvector, embedding storage, or `.env.example` change is allowed.

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-20-phase-5-rag-evidence-status-retrieval-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-20-phase-5-rag-evidence-status-retrieval-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-20-phase-5-rag-evidence-status-retrieval-baseline-security-review.md`
- `src/rag/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/models/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `tests/unit/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `drizzle/**`
- `.env.example`

## Implementation Plan

1. Add RED tests for retrieval input/output contract, `evidence_status`, citation top-three behavior, `rag_ready` filtering, profession/level matching, authorization filtering before AI usage, and redaction-safe evidence summaries.
2. Implement pure RAG retrieval ranking without model providers, embeddings, pgvector, database migrations, or external service calls.
3. Add service boundary that accepts repository-like chunk records plus authorization scope and returns AI-ready retrieval results only after filtering.
4. Add DTO contract types for retrieval outputs using camelCase fields and public identifiers only.
5. Add security review covering authorization, API contract, `evidence_status`, pgvector boundary, and redaction constraints.
6. Record RED/GREEN and all validation output in evidence.
7. Update task queue and project state after validation; handoff should point to the next available pending task in queue order.

## Risk Defenses

- Retrieval must use only resources with `resourceStatus: "rag_ready"`.
- Retrieval must filter authorization before results are handed to AI-facing service output.
- Weak or empty hits must not fabricate citations.
- Top-three citation selection must be deterministic and must not include unauthorized chunks.
- `citation` and `chunk` raw text must not appear in logs or evidence summaries.
- Rerank/vector work is represented only as a deterministic baseline over supplied candidates; no real embedding, pgvector, provider integration, or migrations.
- Public contract must not expose numeric database `id`.
