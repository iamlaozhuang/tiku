# Admin Permission Boundary Review Plan

## Task

- Task id: `phase-21-admin-permission-boundary-review`
- Branch: `codex/phase-21-admin-permission-boundary-review`
- Kind: implementation with TDD.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-21-high-risk-tail-contract.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`

## Human Approval

Approved risk types:

- `admin_ops`
- `authorization`
- `auth_permission_model` only for minimal behavior changes needed to prove or fix existing permission boundaries
- `data_contract`
- `local_human_verification`
- `evidence_integrity`

## Goals

- Prove admin high-risk operation permission boundaries for `super_admin`, `ops_admin`, and `content_admin`.
- Prove denial for non-admin, disabled, or permissionless users.
- Prove `publicId` tampering cannot bypass service-level authorization.
- Preserve API response envelope `{ code, message, data, pagination? }`.
- Preserve camelCase JSON and external `publicId` only; no internal auto-increment `id` exposure.

## Scope

Allowed:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `src/server/services/**`
- `src/server/repositories/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/validators/**`
- `src/app/api/v1/**`
- `tests/**`
- `e2e/**`

Blocked:

- `.env.local`
- `.env.example`
- package and lockfile changes
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`
- staging/prod/cloud/deploy/real provider/external service
- destructive data operations
- force push

## TDD Plan

1. Inspect existing admin services, contracts, routes, and tests for permission checks and public identifier handling.
2. Add focused failing unit tests for the smallest permission boundary gap found.
3. Confirm RED failure for the intended reason.
4. Implement the minimal service/route/contract change needed to pass.
5. Run focused unit tests, then full task validation.
6. If existing code already satisfies the boundary, add proof tests only after confirming they fail against a deliberately missing or uncovered assertion path; do not make behavior changes without a failing test.

## Security Review Plan

Security review is required because this task touches admin permission boundaries and authorization behavior. Review artifact:

- `docs/05-execution-logs/audits-reviews/2026-06-01-admin-permission-boundary-review-security-review.md`

## Validation Commands

- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`

## Stop Conditions

- Stop if proving the boundary requires schema, migration, dependency, env, scripts, deployment, real provider, or destructive data work.
- Stop if permission changes would expand beyond the approved admin boundary proof.
