# 2026-06-28 Full Acceptance Post-Repair Current Session Rerun

## Goal

Rerun the currently authenticated organization-admin localhost browser surfaces after the analytics load-state and organization AI provider-copy repairs, recording only redacted route/status/pass-fail evidence.

## Materialized Authorization

- Approved task: `full-acceptance-post-repair-current-session-rerun-2026-06-28`.
- Approval source: inherited full acceptance goal and per-task closeout authorization from the current user on 2026-06-28.
- Closeout authorization: local commit, fast-forward merge to `master`, push to `origin/master`, and merged short-branch cleanup are approved for this task only.
- Branch: `codex/full-acceptance-post-repair-current-session-rerun-20260628`.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-28-full-acceptance-post-repair-current-session-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-post-repair-current-session-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-full-acceptance-post-repair-current-session-rerun.md`
- `docs/05-execution-logs/acceptance/2026-06-28-full-acceptance-post-repair-current-session-rerun.md`

## Browser Scope

- Use only the current in-app browser localhost session.
- Allowed routes:
  - `http://localhost:3000/organization/organization-analytics`
  - `http://localhost:3000/organization/ai-question-generation`
  - `http://localhost:3000/organization/ai-paper-generation`
- Allowed checks: visible route status, redacted gap closure status, absence of owner-facing Provider copy on organization AI pages, analytics post-load explicit ready/empty/error state.

## Blocked Files And Capabilities

- No source, test, e2e, script, package/lockfile, schema, migration, seed, env, `.next`, Playwright artifact, or local private resource changes.
- No credential read or entry, role switching, cookie/token/session/localStorage/Authorization header capture, raw DOM, screenshot, trace, HTML report, or raw API payload evidence.
- No direct database connection, read/write, migration, seed, schema change, or destructive operation.
- No Provider/AI call, Provider configuration, Provider credential read, prompt capture, provider payload capture, raw AI input/output capture, or Cost Calibration Gate.
- No UI/API mutation or write-flow execution.
- No deployment, PR, force push, release readiness claim, or final Pass claim.

## Evidence Redaction

Allowed evidence: command names, route labels, role/surface labels, pass/fail status, redacted gap status summary, test counts, and commit SHA.

Forbidden evidence: credentials, env file content, DB URLs, API keys, connection strings, raw DOM, screenshots, traces, HTML reports, DB rows, internal IDs, emails, phone numbers, plaintext `redeem_code`, provider payloads, prompts, raw AI input/output, and complete question/paper/material/resource/chunk content.

## Read Standards

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

## Execution Plan

1. Connect to the in-app browser and use targeted checks that return only redacted status summaries.
2. Verify organization analytics no longer remains in the original pre-load state after the load action.
3. Verify organization AI question and paper pages do not show Provider-facing owner-facing copy.
4. Run full unit baseline, lint, typecheck, scoped formatting checks, and Module Run v2 gates.
5. Record redacted evidence, audit, and acceptance summary, then commit, fast-forward merge, push, and cleanup.

## Risk Controls

- Stop and record blocked if the current browser session is no longer authenticated; do not read or enter credentials.
- Stop and record blocked if a check would require submitting a write/mutation form or AI generation action.
- Do not inspect secrets, Provider config, prompt templates, raw AI content, DB rows, cookies, tokens, sessions, localStorage, or Authorization headers.
