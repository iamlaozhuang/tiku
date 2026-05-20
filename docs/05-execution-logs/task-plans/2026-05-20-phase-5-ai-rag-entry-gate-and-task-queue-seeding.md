# Phase 5 AI/RAG Entry Gate And Task Queue Seeding Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:verification-before-completion before handoff. This plan is an evidence and queue-seeding task, not a business implementation task.

**Goal:** Define the Phase 5 AI/RAG entry gate and seed the first reviewable Phase 5 task queue without changing application code, database schema, dependencies, lockfiles, or environment files.

**Architecture:** This task keeps Phase 5 behind documentation, evidence, and queue boundaries. Later implementation tasks must continue to follow the existing Next.js/TypeScript monolith layering: route handlers or server actions -> service -> repository -> model.

**Tech Stack:** Documentation, YAML queue state, local PowerShell agent gates, Git worktree workflow.

---

## Read Sources

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
- `docs/05-execution-logs/evidence/2026-05-20-phase-5-mechanism-hardening-readiness.md`

## Entry Gate Checks

- Dependency approval strategy: Phase 5 implementation must not introduce `ai`, provider SDKs, pgvector client assumptions, queue libraries, document conversion libraries, or text splitting libraries without dependency gate evidence and human approval.
- Secret and environment strategy: no real API keys, no `.env.example` edit, and no client-side model credentials in this task. Later model provider work must document secret storage and redacted display before implementation.
- `model_provider` and `model_config` boundary: queue separates configuration, prompt template, call logging, RAG retrieval, and user-visible AI services so model selection and prompt snapshots are stable.
- `prompt_template` versioning: every AI task must preserve template version evidence in contracts, logs, or snapshots.
- `ai_call_log` redaction: prompt, answer, output, citation, and provider error payload handling must be reviewed before merge.
- RAG `evidence_status`: later retrieval work must explicitly define `sufficient`, `weak`, and `none` behavior and prevent fabricated citations.
- pgvector and `embedding` verification: schema and retrieval work must record whether vector search is mocked, deferred, or backed by a verified PostgreSQL pgvector path.
- Browser/IAB usage: not needed for this entry gate. Later UI work must use lightweight Browser/IAB verification only when routes or rendered UI are changed.
- Security review gate: AI/RAG tasks touching secrets, schema, authorization filtering, API contracts, or external services must include security review evidence.

## Task Split Principles

- Keep contract and threat model before implementation.
- Keep dependency, schema, secret, and external provider work isolated from feature logic.
- Keep `ai_call_log` redaction before any service task that logs prompts, answers, outputs, citations, or provider errors.
- Keep RAG schema and chunking before retrieval.
- Keep retrieval `evidence_status` behavior before AI scoring, explanation, hint, and knowledge recommendation services.
- Keep readiness evidence as the final Phase 5 aggregation task.

## Files

- Create: `docs/05-execution-logs/task-plans/2026-05-20-phase-5-ai-rag-entry-gate-and-task-queue-seeding.md`
- Create: `docs/05-execution-logs/evidence/2026-05-20-phase-5-ai-rag-entry-gate-and-task-queue-seeding.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

## Steps

- [x] Confirm repository state from Git commands and latest evidence.
- [x] Confirm `phase-5-mechanism-hardening-readiness` is `done`.
- [x] Confirm no Phase 5 implementation task is currently pending.
- [x] Create this task plan.
- [x] Create evidence with Phase 5 entry gate decisions.
- [x] Add this entry gate task and initial Phase 5 pending tasks to `task-queue.yaml`.
- [x] Update `project-state.yaml` handoff to the first new pending Phase 5 task.
- [ ] Run validation commands and append results to evidence.
- [ ] Commit, fast-forward merge to `master`, run post-merge gates, push, and clean the worktree after the user-approved gates pass.

## Risk Controls

- Do not modify `package.json`, `pnpm-lock.yaml`, `package-lock.json`, `src/**`, `drizzle/**`, or `.env.example`.
- Do not introduce provider SDKs, queue libraries, document conversion libraries, pgvector setup, or test tooling.
- Do not write real secrets or secret-shaped placeholders.
- Keep all new task IDs and terminology aligned with `glossary.yaml`.
