# Verify Local Acceptance Session Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to execute this plan in the current
> session. Use codex-security:fix-finding for security closure, use superpowers:test-driven-development before any
> production source change, and use superpowers:verification-before-completion before claiming completion.

## Task

- Task id: `verify-local-acceptance-session-boundary-2026-06-29`
- Branch: `codex/verify-local-acceptance-boundary-20260629`
- Source finding: `sec-redlog-003` from `security-data-redaction-log-boundary-inventory-2026-06-29`
- Goal: prove local acceptance session creation remains production-disabled, localhost-only, cookie-mode only, and free
  of credential-like exposure in response bodies or evidence.

## Governance Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest related task plan, evidence, acceptance, audit, and traceability for:
  - `detail-optimization-security-review-kickoff-2026-06-29`
  - `security-data-redaction-log-boundary-inventory-2026-06-29`
  - `verify-ai-provider-error-snapshot-redaction-2026-06-29`

## Scope

Allowed writable files:

- `src/app/api/v1/local-acceptance-sessions/route.ts`
- `src/server/services/local-acceptance-session-service.ts`
- `tests/unit/local-acceptance-session-bootstrap.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-verify-local-acceptance-session-boundary.md`
- `docs/05-execution-logs/task-plans/2026-06-29-verify-local-acceptance-session-boundary.md`
- `docs/05-execution-logs/evidence/2026-06-29-verify-local-acceptance-session-boundary.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-verify-local-acceptance-session-boundary.md`
- `docs/05-execution-logs/acceptance/2026-06-29-verify-local-acceptance-session-boundary.md`

Implementation preference:

- Prefer focused regression-test proof only.
- Change production source only if the new regression proves a current local acceptance boundary gap.
- If production source changes, keep it limited to the scoped route or service.

Blocked actions:

- No staging, production, cloud, deployment, release readiness, final Pass, or Cost Calibration.
- No database connection, mutation, schema, migration, seed, raw row access, or DB evidence capture.
- No Provider or AI call, provider configuration, model configuration, prompt capture, or raw AI input/output evidence.
- No browser runtime, dev server, raw DOM, screenshots, traces, or HTML report capture.
- No account fixture read, login, private account read, credential, cookie, session, localStorage, Authorization header,
  env file, or connection-string evidence.
- No package or lockfile changes, dependency introduction, dependency removal, or dependency upgrade.
- No PR creation and no force-push.

## Regression Plan

1. Inspect existing local acceptance session unit tests and implementation.
2. Add or confirm focused assertions for:
   - production-mode route denial;
   - localhost-only route allowance and remote-host denial;
   - response body omitting credential-like material while cookie mode remains declared;
   - unsupported role rejection.
3. Keep tests synthetic and local-only; do not read account fixtures or start runtime/browser sessions.
4. Record only redacted command status, counts, and assertion summaries in evidence.

## Evidence Rules

Record only:

- File paths, test names, commands, pass/fail status, counts, redacted assertion summaries, commit hash, branch, merge
  target, push target, and cleanup result.

Do not record:

- Credential, cookie, session, localStorage, Authorization header, env value, connection string, raw DB row, internal ID,
  PII, email, phone, plaintext `redeem_code`, Provider payload, prompt, raw AI input/output, raw DOM, screenshot, trace,
  HTML report, exception payload, stack trace, or complete question/paper/material/resource/chunk content.

## Validation Commands

```powershell
npx.cmd prettier --write --ignore-unknown src/app/api/v1/local-acceptance-sessions/route.ts src/server/services/local-acceptance-session-service.ts tests/unit/local-acceptance-session-bootstrap.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-verify-local-acceptance-session-boundary.md docs/05-execution-logs/task-plans/2026-06-29-verify-local-acceptance-session-boundary.md docs/05-execution-logs/evidence/2026-06-29-verify-local-acceptance-session-boundary.md docs/05-execution-logs/audits-reviews/2026-06-29-verify-local-acceptance-session-boundary.md docs/05-execution-logs/acceptance/2026-06-29-verify-local-acceptance-session-boundary.md
npx.cmd prettier --check --ignore-unknown src/app/api/v1/local-acceptance-sessions/route.ts src/server/services/local-acceptance-session-service.ts tests/unit/local-acceptance-session-bootstrap.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-verify-local-acceptance-session-boundary.md docs/05-execution-logs/task-plans/2026-06-29-verify-local-acceptance-session-boundary.md docs/05-execution-logs/evidence/2026-06-29-verify-local-acceptance-session-boundary.md docs/05-execution-logs/audits-reviews/2026-06-29-verify-local-acceptance-session-boundary.md docs/05-execution-logs/acceptance/2026-06-29-verify-local-acceptance-session-boundary.md
npm run test:unit -- tests/unit/local-acceptance-session-bootstrap.test.ts
npm run lint
npm run typecheck
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId verify-local-acceptance-session-boundary-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId verify-local-acceptance-session-boundary-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId verify-local-acceptance-session-boundary-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

- Local commit: approved by active thread task materialization.
- Fast-forward merge to `master`: approved by active thread task materialization after validation passes.
- Push `origin/master`: approved by active thread task materialization after validation passes.
- Cleanup short branch: approved by active thread task materialization after merge and push.
