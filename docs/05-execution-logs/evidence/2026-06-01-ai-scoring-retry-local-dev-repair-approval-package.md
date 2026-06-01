# AI Scoring Retry Local Dev Repair Approval Package Evidence

## Summary

- Result: pass; repair execution remains blocked.
- Scope: docs_only / blocked_gate.
- Changed surfaces: `project-state.yaml`, `task-queue.yaml`, this task plan, this evidence, and security review.
- Gates: `git diff --check` pass; prettier pass after scoped formatting; readiness pass; git completion readiness pass; naming pass; quality gate pass.
- Forbidden scope (`forbiddenScope`): `.env.local` not read; `.env.example`, package/lockfiles, dependencies, `scripts/**`, `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, and `drizzle/**` not modified; no DB connection, migration, raw SQL, reset/rebuild, migration table repair, staging/prod/cloud/deploy, real provider, external service, destructive data operation, force push, unknown worktree deletion, or unmerged branch deletion.
- Residual gaps (`residualGaps`): repair is not executed; human owner must choose and approve one repair path in a later task.

## Task Metadata

- Task id: `phase-21-ai-scoring-retry-local-dev-repair-approval-package`
- Branch: `codex/ai-scoring-retry-local-dev-repair-approval`
- Base: `master`
- Review date: 2026-06-01
- Security review path: `docs/05-execution-logs/audits-reviews/2026-06-01-ai-scoring-retry-local-dev-repair-approval-package-security-review.md`

## Evidence Basis

This approval package is based on existing docs/evidence only:

- `2026-05-31-ai-scoring-retry-persistence-local-migration.md` records that the local/dev DB was previously verified under separate approval, `drizzle-kit migrate` failed, `ai_scoring_attempt` and `ai_scoring_attempt_status` remained absent, and migration history drift was observed.
- `2026-06-01-ai-scoring-retry-local-dev-drift-readonly-audit.md` records that current live DB state was not rechecked because this batch did not approve `.env.local` read or DB connection.
- Current Git reality before this task: `master` and `origin/master` are aligned at `dbe7bf0219f39c5237d6a13b7d19124fbbab4e9f`.

## Option 1: Fresh Local/Dev Database Target

### Intent

Create or select a fresh empty local/dev database, point local configuration to it, and run the reviewed migration path from the repository without touching the drifted database.

### Required Future Approvals

- Read `.env.local` to verify current local/dev target and avoid staging/prod/shared cloud.
- Modify `.env.local` only if the human owner wants the app to point at the fresh database.
- Create or select a fresh local/dev database.
- Connect to local/dev database for read-only identity checks.
- Run `drizzle-kit migrate` against the fresh local/dev database.
- Run seed or local data bootstrap only if separately approved by the task.

### Risks

- Local developer data in the old drifted database is not carried over.
- App behavior may differ until local seed/bootstrap is run.
- Misconfigured `DATABASE_URL` could target the wrong DB unless identity checks are mandatory.

### Validation Commands

```powershell
git status --short --branch
git rev-list --left-right --count master...origin/master
node <approved-secret-safe-db-identity-check>
npx.cmd drizzle-kit migrate
node <approved-read-only-ai-scoring-attempt-verification>
npm.cmd run test:unit
npm.cmd run test:e2e
npm.cmd run build
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

### Rollback / Recovery Boundary

- Revert `.env.local` to the previous local/dev database target if it was changed.
- Drop the fresh local/dev database only after confirming it contains no needed data.
- No destructive operation touches the old drifted database.
- Staging/prod remain untouched.

## Option 2: Destructive Local Rebuild

### Intent

Reset or rebuild the existing local/dev database from the repository's migration and seed baseline after the human owner confirms the local data is disposable or backed up.

### Required Future Approvals

- Read `.env.local` and verify the target is local/dev only.
- Connect to DB for identity and backup/disposable-data confirmation.
- Destructive data operation approval for drop/recreate, truncate, volume reset, or equivalent local rebuild.
- Run `drizzle-kit migrate`.
- Run seed/bootstrap commands if needed and separately approved.

### Risks

- Existing local data is lost unless backed up first.
- If local dev DB contains manually created acceptance data, it must be exported or accepted as disposable before reset.
- Resetting the wrong target would be severe; identity checks and human confirmation are mandatory.

### Validation Commands

```powershell
git status --short --branch
git rev-list --left-right --count master...origin/master
node <approved-secret-safe-db-identity-check>
node <approved-local-data-disposability-or-backup-check>
<approved-local-only-reset-or-rebuild-command>
npx.cmd drizzle-kit migrate
node <approved-read-only-schema-and-migration-verification>
npm.cmd run test:unit
npm.cmd run test:e2e
npm.cmd run build
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

### Rollback / Recovery Boundary

- Restore from a verified local backup if one was taken.
- If no backup is required because the database is disposable, rollback means re-running migrations and seed/bootstrap.
- No staging/prod/cloud/deploy/provider work is included.

## Option 3: Non-Destructive Migration History Reconciliation

### Intent

Inspect the drifted local/dev database, compare live schema and `drizzle.__drizzle_migrations` against repository migrations, and propose a minimal non-destructive repair plan before executing any migration-table or schema correction.

### Required Future Approvals

- Read `.env.local` and verify target is local/dev only.
- Connect to DB for read-only inventory.
- Run read-only schema/migration history comparison.
- Approve exact repair plan before execution.
- If repair needs migration table correction, approve migration table repair explicitly.
- If repair needs raw SQL, approve exact raw SQL statements explicitly.
- If repair needs `drizzle-kit migrate`, approve migration execution explicitly after reconciliation.

### Risks

- Incorrectly marking migrations as applied can hide missing schema objects.
- Applying missing migrations to a partially drifted schema can fail or create inconsistent constraints.
- Raw SQL or migration table edits are high risk even in local/dev and must be reviewed line by line.

### Validation Commands

```powershell
git status --short --branch
git rev-list --left-right --count master...origin/master
node <approved-secret-safe-db-identity-check>
node <approved-read-only-migration-history-inventory>
node <approved-read-only-live-schema-inventory>
node <approved-repository-to-db-drift-report>
<approved-reviewed-repair-command-or-sql-if-any>
npx.cmd drizzle-kit migrate
node <approved-post-repair-read-only-verification>
npm.cmd run test:unit
npm.cmd run test:e2e
npm.cmd run build
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

### Rollback / Recovery Boundary

- Before any repair, capture an approved local backup or schema dump if the data is not disposable.
- Roll back by restoring the backup or reverting only the reviewed repair steps.
- Do not proceed if the drift report cannot identify a non-destructive path.
- Destructive fallback must switch to Option 2 with explicit destructive approval.

## Required Separate Approval Matrix

| Operation                                 | Requires later separate approval    |
| ----------------------------------------- | ----------------------------------- |
| Read `.env.local`                         | Yes                                 |
| Modify `.env.local`                       | Yes                                 |
| Connect to any DB                         | Yes                                 |
| Run read-only DB inventory                | Yes                                 |
| Run `drizzle-kit migrate`                 | Yes                                 |
| Run raw SQL                               | Yes, exact SQL required             |
| Reset/rebuild/drop/truncate local data    | Yes, destructive approval required  |
| Repair `drizzle.__drizzle_migrations`     | Yes                                 |
| Modify `src/db/schema/**` or `drizzle/**` | Yes                                 |
| Modify `src/**`, `tests/**`, or `e2e/**`  | Yes                                 |
| Staging/prod/cloud/deploy/real provider   | Yes, out of current local/dev scope |

## Recommendation

Prefer Option 1 if preserving current local data is not required. It avoids manual migration-table repair and keeps the drifted DB intact for later inspection.

Use Option 2 only when the human owner confirms the existing local/dev DB is disposable or backed up.

Use Option 3 only when preserving current local data matters enough to justify a slower, review-heavy repair path.

## Validation Commands

### `git diff --check`

Result: pass.

Output: no output.

### `node .\node_modules\prettier\bin\prettier.cjs --check ...`

Initial result: fail on this evidence file formatting.

Repair action: scoped Prettier write on `docs/05-execution-logs/evidence/2026-06-01-ai-scoring-retry-local-dev-repair-approval-package.md`. The first sandbox run hit `EPERM` reading local `node_modules`; escalated scoped write passed.

Final result: pass.

Output:

```text
Checking formatting...
All matched files use Prettier code style!
```

### `Test-AgentSystemReadiness.ps1`

Result: pass.

Key output:

```text
OK file: AGENTS.md
OK file: docs\03-standards\code-taste-ten-commandments.md
OK file: docs\04-agent-system\state\project-state.yaml
OK file: docs\04-agent-system\state\task-queue.yaml
OK npm script: lint
OK npm script: typecheck
OK npm script: test
OK npm script: test:unit
OK npm script: format:check
OK content: Phase 7 roadmap anchors
OK content: Phase 7 runtime slice anchors
OK content: phase transition mechanism gate
```

### `Test-GitCompletionReadiness.ps1 -BaseBranch master`

Result: pass.

Key output:

```text
branch: codex/ai-scoring-retry-local-dev-repair-approval
tracked changes: project-state.yaml, task-queue.yaml
untracked files: task plan, evidence, and security review for this task
result: git completion readiness inventory completed
```

### `Test-NamingConventions.ps1`

Result: pass.

Key output:

```text
sourceFiles: 311
OK banned terms absent
OK standalone section/option absent
OK route folders use kebab-case and public-id route params
OK contract DTO fields are camelCase
naming convention scan completed
```

### `Invoke-QualityGate.ps1`

Result: pass.

Key output:

```text
RUN npm script: lint
RUN npm script: typecheck
RUN npm script: test:unit
Test Files 153 passed (153)
Tests 631 passed (631)
RUN npm script: format:check
All matched files use Prettier code style!
```

## Declared Commands

```powershell
git diff --check
node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-01-ai-scoring-retry-local-dev-repair-approval-package.md docs\05-execution-logs\evidence\2026-06-01-ai-scoring-retry-local-dev-repair-approval-package.md docs\05-execution-logs\audits-reviews\2026-06-01-ai-scoring-retry-local-dev-repair-approval-package-security-review.md
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

## Git Closeout

- Commit: pending self-referential docs-only commit creation.
- Merge: pending merge to `master`.
- Push: pending push to `origin/master`, approved by the user's batch instruction.
- Cleanup: pending deletion of merged branch `codex/ai-scoring-retry-local-dev-repair-approval`; no worktree removal is expected because this task uses the primary worktree branch.
