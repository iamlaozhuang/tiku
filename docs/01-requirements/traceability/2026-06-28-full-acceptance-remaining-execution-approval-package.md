# Full Acceptance Remaining Execution Approval Package

## Current Baseline

| Area                                             | Status                                                                                             |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Full unit baseline                               | Green: 317 files / 1430 tests from the latest recorded full-unit run.                              |
| Analytics load-state repair                      | Completed and covered by focused plus full-unit validation.                                        |
| Organization AI Provider copy repair             | Completed; organization-facing covered surfaces no longer expose Provider wording.                 |
| Post-repair current-session browser rerun        | Partial: analytics pass; positive organization AI routes blocked by current session authorization. |
| Final all-role/all-flow/full-function acceptance | Not complete.                                                                                      |

## Remaining Gates

| Gate                                              | Status  | Fresh Approval Needed                        |
| ------------------------------------------------- | ------- | -------------------------------------------- |
| Session fixture / safe role switching             | Blocked | Yes                                          |
| Local UI/API mutation against test-owned fixtures | Blocked | Yes                                          |
| Provider/AI execution                             | Blocked | Yes, separate task-level approval            |
| Direct DB/schema/seed/migration                   | Blocked | Yes, separate task-level approval            |
| Dependency or package/lock change                 | Blocked | Yes, dependency gate and task-level approval |
| Release readiness / final Pass                    | Blocked | Yes, after all blockers are resolved         |
| Cost Calibration Gate                             | Blocked | Yes, separate explicit approval              |

## Copyable Approval Text

### Option A: Session Fixture Or Safe Role Switching

```text
Approve task-level execution for test-owned local account/session switching only.
Scope: localhost or 127.0.0.1, test-owned acceptance accounts or an approved safe role-switching method, redacted role/route/status evidence only.
Allowed roles: org_advanced_admin, org_standard_admin, org_advanced_employee, org_standard_employee, ops_admin, content_admin, personal_advanced_student, personal_standard_student.
Forbidden: recording credentials, cookies, tokens, sessions, localStorage, Authorization headers, env files, raw DOM, screenshots, traces, raw DB rows, Provider payloads, prompts, raw AI input/output, complete question/paper/material/resource/chunk content, direct DB changes, schema/migration/seed, dependency changes, staging/prod/deploy, PR, force-push, release readiness, final Pass, and Cost Calibration Gate.
```

### Option B: Local UI/API Mutation Against Test-Owned Fixtures

```text
Approve task-level localhost UI/API mutation execution only against explicitly test-owned local fixture data.
Scope: localhost or 127.0.0.1, named test-owned workflow rows, redacted route/workflow/mutation-class/status evidence only.
Allowed workflow classes: organization training draft create/copy where fixture ownership is explicit, local contract request submission where Provider remains blocked, and other non-destructive test-owned local workflow rows named in the task plan.
Forbidden: direct DB access, schema/migration/seed, destructive operations, unmarked or non-test-owned data mutation, credentials, cookies, tokens, sessions, localStorage, Authorization headers, env files, raw DOM, screenshots, traces, raw DB rows, Provider payloads, prompts, raw AI input/output, complete question/paper/material/resource/chunk content, dependency changes, staging/prod/deploy, PR, force-push, release readiness, final Pass, and Cost Calibration Gate.
```

### Option C: Combined Local Matrix Continuation

```text
Approve task-level execution for Option A and Option B together.
Scope: localhost or 127.0.0.1, test-owned local account/session switching and explicitly test-owned local UI/API mutation rows only, redacted role/route/workflow/status evidence only.
Forbidden: direct DB access, schema/migration/seed, destructive operations, unmarked or non-test-owned data mutation, Provider/AI calls, Provider config or credential access, prompts, raw AI input/output, credentials, cookies, tokens, sessions, localStorage, Authorization headers, env files, raw DOM, screenshots, traces, raw DB rows, complete question/paper/material/resource/chunk content, dependency changes, staging/prod/deploy, PR, force-push, release readiness, final Pass, and Cost Calibration Gate.
```

## Recommendation

Approve Option A first, then execute a role/session coverage task that records only redacted role, route, workflow, and blocked/pass status. After that, use the new evidence to decide whether Option B is needed for remaining write-flow rows.

## Non-Approval Statement

This package does not approve any browser, session, credential, DB, Provider, mutation, release, or final Pass execution. It only prepares task-level fresh approval language and preserves the current blocker map.
