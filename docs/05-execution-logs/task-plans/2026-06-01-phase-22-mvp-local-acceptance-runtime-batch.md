# Phase 22 MVP Local Acceptance Runtime Batch Plan

## Scope

- Batch id: `phase-22-mvp-local-acceptance-runtime-batch`.
- Branch: `codex/phase-22-mvp-local-acceptance-runtime-batch`.
- Parent task for the newly approved local/dev runtime verification batch.
- Do not reuse historical blocked or closed tasks.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- Latest evidence: `docs/05-execution-logs/evidence/2026-06-01-phase-22-mvp-local-acceptance-reaudit-planning.md`

## Child Tasks

1. `phase-22-runtime-preflight`
2. `phase-22-local-app-boot-smoke`
3. `phase-22-auth-session-smoke`
4. `phase-22-admin-mvp-smoke`
5. `phase-22-student-mvp-smoke`
6. `phase-22-ai-scoring-persistence-smoke`
7. `phase-22-fresh-db-readiness-assessment`
8. `phase-22-evidence-consolidation`

## Execution Strategy

- Run child tasks in dependency order.
- Use stop-the-line: if a failure blocks dependent core paths, record evidence and mark downstream dependent tasks blocked.
- Use only local/dev app loading through existing app/scripts.
- Use existing npm scripts and existing Playwright/Vitest tests.
- Keep evidence redacted.

## Forbidden Scope

- No `.env.local` read, print, copy, edit, commit, or value capture.
- No `.env.example`, package/lockfile, dependency, script, source, test, e2e, schema, or drizzle change.
- No DB reset, destructive data operation, raw SQL, `drizzle-kit push`, migration table repair, staging/prod/cloud/deploy, real provider, external service, force push, unknown worktree deletion, or unmerged branch deletion.

## Validation

- Child-specific commands.
- `git diff --check`
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `Test-AgentSystemReadiness.ps1`
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `Test-NamingConventions.ps1`
- `Invoke-QualityGate.ps1`
