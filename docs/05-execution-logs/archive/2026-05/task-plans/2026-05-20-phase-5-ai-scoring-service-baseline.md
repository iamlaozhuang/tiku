# Task Plan: Phase 5 AI Scoring Service Baseline

## Task

- Task id: `phase-5-ai-scoring-service-baseline`
- Branch: `codex/phase-5-ai-scoring-service-baseline`
- Phase: `phase-5-ai-rag`
- Source stories:
  - `docs/01-requirements/stories/epic-04-ai-scoring.md#us-04-01-主观题-ai-评分模拟考试`
  - `docs/01-requirements/stories/epic-04-ai-scoring.md#us-04-02-评分失败与重试`

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
- `docs/05-execution-logs/evidence/2026-05-20-phase-5-rag-evidence-status-retrieval-baseline.md`

## Confirmed Queue Boundary

- `phase-5-rag-evidence-status-retrieval-baseline` is `done`.
- `project-state.yaml` handoff points to `phase-5-ai-rag / phase-5-ai-scoring-service-baseline`.
- Current task was `pending` with dependencies complete before claim.
- Security review is required by queue metadata.
- Dependency approval is not triggered; no dependency, lockfile, migration, pgvector, embedding storage, real provider, secret, or `.env.example` change is allowed.

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-20-phase-5-ai-scoring-service-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-20-phase-5-ai-scoring-service-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-20-phase-5-ai-scoring-service-baseline-security-review.md`
- `src/ai/**`
- `src/app/api/v1/mock-exams/**`
- `src/app/api/v1/exam-reports/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/models/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
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

1. Add RED tests for the AI scoring input/output contract, unanswered subjective answer shortcut, idempotent successful scoring, scoring point rounding, retry/status boundaries, model config snapshot locking, prompt template version locking, RAG evidence summary integration, no fabricated weak/none citations, and redacted AI call log snapshots.
2. Implement a pure provider-free AI scoring service baseline under `src/server/services/**` that depends on an injected mock scoring runner and injected RAG retrieval context.
3. Extend AI/RAG models and contracts with scoring-specific result, scoring point, status, retry, and evidence summary shapes using camelCase DTO fields and public identifiers only.
4. Ensure subjective scoring never automatically falls back to a fallback model config; scoring starts only with a locked scoring `model_config` snapshot and active scoring prompt template version.
5. Use existing `createAiCallLogRedactedSnapshots` behavior so prompt, user answer, model output, provider payloads, and citations are represented only by redacted snapshots.
6. Add security review covering API contract, AI scoring, external service boundary, answer record/report boundaries, RAG authorization/evidence behavior, secret handling, and log redaction.
7. Record RED/GREEN and all validation output in evidence.
8. Update task queue and project state after validation; handoff should point to the next available pending task in queue order.

## Risk Defenses

- No real model provider integration, SDK call, network request, or provider secret is introduced.
- No database migration or schema change is introduced in this task.
- Empty subjective answers return zero score and do not call the scoring runner.
- A successful result for the same answer record is stable and blocks repeat provider-style invocation.
- Retry attempts only apply to failed scoring records; successful records are not rescored.
- Retry limit is three attempts; exceeding the limit returns a terminal failure status.
- Scoring point scores are rounded to the nearest 0.5 and total score is capped by the question max score.
- Weak or none RAG evidence does not fabricate citation details.
- AI call logs and evidence summaries never store raw prompt text, user answer text, model output text, provider payload text, citation text, or raw chunk text.
- Public contracts must not expose numeric database `id`.
