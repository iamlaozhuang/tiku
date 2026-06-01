# Admin Write Concurrency Proof Implementation Task Plan

## Task

- Task id: `phase-21-admin-write-concurrency-proof-implementation`
- Branch: `codex/phase-21-admin-write-concurrency-proof-implementation`
- Base: `master` at `c7d7e8fcef6890a6d9fddd3dc505aef9acbd2222`
- Scope: fresh implementation task for one write path only: `redeem_code` generation or duplicate-submit concurrency proof.

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
- `docs/05-execution-logs/task-plans/2026-05-31-admin-write-concurrency-proof-startup.md`
- `docs/05-execution-logs/evidence/2026-05-31-admin-write-concurrency-proof-startup.md`

## Human Approval

The user explicitly approved fresh implementation task: `Admin write concurrency proof implementation`.

Approved risk types:

- `admin_ops`
- `transaction_concurrency`
- `data_contract`
- `authorization`
- `local_human_verification`
- `evidence_integrity`

Preferred slice:

- `redeem_code` generation or duplicate-submit concurrency proof.

Stop rule:

- If existing code cannot prove `redeem_code` concurrency safety without schema changes, stop and report. Do not expand to `authorization` overlap or any other admin write path.

## Allowed Files

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

## Blocked Files And Actions

- No `.env.local` read or write.
- No `.env.example` change.
- No `package.json`, lockfile, dependency, CLI, SDK, or test framework change.
- No `src/db/schema/**` or `drizzle/**` change.
- No `scripts/**` change.
- No staging, prod, cloud, deploy, real provider, or external service work.
- No destructive data operation.
- No force push.
- No deletion of unknown worktrees or unmerged branches.

## Implementation Strategy

1. Inspect only the existing `redeem_code` admin generation route/service/repository/test surface.
2. Write a failing test first that proves duplicate submit or deterministic uniqueness handling.
3. Run the focused test and record the expected RED failure in evidence.
4. Implement the smallest service/repository change needed without schema or dependency changes.
5. Record the concurrency strategy in evidence:
   - existing unique index on `redeem_code.code_hash` and `public_id` may be used as the database uniqueness boundary;
   - retry-on-unique-conflict may be acceptable for random generated code collisions;
   - duplicate-submit idempotence requires an existing stable request key. If no such key exists and schema cannot be changed, do not invent broad idempotence.
6. Keep API responses in `{ code, message, data, pagination? }`.
7. Keep JSON fields camelCase and public-facing identifiers as `publicId` only.
8. Update the security review artifact before merge.

## Risk Defense

- Data contract: route/service tests must assert response envelope and camelCase fields where touched.
- Authorization: do not change role permissions unless explicitly necessary; if unchanged, record that no `auth_permission_model` behavior changed.
- Concurrency: prove one path with deterministic tests. If implementation relies on unique constraints and retry, record the exact compare/unique/retry boundary.
- Evidence integrity: no secrets, database URLs, raw customer data, raw code batches beyond synthetic test values, or provider payloads in evidence.
- Schema boundary: no new version, lock, idempotency, unique index, or migration file without separate `database_migration` approval.

## Validation Commands

- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`

## Commit And Closeout Plan

- Commit the completed implementation and evidence.
- Merge to `master`, push `master`, and clean the temporary branch only after validation and security review pass.
- Confirm no unmerged `codex/*` branch or unknown worktree remains.
