# Test Acceptance Redacted E2E Evidence Policy Review Traceability

> Scope: redacted evidence policy only. No browser, e2e, dev server, DB, Provider, dependency, source/test edit,
> staging/prod/deploy, release readiness, final Pass, or Cost Calibration work was executed.

## Source Evidence

| Source                                                           | Status    | Use                                                                               |
| ---------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------- |
| `test-acceptance-regression-risk-inventory-2026-06-29`           | closed    | predecessor test/e2e inventory and evidence policy finding                        |
| `test-acceptance-evidence-status-reconciliation-2026-06-29`      | closed    | current-state acceptance labels and blocked gate preservation                     |
| `test-acceptance-runtime-gate-split-review-2026-06-29`           | closed    | runtime lane split and recommendation for redacted evidence policy                |
| `e2e/**`                                                         | read-only | evidence-capture keyword label counts only                                        |
| `package.json`                                                   | read-only | script labels only                                                                |
| `playwright.config.ts`                                           | read-only | artifact/report configuration label presence only                                 |
| `docs/04-agent-system/state/project-state.yaml` and `task-queue` | updated   | task boundary, allowed files, blocked files, redaction rules, and closeout policy |

## Evidence Policy Matrix

| Surface                     | Allowed evidence                                                                 | Forbidden evidence                                                                                 | Gate status                    |
| --------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------ |
| command execution           | command label, exit status, timing summary, validation result class              | full stdout/stderr dumps containing private values, raw stack traces, or account materials         | allowed_only_when_task_scoped  |
| browser/e2e runtime         | artifact policy status and redacted pass/fail class                              | raw DOM, screenshots, traces, videos, HTML reports, page content, and Playwright report artifacts  | blocked_in_this_task           |
| auth/session/account lanes  | lane label, role label, redacted count, pass/fail class                          | cookies, tokens, sessions, storage state, localStorage, Authorization headers, credentials         | policy_required_before_runtime |
| API/network request lanes   | route family label, status class, count, high-level failure category             | request bodies, response bodies, raw headers, Authorization headers, account identifiers           | policy_required_before_runtime |
| DB-backed lanes             | blocked status, DB lane label, repository/API category, task id                  | raw rows, internal IDs, PII, email, phone, plaintext `redeem_code`, connection strings             | fresh_db_runtime_approval_only |
| Provider/AI/RAG lanes       | blocked status, Provider lane label, disabled/fake status, task id               | Provider payloads, prompts, raw AI input/output, model config values, raw Provider errors          | fresh_provider_approval_only   |
| content-bearing workflows   | content class label, risk family, count, redacted status                         | complete question, paper, material, resource, chunk, answer, or employee subjective answer content | redacted_summary_only          |
| closeout and git operations | branch, commit, fast-forward merge, push target, cleanup status, validation gate | PR metadata expansion, force-push, deployment output, release readiness/final Pass claims          | local_closeout_only            |

## Policy Requirements

- Future browser/e2e tasks must explicitly state artifact capture policy before runtime execution.
- Future browser/e2e tasks must not record raw screenshots, traces, videos, DOM, HTML reports, storage state, request or
  response bodies, or private account material.
- Future runtime evidence must record redacted status classes and counts only.
- Provider/AI, DB-backed, and staging lanes remain separately blocked and cannot inherit approval from this policy task.
- This policy does not authorize e2e execution; it only defines the minimum evidence redaction boundary required before a
  later task can request or consume runtime approval.

## Follow-Up Gate Alignment

| Follow-up                                                                      | Current relationship to this policy                                |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `test-acceptance-e2e-runtime-boundary-approval-package-2026-06-29`             | may consume this policy as a prerequisite before any runtime work  |
| `test-acceptance-provider-ai-e2e-runtime-boundary-approval-package-2026-06-29` | still needs fresh Provider/browser runtime approval                |
| `test-acceptance-db-backed-e2e-runtime-boundary-approval-package-2026-06-29`   | still needs fresh DB/browser runtime approval                      |
| `test-acceptance-staging-e2e-runtime-boundary-approval-package-2026-06-29`     | remains blocked by current goal and release/staging boundary       |
| future write-flow acceptance tasks                                             | must materialize local write-flow scope and redacted evidence rule |

## Non-Goals Preserved

- No release readiness.
- No final Pass.
- No Cost Calibration.
- No staging smoke.
- No Provider call or configuration.
- No DB connection, DB read/write, raw rows, schema, migration, or seed.
- No browser, dev-server, Playwright runtime, screenshot, trace, raw DOM, video, or HTML report.
- No source/test/e2e spec/package/lockfile/dependency changes.
- No credential, token, session, cookie, localStorage, Authorization header, env, secret, or connection-string evidence.
