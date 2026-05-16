# 测试与 TDD 规范 (Testing And TDD)

## Status

Active policy, pending tooling implementation.

## Current State

The repository has not selected or installed a test framework yet. Therefore:

- Do not add `test` script placeholders that do not run real tests.
- Do not claim tests pass until a real test command exists and has been run.
- Any test framework dependency must pass the dependency introduction gate.

## Testing Layers

Tiku should use layered tests once tooling is approved:

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

## Tooling Decision Gate

The first Phase 1 task for testing is `phase-1-test-tooling-decision`. It must decide tooling before package changes. The decision must include `human approval` evidence before modifying package files.
