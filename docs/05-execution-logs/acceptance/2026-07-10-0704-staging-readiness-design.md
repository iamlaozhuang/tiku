# 2026-07-10 0704 Staging Readiness Design

## Status

- designStatus: `template_only_not_executed`
- taskId: `0704-staging-readiness-design-2026-07-10`
- environmentScope: `staging` design only
- executionBoundary: no staging/prod/cloud/deploy/env/secret/Provider/Cost Calibration action executed
- releaseClaim: none

This document is a readiness design for a later approved `staging` run. It does not approve deployment, cloud provisioning, DNS changes, secret or environment variable creation, database connection, object storage creation, migration execution, Provider enablement, Cost Calibration, production release, or final Pass.

## Design Inputs

- `ADR-004`: `dev`, `staging`, and `prod` must be isolated environments.
- `ADR-005`: `staging` is release-candidate rehearsal only and cannot be promoted into `prod` by configuration changes.
- Phase 11 resource, secret/env, and cloud adapter plans already define planning-only boundaries.
- 0704 local evidence closed the localhost business and perimeter validation chain, but does not prove staging readiness or production readiness.

## Data Isolation

| Area           | Required staging design                                                                                                                            | Approval gate before execution                                                         | Stop condition                                                                                                                   |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Database       | Dedicated staging PostgreSQL instance preferred; isolated namespace only if cost-approved. pgvector support must be planned before RAG acceptance. | Cloud/database approval, migration approval, backup/restore approval.                  | Any shared writable `prod` database, production clone without data plan, or raw DB row evidence.                                 |
| Object storage | Dedicated staging bucket preferred; strict `staging/` prefix acceptable only after bucket-policy review.                                           | Object storage approval, bucket/prefix policy approval, public URL approval if needed. | Any shared writable `prod/` prefix, public URL without approval, or full content in evidence.                                    |
| Auth/session   | Staging-only auth base URL, callback URL, session store, and `BETTER_AUTH_SECRET`.                                                                 | DNS/callback approval, secret/env approval, owner account approval.                    | Shared prod secret, shared callback, copied session material, or credential/session evidence.                                    |
| Seed data      | Synthetic or reviewed acceptance data only. Use labels, public-safe identifiers, and redacted status categories in evidence.                       | Data handling approval before real content import.                                     | Production/customer-like private data, raw employee answers, full paper/material/resource/chunk, raw OCR, or answer-key leakage. |
| Logs           | Staging `audit_log` and `ai_call_log` retention separated from prod.                                                                               | Retention and reviewer approval.                                                       | Raw prompt/output, Provider payload, session/token, DB URL, secret, or raw learner/employee content in logs or evidence.         |

## Account Matrix

Future staging execution needs a staging-only account catalog. It must not reuse localhost private credentials or production accounts.

| roleLabel                   | Required staging purpose                                                     | Credential governance                                                                                                   | Evidence rule                                               |
| --------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `super_admin`               | Global admin boundary, model/config visibility, and release oversight.       | Created or reset only through approved staging account process.                                                         | Record roleLabel and pass/fail only.                        |
| `ops_admin`                 | `org_auth`, `redeem_code`, user/organization operations, and audit overview. | No plaintext credential evidence. Redeem code plaintext visibility requires product UI exception and redacted evidence. | Record action/status categories only.                       |
| `content_admin`             | Content, paper, resource, knowledge, and AI draft review surfaces.           | Staging-only account with content role.                                                                                 | No full question, paper, material, resource, or chunk text. |
| `personal_standard_student` | Standard personal learner denial and basic learning smoke.                   | Staging-only learner account.                                                                                           | Record authorization category and route label only.         |
| `personal_advanced_student` | Advanced learner AI and learning smoke.                                      | Staging-only learner account.                                                                                           | No raw prompt/output or generated content.                  |
| `org_standard_admin`        | Standard organization admin boundary and employee management.                | Staging-only organization admin account.                                                                                | No employee raw answer or internal ids.                     |
| `org_advanced_admin`        | Advanced organization admin AI, training, analytics, and privacy boundary.   | Staging-only organization admin account.                                                                                | Aggregate status only.                                      |
| `org_standard_employee`     | Standard organization employee denial and basic learning smoke.              | Staging-only employee account.                                                                                          | Role label and status category only.                        |
| `org_advanced_employee`     | Advanced organization employee AI, training, and learning smoke.             | Staging-only employee account.                                                                                          | No raw AI result, raw answer, or full content.              |

