# Task Plan: batch-257 organization-analytics privacy-preserving employee statistics

## Scope

- Task id: `batch-257-organization-analytics-privacy-preserving-employee-statistics`
- Module: `organization-analytics`
- Target closure item: privacy-preserving employee statistics
- Branch policy: independent short-lived branch after batch-256 closes.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Existing organization-analytics source, tests, evidence, and audit records before editing.

## Execution Plan

1. Re-read the historical employee-statistics implementation and prior redaction evidence.
2. If implementation already exists, perform historical implementation reconcile and focused validation only.
3. If a low-risk gap remains within allowed files, add the smallest scoped model/contract/validator/service/test change preserving aggregate-only and privacy rules.
4. Run the task's pre-edit seed readiness check, focused unit validation, lint, typecheck, diff check, Module Run v2 precommit, closeout, and prepush.
5. Write redacted evidence and audit review, commit independently, fast-forward merge to `master`, push `origin/master`, and clean the short branch.

## Boundaries

- No raw employee answer, row-level employee data, full paper content, internal IDs, secret, token, database URL, provider payload, or prompt exposure in evidence.
- No env, provider, schema, migration, seed, database connection, package/lockfile, dev-server, browser/e2e runtime, deployment, PR, force-push, export object storage or external delivery, org_auth runtime behavior change, payment, external service, or Cost Calibration Gate work without fresh task-specific approval.
