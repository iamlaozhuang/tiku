# organization-training-admin-source-context-ui-response-key-contract-repair

## Scope

Repair the admin organization-training source-context UI response-key contract so the UI consumes the runtime route's successful `data.context` response and no longer treats a successful source-context attachment as a failure.

## Approval Boundary

- User approved creating and executing `organization-training-admin-source-context-ui-response-key-contract-repair` in the current 2026-06-18 prompt.
- Allowed edits: admin organization-training UI, related unit/e2e coverage, coverage matrix, project-state, task-queue, and task plan/evidence/audit.
- Required rerun: `npm.cmd run test:e2e -- e2e/organization-training-local-full-flow.spec.ts`.
- Blocked: `.env*`, schema/drizzle/migration, package/lockfile/dependency changes, provider/model, staging/prod/cloud/deploy/payment/external-service, PR, force-push, destructive database operations, and Cost Calibration Gate.
- Closeout is not approved for this task: no local commit, merge, push, or short-branch cleanup.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-monolith-modular-boundary.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-auth-session-and-permission-boundary.md`
- `docs/02-architecture/adr/adr-005-exam-paper-import-pipeline.md`
- `docs/02-architecture/adr/adr-006-ai-provider-cost-and-quota-control.md`

## TDD Plan

1. RED: change/add the admin entry-surface unit test so the mocked source-context route returns `data.context`, matching `src/server/services/organization-training-route.ts`.
2. Verify the current UI fails the focused unit test because it still reads `data.attachment`.
3. GREEN: update `AdminOrganizationTrainingPage` to consume `response.data.context.sourceContexts`.
4. Re-run the focused unit test and the scoped local full-flow.
5. Update evidence, audit, coverage matrix, project-state, and task-queue with the actual local result.

## Risk Controls

- Keep response envelope `{ code, message, data }` unchanged.
- Do not add compatibility aliases such as `attachment`; the route contract already exposes `context`.
- Keep source-context handling metadata-only and avoid displaying internal IDs, secrets, tokens, standard answers, or analysis.
- Do not claim `experience_closed`; a separate closure readiness audit remains required after green full-flow evidence.
