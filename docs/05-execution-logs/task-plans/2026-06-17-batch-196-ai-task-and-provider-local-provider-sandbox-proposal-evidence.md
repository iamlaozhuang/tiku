# Batch 196: Local Provider Sandbox Proposal And Evidence Rules

## Scope

- Task id: `batch-196-ai-task-and-provider-local-provider-sandbox-proposal-and-evidence`
- Execution profile: `local_unit_tdd`
- Evidence mode: `full`
- Validation policy: `local_unit`
- Target closure: `local_provider_sandbox` proposal and evidence rules

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`

## Implementation Plan

- Add a focused red test proving sandbox evidence rules do not allow public identifier lists.
- Replace `redacted_log_public_ids` metadata with a reference-status-only metadata key.
- Preserve local-only provider sandbox proposal behavior and blocked gates.
- Keep provider/model calls, environment access, dependency changes, schema changes, and Cost Calibration blocked.

## Validation

- Pre-edit auto-seed readiness gate.
- Focused unit test for `src/server/services/ai-generation-task-provider-sandbox-proposal-service.test.ts`.
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
