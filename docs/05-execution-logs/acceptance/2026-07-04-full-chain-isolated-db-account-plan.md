# Full Chain Isolated DB Account Plan

Task id: `full-chain-isolated-db-account-plan-prep-2026-07-04`

Status: account selector plan only.

## Target Context

| Field             | Value                                                                                |
| ----------------- | ------------------------------------------------------------------------------------ |
| Local DB label    | `tiku_full_chain_acceptance_20260704_001`                                            |
| Run selector      | `full_chain_acceptance_20260704`                                                     |
| Fixture namespace | `full-chain-acceptance-2026-07-04`                                                   |
| Private plan path | `D:/tiku-local-private/acceptance/full-chain-isolated-db-account-plan-2026-07-04.md` |

## Source Inputs

| Source                                                                         | Use in this task                         | Sensitive handling                               |
| ------------------------------------------------------------------------------ | ---------------------------------------- | ------------------------------------------------ |
| `D:/tiku-local-private/acceptance/role-separated-local-accounts-2026-06-23.md` | Headings/count only; reuse reference     | No credential value copied to repo evidence.     |
| `D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/`     | File inventory and employee sample paths | No raw material, employee row, or answer copied. |
| Full-chain account provisioning order                                          | Account order and domain boundary        | Repository source; no private value.             |
| Isolated DB bootstrap approval package                                         | Bootstrap seed boundary                  | Repository source; no private value.             |

## Account Selector Matrix

| Selector                                   | Domain           | Role or user intent                      | Creation mode in later run                | Reuse posture                                 | Must happen after                | Must happen before              |
| ------------------------------------------ | ---------------- | ---------------------------------------- | ----------------------------------------- | --------------------------------------------- | -------------------------------- | ------------------------------- |
| `fc_bootstrap_super_admin`                 | admin            | `super_admin` start account              | Bootstrap seed candidate only             | Private credential source required            | Isolated DB target               | Scenario 1                      |
| `fc_ops_admin_created_by_super_admin`      | admin            | `ops_admin`                              | Scenario-created by `super_admin`         | Old fixture can only inform structure         | Bootstrap admin                  | Org/card/admin ops              |
| `fc_content_admin_created_by_super_admin`  | admin            | `content_admin`                          | Scenario-created by `super_admin`         | Old fixture can only inform structure         | Bootstrap admin                  | Content operations              |
| `fc_org_standard_admin_created_by_ops`     | admin            | Standard organization admin              | Scenario-created and org-bound            | Old fixture can only inform structure         | Org tree and standard `org_auth` | Org admin checks                |
| `fc_org_advanced_admin_created_by_ops`     | admin            | Advanced organization admin              | Scenario-created and org-bound            | Old fixture can only inform structure         | Org tree and advanced `org_auth` | Org admin checks                |
| `fc_personal_contact_user_registered`      | learner/student  | Contact visibility ordinary user         | Registration-created                      | Prefer new run-owned account                  | Contact config readiness         | Contact check                   |
| `fc_personal_standard_to_advanced_student` | learner/student  | Standard user later upgraded to advanced | Registration, standard card, upgrade card | Prefer new run-owned account                  | Card generation                  | Personal standard/advanced flow |
| `fc_org_standard_employee_import_batch`    | learner/employee | More than 5 standard employees           | Employee import-created                   | Use run-specific import file, not direct seed | Org tree and standard `org_auth` | Employee data creation          |
| `fc_org_advanced_employee_import_batch`    | learner/employee | More than 5 advanced employees           | Employee import-created                   | Use run-specific import file, not direct seed | Org tree and advanced `org_auth` | Employee data and analytics     |

## Required Private Inputs Before Runtime Acceptance

| Input family                       | Required state before runtime run                                  | Current plan result                                             |
| ---------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------- |
| Bootstrap `super_admin` credential | One private credential source mapped to `fc_bootstrap_super_admin` | Planned, not printed                                            |
| `ops_admin` input                  | Private account input for scenario creation                        | Planned, not printed                                            |
| `content_admin` input              | Private account input for scenario creation                        | Planned, not printed                                            |
| Organization admin inputs          | Standard and advanced admin account inputs                         | Planned, not printed                                            |
| Employee import files              | Standard and advanced import files, more than 5 rows each          | Existing sample paths found; run-specific copies still required |
| Personal user inputs               | Contact-only and standard-to-advanced user input                   | Planned, not printed                                            |
| Card private values                | Standard, advanced, and upgrade card values                        | Future scenario output, not prepared as plaintext here          |

## Reuse Decision

The old 8-role fixture file remains useful for role labels and login-pattern precedent, but it is not the target SSOT
for the full-chain isolated DB run. The full-chain run needs scenario-owned accounts because it must prove:

- `super_admin` creates `ops_admin` and `content_admin`;
- `ops_admin` creates organization admins and imports employees;
- ordinary personal users register through the product flow;
- standard authorization is upgraded through `edition_upgrade`;
- organization analytics is based on employee learning data generated during the run.

Any later reuse of old credential values must be explicitly mapped in the private plan and must not pre-create
scenario-owned DB outputs.

## Stop Rules

- Stop if any admin-domain selector shares a login identity with learner/employee-domain selectors.
- Stop if `ops_admin`, `content_admin`, organization admins, employees, personal users, cards, content, learning,
  training, or analytics are proposed as bootstrap seed defaults.
- Stop if employee import rows include `profession`, `level`, `subject`, `edition`, `orgAuthId`,
  `orgAuthScopePublicId`, internal ids, or authorization fields.
- Stop if the runtime app DB target and the approved isolated DB target differ.
- Stop if private values must be printed into repository evidence.
- Stop if actual DB creation, seed, browser/e2e, dev server, Provider, staging, production, Cost Calibration, release
  readiness, final Pass, or production usability is needed.

## Non-Claims

This account plan does not create accounts, does not prove login success, does not write DB data, and does not approve
runtime acceptance.
