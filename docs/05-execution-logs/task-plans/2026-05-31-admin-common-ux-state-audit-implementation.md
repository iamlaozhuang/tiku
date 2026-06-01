# Admin Common UX State Audit Implementation Task Plan

## Task

- Task id: `phase-21-admin-common-ux-state-audit-implementation`
- Branch: `codex/phase-21-admin-common-ux-state-audit-implementation`
- Scope: fresh Phase 21 implementation task for a small shared admin UX state slice.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-21-high-risk-tail-contract.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`

## Fresh Task Rule

This implementation is registered as a fresh task. It does not claim historical `phase-21-tail-admin-common-ux-state-audit`, which remains `closed` with `closureDecision: deferred` and is not treated as complete.

## Approved Risk Types

- `admin_ops`
- `browser_runtime`
- `local_human_verification`
- `evidence_integrity`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `src/app/(admin)/**`
- `src/app/api/v1/**`
- `src/components/admin/**`
- `src/features/admin/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/**`
- `e2e/**`

## Blocked Files And Actions

- `.env.local`
- `.env.example`
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`
- staging/prod/cloud/deploy/real provider/external service work
- destructive data operation
- force push

## Implementation Slice

Keep this deliberately small:

1. Add failing unit coverage for shared admin loading, empty, error, and permission-denied state semantics.
2. Harden the shared admin state components so browser and assistive technology can distinguish `status` and `alert` states.
3. Verify the states remain redaction-safe and do not expose numeric internal ids, secrets, raw prompt/answer/model/provider payload markers, or database URLs.

No permission model behavior, schema, migration, dependency, route contract, or environment behavior changes are in scope.

## TDD Plan

- RED: add a focused unit test for shared admin state roles, `data-admin-ux-state`, and redaction boundaries.
- GREEN: update shared admin state components in `src/features/admin/content-admin-runtime.tsx`.
- REFACTOR: keep markup compact and preserve existing component APIs where possible.

## Security Review Plan

Security review will be recorded in the evidence file because this task includes `admin_ops`.

Review focus:

- Authentication/authorization behavior remains unchanged.
- Admin state UI does not reveal session tokens, secrets, raw AI data, provider payloads, database URLs, or internal numeric ids.
- API response contract is not changed.
- Public identifier handling remains unchanged.

## Validation Commands

- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
