# Phase 24 Safe Local Dev Bootstrap Runner Task Plan

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/05-execution-logs/audits-reviews/2026-06-01-phase-24-fresh-validation-orchestration-design.md`

## Scope

- Task id: `phase-24-safe-local-dev-bootstrap-runner`
- Branch: `codex/phase-24-fresh-validation-operationalization`
- Create:
  - `scripts/local/Invoke-FreshValidationRun.ps1`
  - `tests/unit/fresh-validation-runner.test.ts`
- Modify:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - this task plan
  - task evidence
- Blocked:
  - `.env.example`
  - `package.json`
  - lockfiles
  - `src/**`
  - `src/db/schema/**`
  - `drizzle/**`

## TDD Steps

1. Add a Vitest test that invokes the planned PowerShell runner against a temporary env file.
2. Verify RED with `npm.cmd run test:unit -- tests/unit/fresh-validation-runner.test.ts`; expected failure is missing runner file or missing behavior.
3. Implement the minimal runner:
   - validate databaseName prefix;
   - parse `.env.local` without printing it;
   - classify loopback host;
   - rewrite only URL databaseName;
   - support `-PlanOnly` for tests;
   - run the approved command chain when not in plan-only mode.
4. Verify GREEN with the same targeted unit command.
5. Run task gates: `npm.cmd run test:unit`, `git diff --check`, naming conventions.

## Risk Gate

- Dependency change: blocked.
- Database migration: script can call existing reviewed migrate only when executed outside `-PlanOnly`.
- Secret or environment change: limited to approved `.env.local` databaseName rewrite; tests use temporary files.
- Destructive data operation: blocked.
- Deploy or external service: blocked.

## Evidence

- Evidence path: `docs/05-execution-logs/evidence/2026-06-01-phase-24-safe-local-dev-bootstrap-runner.md`
