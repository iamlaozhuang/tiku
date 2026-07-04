# 2026-07-04 Stage C-1 Secret Availability Decision

## Status

- Task ID: `stage-c-1-secret-availability-decision-2026-07-04`
- Decision status: prepared
- Execution status: not executed
- Secret value accessed: false
- `.env*` read/write: false
- Provider call: false
- DB/browser/dev-server/staging/Cost Calibration: false

## Problem

The Stage C-1 Provider smoke stopped before any Provider call because `ALIBABA_API_KEY` was absent from the current Codex
process environment. The next decision is how to make the key available to the local smoke process without weakening the
redaction boundary.

## Accepted Decision

Use parent-process or same-process-tree environment injection for the next Stage C-1 rerun.

The owner must make `ALIBABA_API_KEY` available before the smoke runner starts, in the same local execution environment
that will spawn the Codex shell/tool process. Codex may then perform only a boolean presence check and, after fresh
approval, one bounded Provider smoke.

If the current running Codex process cannot inherit the injected variable, the rerun must use a fresh Codex session
started from the prepared local environment. Child shell commands cannot reliably mutate the already-running parent
Codex process for future tool calls.

## Recommended Operator Path

1. Owner prepares a local PowerShell session outside the repository.
2. Owner sets `ALIBABA_API_KEY` only in that session/process tree, without writing `.env*` and without printing the
   value.
3. Owner starts or restarts Codex from that prepared session so future tool commands inherit the variable.
4. Codex reruns the same Stage C-1 Provider smoke scope only after fresh approval.
5. Evidence records only boolean presence, request count, status, timing/token summaries, and redacted stop/pass/fail
   category.

This decision intentionally does not provide or store the secret value.

## Rejected Paths

| Path                                              | Decision | Reason                                                                                 |
| ------------------------------------------------- | -------- | -------------------------------------------------------------------------------------- |
| Read or write repository `.env*`                  | rejected | Violates the current no `.env*` boundary and risks accidental commit/evidence leakage. |
| Paste the secret into chat, docs, or command logs | rejected | Creates durable transcript/log exposure.                                               |
| Persistent User/Machine environment variable      | deferred | Expands scope and needs separate approval plus cleanup/rotation plan.                  |
| DB/admin `model_config` or secret-reference write | rejected | Would change DB/config scope and is not needed for local process smoke.                |
| Dev server/browser route workaround               | rejected | Expands runtime boundary beyond this local process smoke.                              |
| Staging secret injection                          | rejected | Stage C-2 staging requires a separate approval package.                                |
| Source/test/script helper change                  | rejected | Not needed and would expand a docs-only decision task.                                 |

## Fresh Approval Needed For Rerun

Before rerunning Stage C-1, the owner should explicitly approve:

```text
Approve rerun of Stage C-1 Provider smoke after ALIBABA_API_KEY has been injected by the owner into the local Codex
parent process environment, with no .env* read/write, no secret value printed or committed, max 1 Provider call,
0 retries, qwen3.7-max on dashscope.aliyuncs.com, redacted evidence only, stop on first missing-secret/provider-fail/
unsafe/costly/unstable/redaction failure, and no release readiness/final Pass/production claim.
```

## Non-Claims

- No secret was provisioned.
- No Provider smoke was rerun.
- No Provider readiness.
- No staging readiness.
- No Cost Calibration.
- No release readiness.
- No final Pass.
- No production usability.
