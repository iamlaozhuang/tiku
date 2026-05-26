# Phase 12 Role Scenario Script Plan Task Plan

## Task

- TaskId: `phase-12-role-scenario-script-plan`
- Branch: `codex/phase-12-role-scenario-script-plan`
- Goal: create role-specific experience scripts for the multi-role real-browser gap scans.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/02-architecture/interfaces/phase-11-role-based-full-flow-acceptance-contract.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-role-scenario-experience-registration.md`

## allowedFiles

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`

## blockedFiles

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

## Current Implementation Surface Read

- Student pages: `/home`, `/practice`, `/mock-exam`, `/exam-report`, `/mistake-book`, `/profile`, `/redeem-code`.
- Admin pages: `/ops/users`, `/ops/organizations`, `/ops/redeem-codes`, `/ops/resources`, `/ops/ai-audit-logs`, `/content/questions`, `/content/materials`, `/content/papers`, `/content/knowledge-nodes`.
- Auth pages: `/login`, `/register`.
- REST surfaces include `/api/v1/sessions`, `/student-papers`, `/practices`, `/mock-exams`, `/exam-reports`, `/mistake-books`, `/users`, `/organizations`, `/org-auths`, `/redeem-codes`, `/questions`, `/materials`, `/papers`, `/resources`, `/knowledge-nodes`, `/model-providers`, `/model-configs`, `/prompt-templates`, `/audit-logs`, and `/ai-call-logs`.
- Existing browser coverage includes `local-auth-route-guard.spec.ts`, `student-practice-mock-entry.spec.ts`, `content-action-closures.spec.ts`, `staging-required-role-flows.spec.ts`, and `role-based-acceptance/role-based-full-flow.spec.ts`.

## Experience Scripts

### Script S1: Student Authorized Learning Flow

- Role: `student`
- Preconditions:
  - Local dev server and dev database are running.
  - Use seeded or test-created student credentials without recording password values.
  - Student has effective `authorization` for at least one `published` paper.
- Steps:
  1. Login through `/login`.
  2. Confirm redirect to `/home`.
  3. Confirm authorized scopes and paper cards render.
  4. Open `/practice?paperPublicId={publicId}` from a paper card.
  5. Submit an objective answer.
  6. Confirm immediate feedback, `standard_answer`, `analysis`, and mistake_book update behavior for wrong answers.
  7. Open `/mock-exam?paperPublicId={publicId}`.
  8. Save an answer, submit mock_exam, and open `/exam-report`.
  9. Open `/mistake-book` and exercise favorite, mark-mastered, remove, and ai_explanation if an item exists.
- Expected results:
  - Protected routes require the logged-in student session.
  - Practice returns objective feedback only after answer submit.
  - Mock exam answering never reveals correctness, `standard_answer`, `analysis`, `ai_hint`, or `ai_explanation` before submit.
  - Reports use public identifiers and redaction-safe snapshots.
  - Mistake book shows only authorized objective items.
- Verification method:
  - Browser: `/login`, `/home`, `/practice`, `/mock-exam`, `/exam-report`, `/mistake-book`.
  - API/code: `student-flow-runtime`, `student-mistake-book-runtime`, `studentRuntimeApi.ts`, student contract DTOs.
  - Tests: `student-practice-mock-entry.spec.ts`, `role-based-full-flow.spec.ts`, student unit tests.
- Risks:
  - Existing tests prove representative entry paths, not every SSOT AC.
  - Need distinguish fixture UI from live runtime data.
  - Do not record raw answer text beyond short synthetic labels in evidence.

### Script S2: Student No-Authorization And Boundary Flow

- Role: `student` without effective authorization.
- Preconditions:
  - Use seeded or test-created no-auth student credentials without recording password values.
  - No personal_auth or org_auth grants the target `profession`/`level`.
- Steps:
  1. Login through `/login`.
  2. Visit `/home`.
  3. Confirm no paper metadata leaks outside authorized scope.
  4. Follow purchase guidance to `/redeem-code`.
  5. Try direct navigation to `/practice?paperPublicId={knownPublicId}` and `/mock-exam?paperPublicId={knownPublicId}`.
  6. Try API requests for `/api/v1/student-papers`, `/api/v1/practices`, `/api/v1/mock-exams`, `/api/v1/exam-reports`, and `/api/v1/mistake-books`.
- Expected results:
  - Empty authorized scope or typed purchase guidance state.
  - No unauthorized paper title, question, answer, or report leakage.
  - API responses use standard envelope and authorization/not-found code ranges.
