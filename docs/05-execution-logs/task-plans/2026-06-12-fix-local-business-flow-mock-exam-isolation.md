# fix-local-business-flow-mock-exam-isolation Task Plan

## Task

- Task id: `fix-local-business-flow-mock-exam-isolation`
- Branch: `codex/fix-local-business-flow-mock-exam-isolation`
- Priority: P1
- Task kind: `e2e_hardening`
- Date: 2026-06-12
- Source: user request after L5 full e2e recorded a first-run `local-business-flow` `409311` failure and a retry pass.

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- ADR-001 through ADR-006
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-12-validation-l5-fresh-playwright-existing-specs.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-validation-l5-fresh-playwright-existing-specs.md`

## Problem Statement

The fresh-server L5 full e2e first run failed once in `e2e/local-business-flow.spec.ts` because mock answer save received business code `409311`, which maps to `Mock exam is not in progress.` The same spec passed when rerun in isolation, and the second full e2e run passed. This task should harden `local-business-flow` mock_exam state isolation/reset so fresh-server full e2e is first-run green.

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `e2e/local-business-flow.spec.ts`
- `e2e/local-business-flow-mock-exam-isolation.ts`
- `tests/unit/local-business-flow-mock-exam-isolation.test.ts`
- this task plan, evidence, and audit review

Blocked work:

- No dependency/package/lockfile, schema/migration, env/secret, provider, deploy, payment, external-service, PR, force-push, headed/debug/UI e2e, generated e2e artifact commit, or Cost Calibration Gate work.

## Debugging Approach

- Trace the mock_exam flow from `local-business-flow.spec.ts` to the API route/service/repository behavior.
- Confirm the `409311` condition and the state coupling that can make a just-started flow target a non-writable mock_exam.
- Prefer an e2e-local isolation helper over product runtime changes when the root cause is test state coupling.
- Use TDD for the helper shape: write a focused unit test for the e2e isolation helper, verify RED, then implement the smallest helper and wire it into the spec.

## Implementation Strategy

- Extract the student API flow inside `local-business-flow` into small exported helpers only as needed for unit coverage.
- Add a guard/reset loop that starts a fresh mock_exam and only proceeds when the returned mock_exam can accept an answer.
- Keep JSON contract assertions and sensitive payload checks unchanged.
- Avoid arbitrary sleeps; use explicit API result checks.
- Keep the test using the existing fresh Playwright server config.

## Validation Commands

- RED: `npm.cmd run test:unit -- tests/unit/local-business-flow-mock-exam-isolation.test.ts`
- GREEN focused unit: `npm.cmd run test:unit -- tests/unit/local-business-flow-mock-exam-isolation.test.ts`
- Full unit: `npm.cmd run test:unit`
- E2E list: `npm.cmd run test:e2e -- --list`
- First-run full fresh-server e2e: `npm.cmd run test:e2e`
- Static gates: `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run build`, `git diff --check`
- Scoped Prettier write/check for changed docs/state/test files

## Stop Conditions

- Stop if the fix requires env/secret inspection, provider calls, dependency changes, schema/migration, destructive database operations outside local e2e test-scoped behavior, deploy, external-service, headed/debug/UI e2e, or Cost Calibration Gate work.
