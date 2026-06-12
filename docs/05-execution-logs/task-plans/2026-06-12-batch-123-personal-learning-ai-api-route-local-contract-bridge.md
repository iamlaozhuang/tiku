# Task Plan: batch-123-personal-learning-ai-api-route-local-contract-bridge

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-12-seed-next-personal-learning-ai-product-tasks.md`
- `src/app/api/v1/personal-ai-generation-requests/route.ts`
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`
- `src/server/services/personal-ai-generation-local-browser-experience-service.ts`

## Goal

Bridge the existing personal AI generation local browser experience read-model into the approved REST route-service
contract without provider calls, persistence, schema changes, UI, or e2e edits.

## Scope

Allowed:

- `src/app/api/v1/personal-ai-generation-requests/route.ts`
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan, evidence, and audit review

Blocked:

- `src/features/**`, `e2e/**`, repositories, mappers, schema, migrations, env/secret, provider calls, generated-content
  write paths, dependency/package/lockfile changes, deploy, payment, external-service, PR, force-push, and Cost
  Calibration Gate.

## Implementation Plan

1. Add a focused RED unit test to `personal-ai-generation-request-route.test.ts` proving the route can return the
   `localBrowserExperience` read-model when the request body asks for it.
2. Verify RED with:
   `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts`
3. Implement the minimal route-service branch:
   - merge resolver `userPublicId` exactly as the existing request contract does;
   - select the local browser experience read-model only when an explicit camelCase request flag is present;
   - otherwise keep the current redacted request contract behavior unchanged.
4. Verify GREEN with the same focused unit command.
5. Run lint, typecheck, full unit, build, diff, pre-commit hardening, module closeout readiness, and pre-push readiness.

## Risk Controls

- No provider runtime, persistence, schema, migration, formal generated-content write path, UI, or e2e edits.
- Response stays in the standard `{ code, message, data }` envelope.
- JSON fields stay camelCase and use public ids only.
- Cost Calibration Gate remains blocked.
