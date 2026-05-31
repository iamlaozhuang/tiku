# Phase 20 Fix RA-06-03 Organization Employee Management Completion

## Task

- id: `phase-20-fix-ra-06-03-organization-employee-management-completion`
- branch: `codex/phase-20-fix-ra-06-03-organization-employee-management-completion`
- source: `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-06-admin-ops-logs-permissions.md#findings`
- finding: `F-RA-06-03-001`
- scope: local organization and employee admin UI/runtime/test/evidence closure.

## Startup Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/02-architecture/interfaces/global-db-api-skeleton.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`

## Human Approval

User approved claiming this task and approved the required `auth_permission_model` risk for local-only organization/employee admin completion in this session. User also authorized task commit, merge into `master`, push `origin/master`, and short-lived branch cleanup after successful validation.

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

1. Add a focused failing unit test for the missing RA-06-03 behavior:
   - organization enable mutation is available and role-gated;
   - employee batch import returns an atomic validation summary and writes redacted audit metadata;
   - employee unbind is available, role-gated, uses public identifiers, and writes redacted audit metadata;
   - full organization detail includes org auth detail evidence without numeric ids in external DTOs.
2. Run the focused test and record the expected RED failure.
3. Implement the smallest service/repository/route/UI changes needed within existing patterns.
4. Re-run the focused test and broader required gates.
5. Attempt Browser plugin local verification for `/ops/organizations`; if Browser runtime is unavailable, record the failure and use the approved local fallback.
6. Complete a `Security Review` section in evidence before merge.

## Risk Controls

- Keep REST responses in `{ code, message, data, pagination? }`.
- Keep JSON keys camelCase and external references as `publicId`.
- Do not expose numeric auto-increment ids in URLs or DTOs.
- Do not touch schema, migrations, dependencies, env files, cloud/deploy, real providers, or destructive data operations.
- Keep authorization checks in service/runtime paths, not UI only.
- Keep audit metadata redaction-safe.
