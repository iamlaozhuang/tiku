# Role Separated Test Fixture Supplement Scope Approval Package

packageId: ROLE_SEPARATED_TEST_FIXTURE_SUPPLEMENT_SCOPE_2026_06_23
status: prepared_not_approved_for_execution
preparedAt: "2026-06-23T05:44:44-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only

## What This Approval Would Allow

If laozhuang approves `ROLE_SEPARATED_TEST_FIXTURE_SUPPLEMENT_SCOPE_2026_06_23`, a later implementation task may add or
update test-only fixture coverage for the role-separated account blocker.

The future implementation task may be scoped to:

- create a new test-only fixture spec named `e2e/role-separated-account-fixture-supplement.spec.ts`; or
- update the existing test-only fixture specs `e2e/admin-role-denial-browser.spec.ts` and
  `e2e/edition-aware-authorization-local-flow.spec.ts` only if that is smaller and clearer than a new file.

The preferred path is one new test-only supplement spec, so existing runtime and DB-backed specs remain stable.

## Role Rows To Cover

| Role row                    | Fixture must prove allowed behavior                                                   | Fixture must prove denied behavior                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `personal_advanced_student` | Advanced personal learner entitlement is visible or usable.                           | No admin, content operations, system operations, organization admin, Provider, or cost controls.              |
| `org_standard_employee`     | Standard organization employee can use employee learner/training surface.             | No admin power, no content/system operations, no advanced-only entitlement, no cross-organization data.       |
| `org_advanced_employee`     | Advanced organization employee gets advanced entitlement as employee.                 | No admin power, no content/system operations, no cross-organization data.                                     |
| `org_standard_admin`        | Standard organization admin can manage its own organization scope.                    | No cross-organization management, no global system ops, no advanced-only entitlement.                         |
| `org_advanced_admin`        | Advanced organization admin can manage its own advanced organization scope.           | No cross-organization management, no global system ops, no Provider or cost controls.                         |
| `content_admin`             | Content operations can use content authoring or content management paths.             | No user, organization, `org_auth`, `redeem_code`, system ops, Provider, cost, staging, or prod paths.         |
| `ops_admin`                 | System operations can use user, organization, `org_auth`, or `redeem_code` ops paths. | No question, material, paper, knowledge, resource, content authoring, Provider, cost, staging, or prod paths. |

## Auditor Decision

`auditor_if_supported` is not silently included.

Approve one of these during the next owner decision:

- include auditor fixture: add a read-only auditor fixture row that can view redacted audit summaries and cannot change
  accounts, content, authorization, Provider, cost, staging, or prod settings;
- exclude auditor from MVP: record that the MVP has no distinct auditor role, so this row is not required for this
  blocker;
- keep auditor blocked: make no fixture change until the product role is clarified.

## Validation Boundary If Approved

The preferred future validation should be narrow:

- `npx.cmd prettier --check --ignore-unknown <changed test-only files and docs/state files>`;
- `git diff --check`;
- `Test-ModuleRunV2PreCommitHardening.ps1` for the future task id;
- optionally one local Playwright command for the single approved test-only spec, only if the approval explicitly allows
  local Playwright runtime and the target is localhost or `127.0.0.1`.

If local Playwright runtime is not explicitly approved, the future task must stop after static validation and record
runtime evidence as still pending.

## Evidence Rules

Future evidence may record:

- role row labels;
- fixture labels;
- allowed route or workflow labels;
- denied route or workflow labels;
- command name, pass/fail status, and test count if runtime is separately approved.

Future evidence must not record passwords, tokens, cookies, Authorization headers, localStorage, `.env*` values,
database URLs, raw database rows, Provider payloads, raw prompts, raw AI outputs, full `paper`, full `material`, raw
answers, screenshots, traces, HTML reports, page dumps, staging data, or production data.

## What This Approval Would Not Allow

This approval package, by itself, does not allow:

- modifying fixture or e2e files before laozhuang approves the package;
- creating real accounts;
- disabling accounts;
- changing passwords;
- changing seed scripts or seed data;
- connecting to or mutating a database;
- schema migration or `drizzle-kit push`;
- changing product source files;
- changing package or lock files;
- reading or editing `.env*`;
- starting a dev server;
- running browser or Playwright runtime unless separately included in the owner approval;
- calling Provider/model services;
- changing Provider configuration;
- running Cost Calibration;
- deploying staging/prod/cloud resources;
- touching payment or external services;
- creating or updating a PR;
- force push;
- claiming Standard or Advanced MVP final pass.

## Stop Conditions

The future implementation task must stop and return to owner decision if:

- a fixture needs product source changes to pass;
- a role cannot be represented without inventing unsupported product behavior;
- the auditor role is still ambiguous;
- validation requires secrets, database rows, provider payloads, or credentials;
- runtime execution requires starting a dev server without explicit approval;
- the work would touch staging/prod/cloud, payment, external services, package files, schema, migrations, or real
  account state.

## Requested Owner Decision

Approve or reject this package:

- approve: allow a later task to perform the scoped test-only fixture supplement;
- approve with auditor included: same as approve, plus include `auditor_if_supported`;
- approve with auditor excluded from MVP: same as approve, but record auditor as not required in this MVP blocker;
- reject or revise: do not edit fixture/e2e yet; revise role rows, file boundary, or runtime policy first.
