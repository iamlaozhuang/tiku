# Phase 32 Advanced Edition Doc Governance Batch Queueing Task Plan

## Goal

Create a serial docs-only batch queue for advanced edition document governance hardening before any code-stage implementation queue seeding.

## Scope

Allowed changes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan
- this task evidence
- this task review record

Blocked changes:

- product code under `src/**`
- database schema or migrations under `src/db/schema/**` or `drizzle/**`
- tests, e2e, scripts, package, lockfile, dependencies
- `.env.local`, `.env.example`, env/secret work
- provider, staging, prod, cloud, deploy, payment, or external-service work
- Cost Calibration Gate execution
- code-stage implementation subtask creation

## Batch Design

The batch is serial and review-gated. Each productive docs-only task is followed by a review task:

1. Source-of-truth index.
2. Source-of-truth index review.
3. Cost Calibration Gate blocked-state clarification.
4. Cost Calibration Gate blocked-state clarification review.
5. Evidence and redaction template.
6. Evidence and redaction template review.
7. Implementation boundary checklist.
8. Implementation boundary checklist review.

Each productive task must complete its own plan, evidence, validation, and local commit on a short branch. Its paired review must then inspect scope, terminology, blocked gates, and validation evidence. Only after the paired review passes may the branch be merged to `master`, pushed to `origin/master`, and cleaned up.

## Risk Defense

- The batch contains no product code implementation task.
- The batch contains no provider, env/secret, staging/prod/cloud/deploy, payment, or external-service action.
- The batch keeps Cost Calibration Gate blocked.
- The batch avoids `license`, `exam_paper`, and other non-project terminology.
- Every task is constrained to docs-only files and has explicit blocked files.

## Validation Plan

- `git diff --check`
- Prettier check for modified markdown/yaml files.
- Pattern checks for every queued task id.
- Pattern checks for `review`, `Cost Calibration Gate remains blocked`, `code-stage queue seeding remains paused`, and `taskKind: docs_only`.