Minimum account preflight before any future staging run:

1. Confirm each roleLabel exists in the staging credential catalog.
2. Confirm account status category is active or intentionally blocked.
3. Confirm authorization context category matches the role.
4. Confirm no credential, password, cookie, session, token, localStorage, Authorization header, or internal id is recorded.
5. Stop the staging run if any core role is missing, ambiguous, expired, disabled, or mapped to the wrong context.

## Credential And Env Governance

Staging credential and environment work must be a separate approved implementation task. It must define owner, storage location, injection target, rotation owner, and rollback method before values exist.

| Item                       | Evidence allowed after approval           | Evidence forbidden                                 | Fresh approval required               |
| -------------------------- | ----------------------------------------- | -------------------------------------------------- | ------------------------------------- |
| `APP_ENV`                  | enum value `staging`                      | none beyond enum                                   | Before runtime env creation.          |
| `APP_BASE_URL`             | approved hostname after DNS/TLS approval  | unapproved callback URL claim                      | Before DNS/callback verification.     |
| `DATABASE_URL`             | variable name and owner role only         | full URL, host with credential, username, password | Before database purchase/connection.  |
| `BETTER_AUTH_SECRET`       | variable name and secret store class only | value, hash, derived secret                        | Before secret creation/injection.     |
| Object storage credentials | variable names and owner role only        | access key, secret key, signed URL                 | Before bucket or credential creation. |
| AI provider keys           | provider name and policy after approval   | API key, Authorization header, Provider payload    | Before Provider enablement.           |
| Budget/quota flags         | approved numeric policy after approval    | cost ledger with sensitive payload                 | Before any real Provider traffic.     |

## Resource Boundaries

| Resource       | Readiness design requirement                                                                                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain/TLS     | Use `staging` hostname only after DNS, ICP, TLS, and callback owner approval. Placeholder hostnames are planning placeholders, not route evidence.                     |
| Runtime        | One staging deployment target with separate env, logs, callback origin, and owner acceptance gate.                                                                     |
| Database       | Apply only reviewed migrations. `drizzle-kit push` remains forbidden. Require backup point, restore method, rollback decision point, and drift check.                  |
| Object storage | Enforce object keys as `{environment}/{resource_type}/{profession}/{yyyymm}/{file_hash}.{extension}` and keep `environment=staging`.                                   |
| Provider       | Disabled by default unless separate approval defines provider, model allowlist, quota, retry, timeout, fallback, kill switch, logging allowlist, and redaction policy. |
| Logs           | Expose only status category, role label, route label, duration bucket, error category, and aggregate counts.                                                           |
| Monitoring     | Track health, build status, database connectivity category, route failure category, Provider-disabled category, and storage category without raw payloads.             |

## Migration And Rollback Rehearsal

Future staging migration rehearsal must be a separate task and must include:

1. Reviewed source branch and migration files.
2. Staging database target class, not a secret value.
3. Backup point and restore owner.
4. Forward migration command, but only after approval.
5. Rollback decision point and stop criteria.
6. Drift check between reviewed schema and staging database.
7. Evidence template that records command category, pass/fail, table/category counts when safe, and no raw rows.

Stop immediately if any step requires production data, production credentials, unreviewed migration files, destructive reset/drop/truncate, `drizzle-kit push`, or raw DB evidence.

## Seed And Redaction Rules

Allowed staging data classes:

- synthetic organizations, users, `org_auth`, `redeem_code`, `contact_config`, content, resources, and logs;
- reviewed acceptance metadata with no private/customer-like content;
- role labels, route labels, status categories, and aggregate counts.

Forbidden staging evidence:

