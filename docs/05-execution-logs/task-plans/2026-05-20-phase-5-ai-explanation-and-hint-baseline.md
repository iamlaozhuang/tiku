# Phase 5 AI Explanation And Hint Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for implementation and superpowers:verification-before-completion before handoff. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a provider-free AI explanation and AI hint service baseline that can be used by practice and mistake-book workflows without connecting to real model providers.

**Architecture:** Keep the service inside the existing `src/server/services` boundary and follow the AI scoring baseline: inject a runner, lock model config and prompt template snapshots at call start, use RAG retrieval DTOs as input, and produce only redacted AI call log drafts. No API route, database migration, dependency, lockfile, `.env.example`, pgvector, embedding storage, or real provider integration is in scope.

**Tech Stack:** TypeScript, Next.js server-layer conventions, Vitest unit tests, existing AI/RAG models and contracts.

---

## Required Startup Documents Read

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
- `docs/05-execution-logs/evidence/2026-05-20-phase-5-ai-scoring-service-baseline.md`

## Queue Scope

- Task id: `phase-5-ai-explanation-and-hint-baseline`
- Branch: `codex/phase-5-ai-explanation-and-hint-baseline`
- Allowed files:
  - `docs/05-execution-logs/task-plans/2026-05-20-phase-5-ai-explanation-and-hint-baseline.md`
  - `docs/05-execution-logs/evidence/2026-05-20-phase-5-ai-explanation-and-hint-baseline.md`
  - `docs/05-execution-logs/audits-reviews/2026-05-20-phase-5-ai-explanation-and-hint-baseline-security-review.md`
  - `src/ai/**`
  - `src/app/api/v1/mistake-books/**`
  - `src/app/api/v1/practices/**`
  - `src/server/contracts/**`
  - `src/server/mappers/**`
  - `src/server/models/**`
  - `src/server/repositories/**`
  - `src/server/services/**`
  - `src/server/validators/**`
  - `tests/unit/**`
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
- Blocked files:
  - `package.json`
  - `pnpm-lock.yaml`
  - `package-lock.json`
  - `drizzle/**`
  - `.env.example`
- Security review: required.

## Implementation Boundary

- Use existing `ModelConfigSnapshot`, `RagRetrievalResultDto`, `RagCitationDto`, and `createAiCallLogRedactedSnapshots`.
- Create `src/server/services/ai-explanation-hint-service.ts`.
- Create `src/server/services/ai-explanation-hint-service.test.ts`.
- Do not create route handlers in this task unless tests prove the service cannot express the required boundary. The queue allows route paths, but the baseline can be service-first.
- Do not call any real model provider. Runners are injected test doubles and future adapter seams.
- Allow fallback model config for explanation and hint by recording the snapshot; do not resolve or call the fallback provider in this baseline.
- For weak or none RAG evidence, return no citations and include a clear insufficient-evidence message.
- For hint, never expose `standardAnswer`; use improvement guidance and guard against direct answer leakage.
- Failure results must be non-blocking and return a retryable unavailable message plus a failed redacted AI call log draft.

## TDD Tasks

### Task 1: RED Tests

**Files:**

- Create: `src/server/services/ai-explanation-hint-service.test.ts`

- [ ] **Step 1: Write failing tests**

Cover:

- wrong objective answer auto explanation and correct objective answer manual explanation modes;
- explanation input/output contract with model config snapshot, prompt template version, evidence status, citations, and unavailable status;
- hint input/output contract without direct `standardAnswer` leakage;
- weak/none evidence returns no fabricated citation and includes insufficient-evidence notice;
- failure does not throw and creates failed redacted log draft;
- raw prompt, answer, model output, provider payload, and citation content do not appear in AI call log draft JSON.

- [ ] **Step 2: Verify RED**

Run:

```powershell
npm.cmd run test:unit -- src/server/services/ai-explanation-hint-service.test.ts
```

Expected: fail because `src/server/services/ai-explanation-hint-service.ts` does not exist yet.

### Task 2: GREEN Implementation

**Files:**

- Create: `src/server/services/ai-explanation-hint-service.ts`

- [ ] **Step 1: Implement minimal service**

Add provider-free exported factory:

```ts
createAiExplanationHintService({
  explanationRunner,
  hintRunner,
});
```

Expose:

```ts
generateObjectiveExplanation(context);
generateSubjectiveHint(context);
```

- [ ] **Step 2: Verify GREEN**

Run:

```powershell
npm.cmd run test:unit -- src/server/services/ai-explanation-hint-service.test.ts
```

Expected: pass for the new service tests.

### Task 3: Security Review And Evidence

**Files:**

- Create: `docs/05-execution-logs/audits-reviews/2026-05-20-phase-5-ai-explanation-and-hint-baseline-security-review.md`
- Create: `docs/05-execution-logs/evidence/2026-05-20-phase-5-ai-explanation-and-hint-baseline.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [ ] **Step 1: Create security review**

Verdict must be `APPROVE` or a non-blocking `COMMENT`; otherwise stop before merge.

- [ ] **Step 2: Record evidence**

Record startup, claim, RED/GREEN, validation commands, scope guards, commit/merge/push/cleanup status.

- [ ] **Step 3: Update state**

Move task from `pending` through `validated`, then `done` after master closeout. Handoff after this task should point to the next queue-ready pending task, expected `phase-5-ai-rag / phase-5-knowledge-recommendation-baseline`.

## Validation Commands

Run before implementation commit:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-5-ai-explanation-and-hint-baseline
npm.cmd run test:unit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
npm.cmd run build
git diff --name-only
git diff --name-only -- package.json pnpm-lock.yaml package-lock.yaml drizzle/** .env.example
git status --short --branch
```

After fast-forward merge to `master`, rerun the required master gates and append closeout evidence before the closeout evidence commit.

## Risk Controls

- Authorization/RAG boundary: service consumes already-authorized RAG result only; it must not broaden retrieval or invent citations.
- Secret boundary: no provider key or environment variable is introduced.
- Data exposure: AI call logs contain redacted snapshots only.
- Standard answer leakage: explanation may use `standardAnswer`; hint output must not contain the exact `standardAnswer` string.
- Failure boundary: explanation/hint failure must return non-blocking unavailable status, not throw through the answer flow.
- Dependency boundary: no `package.json`, lockfile, `.env.example`, migration, pgvector, embedding storage, or provider SDK change.
