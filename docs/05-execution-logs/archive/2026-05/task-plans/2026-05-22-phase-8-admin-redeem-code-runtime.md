# Phase 8 Admin Redeem Code Runtime Task Plan

## Metadata

- Task id: `phase-8-admin-redeem-code-runtime`
- Branch: `codex/phase-8-admin-redeem-code-runtime`
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
- `docs/05-execution-logs/evidence/2026-05-22-phase-8-admin-organization-org-auth-runtime.md`

## Scope

Allowed files follow the queue entry:

- `src/app/api/v1/redeem-codes/**`
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

1. Use TDD with a focused Phase 8 admin `redeem_code` runtime test before production code.
2. Replace `GET /api/v1/redeem-codes` unavailable admin baseline with a real read-only runtime handler.
3. Reuse the existing local admin session runtime; require an authenticated admin session before returning card code data.
4. Allow only admin roles that can view operational authorization data (`super_admin` and `ops_admin`); deny `content_admin`.
5. Add a Postgres repository for paginated `redeem_code` listing with optional keyword/status filtering and public-id-only DTO mapping.
6. Always return masked `codeDisplay` and `canViewPlainText: false`; never return `code_hash`, raw code text, session tokens, password hashes, auth user ids, or numeric database ids.
7. Keep this slice read-only. If generation, cancellation, or disable behavior is still not represented by existing route/schema boundaries, record it as deferred in evidence and security review.
8. Do not add dependencies, schema changes, migrations, external providers, production credentials, or browser/E2E changes.

## Risk Defense

- Auth/session: `GET /api/v1/redeem-codes` resolves the current admin through `createLocalSessionRuntime`; missing or invalid sessions receive a standard `401001` response.
- Permission: only `super_admin` and `ops_admin` can read the admin `redeem_code` list; `content_admin` receives `403601`.
- Data exposure: DTOs use `publicId`, `redeemedUserPublicId`, and masked `codeDisplay` only. Numeric ids and sensitive fields stay inside the repository.
- Audit boundary: this slice is read-only and does not mutate `redeem_code`, so it does not write `audit_log`. Future generate/cancel/disable routes must add audit writes before activation.
- Query shape: repository uses bounded paginated queries and a batched user public id lookup for redeemed codes.
- Dependency boundary: no dependency, lockfile, env example, schema, migration, or `drizzle/**` edits.

## Validation Plan

- Focused RED test:
  `npm.cmd run test:unit -- tests/unit/phase-8-admin-redeem-code-runtime.test.ts`
- Focused GREEN test:
  `npm.cmd run test:unit -- tests/unit/phase-8-admin-redeem-code-runtime.test.ts`
- Required gates:
  `npm.cmd run test:unit`
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
  `npm.cmd run build`
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

`npm.cmd run test:e2e` is not planned because this task does not modify browser flows or E2E files.
