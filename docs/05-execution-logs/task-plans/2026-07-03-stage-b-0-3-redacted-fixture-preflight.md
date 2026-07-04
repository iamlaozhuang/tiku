# 2026-07-03 Stage B-0.3 Redacted Fixture Preflight Plan

## Task

- Task ID: `stage-b-0-3-redacted-fixture-preflight-2026-07-03`
- Branch: `codex/stage-b-0-3-redacted-fixture-preflight-2026-07-03`
- Status: completed with redacted preflight failure

## Required Reading Completed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/05-execution-logs/acceptance/2026-07-03-stage-b-0-read-only-aggregate-local-db-inventory.md`
- `docs/05-execution-logs/evidence/2026-07-03-stage-b-0-read-only-aggregate-local-db-inventory.md`
- `docs/05-execution-logs/acceptance/2026-07-03-stage-b-0-2-local-db-baseline-decision.md`
- `docs/05-execution-logs/evidence/2026-07-03-stage-b-0-2-local-db-baseline-decision.md`
- `docs/05-execution-logs/audits-reviews/2026-07-03-stage-b-0-2-local-db-baseline-decision.md`

## Scope

Run a local redacted fixture preflight for the 8 test-owned roles before DB-backed Stage B acceptance:

1. `personal_standard_student`
2. `personal_advanced_student`
3. `org_standard_employee`
4. `org_advanced_employee`
5. `org_standard_admin`
6. `org_advanced_admin`
7. `content_admin`
8. `ops_admin`

## Private Fixture Input

Path: `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`.

Allowed use:

- read role labels, login identifiers, and expected authorization shape in process memory;
- use login identifiers only as query parameters or local lookup inputs;
- record only role labels, expected shape labels, status categories, aggregate counts, and pass/fail/block summaries.

Forbidden:

- no credential, phone, email, password, token, cookie, session, Authorization header, internal id, plaintext
  `redeem_code`, or raw row value in committed evidence.

## Planned Checks

| Check                              | Boundary                                             |
| ---------------------------------- | ---------------------------------------------------- |
| Private fixture marker check       | completed; redacted role marker counts only.         |
| Local DB target check              | completed; Docker Compose service label/status only. |
| User/account presence              | completed; role-label aggregate status only.         |
| Admin role presence                | completed; aggregate role status only.               |
| Organization binding presence      | completed; aggregate binding status only.            |
| Personal authorization context     | completed; aggregate expected-shape status only.     |
| Organization authorization context | completed; aggregate expected-shape status only.     |

## Execution Result

The private fixture file contained one usable row for each of the 8 required roles. The local read-only aggregate/status
DB preflight then returned `fail` for all 8 roles because the current local DB did not match the test-owned account
fixtures by login identifier:

- 4 learner/employee roles failed at `account_presence`.
- 4 admin roles failed at `admin_account_presence`.

This task stopped at preflight. It did not enter DB-backed Stage B acceptance and did not mutate or clean local data.

## Follow-Up Task Split

New pending task split from this preflight failure:

- Task ID: `stage-b-test-owned-fixture-provisioning-repair-2026-07-03`
- Purpose: decide and execute a separately approved local test-owned fixture provisioning/repair path so the 8 roles can
  be preflighted again before DB-backed Stage B acceptance.
- Required before execution: fresh task materialization and approval for exact local DB write/provisioning boundaries.
- Still forbidden without that approval: cleanup, reset, destructive delete/truncate, staging/prod, Provider, browser
  acceptance, and raw credential/PII evidence.

## Stop Conditions

- Any query or output would expose raw rows, login values, credentials, PII, internal ids, plaintext `redeem_code`,
  Provider payloads, Prompt, AI I/O, screenshot, trace, DOM, or full content.
- DB target is not local Docker Compose `tiku-postgres`.
- Any role is missing or has ambiguous fixture data.
- Any account, organization binding, or authorization context is missing or ambiguous.
- A repair/provisioning action would be required.

## Non-Scope

- No DB write, cleanup, reset, seed, migration, DDL, provisioning, or repair.
- No DB-backed Stage B acceptance execution.
- No browser acceptance, e2e, login flow, Provider, staging/prod, deploy, dependency, schema, source, or test edit.
- No release readiness, final Pass, production usability, or Cost Calibration claim.

## Planned Validation

- Scoped Prettier check for this task's docs/state files.
- `git diff --check`.
- Module Run v2 PreCommit Hardening.
- Module Run v2 PrePush Readiness.
