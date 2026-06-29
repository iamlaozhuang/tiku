# Isolated Staging Target Package

- Task id: `isolated-staging-target-package-2026-06-29`
- Branch: `codex/isolated-staging-target-package-20260629`
- Status: pass_docs_only_staging_target_package_prepared_smoke_blocked_pending_concrete_target
- Date: `2026-06-29`

## Purpose

This document prepares Gate 2 from the release-readiness docs-only execution plan: the isolated staging target package.
It records the fields and stop conditions required before any future staging smoke execution.

This task does not create or modify cloud resources, connect to staging/prod, deploy, read or write env/secrets, access a
database, execute Provider calls, change source/tests/dependencies/schema/migrations/seeds, create a PR, force-push,
claim release readiness, claim final Pass, or execute Cost Calibration.

## Inputs

| Input                                      | Status | Reference                                                                                                 |
| ------------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------- |
| Local durable-goal completion              | pass   | `docs/05-execution-logs/evidence/2026-06-29-full-acceptance-post-employee-ai-actions-completion-audit.md` |
| Owner handoff approval package             | pass   | `docs/01-requirements/traceability/2026-06-29-owner-handoff-release-readiness-approval-package.md`        |
| Release-readiness docs-only execution plan | pass   | `docs/01-requirements/traceability/2026-06-29-release-readiness-docs-only-execution-plan.md`              |
| Current task approval                      | pass   | user approved execution of this docs-only package                                                         |

## Staging Target Decision Record

| Field                         | Current value                                      | Gate impact                                                        |
| ----------------------------- | -------------------------------------------------- | ------------------------------------------------------------------ |
| Staging URL                   | not recorded                                       | staging smoke remains blocked                                      |
| Deploy target label           | not recorded                                       | staging smoke remains blocked                                      |
| Environment resource owner    | pending owner confirmation                         | staging smoke remains blocked                                      |
| Stop decision owner           | `laozhuang`                                        | owner may stop any future gate                                     |
| Production untouched rule     | required                                           | any prod dependency stops future staging smoke                     |
| Secret/env boundary           | no secret/env read or write in this task           | future gate needs explicit boundary without evidence leakage       |
| Data source boundary          | no prod data; synthetic/redacted staging data only | future gate must list approved data source                         |
| Account/session method        | not selected                                       | future gate needs test-owned staging accounts or safe role switch  |
| Evidence mode                 | redacted status/count/summary only                 | raw DOM, screenshots, traces, tokens, rows, prompts, and IO barred |
| Rollback/deployment authority | not applicable in docs-only task                   | future deploy/migration gate needs separate rollback owner         |

## Required Before Staging Smoke

A future staging smoke task is blocked until all of these are recorded in governance state and task queue:

- exact staging URL or deploy target label;
- environment resource owner;
- target account source or approved safe role-switching method;
- production untouched rule;
- secret/env boundary;
- staging data source boundary;
- evidence redaction rules;
- stop decision owner and, if deployment/migration is involved, rollback owner.

## Stop Conditions

Stop before execution if any of these appears:

- no concrete staging target;
- production URL, production credential, production database, production object storage, or production data dependency;
- requirement to record credentials, cookies, tokens, sessions, localStorage, Authorization headers, env contents, or
  connection strings;
- requirement to record raw DOM, screenshots, traces, raw DB rows, internal IDs, PII, email, phone, plaintext
  `redeem_code`, Provider payloads, prompts, raw AI input/output, or complete question/paper/material/resource/chunk
  content;
- request to create/modify cloud resources, deploy, change source/tests/dependencies/schema/migrations/seeds, PR,
  force-push, claim release readiness, claim final Pass, or execute Cost Calibration inside this package.

## Gate Status

| Gate                            | Status after this package | Fresh approval required |
| ------------------------------- | ------------------------- | ----------------------- |
| Local durable-goal completion   | complete                  | no                      |
| Owner handoff package           | complete                  | no                      |
| Release-readiness docs plan     | complete                  | no                      |
| Isolated staging target package | prepared                  | current task only       |
| Staging smoke execution         | blocked                   | yes                     |
| Provider smoke                  | blocked                   | yes                     |
| Cost Calibration                | blocked                   | yes                     |
| Owner final walkthrough         | blocked                   | yes                     |
| Final Pass decision recording   | blocked                   | yes                     |
| Release readiness claim         | blocked                   | yes                     |

## Next Task Candidate

The next task can be one of these, depending on owner input:

- `staging-target-detail-confirmation-2026-06-29`: docs/state-only update after the owner provides the exact staging URL
  or deploy target label.
- `staging-smoke-execution-2026-06-29`: only after the concrete target and account/session method are recorded and
  fresh-approved.

## Still Blocked

- Staging smoke execution.
- Any staging/prod/cloud connection or deployment.
- Release readiness claim.
- Final Pass.
- Cost Calibration.
- Provider execution or configuration.
- Browser/runtime/dev-server/e2e execution.
- DB access or mutation.
- Source/test/dependency/package/lockfile changes.
- Schema/migration/seed changes.
- PR and force-push.
- Sensitive evidence capture.
