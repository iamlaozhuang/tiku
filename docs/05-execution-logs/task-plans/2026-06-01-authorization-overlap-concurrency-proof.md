# Authorization Overlap Concurrency Proof Plan

## Task

- Task id: `phase-21-authorization-overlap-concurrency-proof`
- Branch: `codex/phase-21-authorization-overlap-concurrency-proof`
- Kind: implementation with TDD unless investigation proves a blocked gate is required.

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
- `transaction_concurrency`
- `authorization`
- `data_contract`
- `local_human_verification`
- `evidence_integrity`

## Goal

Prove only the `authorization` / `org_auth` overlap write path. The overlap dimensions must include:

- `organization`
- `auth_scope_type`
- `profession`
- `level`
- effective date range

If the current code cannot prove concurrency safety without schema or migration changes, stop and report instead of expanding scope.

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
- employee import, redeem_code, model config, and other write paths
- staging/prod/cloud/deploy/real provider/external service
- destructive data operations
- force push

## TDD / Stop Plan

1. Inspect existing org_auth service/repository/validators/tests for overlap checks and transaction semantics.
2. If existing code has a transaction or compare-and-update boundary that can be proven locally, add a failing test for the missing proof first.
3. Implement only the minimal behavior needed to prove overlap rejection across the required dimensions.
4. If a schema uniqueness constraint, lock column, migration, or database-specific isolation change is required, stop and record the blocked gate instead of changing code.

## Validation Commands

- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