- credentials, passwords, sessions, cookies, tokens, localStorage, Authorization headers;
- env values, database URLs, object storage credentials, signed URLs;
- raw DB rows or internal numeric ids;
- raw Provider payload, raw prompt, raw AI input/output;
- full question, paper, material, resource, chunk, OCR, textbook, answer key, or raw employee answer;
- plaintext `redeem_code` outside the approved product UI, and never in committed evidence.

## Future Staging Execution Checklist

| Gate               | Required proof before execution                                                   | If missing                      |
| ------------------ | --------------------------------------------------------------------------------- | ------------------------------- |
| Approval           | Fresh explicit approval naming environment, action, owner, and evidence boundary. | Blocked by approval gate.       |
| Resource isolation | Staging DB/storage/auth/log/provider/domain separated from prod.                  | Blocked by resource isolation.  |
| Account matrix     | Nine core staging roleLabels ready and mapped to expected authorization contexts. | Blocked by account readiness.   |
| Data plan          | Synthetic/reviewed data only, with reset strategy and no production clone.        | Blocked by data handling.       |
| Migration/rollback | Backup/restore, drift check, reviewed migration, rollback owner.                  | Blocked by migration readiness. |
| Provider policy    | Disabled or approved quota/model/logging/kill switch.                             | Blocked by Provider gate.       |
| Evidence hygiene   | Redaction reviewer and template confirmed.                                        | Blocked by evidence hygiene.    |
| Monitoring         | Health, error, DB, storage, Provider-disabled, and audit signals defined.         | Blocked by observability.       |

## Evidence Template

Future staging evidence should use this redacted shape:

| Field               | Allowed value class                                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| environmentLabel    | `staging`                                                                                                              |
| taskId              | public task id                                                                                                         |
| roleLabel           | one of the approved staging role labels                                                                                |
| routeLabel          | public-safe route/workflow label                                                                                       |
| authContextCategory | `personal_standard`, `personal_advanced`, `org_standard`, `org_advanced`, `admin_global`, `admin_content`, `admin_ops` |
| resourceCategory    | `database`, `object_storage`, `auth`, `provider`, `audit_log`, `ai_call_log`, `domain`, `runtime`                      |
| stateCategory       | `ready`, `missing`, `stale`, `blocked`, `denied`, `passed`, `failed`, `not_executed`                                   |
| commandCategory     | command label only, no raw env or secret output                                                                        |
| aggregateCount      | safe count only                                                                                                        |
| redactionReview     | `pass` or failure category                                                                                             |

## Stop Conditions

A future staging run must stop before business validation when:

- any core staging role account is missing, ambiguous, disabled, expired, or wrong-context;
- DNS/TLS/callback, database, storage, or secret prerequisites are not approved;
- staging uses or can mutate prod resources;
- data import includes production/customer-like private content without a separate data handling approval;
- Provider execution is not explicitly approved or cannot be disabled safely;
- logs or evidence expose forbidden sensitive material;
- migration/rollback lacks backup, drift check, restore owner, or reviewed migration files;
- any step would require production deployment, Cost Calibration, force push, PR, or unapproved external service action.

## Future Task Split

Recommended next tasks after this design, each requiring its own approval and evidence:

1. `staging-resource-approval-gate`: confirm cloud/server/database/storage/domain procurement state.
2. `staging-secret-env-approval-gate`: approve secret store, env injection, rotation, and callback values without exposing values.
3. `staging-account-catalog-preflight`: create or verify staging-only role catalog with redacted readiness.
4. `staging-migration-rollback-rehearsal-plan`: plan backup, restore, drift check, and migration rehearsal.
5. `staging-provider-observability-gate`: decide Provider disabled vs limited quota, logging allowlist, kill switch, and monitoring.
6. `staging-owner-acceptance-run`: execute role matrix only after all prior gates are closed.

## Non-Claims

This design does not claim:

- staging readiness;
- production readiness;
- release readiness;
- final Pass;
- Provider readiness;
- Cost Calibration completion;
- deployment readiness;
- data migration readiness;
- customer-network acceptance.
