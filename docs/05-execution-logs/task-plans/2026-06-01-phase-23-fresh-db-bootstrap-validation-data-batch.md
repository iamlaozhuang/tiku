# Phase 23 Fresh DB Bootstrap And Validation Data Implementation Batch Plan

## Scope

- Register and execute a new serial batch approved by the user on 2026-06-01.
- Target: fresh migrated local/dev DB -> dev seed/bootstrap -> validation data prep -> full e2e first pass -> build and quality gates.
- Keep the mechanism minimal, auditable, rerunnable, and synthetic-data only.

## Read Standards

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
- Latest Phase 22 evidence under `docs/05-execution-logs/evidence/2026-06-01-phase-22-*.md`

## Serial Tasks

1. `phase-23-implementation-preflight-approval-boundary`
2. `phase-23-dev-seed-gap-closure`
3. `phase-23-validation-data-prep-mechanism`
4. `phase-23-fresh-db-first-run-e2e-validation`
5. `phase-23-e2e-order-data-isolation-hardening-assessment`
6. `phase-23-evidence-consolidation-closeout`

## Guardrails

- Do not modify `.env.example`, package or lock files, dependencies, schema, migrations, or `drizzle/**`.
- Do not run raw SQL, `drizzle-kit push`, migration table repair, DB reset/drop/truncate/delete, volume reset, or destructive data operations.
- Do not use staging/prod/cloud/deploy/real provider/external service.
- Do not record DB URLs, credentials, tokens, provider payloads, raw prompts, raw student answers, raw model responses, or plaintext `redeem_code`.
- Stop the line if implementation requires dependency, schema/migration, destructive DB, or forbidden env changes.

## Validation Strategy

- Unit tests around seed/prep logic where changed.
- Existing or new local/dev prep command with redacted evidence.
- Full `npm.cmd run test:e2e`.
- `npm.cmd run build`.
- Local CI/readiness/naming/quality gates and `git diff --check`.
