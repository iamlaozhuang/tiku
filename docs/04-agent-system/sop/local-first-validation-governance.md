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

## Module Run v2 Local Full-Loop Completion Standard

For advanced edition Module Run v2, the local validation ladder is not only a task label. It is the default module
completion standard.

Each Module Run plan must declare the intended `localFullLoopGate` level:

- L1 `lint_typecheck`;
- L2 `unit`;
- L3 `local_repository_or_docker_db`;
- L4 `local_api_or_server_action_contract`;
- L5 `local_ui_browser`;
- L6 `role_flow`;
- L7 `local_human_review`;
- L8 `environment_provider_deploy_blocked_remainder`.

The Module Run should progress to the highest safe local level for its execution module before closeout. If the highest
useful level is blocked, evidence must state the exact blocked remainder instead of closing the module at a weaker
contract level by habit.

Local full-loop evidence may include `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, and
`ai_call_log` only according to the relevant redaction rules. It must not expose auto-increment ids, DB rows, full paper
content, plaintext redeem_code, raw prompts, raw answers, raw provider responses, provider payloads, secrets, tokens,
database URLs, or Authorization headers.

Module Run v2 local completion does not imply staging, prod, provider, payment, or external-service readiness.

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

## Local Provider Sandbox

Module Run v2 may use a `local_provider_sandbox` only when the user explicitly approves that specific local provider
validation call.

The sandbox is allowed only for local dev validation and only when evidence records redacted metadata:

- provider category or mock/local sandbox label;
- whether the local call succeeded;
- failure category when it failed;
- local validation result;
- no raw prompt, raw response, raw generated AI content, provider payload, API key, token, secret, database URL, or
  Authorization header.

The sandbox must not read, display, copy, or record `.env.local` contents. It must not change provider packages, SDKs,
quotas, endpoints, model selection, fallback behavior, staging/prod configuration, cloud resources, deploy settings,
payment, or external-service settings.

Cost Calibration Gate remains blocked. A redacted, user-approved local provider sandbox call is not provider cost
calibration and is not approval for staging/prod provider readiness.

## Local E2E Validation Approval

Module Run v2 may run local Playwright e2e validation only when a queued task explicitly declares:

```yaml
capabilities:
  localE2EValidation: approved_local_only_existing_specs
validationProfile: L5-local-e2e
localFullLoopGate: L5
```

The standing approval is intentionally local-only and spec-targeted. It allows only:

- `npm.cmd run test:e2e -- --list`
- `npm.cmd run test:e2e -- e2e/<existing-spec>.spec.ts`

The target spec must already exist under `e2e/**`, and execution must stay on `localhost` or `127.0.0.1` through the
existing Playwright configuration. Evidence may record only the command, pass/fail status, spec name, and test count.
Screenshots, traces, HTML reports, page text, raw prompts, provider payloads, DB rows, credentials, tokens, database
URLs, Authorization headers, cleartext `redeem_code`, and full `paper` or `material` content must not be recorded or
committed.

The approval does not make e2e a default gate for ordinary tasks. These remain blocked without fresh task-specific
approval:

- full-suite default `npm.cmd run test:e2e`;
- `npm.cmd run test:e2e:ui`, headed mode, debug mode, or inspector-driven e2e;
- non-existing specs, paths outside `e2e/**`, or generated e2e artifacts;
- env/secret, provider, dependency, schema/migration, destructive DB, staging/prod/cloud/deploy, payment, or
  external-service work.

Cost Calibration Gate remains blocked.

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

For unattended worktrees, record `localToolingReadiness` separately from product validation. A fresh clean worktree that
lacks `node_modules`, local binary shims, or other already-approved local tooling is a local tooling readiness gap, not
a product behavior failure. Automation may use an existing approved local tooling surface or a task-approved tooling
repair, but it must not install dependencies, change package files, or mutate lockfiles without the dependency gate.

For docs-only governance, closeout, evidence, audit review, task plan, task queue, and project state changes, apply this formatting order:

1. Write final local validation level, blocked environment work, and residual gap wording.
2. Run scoped `prettier --write` on the changed docs/state files.
3. Run scoped `prettier --check` on the same file list.
4. Run `git diff --check` and required-section or anchor searches.

This order is required before claiming docs-only validation passed. Cost Calibration Gate remains blocked unless separately approved.

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
