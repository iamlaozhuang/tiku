# Task Plan: Advanced Edition Requirements Handoff Hardening

## Task

- Queue id: `phase-31-advanced-edition-requirements-handoff-hardening`
- Task kind: `docs_only`
- Branch: `codex/advanced-edition-requirements-handoff-hardening`
- Scope: batch-complete the remaining requirements-stage handoff hardening work for the advanced edition MVP before implementation subtask queueing.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-mvp-implementation-breakdown.md`
- The seven Phase 31 advanced edition implementation plans and related reviews.

## Constraints

- Do not modify product code, tests, schema, migrations, scripts, package files, or lock files.
- Do not execute Cost Calibration Gate.
- Do not measure provider cost or call a real `model_provider`.
- Do not create, read, or edit env/secret files.
- Do not touch staging/prod/cloud/deploy/payment/external-service configuration.
- Do not seed code implementation tasks as executable queue items in this task; only prepare the handoff model and sizing.
- Use project terms: `authorization`, `personal_auth`, `org_auth`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, and `ai_call_log`.

## Internal Serial Steps

1. Perform requirements-to-plan traceability final review.
2. Freeze acceptance scenario matrix for implementation handoff.
3. Prepare implementation-stage subtask decomposition model.
4. Freeze risk and blocked-work list.
5. Recheck terminology and naming consistency.
6. Produce the requirements-to-implementation handoff package.

## Risk Controls

- Keep all unconfirmed matters as blocked, not as requirements.
- Keep Cost Calibration Gate separate from the advanced edition implementation queue.
- Keep provider, env/secret, staging/prod/cloud/deploy, payment, external-service, schema, migration, dependency, script, package, and lockfile work out of scope.
- Keep evidence redacted; do not include prompt, raw AI input/output, provider payload, secret, token, database URL, plaintext `redeem_code`, or employee subjective answer text.

## Expected Output

- `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-to-implementation-handoff.md`
- `docs/05-execution-logs/audits-reviews/2026-06-06-advanced-edition-requirements-handoff-hardening-review.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-requirements-handoff-hardening.md`
- Updated `docs/04-agent-system/state/project-state.yaml`
- Updated `docs/04-agent-system/state/task-queue.yaml`
