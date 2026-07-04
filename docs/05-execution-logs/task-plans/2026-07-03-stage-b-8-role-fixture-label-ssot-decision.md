# 2026-07-03 Stage B 8 Role Fixture Label SSOT Decision Task Plan

## Task

- Task ID: `stage-b-8-role-fixture-label-ssot-decision-2026-07-03`
- Branch: `codex/stage-b-test-owned-account-db-target-alignment-2026-07-03`
- Mode: docs/state read-only decision

## Scope

Decide whether the Stage B 8-role fixture labels are the target source of truth for the next DB-backed acceptance
preflight. This task does not write DB data, does not clean or reset local data, does not run browser acceptance, and
does not start DB-backed Stage B.

## Read Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-03-source-landing-8-role-credential-backed-fixture-target-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-03-stage-b-test-owned-account-db-target-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-03-stage-b-test-owned-account-db-target-alignment.md`
- `src/db/schema/auth.ts`
- `e2e/credential-backed-8-role-local-acceptance.spec.ts`
- `e2e/role-separated-account-fixture-supplement.spec.ts`

## Decision Rules

- Requirement and traceability role labels outrank private fixture row order when the two disagree.
- The private fixture file can be selector input only after its role-to-login mapping matches the target role shape.
- A login-capable account is not sufficient for Stage B if its account type, admin role, organization binding, or
  authorization edition does not match the named role.
- `super_admin` remains a privilege overlay only and is not one of the 8 primary Stage B roles.
- DB write/provisioning still requires fresh approval after selector and DB target are refreshed.

## Validation Plan

- Scoped Prettier check over this task's docs/state files.
- `git diff --check`.
- Module Run v2 pre-commit hardening for this task ID.

## Boundaries

- No DB write, cleanup, reset, seed, migration, DDL, or provisioning.
- No login request, session creation, browser/e2e acceptance, Provider, staging/prod/deploy, Cost Calibration, release
  readiness, final Pass, or production usability claim.
- Evidence remains redacted: no credential, token, cookie, session, Authorization header, env value, connection string,
  raw DB row, internal id, PII, email, phone, plaintext `redeem_code`, Provider payload, Prompt, AI I/O, screenshot,
  trace, DOM dump, or full content.
