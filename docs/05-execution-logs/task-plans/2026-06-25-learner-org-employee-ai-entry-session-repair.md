# Task Plan: learner-org-employee-ai-entry-session-repair-2026-06-25

## Task Identity

- Task id: `learner-org-employee-ai-entry-session-repair-2026-06-25`.
- Branch: `codex/learner-org-ai-entry-session-repair-20260625`.
- Source: current user-directed serial task 3.
- Selected repair scope: learner/org employee AI entry and login-state misclassification.
- Non-claim: this task must not declare Standard MVP or Advanced MVP final Pass.

## Required Reading

- `AGENTS.md`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`.
- `docs/05-execution-logs/evidence/2026-06-25-role-separated-post-org-admin-repair-gap-refresh-no-final-pass.md`.
- `docs/05-execution-logs/acceptance/2026-06-25-role-separated-full-8-row-post-org-admin-repair-rerun-scope-package.md`.

## Minimal Scope Decision

Task 1 identified `learner/org employee AI entry and login-state misclassification repair` as the first minimal source repair candidate. Task 2 requires future browser evidence to treat `org_advanced_employee` `/ai-generation` as a logged-in organization-context or safe Provider-gated surface, not as an unauthenticated route.

This task repairs only the local contract/session classification path:

- keep personal advanced learner `/ai-generation` behavior intact;
- stop resolving employee sessions as `401001` on the AI request/result route;
- make the local AI request body and read model carry explicit personal vs organization authorization context;
- keep organization employee persistence conservative by not extending DB/schema behavior;
- keep browser rerun blocked.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-25-learner-org-employee-ai-entry-session-repair.md`
- `docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-ai-entry-session-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-learner-org-employee-ai-entry-session-repair.md`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `tests/unit/student-personal-ai-generation-ui.test.ts`
- `src/server/contracts/personal-ai-generation-request-contract.ts`
- `src/server/models/ai-generation-task-request.ts`
- `src/server/models/personal-ai-generation-request.ts`
- `src/server/models/personal-ai-generation-request-flow.ts`
- `src/server/services/personal-ai-generation-request-context-service.ts`
- `src/server/services/personal-ai-generation-request-context-service.test.ts`
- `src/server/services/personal-ai-generation-request-flow-service.test.ts`
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`
- `src/server/services/personal-ai-generation-result-route.ts`
- `src/server/services/personal-ai-generation-result-route.test.ts`
- `src/server/services/ai-generation-task-request-service.test.ts`
- `src/server/validators/personal-ai-generation-request.ts`
- `src/server/validators/personal-ai-generation-request.test.ts`

## Blocked Scope

- Browser, Playwright, e2e runtime, dev server.
- DB reads/writes, seed, schema, migration, `drizzle-kit`.
- `.env*`, credentials, tokens, cookies, localStorage dumps, credential files.
- Provider/model call or Provider configuration.
- Cost Calibration, staging/prod/cloud/deploy, payment, external service.
- Package or lockfile changes.
- PR, force push, final Standard/Advanced MVP Pass.

## TDD Plan

1. Add RED tests proving employee sessions are not classified as unauthenticated on the AI request/result routes and that the learner AI page submits an organization-context local contract body for employee sessions.
2. Implement the smallest server/client changes to pass those tests.
3. Run focused unit tests for touched AI contract surfaces.
4. Run `lint`, `typecheck`, `git diff --check`, scoped Prettier, and Module Run v2 hardening/pre-push gates.

## Risk Defense

- No schema or repository ownership migration is included.
- Organization-context local browser requests stay local-contract only and do not write formal `question` or `paper`.
- Evidence records command/result summaries only and excludes credentials, tokens, raw provider payloads, and generated AI content.
