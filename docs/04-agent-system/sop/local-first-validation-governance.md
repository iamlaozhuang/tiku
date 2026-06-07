# Local-First Validation Governance SOP

## Status

Active for docs-only automation governance planning.

This SOP defines how Tiku should complete all work that can be validated in local `dev` before waiting for `staging`, `prod`, real provider, payment, or external-service availability. It does not approve product code implementation, dependency changes, schema or migration work, env/secret access, provider calls, staging/prod/cloud/deploy work, payment work, external-service work, or Cost Calibration Gate execution.

## Purpose

Prevent project progress from stalling while non-local environments remain unavailable.

The rule is:

- complete every safe local validation layer that is available;
- label mocks, fixtures, and read-only surfaces honestly;
- record environment-blocked work as blocked gates or future approval tasks;
- never claim staging, prod, provider, or payment readiness from local-only evidence.

## Local Validation Ladder

Use this ladder to classify how far a task can be validated locally:

| Level | Name                 | Evidence examples                                               | Completion claim allowed                                |
| ----- | -------------------- | --------------------------------------------------------------- | ------------------------------------------------------- |
| L0    | docs-only governance | SOP, plan, evidence, audit review, state, queue                 | governance only                                         |
| L1    | static code gates    | lint, typecheck, formatting, naming checks                      | code shape and type safety                              |
| L2    | unit behavior        | focused unit tests for services, validators, mappers, utilities | isolated behavior                                       |
| L3    | local repository     | local `dev` database repository tests using approved setup      | local data access behavior                              |
| L4    | local API contract   | local route handler or Server Action contract checks            | local transport contract                                |
| L5    | local UI interaction | local browser or e2e checks against localhost                   | local visible flow, not staging readiness               |
| L6    | local role flow      | student/admin/employee role walkthrough using local data        | local role-to-role flow when write/read evidence exists |
| L7    | local human review   | human-accompanied local walkthrough with redacted evidence      | local acceptance signal, not production acceptance      |
| L8    | environment blocked  | staging/prod/provider/payment/external-service approval missing | blocked, not complete                                   |

Tasks must name the highest level reached and the remaining level that is blocked, if any.

## Allowed Local-First Work

Allowed local-first work includes:

- docs-only governance and planning;
- lint, typecheck, format, and naming checks;
- focused unit tests;
- local repository validation using approved `dev` database setup;
- local API or Server Action contract checks;
- local browser verification against `localhost` or `127.0.0.1`;
- local role walkthrough for `student`, `admin`, `organization`, and `employee` flows when credentials and data are safe and redacted;
- mock-provider or fixture validation when clearly labeled;
- redacted `audit_log` and `ai_call_log` evidence summaries;
- local validation of `authorization`, `paper`, `mock_exam`, and `redeem_code` behavior when no blocked gate is crossed.

Allowed local-first work must still follow task-specific `allowedFiles`, `blockedFiles`, validation commands, and evidence redaction rules.

## Blocked Environment Work

The following must remain blocked until fresh explicit approval records the required scope and evidence:

- provider cost measurement;
- real provider call;
- provider quota, endpoint, model selection, fallback, or production default configuration;
- env/secret creation, reading, update, rotation, or `.env.local` / `.env.example` changes;
- staging, prod, cloud, deploy, public endpoint, domain, TLS, object storage, or production-like resource work;
- payment, pricing, invoice, refund, reconciliation, or external-service action;
- production data, production-like private data, or customer/customer-like sensitive data;
- schema, migration, destructive data operation, or `drizzle-kit push`;
- dependency, package, lockfile, CLI, SDK, or test framework change without approval.

Cost Calibration Gate remains blocked pending fresh explicit approval.

## Mock, Fixture, And Local Labels

Evidence must label incomplete or non-real behavior precisely:

- `fixture-only`: behavior depends on seeded props, static data, or test fixtures.
- `mock-only`: behavior depends on a mock provider, mock service, or fake response.
- `read-only`: the surface lists or displays data but does not complete the required write/read loop.
- `entry-only`: navigation reaches a page, route, or form but the workflow is not completed.
- `local_runtime`: behavior is proven in local `dev` with real local write/read propagation.
- `local_role_flow`: local runtime evidence covers the relevant role boundary.
- `blocked_by_approval`: next validation needs a blocked environment or high-risk action.

Do not use a green local render, route existence, or seeded happy path as proof of runtime closure.

## Validation Selection

Choose validation commands by changed surface:

| Changed surface                | Minimum local validation                                    |
| ------------------------------ | ----------------------------------------------------------- |
| docs-only governance           | `git diff --check`, Prettier, required-section search       |
| contracts, mappers, validators | lint, typecheck, focused unit tests, naming checks          |
| services                       | lint, typecheck, focused unit tests, relevant integration   |
| repositories                   | local `dev` database validation when approved and available |
| API routes or Server Actions   | contract checks, naming checks, unit/integration, build     |
| UI pages or components         | lint, typecheck, unit/e2e/browser, visual state checks      |
| role flows                     | local browser/e2e with role matrix and redacted credentials |
| closeout                       | Git inventory, quality gate, push alignment when approved   |

If a command is unavailable, evidence must record the reason and residual risk.

## Local Role Flow Matrix

Use the smallest relevant matrix for each task:

| Role          | Local evidence target                                                                        |
| ------------- | -------------------------------------------------------------------------------------------- |
| `student`     | `practice`, `mock_exam`, `exam_report`, `mistake_book`, and authorization visibility         |
| `admin`       | content, `paper`, `question`, `knowledge_node`, and operational controls                     |
| `employee`    | organization training participation and answer visibility boundaries                         |
| `super_admin` | `authorization`, `org_auth`, `redeem_code`, quota, `audit_log`, and `ai_call_log` governance |

Evidence must redact credentials, secrets, tokens, raw prompts, raw answers, provider payloads, cleartext `redeem_code`, and private answer text.

## Staging And Prod Boundary

Local-first evidence can prepare for staging, but it cannot replace staging.

Do not claim:

- staging readiness without staging resource evidence;
- prod readiness without production approval evidence;
- provider readiness without approved provider evidence;
- payment readiness without approved payment evidence;
- external-service readiness without approved external-service evidence.

When staging, prod, provider, payment, or external-service work is needed, create or reference a blocked gate instead of weakening the local claim.

## Evidence Shape

Local-first evidence should include:

```text
highest local validation level:
local surfaces verified:
mock/fixture/read-only labels:
role matrix:
commands:
blocked environment work:
residual gaps:
next local-completable task:
approval-required task:
```

This shape lets a future thread continue local work without waiting for non-local environments.

## Stop Conditions

Stop local-first validation when:

- the next useful step requires provider, env/secret, staging/prod/cloud/deploy, payment, or external-service work;
- evidence would need sensitive data;
- local validation would require schema, migration, dependency, or script changes without approval;
- local results are being used to claim non-local readiness;
- task scope exceeds `allowedFiles` or touches `blockedFiles`.

## Forbidden Claims

Do not claim:

- full runtime completion from `fixture-only`, `mock-only`, `read-only`, or `entry-only` evidence;
- staging or prod readiness from local validation;
- real provider readiness from mock provider evidence;
- `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, or `ai_call_log` closure without task-specific write/read or redacted governance evidence;
- Cost Calibration Gate readiness while it remains blocked.
