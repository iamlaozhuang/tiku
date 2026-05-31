# Phase 20 Fix RA-01-05 Password Reset Ops Flow

## Scope

- Task: `phase-20-fix-ra-01-05-password-reset-ops-flow`
- Branch: `codex/phase-20-fix-ra-01-05-password-reset-ops-flow`
- Source finding: `F-RA-01-05-001`
- Goal: make admin password reset produce a usable operator handoff path without exposing raw password values in API responses, audit logs, or evidence.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`

## Constraints

- Do not read or modify `.env*`.
- Do not modify dependency manifests or lockfiles.
- Do not modify `src/db/schema/**`, `drizzle/**`, or migrations.
- Do not use real providers, staging/prod/cloud/deploy, or destructive data operations.
- Keep password evidence redacted.
- Keep API JSON camelCase and standard `{ code, message, data, pagination? }` envelope.

## TDD Plan

1. Add a failing unit test that posts an operator-provided `newPassword` to `/api/v1/users/{publicId}/reset-password`.
2. Assert the repository receives the password handoff input while response and audit evidence remain redacted.
3. Implement request normalization, repository hashing of the provided password, session revocation, and UI handoff body submission.
4. Run targeted RED/GREEN, task validation commands, local CI gates, and record evidence.

## Security Review Notes

- `auth_permission_model`: existing admin reset permission gate must remain enforced.
- `secret_or_env_change`: no env file reads or writes; new password must not be logged or returned.
- `local_human_verification`: evidence records command results only, with password values redacted.
- `evidence_integrity`: evidence must not contain token, secret, password, internal numeric id, or raw session value.
