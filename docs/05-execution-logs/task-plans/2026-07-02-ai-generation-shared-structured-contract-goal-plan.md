# AI Generation Shared Structured Contract Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make AI出题 and AI组卷 deterministic before real Provider reruns by centralizing task contracts, hardening structured preview parsing, unifying Provider instruction construction, and adding a cross-role regression matrix.

**Architecture:** Keep ADR-002 layering: route handlers remain thin, shared AI generation behavior lives in `src/server/services`, contracts live in `src/server/contracts`, validators stay in `src/server/validators`, and UI pages consume stable route contracts. Admin and student surfaces may keep different layouts, but task semantics, structured output contracts, status mapping, and acceptance gates must be shared.

**Tech Stack:** Next.js App Router, TypeScript, Vercel AI SDK through existing installed packages, Vitest, Testing Library, ESLint, Prettier, Module Run v2 gates.

---

## Planning Task Boundary

- Task id: `ai-generation-shared-structured-contract-goal-plan-2026-07-02`
- Branch: `codex/ai-generation-shared-structured-contract-goal-plan`
- This task is planning and queue materialization only.
- No source/runtime/test code is changed in this task.
- No Provider call, browser walkthrough, DB mutation, package/lockfile change, schema/migration/seed change, deploy, PR, force push, release readiness, final Pass, or Cost Calibration is allowed in this planning task.

## Read Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-02-marketing-monopoly-logistics-provider-rerun.md`
- `docs/05-execution-logs/evidence/2026-07-02-monopoly-scanned-pdf-ocr-runtime-rag-coverage.md`

## First-Principles Diagnosis

AI出题 and AI组卷 acceptance requires all of these to hold at the same time:

1. The role can reach the page.
2. The page sends a valid task request.
3. The service resolves the correct owner/auth/quota boundary.
4. Runtime RAG has sufficient evidence.
5. Provider output follows the expected JSON contract.
6. The structured preview parser recognizes the output.
7. The route only persists or displays acceptable drafts.
8. The UI shows history and failure states without leaking raw content.
9. Regression tests lock the behavior across content admin, organization admin, and student surfaces.

The previous OCR/runtime task proved that the sampled monopoly level-3 skill path now has sufficient RAG retrieval. The remaining failure is after RAG: the route still returns `409015` because the generated content is not acceptable structured draft output. AI组卷 also produces visible drafts but the parser can fail to identify total question count. Therefore the next phase must harden deterministic contracts before another real Provider rerun.

## Existing Reuse Map

Already shared:

- Admin pages use `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx` for content and organization workspaces.
- Admin API routes share `src/server/services/admin-ai-generation-local-contract-route.ts`.
- Shared Provider and structured preview primitives live in `src/server/services/route-integrated-provider-execution-service.ts`.
- Admin and personal Provider paths both use the shared structured preview primitives.

Not shared enough:

- Admin and personal Provider instruction builders are separate.
- The AI出题 requested count is currently effectively contract-fixed at 10 in `createRouteIntegratedStructuredPreviewOptionsForTask`.
- AI组卷 question-count parsing is too narrow for real Provider variations.
- Admin and student UI state labels and task detail controls are independently maintained.
- Cross-role deterministic tests do not yet prove the same contract for content admin, organization admin, and student flows.

## Goal Completion Criteria

The goal is complete only when all child tasks below are closed and evidence proves:

- AI出题 parses and accepts exactly the requested `questionCount`, not a hard-coded count.
- AI组卷 structured preview reports a non-null total `questionCount` for supported JSON forms.
- Admin and personal Provider instruction generation use the same shared output contract definitions.
- Content admin, organization admin, and student routes pass deterministic mocked-provider tests for AI出题 and AI组卷 success and safe failure.
- UI surfaces show accepted, failed, insufficient-evidence, and history states without raw payloads or technical contract wording.
- A bounded real Provider rerun runs only after deterministic gates pass.
- No accepted regression can be overwritten without failing a focused test or Module Run v2 gate.

## Child Task Templates

### Task 1: Shared Task Spec Contract

**Task id:** `ai-generation-shared-task-spec-contract-2026-07-02`

**Purpose:** Create the single source of truth for AI出题 and AI组卷 task semantics.

**Likely files:**

- Create: `src/server/contracts/ai-generation-task-spec-contract.ts`
- Modify: `src/server/services/route-integrated-provider-execution-service.ts`
- Test: `src/server/services/route-integrated-provider-execution-service.test.ts`
- Docs/state/evidence files for the task.

**Acceptance standards:**

- `ai_question_generation` and `ai_paper_generation` are defined once with labels, expected structured preview kind, count semantics, allowed high-level output fields, and redaction category.
- AI出题 requested count is derived from `generationParameters.questionCount`.
- AI组卷 requested count is derived from `generationParameters.questionCount`.
- Existing tests for structured preview still pass.
- New unit tests prove no caller can silently fall back from requested count 5 or 20 to 10.

**Steps:**

