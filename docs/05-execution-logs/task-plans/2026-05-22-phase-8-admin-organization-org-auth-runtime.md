# Phase 8 Admin Organization Org Auth Runtime Task Plan

## Metadata

- Task id: `phase-8-admin-organization-org-auth-runtime`
- Branch: `codex/phase-8-admin-organization-org-auth-runtime`
- Base: `master`
- Date: `2026-05-22`

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/02-architecture/interfaces/phase-8-product-surface-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-22-phase-8-student-mistake-book-ui.md`

## Scope

Allowed files follow the queue entry:

- `src/app/api/v1/organizations/**`
- `src/app/api/v1/org-auths/**`
- `src/app/api/v1/employees/**`
- `src/server/auth/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- task plan, evidence, security review, project state, and task queue files.

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `drizzle/**`

## Implementation Approach

1. Use TDD with a focused Phase 8 admin runtime test before production code.
2. Add an admin organization/org_auth/employee runtime route boundary that uses the existing local admin session runtime.
3. Implement read-only runtime for:
   - `GET /api/v1/organizations`
   - `GET /api/v1/org-auths`
   - `GET /api/v1/employees`
4. Keep mutation routes authenticated but intentionally unavailable in this slice:
   - organization create/update/disable
   - org_auth create/cancel
   - employee account create
5. Add a Postgres repository for the read-only lists using existing Drizzle schema and public-id-only DTO mapping.
6. Do not add dependencies, schema changes, migrations, external providers, production credentials, or browser/E2E changes.

## Risk Defense

- Auth/session: every route resolves the current admin through `createLocalSessionRuntime`; no route reads admin data without a valid admin session.
- Permission: only `super_admin` and `ops_admin` can read this admin runtime slice; `content_admin` receives permission denied.
- Data exposure: DTOs use public identifiers only and never expose numeric `id`, auth user ids, password hashes, session tokens, or secrets.
- Mutation boundary: mutation endpoints remain safe placeholders returning standard 503 responses after auth. Because no mutation is executed, no new audit_log write is produced in this slice; this will be recorded in evidence and security review.
- Query shape: repository methods batch related counts/public ids rather than querying inside row loops.
- Dependency boundary: no dependency, lockfile, env example, schema, migration, or `drizzle/**` edits.

## Validation Plan

- Focused RED test:
  `npm.cmd run test:unit -- tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts`
- Focused GREEN test:
  `npm.cmd run test:unit -- tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts`
- Required gates:
  `npm.cmd run test:unit`
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
  `npm.cmd run build`
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

`npm.cmd run test:e2e` is not planned because this task does not modify browser flows or E2E files.
