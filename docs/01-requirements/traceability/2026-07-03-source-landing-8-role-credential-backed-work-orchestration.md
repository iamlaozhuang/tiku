# 2026-07-03 Source Landing 8 Role Credential-Backed Work Orchestration

## Status

This is a next-work orchestration recommendation only. It does not approve source changes, test changes, schema,
migrations, DB access, Provider execution, env-secret access, browser/runtime validation, staging/prod deployment,
release readiness, final Pass, production usability, or Cost Calibration.

## Recommended Serial Chain

| Step | Task shape                                                       | Purpose                                                                                                                             | Approval needed before execution                                                                                                          |
| ---- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `source-landing-8-role-credential-backed-fixture-hardening-plan` | Convert the coverage checklist into an exact fixture/data/account target matrix and acceptance standard.                            | Docs/state only; no runtime approval needed if kept read-only.                                                                            |
| 2    | `source-landing-8-role-local-account-data-fixture-hardening`     | Materialize or adjust local-only seeded accounts, test-owned data, and e2e harness helpers required for credential-backed coverage. | Fresh approval for touched test/fixture/seed/script files; separate approval for any local DB reset/import/write; no env-secret evidence. |
| 3    | `source-landing-8-role-credential-backed-local-acceptance-rerun` | Rerun 8 roles with credential-backed evidence preferred and fixture-first allowed only where explicitly approved.                   | Fresh runtime approval for Playwright/browser/dev-server webserver use and redacted evidence.                                             |
| 4    | `source-landing-8-role-gap-repair-loop-*`                        | Stop on first fail/block, repair only the proven root cause, then merge and restart full 8-role rerun from the beginning.           | Per-repair task approval; product/test/source/DB/provider boundaries must be narrower than the failure requires.                          |
| 5    | `source-landing-stage-b-acceptance-approval-pack`                | Prepare higher-risk approval material for DB-backed, Provider-backed, staging, or owner acceptance gates.                           | Approval package only unless the user explicitly authorizes execution.                                                                    |

## Preparation Materials

- Current 8-role coverage checklist.
- Role-specific target criteria: which rows require `credential_backed_runtime`, which may remain fixture supplement.
- Local account matrix by role, edition, organization context, `authorization`, quota owner, and denied routes.
- Test-owned data matrix for `practice`, `mock_exam`, `exam_report`, `mistake_book`, `企业训练`, organization analytics,
  content resources, content AI drafts, `redeem_code`, `org_auth`, employee import/password, and redacted logs.
- Redaction policy that forbids credentials, sessions, cookies, headers, env values, raw DB rows, internal ids, PII,
  plaintext `redeem_code`, Provider payloads, Prompt text, AI input/output, full content, screenshots, traces, and DOM
  dumps in committed evidence.

## Permission Gates

| Gate                             | Default for next chain                                                                   | Notes                                                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Product source                   | Blocked unless a later fail/block proves a product defect and fresh approval is granted. | Avoid source work during fixture planning.                                                                    |
| Test/e2e source                  | Needs fresh task-scoped approval.                                                        | Likely needed for credential-backed hardening.                                                                |
| Seed/fixture/script files        | Needs fresh task-scoped approval.                                                        | Include exact allowed files before editing.                                                                   |
| Local DB read/write/reset/import | Blocked until explicitly approved.                                                       | Prefer existing test-owned harnesses and redacted aggregate evidence.                                         |
| Env-secret read/write            | Blocked by default.                                                                      | Do not require it for local fixture hardening unless separately approved.                                     |
| Provider calls                   | Blocked.                                                                                 | Keep AI surfaces as UI/contract unless a separate Provider gate is approved.                                  |
| Screenshots/traces/DOM dumps     | Blocked by default.                                                                      | Use summary-only evidence unless a later approval changes the evidence mode.                                  |
| Staging/prod/deploy              | Blocked.                                                                                 | Stage B should be a separate approval package.                                                                |
| PR/force push                    | Blocked.                                                                                 | Continue local short branch, fast-forward merge, push `origin/master`, and branch cleanup only when approved. |

## Stop Rule

Each task in the chain must be independently materialized, validated, committed, fast-forward merged, pushed, and cleaned
before the next task starts. Any fail/block stops the chain and creates a narrower repair task; do not batch unrelated
fixes into the acceptance rerun.
