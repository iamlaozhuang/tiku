# Advanced Edition Evidence Redaction Template Task Plan

## Goal

Create a docs-only evidence redaction template for advanced edition tasks.

## Scope

Allowed changes:

- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- this task plan
- this task evidence
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked changes:

- product code, schema, migrations, tests, e2e, scripts, dependencies, package, lockfile, env/secret, provider, staging/prod/cloud/deploy, payment, external-service, Cost Calibration Gate execution, and code-stage queue seeding.

## Steps

1. Define required evidence shape.
2. Define allowed evidence values.
3. Define sensitive field denylist.
4. Define redacted summary patterns for `audit_log`, `ai_call_log`, `redeem_code`, prompt, provider payload, secret, and token.
5. Update task state and run validation.

## Validation

- `git diff --check`
- `Select-String -Path docs\04-agent-system\sop\advanced-edition-evidence-redaction-template.md -Pattern 'audit_log','ai_call_log','redeem_code','prompt','provider payload','secret','token'`
