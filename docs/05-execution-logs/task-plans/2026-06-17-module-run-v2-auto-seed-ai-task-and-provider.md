# Module Run v2 Auto-Seed Plan: ai-task-and-provider

## Scope

- Apply the approved `autoDriveLocalImplementationApproval` for `ai-task-and-provider`.
- Seed only guarded low-risk local implementation tasks.
- Keep provider/model calls, credential access, dependency/package/lockfile changes, schema/drizzle/migration work, cloud/deploy/payment/external-service work, PR/force-push, and Cost Calibration Gate blocked.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`

## Implementation Plan

- Run the project status and next-action diagnostics.
- Apply the seed transaction only after the script reports `seedModule: ai-task-and-provider`.
- Run seed self-review limited to the four generated task ids.
- Record redacted evidence and audit notes.
- Commit and integrate the seed transaction before claiming seeded implementation work.

## Risk Controls

- No `.env*` reads or writes.
- No provider/model call.
- No schema, migration, dependency, package, lockfile, deploy, cloud, payment, or external-service change.
- Evidence records command outcomes only; no raw prompts, raw answers, provider payloads, private row data, public identifier inventories, credentials, database URLs, or Authorization headers.
