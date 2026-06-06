# Advanced Edition Evidence Redaction Template Review Task Plan

## Goal

Review the evidence redaction template for scope control, terminology compliance, and sensitive evidence handling.

## Scope

Allowed changes:

- docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md
- docs/05-execution-logs/audits-reviews/2026-06-06-advanced-edition-evidence-redaction-template-review.md
- docs/05-execution-logs/task-plans/2026-06-06-advanced-edition-evidence-redaction-template-review.md
- docs/05-execution-logs/evidence/2026-06-06-advanced-edition-evidence-redaction-template-review.md
- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml

Blocked changes:

- product code, schema, migrations, tests, e2e, scripts, dependencies, package, lockfile, env/secret, provider, staging/prod/cloud/deploy, payment, external-service, Cost Calibration Gate execution, and code-stage queue seeding.

## Review Checklist

1. Confirm the SOP is docs-only and changes no runtime behavior.
2. Confirm the SOP uses project terms including `authorization`, `redeem_code`, `audit_log`, and `ai_call_log`.
3. Confirm sensitive raw prompt, provider payload, secret, token, and cleartext `redeem_code` values are prohibited in evidence.
4. Confirm the SOP does not approve Cost Calibration Gate execution or external-service work.
5. Confirm validation evidence is recorded before completion.

## Validation

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\sop\advanced-edition-evidence-redaction-template.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-evidence-redaction-template.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-evidence-redaction-template.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-evidence-redaction-template-review.md docs\05-execution-logs\audits-reviews\2026-06-06-advanced-edition-evidence-redaction-template-review.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-evidence-redaction-template-review.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml`
- `Select-String -Path docs\04-agent-system\sop\advanced-edition-evidence-redaction-template.md -Pattern 'audit_log','ai_call_log','redeem_code','prompt','provider payload','secret','token'`
- `Select-String -Path docs\05-execution-logs\audits-reviews\2026-06-06-advanced-edition-evidence-redaction-template-review.md -Pattern 'pass','Scope Review','Blocking Findings','Sensitive Field Review'`
