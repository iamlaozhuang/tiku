# Batch 195: Redacted Audit Log And AI Call Log Evidence References

## Scope

- Task id: `batch-195-ai-task-and-provider-redacted-audit-log-and-ai-call-log-evidence`
- Execution profile: `local_unit_tdd`
- Evidence mode: `full`
- Validation policy: `local_unit`
- Target closure: redacted `audit_log` and `ai_call_log` evidence references

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`

## Implementation Plan

- Add a focused red test for explicit evidence reference availability status.
- Extend the local evidence reference item with `referenceStatus: available | missing`.
- Preserve `summary_only` visibility and `redacted` status.
- Keep raw content, provider payloads, and row data out of contracts and evidence.

## Validation

- Pre-edit auto-seed readiness gate.
- Focused unit test for `src/server/services/ai-generation-task-log-evidence-reference-service.test.ts`.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- Module closeout readiness.

## Blocked Gates

- Provider/model calls remain blocked.
- Credential and `.env*` access remains blocked.
- Dependency/package/lockfile changes remain blocked.
- Schema/drizzle/migration changes remain blocked.
- Cloud/deploy/payment/external-service work remains blocked.
- PR/force-push and Cost Calibration Gate remain blocked.
