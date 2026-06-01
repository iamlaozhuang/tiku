# Phase 22 Fresh DB Seed Bootstrap Readiness Batch Plan

## Summary

- Task id: `phase-22-fresh-db-seed-bootstrap-readiness-batch`
- Branch: `codex/phase-22-fresh-db-seed-bootstrap-readiness`
- Scope: local/dev fresh DB seed/bootstrap readiness and e2e determinism evidence.
- Mode: serial batch, docs/state/evidence changes only.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- Latest recovery evidence: `docs/05-execution-logs/evidence/2026-06-01-phase-22-evidence-consolidation.md`

## Serial Children

1. `phase-22-fresh-db-seed-bootstrap-preflight`
2. `phase-22-validation-data-requirement-matrix`
3. `phase-22-existing-seed-bootstrap-capability-assessment`
4. `phase-22-e2e-order-data-isolation-diagnosis`
5. `phase-22-follow-up-implementation-gate-proposal`
6. `phase-22-fresh-db-e2e-determinism-evidence-consolidation`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

## Forbidden Scope

- Do not read, print, copy, modify, or commit `.env.local` values.
- Do not modify `.env.local`, `.env.example`, `package.json`, lockfiles, dependencies, `scripts/**`, `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, or `drizzle/**`.
- Do not run DB reset, destructive data operation, raw SQL, `drizzle-kit push`, migration table repair, staging/prod/cloud/deploy, real provider, external service, force push, unknown worktree deletion, or unmerged branch deletion.

## Validation Plan

- Run each child task's validation commands.
- Run closeout gates: `git diff --check`, `npm.cmd run test:unit`, `npm.cmd run test:e2e`, `npm.cmd run build`, readiness, git completion readiness, naming, and quality gate.
- Evidence must record pass/fail/blocked and any skipped runtime-only checks with reason.

## Risk Controls

- Stop-the-line if a child failure blocks downstream readiness judgment.
- If code/test/schema/script/dependency/env/seed implementation is required, stop and register blocked gate or follow-up task; do not implement.
- Evidence must not include DB URLs, credentials, provider payloads, raw prompts, raw student answers, raw model responses, or plaintext `redeem_code`.
