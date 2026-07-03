# 2026-07-03 Repair Student Practice Restart Acceptance Harness Task Plan

## Task

- Task ID: `repair-student-practice-restart-acceptance-harness-2026-07-03`
- Branch: `codex/repair-student-practice-restart-acceptance-harness-2026-07-03`
- Source task: `source-landing-8-role-local-acceptance-2026-07-03`
- Goal: repair the existing student practice local acceptance harness so it follows the current two-step restart confirmation contract.

## Fresh Approval

The current user approved this repair, local validation, fast-forward merge to `master`, push to `origin/master`, short-branch cleanup, and continuation into a full 8-role local acceptance rerun under the stop-on-fail/block rule.

## Scope

- In scope: `e2e/student-practice-mock-entry.spec.ts`, task plan, redacted evidence, audit, project state, task queue.
- Out of scope: product source, schema, dependencies, direct DB access, env secret access, Provider calls, staging/prod/deploy, PR, force push, Cost Calibration, release readiness, final Pass, production usability.

## Root Cause

- The failing test waited for `POST /api/v1/practices/{redacted}/restart` immediately after clicking `practice-resume-restart-button`.
- Current UI source shows that this first click opens `practice-restart-confirmation`.
- The restart request is sent only after the confirmation action.
- Therefore the repair target is the acceptance harness, not product behavior.

## TDD Plan

1. RED: run the existing student practice spec and confirm it fails at the restart wait.
2. GREEN: change only the existing spec to click the confirmation action before awaiting the restart response.
3. VERIFY: rerun the same spec with line reporter and trace disabled.
4. Run lint, typecheck, scoped Prettier check, `git diff --check`, Module Run v2 pre-commit and pre-push readiness.

## Redaction

Evidence may contain command names, exit status, file paths, role names, and assertion categories. Evidence must not contain credentials, sessions, cookies, auth headers, env values, DB rows, internal ids, PII, plaintext `redeem_code`, Provider payloads, Prompt text, AI input/output, full content, screenshots, traces, or DOM dumps.
