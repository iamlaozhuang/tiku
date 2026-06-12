# Task Plan: batch-125-personal-learning-ai-redacted-reference-display-integration

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-12-batch-122-personal-learning-ai-redacted-ai-call-log-reference.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-124-personal-learning-ai-student-local-request-entry-ui.md`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `tests/unit/student-personal-ai-generation-ui.test.ts`
- `src/server/contracts/personal-ai-generation-local-browser-experience-contract.ts`
- `src/server/contracts/personal-ai-generation-request-flow-contract.ts`
- `src/server/contracts/personal-ai-generation-result-reference-contract.ts`

## Goal

Integrate the existing redacted personal AI result/reference DTO into the student local AI page so the UI displays
summary-only reference metadata: result public id, task public id, ai_call_log public reference, evidence status,
citation count, content visibility, and redaction status. The display must not render raw prompt text, raw generated
content, provider payloads, numeric ids, full paper content, tokens, or headers.

## Scope

Allowed:

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

1. Add a focused RED unit assertion proving the current page does not yet render the redacted result/reference summary
   from camelCase local DTO fields.
2. Extend the UI summary in `StudentPersonalAiGenerationPage` with a small redacted reference block that reads from
   `experience.resultState` and `experience.requestFlow.resultReference`.
3. Render null-aware values as the literal `null` string while preserving public-id-only visibility.
4. Add unit assertions that raw prompt, raw generated content, provider payload, numeric ids, full paper content, and
   the session token do not appear in the DOM.
5. Run focused GREEN, lint, typecheck, full unit, build, diff, e2e list, full e2e, closeout, and pre-push gates.

## Risk Controls

- No provider execution, no generated content storage, and no formal content path changes.
- No API route, repository, mapper, schema, migration, env, dependency, or e2e spec edits.
- Use existing DTO fields instead of introducing a new client contract.
- Keep UI token-driven and preserve existing loading, empty, error, unauthorized, and blocked states.
- Cost Calibration Gate remains blocked.
