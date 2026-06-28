# Traceability: Full Acceptance Session Fixture Boundary

- Task id: `full-acceptance-session-fixture-boundary-2026-06-28`
- Source task: `full-acceptance-matrix-execution-2026-06-28`
- Branch: `codex/full-acceptance-session-fixture-boundary-20260628`
- Status: closed

## Source Gap

The full acceptance matrix recorded blocked Student and Ops/Admin workflow coverage because the current task did not have
approval to read, enter, store, echo, or capture account credentials, cookies, tokens, sessions, localStorage values, or
Authorization headers.

## Boundary Decision

This task prepares only the docs/state approval package for future test-owned local account/session switching. It does not
execute login, browser role-flow validation with credentials, session fixture access, storage inspection, DB access, source or
test changes, Provider/AI calls, dependency changes, or final acceptance Pass.

## Future Approval Package

The smallest future execution package should be explicit and limited:

```text
Approve task-level execution for test-owned local account/session switching only.
Scope: localhost or 127.0.0.1, test-owned acceptance accounts or an approved safe role-switching method, redacted role/route/status evidence only.
Forbidden: recording credentials, cookies, tokens, sessions, localStorage, Authorization headers, env files, raw DOM, screenshots, traces, raw DB rows, Provider payloads, prompts, raw AI input/output, complete question/paper/material/resource/chunk content, direct DB changes, schema/migration/seed, dependency changes, staging/prod/deploy, PR, force-push, release readiness, final Pass, and Cost Calibration Gate.
Closeout: local commit, fast-forward merge to master, push origin/master, and merged branch cleanup remain allowed only if task gates pass.
```

## Requirement Mapping

| Requirement area            | Current status                     | Future unblock requirement                                            |
| --------------------------- | ---------------------------------- | --------------------------------------------------------------------- |
| Student workflows           | Blocked by credential boundary     | Approved test-owned local student session path                        |
| Content/Ops admin workflows | Blocked by credential boundary     | Approved test-owned local admin role session path                     |
| Organization workflows      | Partially covered with current org | Additional role-switching only if future task explicitly approves it  |
| Evidence redaction          | Required                           | Role labels, route labels, pass/fail/blocked status, gap summary only |

## Non-Goals

- No credential, token, cookie, session, localStorage, Authorization header, env, DB, Provider, prompt, or raw AI data access.
- No browser login execution.
- No source, test, package, lockfile, schema, migration, seed, script, e2e, or dependency changes.
- No Cost Calibration Gate, staging/prod/deploy, PR, force-push, release readiness, or final acceptance Pass.
