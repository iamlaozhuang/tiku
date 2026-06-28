# Residual Active Queue Archive Index Cleanup After Staging Infra Planning Acceptance

## Acceptance Criteria

- Current task has an execution plan.
- Only diagnostic archive candidates are moved.
- Active queue removes the moved task blocks.
- Archive file contains the moved task blocks.
- Task history index has lookup entries for the moved tasks.
- Project state records a docs/state-only cleanup result.
- Evidence and audit records are redacted.
- Runtime, source, DB, Provider, Cost Calibration, staging/prod/deploy/payment/OCR/export, PR, force push, release readiness, and final Pass remain blocked.

## Acceptance Result

- Execution plan prepared: pass.
- Moved diagnostic candidate count: pass, 2.
- History index update count: pass, 2.
- Unregistered task moves: pass, 0.
- Redaction status: pass.
- Forbidden-action checklist: pass.
- Validation gates: pass after evidence structure repair rerun.

## Current Blocking Gate

The Goal remains blocked by missing staging infrastructure and missing concrete non-secret isolated staging target. This task does not unblock staging execution, production readiness, payment, OCR/export, release readiness, or final Pass.
