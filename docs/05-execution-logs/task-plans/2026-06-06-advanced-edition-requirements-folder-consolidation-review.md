# Advanced Edition Requirements Folder Consolidation Review Task Plan

## Goal

Review the advanced edition derived requirement reading surface for source preservation, terminology compliance, blocked gate protection, and evidence integrity.

## Scope

Allowed changes:

- review audit
- review evidence
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked changes:

- moving, deleting, or renaming existing requirement documents;
- product code, schema, migrations, tests, e2e, scripts, dependencies, package, lockfile, env/secret, provider, staging/prod/cloud/deploy, payment, external-service, Cost Calibration Gate execution, and code-stage queue seeding.

## Review Checklist

1. Confirm the new docs are a derived reading surface.
2. Confirm standard edition `modules/` and `stories/` remain in place.
3. Confirm advanced edition source specs/plans remain in place.
4. Confirm required terms appear: `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, `ai_call_log`.
5. Confirm Cost Calibration Gate remains blocked.
6. Confirm no code-stage queue seeding occurred.

## Validation

- `git diff --check`
- Prettier check on changed docs and state files
- Required term search
- Source preservation check
