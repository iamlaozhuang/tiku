# 测试与 TDD 规范 (Testing And TDD)

## Status

Active policy with Vitest and Playwright tooling.

## Current State

The repository has selected and installed the baseline test tools:

- Unit tests: `vitest`
- Component-oriented DOM tests: `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, and `jsdom`
- End-to-end tests: `@playwright/test`

The current npm scripts are:

- `npm run test`
- `npm run test:unit`
- `npm run test:e2e`

Do not claim a gate passed until the exact command was run and the output was recorded in evidence.

## Testing Layers

Tiku uses layered tests:

1. **Unit tests**
   - Target pure functions, mappers, contracts, validators, and service logic without browser dependencies.
   - Good candidates: API response helpers, public ID mappers, authorization scope calculations.

2. **Integration tests**
   - Target route handlers, repositories, database migration behavior, and auth boundaries.
   - Database-backed tests may use Docker only after the local database workflow is documented.

3. **End-to-end tests**
   - Target browser workflows and workplace desktop compatibility.
   - Required for admin shell, student home, login, mock exam submission, and report viewing once those features exist.

## TDD Workflow

For business logic:

1. Write or update the test that describes the behavior.
2. Run the test and confirm it fails for the expected reason.
3. Implement the smallest change.
4. Run the test and confirm it passes.
5. Run lint and typecheck.
6. Record the command output in evidence.

## Regression Rule

For bug fixes:

- Reproduce the bug with a failing test or documented failing command.
- Fix the bug.
- Re-run the failing test or command and record the passing output.

If a bug cannot be automated yet, record why in `docs/06-issue-tracking/bug-reports/`.

## Tooling Change Gate

The initial tooling decision was completed in `phase-1-test-tooling-decision`.

Any future test framework add, remove, upgrade, browser install policy change, or major test runner configuration change is a dependency/tooling change. It must pass `docs/04-agent-system/sop/dependency-introduction-gate.md` and include `human approval` evidence before modifying package files or lockfiles.
