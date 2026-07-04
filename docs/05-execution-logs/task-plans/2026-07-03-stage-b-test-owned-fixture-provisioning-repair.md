# 2026-07-03 Stage B Test-Owned Fixture Provisioning Repair Plan

## Task

- Task ID: `stage-b-test-owned-fixture-provisioning-repair-2026-07-03`
- Branch: `codex/stage-b-test-owned-fixture-provisioning-repair-2026-07-03`
- Status: awaiting fresh approval before DB write/provisioning

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
- `docs/05-execution-logs/evidence/2026-07-03-stage-b-0-3-redacted-fixture-preflight.md`
- `docs/05-execution-logs/acceptance/2026-07-03-stage-b-0-3-redacted-fixture-preflight.md`
- `docs/05-execution-logs/audits-reviews/2026-07-03-stage-b-0-3-redacted-fixture-preflight.md`

## Trigger

Stage B-0.3 redacted fixture preflight found all 8 private fixture rows but failed at local DB account/admin principal
presence:

- 4 learner/employee roles failed at `account_presence`.
- 4 backend roles failed at `admin_account_presence`.

## Selector

Private fixture file:

- `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`

Selector is restricted to these role rows and their private login identifiers:

1. `personal_standard_student`
2. `personal_advanced_student`
3. `org_standard_employee`
4. `org_advanced_employee`
5. `org_standard_admin`
6. `org_advanced_admin`
7. `content_admin`
8. `ops_admin`

Selector rules:

- Role labels and expected authorization shape may be recorded.
- Login identifiers and credential values may be read only in process memory after fresh approval.
- Login identifiers and credential values must not be printed, committed, exported, or copied into evidence.
- If any selector is missing, duplicated, ambiguous, or already mapped to a non-test-owned conflicting principal, stop.

## Proposed Non-Destructive Local DB Write Scope

This scope is not approved until the user gives fresh approval.

Allowed target after approval:

- Local Docker Compose service: `tiku-postgres`
- Local database label: `tiku`
- Environment boundary: local dev only

Candidate write tables after approval:

| Table                   | Purpose                                                                          |
| ----------------------- | -------------------------------------------------------------------------------- |
| `auth_user`             | create or repair auth principal for each test-owned login.                       |
| `auth_account`          | create or repair password credential row for each auth principal.                |
| `user`                  | create or repair learner/employee login principal rows.                          |
| `student`               | create personal learner profiles.                                                |
| `admin`                 | create backend admin principal rows for content/ops/org-bound admin fixtures.    |
| `organization`          | create active test-owned organization nodes for org-bound roles.                 |
| `employee`              | bind org employee users to test-owned organizations.                             |
| `admin_organization`    | bind org admin principals to test-owned organizations.                           |
| `redeem_code`           | create synthetic local-only used `redeem_code` rows required by `personal_auth`. |
| `personal_auth`         | create active standard/advanced personal authorization rows.                     |
| `org_auth`              | create active standard/advanced organization authorization rows.                 |
| `org_auth_organization` | bind organization authorization rows to test-owned organizations.                |

Forbidden even after this approval unless a later task explicitly expands scope:

- No `DROP`, `TRUNCATE`, broad `DELETE`, cleanup, reset, or destructive replacement.
- No schema migration, DDL, `drizzle-kit push`, dependency/package/lockfile change, or product/test source change.
- No `auth_session` provisioning or session material creation.
- No `auth_upgrade` provisioning; this repair uses direct standard/advanced source authorization only.
- No Provider, staging/prod, browser/e2e acceptance, DB-backed Stage B acceptance, Cost Calibration, release readiness, or
  final Pass claim.

## Proposed Write Semantics

After approval, the provisioning should be idempotent and narrow:

- Open a single transaction.
- Read private fixture login identifiers and credential values in process memory only.
- Upsert/create only rows selected by the 8 role labels and private login identifiers.
- Preserve unrelated local DB rows.
- Do not delete or disable existing rows outside the selector.
- If an existing selected login conflicts with a different role, unexpected principal type, or non-test-owned shape, stop.
- Record only redacted aggregate counts and pass/fail/block categories.

## Required Post-Repair Check

After the repair, rerun Stage B-0.3 redacted fixture preflight from scratch:

- Same 8 roles.
- Same private fixture input.
- Redacted evidence only.
- No browser/e2e/DB-backed Stage B acceptance until preflight passes.

## Fresh Approval Required

Before any DB write, the user must explicitly approve this exact boundary:

> Approve non-destructive local-only fixture provisioning for
> `stage-b-test-owned-fixture-provisioning-repair-2026-07-03` on local Docker Compose `tiku-postgres` / database `tiku`,
> using the 8 role rows from
> `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md` as in-memory private input, allowing
> idempotent create/upsert to the listed auth/user/admin/organization/authorization tables only, with no cleanup/reset,
> no destructive delete/truncate/drop, no schema migration, no source/test/dependency changes, no browser/e2e/Provider,
> and redacted evidence only.
