# 2026-07-03 Repair Content Admin Cookie-Backed Acceptance Harness Plan

## Task

- Task ID: `repair-content-admin-cookie-backed-acceptance-harness-2026-07-03`
- Branch: `codex/repair-content-admin-cookie-backed-acceptance-harness-2026-07-03`
- Status: closed

## Read Baseline

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- 2026-07-03 blocked credential-backed 8-role acceptance evidence
- Working cookie-backed local harness examples:
  - `e2e/credential-backed-8-role-local-acceptance.spec.ts`
  - `e2e/local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts`
  - `e2e/personal-ai-generation-local-request.spec.ts`

## Root Cause

- `e2e/local-full-loop-knowledge-rag-maintenance-smoke.spec.ts` still expects `payload.data.token` after login.
- Current session contract is HttpOnly `tiku_session` cookie-backed and omits client-visible token material.
- `e2e/local-full-loop-ai-generation-paper-provider-smoke.spec.ts` also has a stale token expectation, but after request
  shape alignment it enters a Provider-executing route. It is therefore out of scope for this local no-Provider repair
  and must be handled only under Stage B Provider approval.

## Scope

Allowed:

- Update only the content resource/RAG acceptance harness to use cookie-backed session headers.
- Keep Provider, DB direct access, product source, schema, dependencies, env, staging/prod, deploy, PR, force push, cost,
  release readiness, final Pass, and production usability out of scope.
- Run focused Playwright tests with `--trace=off` and record redacted command outcomes.

Blocked:

- Product source changes.
- Direct DB connection or raw DB row evidence.
- Credentials, passwords, session/cookie values, headers, localStorage values, env values, Provider payloads, Prompt text,
  raw AI I/O, full content, screenshots, traces, raw DOM, or exports in evidence.

## TDD Sequence

1. RED: run `local-full-loop-knowledge-rag-maintenance-smoke.spec.ts` and confirm obsolete token failure.
2. GREEN: change the content resource/RAG harness to read the `Set-Cookie` header after login and send only the cookie
   pair in later requests.
3. Verify the focused content resource/RAG test passes with `--trace=off`.
4. Record the AI provider smoke as out-of-scope for this repair because a boundary probe showed Provider execution.
5. Run scoped Prettier, `git diff --check`, Module Run v2 pre-commit, and pre-push readiness.