- Verification method:
  - Browser: `/home`, `/redeem-code`, direct protected student routes.
  - API/code: effective authorization resolver, student route handlers.
  - Tests: `role-based-full-flow.spec.ts` negative flow plus targeted follow-up checks.
- Risks:
  - `publicId` must not become an access-control mechanism.
  - Evidence must not include generated redeem_code plaintext.

### Script S3: Unauthenticated And Session Boundary Flow

- Role: unauthenticated user.
- Preconditions:
  - Browser storage is cleared.
- Steps:
  1. Visit `/home`, `/practice`, `/mock-exam`, `/mistake-book`, `/ops/users`, `/content/questions`.
  2. Confirm redirect to `/login`.
  3. Attempt representative protected API requests without session.
  4. Login as student and admin in separate browser contexts to check redirect destinations and role separation.
- Expected results:
  - Protected UI routes redirect to login.
  - Protected APIs do not return data without authenticated context.
  - Student login lands on student surface; admin login lands on admin surface.
- Verification method:
  - Browser: `local-auth-route-guard.spec.ts` plus expanded manual paths.
  - API/code: `/api/v1/sessions`, auth route guards, role resolver.
- Risks:
  - Existing local session token storage must not be recorded in evidence.

### Script S4: Admin Content Management Flow

- Role: `content_admin` or `super_admin`.
- Preconditions:
  - Admin session is available.
  - Existing content data includes material, question, paper, and knowledge_node surfaces.
- Steps:
  1. Login through `/login`.
  2. Visit `/content/questions`, filter/search, create or inspect question form states.
  3. Verify disabled/locked question edit/copy behavior.
  4. Visit `/content/materials`, inspect material create/edit/disable/copy states.
  5. Visit `/content/papers`, inspect draft create, composition, publish, archive, copy, and unavailable action explanations.
  6. Visit `/content/knowledge-nodes`, inspect tree CRUD, sorting, disabled state, and AI recommendation review entry.
- Expected results:
  - Content actions require admin role and use public identifiers.
  - Loading/empty/error states are visible where data fetches occur.
  - Locked/disabled/archived state rules match question-paper contract.
  - Publish validation failures use standard API envelope and do not leak internal ids.
- Verification method:
  - Browser: `/content/questions`, `/content/materials`, `/content/papers`, `/content/knowledge-nodes`.
  - API/code: question, material, paper, knowledge-node routes and admin feature files.
  - Tests: `content-action-closures.spec.ts`, admin content unit tests.
- Risks:
  - Current E2E includes some guarded/unavailable paper actions; scan must classify whether this is intended staged behavior or MVP gap.

### Script S5: Admin Operations, Organization, Employee, And Authorization Flow

- Role: `ops_admin` or `super_admin`.
- Preconditions:
  - Admin session is available.
  - Existing organization, employee, org_auth, redeem_code, and user data are present or can be created through local runtime.
- Steps:
  1. Visit `/ops/users`, inspect filters, pagination, disable/enable, reset password entry points.
  2. Visit `/ops/organizations`, inspect organization tree, employee list/create/disable, org_auth create/cancel/occupancy states.
  3. Visit `/ops/redeem-codes`, inspect batch generation, filters, clear-text display boundary, and purchase guidance.
  4. Exercise invalid/duplicate/overlap request paths through API with synthetic payloads only.
  5. Confirm affected student visibility changes for cancelled/expired/disabled authorization states where local data permits.
- Expected results:
  - Ops surfaces use role checks in service code, not only UI.
  - Organization/employee cross-scope `publicId` tampering is denied.
  - Overlapping org_auth, duplicate redeem, repeated submit, and invalid payloads return standard error envelopes.
  - Clear-text redeem_code appears only where role-gated and is never recorded in evidence.
- Verification method:
  - Browser: `/ops/users`, `/ops/organizations`, `/ops/redeem-codes`.
  - API/code: user, organization, employee, org_auth, redeem_code route handlers and services.
  - Tests: `staging-required-role-flows.spec.ts`, role-based full flow, ops unit tests.
- Risks:
  - Admin role distinction may be under-tested if only a `super_admin` seed exists.
  - Do not record generated card codes or passwords.

### Script S6: Admin AI/RAG, Model Configuration, And Redaction Flow

- Role: `super_admin` for model_config mutation; ops/content admin read-only where allowed.
- Preconditions:
  - Local mock AI runtime is enabled.
  - No real provider, env, staging, prod, or cloud connection is used.
