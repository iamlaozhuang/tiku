# Module Run v2 Seeded Task Plan: batch-254

## Task

- Task id: `batch-254-organization-training-paper-and-mock-exam-context-usage-without-ex`
- Module: `organization-training`
- Target closure: paper and mock_exam context usage without exposing full paper content in evidence.
- Seed source: `phase-72-advanced-organization-training-implementation-planning`
- localFullLoopGate: L6

## Seeded Scope

- Use the generated queue scope and existing historical implementation evidence first.
- If implementation already exists, perform historical implementation reconcile and focused validation.
- Allowed source surfaces are limited to `src/server/models/**`, `src/server/contracts/**`, `src/server/validators/**`, and `src/server/services/**`.
- Governance updates are limited to `docs/04-agent-system/state/**` and `docs/05-execution-logs/**`.

## Blocked Gates

- No Provider/model calls.
- No `.env*` read/write/output.
- No package or lockfile changes.
- No schema, migration, seed, database connection, or data mutation.
- No dev server, browser, Playwright/e2e, deploy, PR, force push, payment, external service, org_auth runtime behavior change, raw employee answer exposure, full paper content exposure, or Cost Calibration Gate work.

## Validation Plan

- Replace the seeded placeholder with the focused unit command selected during implementation.
- Run `npm.cmd run lint`.
- Run `npm.cmd run typecheck`.
- Run `git diff --check`.
- Run Module Run v2 precommit, closeout, and prepush gates before commit, merge, push, and cleanup.
