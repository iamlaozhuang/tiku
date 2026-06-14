# Task Plan: batch-177-personal-learning-ai-formal-adoption-implementation

## Scope

- Task: `batch-177-personal-learning-ai-formal-adoption-implementation`
- Branch: `codex/batch-177-personal-learning-ai-formal-adoption-implementation`
- Task kind: first implementation slice for formal generated-content adoption.
- Fresh approval: user prompt on 2026-06-14 approved a minimal manual review adoption gate only.

## Read Before Edits

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Recent execution records for batch-173, batch-174, batch-175, batch-176, and batch-179.

## Approved Implementation Boundary

- Implement a minimal admin-gated personal AI formal adoption review gate.
- Preserve a human review gate: no automatic adoption of AI generated content.
- Use existing admin roles only; no authorization model changes.
- Do not write formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` records in this slice.
- Do not modify schema, migrations, Drizzle schema, provider code/configuration, env/secret files, package files, lockfiles, deploy/payment/external-service surfaces, or e2e files.
- Do not read `.env.local`, `.env.*`, provider config, or real secret files.
- Stop and request secondary approval if schema/migration, provider/env, dependency, e2e, or formal table writes become necessary.

## Planned Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-177-personal-learning-ai-formal-adoption-implementation.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-177-personal-learning-ai-formal-adoption-implementation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-177-personal-learning-ai-formal-adoption-implementation.md`
- `src/server/models/personal-ai-generation-formal-adoption.ts`
- `src/server/contracts/personal-ai-generation-formal-adoption-contract.ts`
- `src/server/validators/personal-ai-generation-formal-adoption.ts`
- `src/server/repositories/personal-ai-generation-formal-adoption-repository.ts`
- `src/server/services/personal-ai-generation-formal-adoption-service.ts`
- `src/server/services/personal-ai-generation-formal-adoption-service.test.ts`
- `src/server/services/personal-ai-generation-formal-adoption-runtime.ts`
- `src/server/services/personal-ai-generation-formal-adoption-runtime.test.ts`
- `src/app/api/v1/personal-ai-generation-results/[publicId]/formal-adoption-reviews/route.ts`

## TDD Plan

1. Add failing service tests for non-admin denial, missing human review confirmation, invalid target rejection, missing source result rejection, and successful redacted manual review gate.
2. Add minimal model/contract/validator/service implementation to pass those tests.
3. Add failing runtime route tests for session-required, content-admin allowed, audit appended, and standard API response.
4. Add runtime route implementation and Next.js route export without reading env/secrets in tests.
5. Run focused tests, lint, typecheck, full unit tests, `git diff --check`, and Module Run v2 readiness scripts.

## Risk Controls

- API response remains `{ code, message, data }`.
- Response data includes public identifiers and redacted summaries only; no raw generated content, prompt, provider payload, provider response, raw generated output, token, secret, Authorization header, database URL, or row data.
- Formal target writes remain explicitly blocked in the response as a future-task boundary.
- `npm.cmd run build` is not planned because local Next.js build has previously reported loading `.env.local`.
