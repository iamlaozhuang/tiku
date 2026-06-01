# Phase 22 Runtime Preflight Plan

## Scope

Verify local dependency/script/port/forbidden-scope readiness before runtime checks.

## Steps

1. Confirm branch, status, master alignment, branch list, and worktree list.
2. Confirm required npm scripts exist without modifying `package.json`.
3. Confirm the local server port state before boot.
4. Run agent readiness.
5. Record forbidden-scope status without opening `.env.local`.

## Evidence Rules

Record command, result, and sanitized summary only. Do not record env values, credentials, DB URLs, provider payloads, raw prompts, raw answers, or raw model responses.

## Stop Conditions

Stop if required scripts are missing, branch isolation is broken, master is behind, or verification requires a forbidden file/action.
