# Full Chain Isolated DB Bootstrap Seed Approval Package

Task id: `full-chain-isolated-db-bootstrap-seed-approval-prep-2026-07-04`

Status: approval package only.

## Decision Boundary

The later full-chain acceptance should use a new isolated local DB target, not the current local app DB, as the default
baseline.

This package prepares the future approval wording and selector boundary only. It does not approve or execute any DB
action in the current task.

## Proposed Future Target

| Field                     | Proposed value                             |
| ------------------------- | ------------------------------------------ |
| Local service label       | local Docker Compose PostgreSQL            |
| Local DB label            | `tiku_full_chain_acceptance_20260704_001`  |
| Run selector              | `full_chain_acceptance_20260704`           |
| Fixture namespace         | `full-chain-acceptance-2026-07-04`         |
| Bootstrap admin selector  | `fc_bootstrap_super_admin`                 |
| Contact readiness label   | `fc_contact_config_runtime_static_default` |
| Scenario-output seed mode | blocked unless separately approved         |

## Fresh Approval Text For Future Execution

The future execution task should request explicit approval no broader than:

> Approve local-only isolated DB target and bootstrap seed execution for
> `full-chain-isolated-db-bootstrap-seed-execution-2026-07-04` on local Docker Compose PostgreSQL, target DB label
> `tiku_full_chain_acceptance_20260704_001`, run selector `full_chain_acceptance_20260704`, allowing only:
>
> 1. selector-scoped target inventory,
> 2. creation or selection of that isolated local DB target,
> 3. execution of existing reviewed migrations only if the target is empty and migration execution is explicitly
>    included,
> 4. idempotent create/upsert of the bootstrap `super_admin` auth/admin rows needed to start scenario 1,
> 5. redacted aggregate verification of the bootstrap selector and scenario-output absence.
>    This approval excludes current local DB cleanup/reset, destructive SQL, `drizzle-kit push`, schema changes, product
>    source/test/dependency/script changes, `.env*` output, raw DB rows, credentials, phone/email/password values,
>    `ops_admin`, `content_admin`, organization tree, `org_auth`, organization admins, employees, `redeem_code`, personal
>    users, content, paper, learning, training, analytics, browser/e2e, dev server, Provider, staging, production, Cost
>    Calibration, release readiness, final Pass, and production usability claims. Evidence must be redacted.

## Bootstrap Seed Boundary

| Category                 | Default stance                               | Examples or notes                                                                                          |
| ------------------------ | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| DB target                | Future execution after fresh approval only   | Create/select `tiku_full_chain_acceptance_20260704_001`; no current task DB action.                        |
| Existing migrations      | Future execution only if explicitly approved | Use reviewed migration files; no `drizzle-kit push`; no schema drift repair in this task.                  |
| Bootstrap `super_admin`  | Future idempotent seed candidate             | Auth/session-compatible `auth_user`, `auth_account`, and `admin` rows for `fc_bootstrap_super_admin` only. |
| `audit_log`              | Optional future redacted metadata only       | If supported by the approved executor; do not record raw values or secrets.                                |
| `contact_config`         | Runtime readiness, not DB seed by default    | Current source uses local/runtime repository; no persistent DB table found in this scan.                   |
| Scenario-created outputs | Blocked as seed by default                   | Must be created by the future browser/e2e flow unless a shortcut is separately approved.                   |

## Scenario Outputs That Must Not Be Bootstrap-Seeded By Default

- `ops_admin`
- `content_admin`
- organization tree
- `org_auth`
- `org_auth_organization`
- organization admin accounts and `admin_organization`
- employee accounts and employee imports
- `redeem_code`
- personal users, `student`, `personal_auth`, and `auth_upgrade`
- `material`, `knowledge_node`, `question`, `question_option`, `paper`, `paper_question`, `paper_asset`
- `practice`, `mock_exam`, `answer_record`, `exam_report`, `mistake_book`
- organization training rows
- AI generation task rows, `ai_call_log`, Provider payloads, prompts, or model outputs
- analytics rows or precomputed analytics summaries

## Future Execution Phases

| Phase | Action                               | Required evidence                                                             |
| ----- | ------------------------------------ | ----------------------------------------------------------------------------- |
| B1    | Fresh approval check                 | Approval text, target label, run selector, and blocked-operation list.        |
| B2    | Read-only target inventory           | Target existence/status label only; no connection string or raw row evidence. |
| B3    | Isolated target create/select        | Target label, command name, result status; no destructive operation.          |
| B4    | Reviewed migrations if approved      | Migration count and result status; no raw SQL dump; no `drizzle-kit push`.    |
| B5    | Bootstrap `super_admin` seed         | Counts by selector/table family; no phone/email/password/hash values.         |
| B6    | Contact readiness classification     | Runtime/default readiness label; no DB-table claim unless schema exists.      |
| B7    | Scenario-output absence verification | Zero/pending aggregate counts by family; no raw rows or internal ids.         |
| B8    | Stop or hand off                     | Pass/fail/block summary and next task recommendation.                         |

## Stop Rules

- Stop if target DB label or runtime target label is ambiguous.
- Stop if the future task would need to read or print `.env*`, connection strings, credentials, tokens, sessions,
  cookies, Authorization headers, phone, email, password, plaintext `redeem_code`, raw DB rows, or internal ids.
- Stop if execution needs cleanup/reset/delete/truncate/drop or broad unscoped mutation.
- Stop if migration execution is needed but was not explicitly approved for an empty isolated target.
- Stop if `drizzle-kit push` is proposed.
- Stop if source/test/dependency/schema/script changes are required.
- Stop if any scenario-created output would be seeded by default.
- Stop if `contact_config` is treated as a DB table without a current schema/source anchor.
- Stop if browser/e2e, dev server, Provider, staging, production, deployment, Cost Calibration, release readiness, or
  final Pass is needed.

## Non-Claims

This package does not create the DB target, does not execute migrations, does not seed data, does not prove DB readiness,
and does not approve runtime acceptance.