- [ ] Add failing tests proving `questionCount=5` creates a `question_set` preview requiring 5 questions.
- [ ] Add failing tests proving `paper` preview options preserve requested total count for later parser validation.
- [ ] Implement the shared task spec contract with exported functions using existing names and glossary terms.
- [ ] Replace hard-coded count construction in shared preview options.
- [ ] Run `npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts`.
- [ ] Run lint, typecheck, Prettier, diff check, and Module Run v2 gates.

### Task 2: Structured Preview Parser Hardening

**Task id:** `ai-generation-structured-preview-parser-hardening-2026-07-02`

**Purpose:** Make parser acceptance deterministic for common Provider JSON variants without accepting raw or ungrounded content.

**Likely files:**

- Modify: `src/server/services/route-integrated-provider-execution-service.ts`
- Test: `src/server/services/route-integrated-provider-execution-service.test.ts`
- Docs/state/evidence files for the task.

**Acceptance standards:**

- AI出题 accepts `questions`, `questionDrafts`, and `question_drafts` only when the count equals requested `questionCount`.
- AI出题 failure reports one of: `invalid_json`, `missing_questions`, `question_count_mismatch`.
- AI组卷 recognizes total question count from top-level `questionCount`, `totalQuestionCount`, section `questionCount`, nested `questions`, nested `questionDrafts`, and distribution totals.
- AI组卷 failure remains safe and does not expose generated content.
- Parser tests cover at least 8 JSON variants: 3 question success/failure cases and 5 paper count cases.

**Steps:**

- [ ] Add failing tests for AI组卷 top-level `totalQuestionCount`.
- [ ] Add failing tests for AI组卷 section-level `questionCount`.
- [ ] Add failing tests for AI组卷 nested `questions` arrays.
- [ ] Add failing tests for AI组卷 nested `questionDrafts` arrays.
- [ ] Add failing tests for AI组卷 `questionTypeDistribution` sum fallback.
- [ ] Implement minimal parser helpers using existing `readArrayProperty`, `readCollectionCount`, and immutable data handling.
- [ ] Run parser unit tests, lint, typecheck, Prettier, diff check, and Module Run v2 gates.

### Task 3: Shared Provider Instruction Builder

**Task id:** `ai-generation-provider-instruction-unification-2026-07-02`

**Purpose:** Remove drift between admin and personal prompt construction while keeping role-specific scene labels.

**Likely files:**

- Create: `src/server/services/route-integrated-provider-instruction-service.ts`
- Modify: `src/server/services/admin-ai-generation-runtime-bridge-service.ts`
- Modify: `src/server/services/personal-ai-generation-route-integrated-provider-execution-service.ts`
- Test: `src/server/services/route-integrated-provider-instruction-service.test.ts`
- Docs/state/evidence files for the task.

**Acceptance standards:**

- Admin and personal routes call the same instruction builder.
- The builder outputs one shared JSON contract per task kind.
- Scene wording can vary by workspace/owner context, but output field requirements cannot drift.
- Tests assert the instruction contains task count, expected root fields, grounding-only rule, and no forbidden evidence words.
- No real Provider call is made.

**Steps:**

- [ ] Add tests for AI出题 instruction contract with requested count 10 and requested count 5.
- [ ] Add tests for AI组卷 instruction contract requiring total question count and paper sections.
- [ ] Extract shared builder and pass scene labels as parameters.
- [ ] Replace admin and personal local builders.
- [ ] Run targeted service tests, lint, typecheck, Prettier, diff check, and Module Run v2 gates.

### Task 4: Admin And Personal Route Contract Alignment

**Task id:** `ai-generation-route-contract-alignment-2026-07-02`

**Purpose:** Ensure content admin, organization admin, and student routes consume the shared task spec and return consistent safe outcomes.

**Likely files:**

- Modify: `src/server/services/admin-ai-generation-local-contract-route.ts`
- Modify: `src/server/services/personal-ai-generation-request-route.ts`
- Modify: `src/server/services/personal-ai-generation-route-integrated-provider-execution-service.ts`
- Test: `src/server/services/admin-ai-generation-local-contract-route.test.ts`
- Test: `src/server/services/personal-ai-generation-request-route.test.ts`
- Docs/state/evidence files for the task.

**Acceptance standards:**

- Mocked provider success for AI出题 creates acceptable `question_set`.
- Mocked provider success for AI组卷 creates acceptable `paper_draft` with non-null question count.
- Mocked provider malformed JSON returns safe failure and does not persist draft.
- Mocked insufficient RAG returns safe insufficient evidence without provider execution.
- Both admin and personal routes return standard `{ code, message, data }`.

**Steps:**

- [ ] Add admin route tests for content AI出题 and AI组卷 using mocked provider output.
- [ ] Add organization route tests for AI出题 and AI组卷 using mocked provider output.
- [ ] Add personal route tests for AI出题 and AI组卷 using mocked provider output.
- [ ] Align route result materialization with the shared acceptable-draft predicate.
- [ ] Run targeted route tests, lint, typecheck, Prettier, diff check, and Module Run v2 gates.

### Task 5: Cross-Surface UI State Regression Matrix

**Task id:** `ai-generation-cross-surface-ui-regression-matrix-2026-07-02`

**Purpose:** Lock the ordinary UI behavior so role/page regressions fail tests before Provider reruns.

