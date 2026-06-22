# Module Run v2 Seeded Task Plan: batch-283

## Task

- Task id: `batch-283-ops-governance-and-retention-local-recovery-and-expired-hidden-boundary-c`
- Module: `ops-governance-and-retention`
- Target closure: local recovery and expired-hidden boundary contracts.
- Seed source: `phase-75-advanced-retention-log-governance-implementation-planning`
- localFullLoopGate: L6

## Seeded Scope

- Use the generated queue scope and existing historical implementation evidence first.
- If implementation already exists, perform historical implementation reconcile and focused validation.
- Allowed source surfaces are limited to `src/server/models/**`, `src/server/contracts/**`, `src/server/validators/**`, and `src/server/services/**`.
- Governance updates are limited to `docs/04-agent-system/state/**` and `docs/05-execution-logs/**`.

## Blocked Gates

- No actual recovery, purge, deletion, or destructive data operation.
- No raw hidden/expired record exposure.
- No Provider/model calls.
- No `.env*` read/write/output.
- No package or lockfile changes.
- No schema, migration, seed, database connection, data mutation, dev server, browser, Playwright/e2e, deploy, PR, force push, payment, external service, org_auth runtime behavior change, plaintext redeem_code, raw prompt/provider payload/raw generated content/raw answer exposure, or Cost Calibration Gate work.

## Validation Plan

- Historical implementation reconcile:
  - Review existing recovery and expired-hidden boundary contracts and focused tests before touching source.
  - Confirm local recovery is represented as a safe boundary contract only and does not execute recovery, purge, deletion, or destructive data operations.
  - Do not change source if current implementation already satisfies the task.
- Focused unit command:
  - Replace the placeholder with an explicit scoped unit command before task closeout.
- Run `npm.cmd run lint`.
- Run `npm.cmd run typecheck`.
- Run `git diff --check`.
- Run Module Run v2 precommit, closeout, and prepush gates before commit, merge, push, and cleanup.
