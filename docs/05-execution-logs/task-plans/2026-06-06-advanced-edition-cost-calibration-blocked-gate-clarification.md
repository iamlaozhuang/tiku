# Advanced Edition Cost Calibration Blocked Gate Clarification Task Plan

## Goal

Clarify the advanced edition Cost Calibration Gate as a blocked gate so future agents do not execute provider, env/secret, staging/prod/cloud/deploy, payment, or external-service work without fresh approval.

## Scope

Allowed changes:

- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- this task plan
- this task evidence
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked changes:

- product code, schema, migrations, tests, e2e, scripts, dependencies, package, lockfile, env/secret, provider, staging/prod/cloud/deploy, payment, external-service, Cost Calibration Gate execution, and code-stage queue seeding.

## Steps

1. Write the blocked-gate SOP.
2. Confirm it names fresh approval requirements and trigger terms.
3. Confirm it allows only docs-only blocked-state maintenance.
4. Update task state.
5. Run validation and record evidence.

## Validation

- `git diff --check`
- `Select-String -Path docs\04-agent-system\sop\advanced-edition-cost-calibration-blocked-gate.md -Pattern 'blocked','fresh explicit approval','provider','env/secret','staging','prod','cloud','deploy','payment','external-service'`