**Likely files:**

- Modify: `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- Modify: `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- Test: `tests/unit/admin-ai-generation-entry-surface.test.ts`
- Test: `tests/unit/student-personal-ai-generation-ui.test.ts`
- Test: `src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx`
- Test: `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- Docs/state/evidence files for the task.

**Acceptance standards:**

- Content admin AI出题 page shows success, failure, insufficient evidence, and history states.
- Content admin AI组卷 page shows success with recognized question count.
- Organization admin AI出题 and AI组卷 pages are covered with advanced authorization capability.
- Student AI出题 and AI组卷 pages show accepted, blocked, history, and result detail states.
- UI tests assert no raw payload, prompt, Provider response, localStorage token, Authorization header, or technical internal ids are visible.
- Shared labels should be introduced only where they reduce real drift; admin desktop layout and student mobile-first layout remain separate.

**Steps:**

- [ ] Add matrix fixtures for route success/failure responses.
- [ ] Add admin UI tests for content and organization, both task kinds.
- [ ] Add student UI tests for both task kinds.
- [ ] Refactor only duplicated status/label mapping that causes drift.
- [ ] Run targeted UI tests, lint, typecheck, Prettier, diff check, and Module Run v2 gates.

### Task 6: Deterministic Acceptance Matrix Rollup

**Task id:** `ai-generation-deterministic-acceptance-matrix-rollup-2026-07-02`

**Purpose:** Prove all deterministic gates pass together before real Provider execution is allowed.

**Likely files:**

- Create: `docs/05-execution-logs/evidence/2026-07-02-ai-generation-deterministic-acceptance-matrix-rollup.md`
- Create: `docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-deterministic-acceptance-matrix-rollup.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

**Acceptance standards:**

- Rollup lists every deterministic task and its commit/result.
- Rollup records content admin, organization admin, and student rows for AI出题 and AI组卷.
- Rollup records successful parser contract coverage for requested question count and paper total question count.
- Rollup confirms zero real Provider calls in deterministic tasks.
- Rollup confirms no source/test/package/schema/deploy work outside declared tasks.

**Steps:**

- [ ] Read evidence from Tasks 1-5.
- [ ] Run focused test suite commands from Tasks 1-5 where practical.
- [ ] Write rollup evidence with redacted count/status summaries.
- [ ] Run lint, typecheck, Prettier, diff check, and Module Run v2 gates.

### Task 7: Bounded Real Provider Rerun

**Task id:** `ai-generation-bounded-provider-rerun-after-structured-contract-2026-07-02`

**Purpose:** Validate the hardened contract against real Qwen only after deterministic gates pass.

**Likely files:**

- Create: `docs/05-execution-logs/evidence/2026-07-02-ai-generation-bounded-provider-rerun-after-structured-contract.md`
- Create: `docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-bounded-provider-rerun-after-structured-contract.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

**Acceptance standards:**

- Requires Task 6 closed with pass.
- Real Provider attempts are bounded to one content-admin sample per profession/function unless a later task explicitly narrows or expands this.
- Retries remain zero unless explicitly approved.
- Evidence records only role label, route/function, profession, subject, status category, duration bucket, structured preview count, and failure category.
- No credentials, env values, prompt, Provider payload, raw AI output, raw material/chunk/question/paper content, raw DOM, screenshots, traces, or localStorage are recorded.
- AI组卷 question count must be recognized in the safe structured preview for every successful paper sample.
- This task still must not claim release readiness, final Pass, Cost Calibration, staging, prod, or production usability.

**Steps:**

- [ ] Verify Task 6 rollup is closed and deterministic gates passed.
- [ ] Materialize a separate Provider rerun task with explicit attempt budget.
- [ ] Run resource/RAG preflight checks.
- [ ] Run bounded localhost samples.
- [ ] Write redacted evidence and audit.
- [ ] Run declared local gates and Module Run v2.

## Regression Guard Policy

Every implementation task in this goal must:

- Add failing tests before implementation when source behavior changes.
- Prefer existing shared service/contract files before adding new abstractions.
- Keep role-specific UI layout separate unless sharing removes a confirmed drift risk.
- Avoid real Provider calls until deterministic tests prove the contract.
- Record redacted evidence before closeout.
- Stop if a deterministic gate fails; do not compensate by rerunning Provider.

## Validation For This Planning Task

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-ai-generation-shared-structured-contract-goal-plan.md docs/05-execution-logs/evidence/2026-07-02-ai-generation-shared-structured-contract-goal-plan.md docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-shared-structured-contract-goal-plan.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-shared-structured-contract-goal-plan-2026-07-02
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-shared-structured-contract-goal-plan-2026-07-02 -SkipRemoteAheadCheck
```

## Self Review

- Spec coverage: the goal covers root-cause diagnosis, reuse boundaries, deterministic contract hardening, cross-role UI regression, and bounded Provider rerun.
- Placeholder scan: no task uses `TBD`, `TODO`, or unspecified acceptance language.
- Type consistency: task ids, file names, and terms use project glossary naming.
- Scope control: this planning task creates no business logic and does not authorize child tasks to bypass per-task materialization.
