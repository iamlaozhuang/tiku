# Phase 20 Fix RA-06-04 Org Auth Detail Route Alignment

## Task

- id: `phase-20-fix-ra-06-04-org-auth-detail-route-alignment`
- branch: `codex/phase-20-fix-ra-06-04-org-auth-detail-route-alignment`
- source: `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-06-admin-ops-logs-permissions.md#findings`
- finding: `F-RA-06-04-001`
- scope: local `org_auth` detail route, API DTO, UI, test, and evidence alignment.

## Startup Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`

## Human Approval

User approved claiming the recommended task and approved the required `auth_permission_model` and `api_contract` risks for this local-only task. User also authorized task commit, merge into `master`, push `origin/master`, and short-lived branch cleanup after successful validation.

## Boundaries

Allowed:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `src/**`
- `tests/**`
- `e2e/**`

Blocked:

- `.env.local`
- `.env.example`
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`
- staging/prod/cloud/deploy/real provider/destructive data operation

## TDD Plan

1. Inspect existing `org_auth` list/detail contracts, route handlers, admin organization UI, and tests.
2. Add a focused failing unit test for `org_auth` detail alignment:
   - detail route/API exists and returns `{ code, message, data, pagination? }`;
   - DTO JSON keys are camelCase;
   - external DTO/URL expose `publicId` references only, not numeric `id`;
   - detail includes organization, authorization scope, occupancy/employee evidence needed by the admin UI;
   - unauthorized role is denied server-side.
3. Run the focused test and record the expected RED failure.
4. Implement the smallest route/service/contract/UI changes within existing patterns.
5. Re-run focused and adjacent admin ops tests.
6. Run required local gates, including unit, e2e, readiness, naming, format, diff check, and build when relevant.
7. Complete a `Security Review` section in evidence before merge.

## Risk Controls

- Keep all REST responses in `{ code, message, data, pagination? }`.
- Keep JSON fields camelCase.
- Use `publicId` in external routes and DTOs; do not expose numeric auto-increment ids.
- Enforce authorization in server runtime, not only in UI.
- Do not touch schema, migrations, dependencies, env files, cloud/deploy, real providers, or destructive data operations.
- Keep audit/evidence redaction-safe.
