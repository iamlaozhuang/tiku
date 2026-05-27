# Phase 20 Fix RA-06-05 Redeem Code Detail View Plan

**Task id:** `phase-20-fix-ra-06-05-redeem-code-detail-view`

**Branch:** `codex/phase-20-fix-ra-06-05-redeem-code-detail-view`

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-21-implementation-plan-breakdown.md`
- `docs/05-execution-logs/evidence/2026-05-27-phase-21-implementation-plan-breakdown.md`

## Finding

`F-RA-06-05-001`: `redeem_code` batch generation, deadline normalization, filters, generated plaintext response, and redacted audit logs already exist. The remaining gap is dedicated detail-view evidence for `redeem_code`.

## Scope

Allowed by `phase20_ra06_allowed_files`:

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
- package and lock files
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

## Implementation Approach

1. Keep the existing `/ops/redeem-codes` and `/api/v1/redeem-codes` boundaries.
2. Add a local admin detail view on the `redeem_code` page using existing list DTO fields, without exposing numeric `id`, `code_hash`, or plaintext values outside the existing generation-only response.
3. Add focused unit coverage proving the detail view is visible, public-id based, and redaction-safe.
4. Add e2e/browser evidence for the detail panel when local runtime data has at least one `redeem_code` row; keep evidence redacted.
5. Update queue/project-state/evidence through the task lifecycle.

## Risk Defense

- No auth permission-model change.
- No schema, migration, or Drizzle change.
- No dependency, package, or lockfile change.
- No secret/env read or `.env.example` change.
- No staging/prod/cloud/deploy/real provider/destructive operation.
- Evidence must not record plaintext `redeem_code` values except the already tested generation-only runtime behavior; this task will record only masked display and public identifiers.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-06-05-redeem-code-detail-view`
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
- changed-file Prettier check
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `npm.cmd run build` because this touches frontend behavior.