- Steps:
  1. Visit AI/model configuration admin surface if linked from admin navigation.
  2. Exercise model_provider, model_config, prompt_template list/create/edit/enable/disable/fallback UI where available.
  3. Trigger local mock AI paths through practice explanation, mistake_book ai_explanation, mock_exam scoring, learning suggestion, or knowledge recommendation.
  4. Visit `/ops/ai-audit-logs`.
  5. Inspect audit_log and ai_call_log lists/details/summary for redaction.
  6. Confirm no raw prompt, raw answer, raw model response, raw provider payload, token, Authorization header, or secret-like value appears in UI/API/evidence.
- Expected results:
  - `model_config` and `prompt_template` surfaces expose only redaction-safe metadata.
  - AI call logs snapshot public model_config/prompt_template metadata without secrets.
  - `evidence_status` is explicit and citations are not fabricated when RAG evidence is weak/none.
- Verification method:
  - Browser: `/ops/ai-audit-logs`, model config surface if route/navigation exists, student AI-triggering routes.
  - API/code: `/api/v1/model-providers`, `/model-configs`, `/prompt-templates`, `/ai-call-logs`, AI services and redaction helpers.
  - Tests: model config, AI log, RAG, and role-based E2E tests.
- Risks:
  - Prompt/template body handling remains sensitive; evidence may record only masked/digest metadata.
  - Any real provider or env access must pause for approval.

### Script S7: Disabled, Archived, Inactive, Duplicate, And Illegal Parameter Flow

- Role: `student`, `admin`, and insufficient-permission user.
- Preconditions:
  - Synthetic data or existing local data can represent disabled question/material/resource, archived paper, inactive organization/authorization, and submitted sessions.
- Steps:
  1. Attempt new practice/mock_exam for archived paper.
  2. Attempt continue practice/mock_exam after simulated authorization loss or inactive account state where local APIs allow.
  3. Re-submit a submitted mock_exam.
  4. Submit invalid answer payloads and invalid query params.
  5. Inspect disabled source question/material visibility in historical snapshots.
  6. Inspect disabled resource/knowledge_base exclusion from AI/RAG flows.
- Expected results:
  - New sessions are blocked for archived/unavailable content.
  - Historical reports and mistake_book use snapshots but still enforce current authorization visibility.
  - Duplicate submit and illegal params return conflict/validation envelopes.
  - Disabled/archived/inactive states are visible in UI as clear states, not silent failures.
- Verification method:
  - Browser: targeted student/admin pages.
  - API/code: lifecycle actions under practices, mock-exams, papers, questions, materials, resources, authorizations.
  - Tests: split follow-up scan tasks should add no code but may run existing unit/e2e gates.
- Risks:
  - Some states may require local setup not currently exposed by UI; record as gap rather than changing runtime in scan tasks.

## Browser Verification Plan

- Start local dev server only if not already running.
- Use localhost routes only.
- Prefer existing Playwright coverage as a starting point, then perform targeted manual browser actions for missing scenarios.
- Evidence may record route names, test ids, status names, counts, and public identifiers when needed.
- Evidence must not record passwords, session tokens, Authorization headers, generated redeem_code plaintext, raw prompt, raw answer, raw model response, raw provider payload, full paper, full textbook, OCR full text, or customer-like private content.

## Code Cross-Check Paths

- Student: `src/features/student/**`, `src/app/(student)/**`, `src/app/api/v1/student-papers/**`, `src/app/api/v1/practices/**`, `src/app/api/v1/mock-exams/**`, `src/app/api/v1/exam-reports/**`, `src/app/api/v1/mistake-books/**`.
- Admin: `src/features/admin/**`, `src/app/(admin)/**`, `src/app/api/v1/users/**`, `organizations/**`, `org-auths/**`, `redeem-codes/**`, `questions/**`, `materials/**`, `papers/**`, `resources/**`, `knowledge-nodes/**`.
- AI/RAG/redaction: `src/app/api/v1/model-providers/**`, `model-configs/**`, `prompt-templates/**`, `audit-logs/**`, `ai-call-logs/**`, `src/server/services/*ai*`, `src/server/services/*model*`, `src/server/services/*rag*`.
- Tests: `e2e/**`, `tests/unit/**`.

## Risk Defenses

- Script planning is docs-only; actual scan tasks must close separately.
- Do not modify runtime/UI/test code in scan tasks unless a later registered queue item explicitly permits it.
- Do not modify dependency, env, schema, migration, or scripts.
- Any real provider/cloud/staging/prod/deploy need pauses for approval.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Sensitive Information Red Lines

- Do not read, modify, or output `.env.local` or `.env.example`.
- Do not connect to provider/cloud/staging/prod or deploy.
- Do not record secrets, tokens, Authorization headers, database URLs, generated redeem_code plaintext, raw provider payloads, raw prompts, raw answers, raw model responses, full教材, full试卷, OCR full text, or customer-like private data.
