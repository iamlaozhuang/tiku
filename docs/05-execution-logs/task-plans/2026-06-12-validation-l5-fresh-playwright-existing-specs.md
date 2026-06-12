# validation-l5-fresh-playwright-existing-specs Task Plan

## Task

- Task id: `validation-l5-fresh-playwright-existing-specs`
- Branch: `codex/validation-l5-fresh-playwright-existing-specs`
- Task kind: `validation_only`
- Date: 2026-06-12
- Gate: L5 local e2e
- Source: user request after P1 unit gate fix

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- ADR-001 through ADR-006
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-12-fix-unit-gate-student-authorization-context-contract.md`

## Preconditions

- P1 unit gate fix completed before this task.
- `npm.cmd run test:unit` passed with 239 test files and 856 tests.
- `playwright.config.ts` default fresh server behavior is in place: local `webServer.reuseExistingServer` defaults to `false` unless explicitly opted in with `TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER=1`.

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- This task plan, evidence, and audit review

Blocked work:

- No product code, unit test, e2e spec, dependency/package/lockfile, schema/migration, env/secret, provider, deploy, payment, external-service, PR, force-push, `test:e2e:ui`, headed/debug browser mode, or Cost Calibration Gate work.

## Approach

- List existing Playwright specs with `npm.cmd run test:e2e -- --list`.
- Run existing specs with `npm.cmd run test:e2e`.
- Rely on default fresh-server Playwright config; do not set `TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER=1`.
- Record command results and failures, if any, in redacted evidence.
- Run lint/typecheck/diff check after evidence docs are written.

## Validation Commands

- `npm.cmd run test:e2e -- --list`
- `npm.cmd run test:e2e`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`

## Stop Conditions

- Stop if validation requires env/secret inspection, provider calls, dependency changes, e2e spec edits, headed/debug/UI mode, deploy, external-service, or Cost Calibration Gate work.
