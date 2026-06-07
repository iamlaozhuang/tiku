# Phase 9 AI Scoring Explanation Hint Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for implementation. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Phase 9 runtime gap for `ai_scoring`, `ai_explanation`, `ai_hint`, `prompt_template`, and `ai_call_log` with local deterministic behavior.

**Architecture:** Keep ADR-002 layering: REST route handlers stay thin, services own business rules, repositories own persistence, and mappers/contracts expose camelCase DTOs only. Use existing local mock/deterministic AI boundaries and `ai_call_log` redaction; do not call real AI providers or add dependencies. Because the current schema has no async queue table or dedicated AI scoring result table and this task blocks schema and migration changes, mock-exam subjective scoring will run synchronously during submit/retry while preserving retry/failure states and recording the queue mismatch as residual risk.

**Tech Stack:** Next.js App Router route handlers, TypeScript service/repository layers, Drizzle-backed repositories, Vitest unit tests, local deterministic AI runners.

---

## Read Scope

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-9-mvp-acceptance-contract.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-student-experience-ui-completion.md`

## Allowed Files Boundary

Allowed by `phase-9-ai-scoring-explanation-hint-runtime`:

- This task plan and final evidence.
- Security review at `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-ai-scoring-explanation-hint-runtime-security-review.md`.
- `src/app/api/v1/mock-exams/**`
- `src/app/api/v1/exam-reports/**`
- `src/app/api/v1/mistake-books/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- Agent state files.

Blocked:

- `package.json`, lockfiles, `.env.example`, and `drizzle/**`.
- Any real SMS, email, payment, production credential, or real AI provider connection.
- Any URL/DTO exposure of internal auto-increment `id`.

## Implementation Tasks

### Task 1: RED tests for mock-exam AI scoring runtime

**Files:**

- Modify: `src/server/services/mock-exam-service.test.ts`

- [ ] Add failing tests proving:
  - Submitted subjective answers invoke an injected deterministic AI scoring runtime.
  - Score is saved as half-point capped score and included in `subjectiveScore`/`totalScore`.
  - Unanswered subjective questions score `0.0` without invoking AI.
  - Failed scoring marks answer records `scoring_failed` and mock exam `scoring_partial_failed`.
  - Retry scoring only reprocesses failed answer records and does not rescore already successful results.

Expected RED command:

```powershell
npm.cmd run test:unit -- src/server/services/mock-exam-service.test.ts
```

Expected failure: missing `retryMockExamScoring` service method and AI scoring runtime integration.

### Task 2: GREEN implementation for mock-exam AI scoring runtime

**Files:**

- Modify: `src/server/contracts/mock-exam-contract.ts`
- Modify: `src/server/repositories/mock-exam-repository.ts`
- Modify: `src/server/repositories/student-flow-runtime-repository.ts`
- Modify: `src/server/services/mock-exam-service.ts`
- Modify: `src/server/services/mock-exam-route.ts`
- Add: `src/app/api/v1/mock-exams/[publicId]/retry-scoring/route.ts`

- [ ] Add service dependency types for deterministic subjective scoring.
- [ ] Update submit flow to score subjective answers when a runtime is provided.
- [ ] Keep existing no-runtime behavior stable for earlier tests and isolated callers.
- [ ] Add repository methods to persist scoring statuses and mock-exam aggregate scores without schema changes.
- [ ] Add `POST /api/v1/mock-exams/{publicId}/retry-scoring` as the student action endpoint.

Expected GREEN command:

```powershell
npm.cmd run test:unit -- src/server/services/mock-exam-service.test.ts
```

### Task 3: RED tests for mistake-book AI explanation runtime

**Files:**

- Modify: `src/server/services/mistake-book-service.test.ts`
- Modify: `src/server/services/mistake-book-route.test.ts`

- [ ] Add failing tests proving:
  - Authorized mistake-book `ai-explanation` returns an AI explanation DTO.
  - RAG weak/none status returns an insufficient-evidence message and no attached citations.
  - The route forwards request body and returns the standard API response.

Expected RED command:

```powershell
npm.cmd run test:unit -- src/server/services/mistake-book-service.test.ts src/server/services/mistake-book-route.test.ts
```

Expected failure: service still returns Phase 4 not-available response.

### Task 4: GREEN implementation for AI explanation/hint DTO and runtime wiring

**Files:**

- Modify: `src/server/contracts/mistake-book-contract.ts`
- Modify: `src/server/services/mistake-book-service.ts`
- Modify: `src/server/services/student-mistake-book-runtime.ts`

- [ ] Add a public `AiExplanationDto` result shape without raw prompt, raw answer, secret, token, or internal numeric id.
- [ ] Add optional AI explanation runtime dependency to `MistakeBookService`.
- [ ] Build context from authorized mistake-book snapshot and latest wrong answer.
- [ ] Use local deterministic AI explanation runtime in the default student mistake-book route handlers.
- [ ] Preserve not-available response when runtime is absent for isolated Phase 4 callers.

Expected GREEN command:

```powershell
npm.cmd run test:unit -- src/server/services/mistake-book-service.test.ts src/server/services/mistake-book-route.test.ts
```

### Task 5: Integrate local prompt templates, model snapshots, and AI call logs

**Files:**

- Modify: `src/server/services/student-flow-runtime.ts`
- Modify: `src/server/services/student-mistake-book-runtime.ts`
- Modify: `src/server/services/ai-mock-provider-runtime.ts` if a shared helper is needed.
- Modify: `tests/unit/phase-7-ai-mock-provider-and-log-runtime-smoke.test.ts` only if existing assumptions need updating.

- [ ] Create local deterministic `ai_scoring`, `ai_explanation`, and `ai_hint` runners.
- [ ] Use versioned prompt template snapshots such as `dev_ai_scoring_v1`, `dev_ai_explanation_v1`, and `dev_ai_hint_v1`.
- [ ] Append `ai_call_log` rows through the existing admin AI audit log runtime repository.
- [ ] Ensure redacted snapshots hash prompt, user answer, model output, citations, and provider payloads instead of storing raw sensitive content.
- [ ] Keep model/provider snapshots local mock only.

Expected focused command:

```powershell
npm.cmd run test:unit -- src/server/services/mock-exam-service.test.ts src/server/services/mistake-book-service.test.ts src/server/services/mistake-book-route.test.ts
```

### Task 6: Security review, evidence, and state closeout

**Files:**

- Add: `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-ai-scoring-explanation-hint-runtime-security-review.md`
- Add: `docs/05-execution-logs/evidence/2026-05-23-phase-9-ai-scoring-explanation-hint-runtime.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [ ] Write security review covering auth/session, authorization, local AI provider, `ai_call_log` redaction, prompt/template versioning, retry behavior, and residual async-queue risk.
- [ ] Run and record all required validation commands.
- [ ] Mark task closed in state and queue only after validation passes.
- [ ] Commit one reviewable task commit.

Required validation commands:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-ai-scoring-explanation-hint-runtime
npm.cmd run test:unit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

## Risk Controls

- No dependency, schema, migration, environment, or production-resource change.
- No real AI provider call; local deterministic runners only.
- Do not log raw prompt, raw answer, raw model output, secrets, session token, or API key.
- Do not bypass session or authorization checks; `publicId` remains only a lookup key combined with user ownership and scope checks.
- If queue acceptance expects asynchronous scoring, document that current no-migration runtime performs deterministic synchronous scoring and leaves durable queue processing to a later approved schema/task.
