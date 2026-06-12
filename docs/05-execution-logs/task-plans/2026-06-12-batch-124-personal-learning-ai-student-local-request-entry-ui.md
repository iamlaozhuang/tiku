# Task Plan: batch-124-personal-learning-ai-student-local-request-entry-ui

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/05-execution-logs/evidence/2026-06-12-seed-next-personal-learning-ai-product-tasks.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-121-personal-learning-ai-local-ui-browser-experience-for-request-and.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-122-personal-learning-ai-redacted-ai-call-log-reference.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-123-personal-learning-ai-api-route-local-contract-bridge.md`
- `src/features/student/studentRuntimeApi.ts`
- `src/features/student/home/StudentHomePage.tsx`
- `tests/unit/student-home-ui.test.ts`
- `src/server/contracts/personal-ai-generation-local-browser-experience-contract.ts`
- `src/server/models/personal-ai-generation-request.ts`

## Goal

Add a local-only student personal learning AI request entry page that can submit an approved camelCase public-id payload
to `/api/v1/personal-ai-generation-requests` and render the local browser experience contract summary without provider
calls, persistence, generated-content storage, dependency changes, schema changes, or e2e file edits.

## Scope

Allowed:

- `src/app/(student)/ai-generation/page.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/features/student/studentRuntimeApi.ts`
- `tests/unit/student-personal-ai-generation-ui.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan, evidence, and audit review

Blocked:

- `package.json`, lockfiles, schema, migrations, repositories, mappers, env/secret, provider calls, formal
  generated-content write paths, e2e file edits, Playwright generated artifacts, deploy, payment, external-service, PR,
  force-push, and Cost Calibration Gate.

## Implementation Plan

1. Write a focused RED unit test that renders the student request-entry UI, clicks the request action, and proves the
   POST body uses camelCase public identifiers plus `responseMode: "local_browser_experience"` without exposing the
   session token.
2. Add the minimal student route page and feature component.
3. Reuse `fetchStudentApi()` for authorization headers and standard response parsing.
4. Render explicit loading, empty, error, unauthorized, and permission-blocked states using existing token-driven
   Tailwind classes and local student UI patterns.
5. Verify GREEN with the focused unit command, then run lint, typecheck, full unit, build, diff, e2e list, full e2e,
   closeout, and pre-push gates.

## Risk Controls

- The UI sends only public ids and local context fields; it does not send numeric ids, tokens in body, raw prompts, raw
  generated content, provider payloads, or full paper content.
- The route may return unauthorized in the real app until a future auth/session resolver task is approved; this task
  only consumes the local route contract and renders blocked/error states.
- e2e execution is local-only validation evidence; no e2e specs or generated artifacts are committed.
- Cost Calibration Gate remains blocked.
