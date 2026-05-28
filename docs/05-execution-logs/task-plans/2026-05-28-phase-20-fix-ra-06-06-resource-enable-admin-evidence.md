# Phase 20 Fix RA-06-06 Resource Enable Admin Evidence Plan

**Task id:** `phase-20-fix-ra-06-06-resource-enable-admin-evidence`

**Branch:** `codex/phase-20-fix-ra-06-06-resource-enable-admin-evidence`

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/evidence/phase-20-fix-ra-05-05-resource-enable-restore-state.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-06-admin-ops-logs-permissions.md`

## Scope

- Add admin resource UI evidence for the low-risk enable/restore action introduced by RA-05-05.
- Keep route-facing identifiers publicId-only.
- Add unit/browser-style coverage for the admin resource page enable action, confirmation, toast, and safe fetch boundary.
- Update task plan, evidence, project-state, and task queue.

## Risk Boundaries

- No `.env.local` or `.env.example` access or edits.
- No dependency, package manifest, or lockfile changes.
- No schema, migration, Drizzle, staging, prod, cloud, deploy, provider, auth permission model, or destructive data operations.
- Persistent ops_admin login caveats must remain explicit if not fully covered by automated local browser evidence.

## Implementation Approach

1. Extend the resource management component with a disabled-resource enable action and confirmation dialog.
2. Wire the action to `POST /api/v1/resources/{publicId}/enable` using existing admin auth header helpers.
3. Extend existing admin content/knowledge unit tests to verify the enable button, confirmation, API call, state update, and success toast.
4. Run focused tests, full unit tests, build/e2e, readiness, naming, Git inventory, diff check, and quality gate.

## Residual Gap Policy

- This task closes the resource enable admin UI evidence gap only for local automated coverage.
- It does not claim full manual ops_admin session evidence beyond the local e2e/browser gates actually run.
