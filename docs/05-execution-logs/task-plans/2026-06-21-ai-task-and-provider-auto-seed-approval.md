# Task Plan: ai-task-and-provider auto-seed approval

## Scope

- Task: materialize `autoDriveLocalImplementationApproval` for module `ai-task-and-provider`.
- Branch: `codex/ai-task-provider-auto-seed-approval-2026-06-21`.
- Source planning task: `phase-70-advanced-ai-task-domain-implementation-planning`.
- Seeded task range: `batch-232` through `batch-235`.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

## Approval Boundary

- User approved `autoDriveLocalImplementationApproval for module ai-task-and-provider`.
- Scope is limited to local low-risk implementation tasks.
- Per-task local commit, fast-forward merge to `master`, push to `origin/master`, and merged short-branch cleanup are approved when gates pass.
- Provider/env/dependency/schema/deploy/payment/PR/force-push/Cost Calibration Gate remain blocked.
- No provider/model call is allowed.
- Evidence must remain redacted.

## Allowed Files

- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

## Blocked Files

- `.env.local`
- `.env.example`
- `package.json`
- lockfiles
- `src/db/schema/**`
- `drizzle/**`
- provider/env/dependency/schema/deploy/payment files
- product source files during the seed transaction

## Implementation Plan

1. Confirm local repository is on `master`, clean, and synchronized with `origin/master`.
2. Inspect seed proposal and verify it selects `ai-task-and-provider` only.
3. Create a short branch from current `master`.
4. Run `New-ModuleRunV2ImplementationSeed.ps1 -Apply` with the approved redacted approval statement.
5. Run scoped seed self-review against exactly the newly seeded task ids.
6. Record validation results, commit, FF merge to `master`, push `origin/master`, and delete the merged short branch.

## Risk Controls

- Do not modify `src/**`, schema, migration, env, dependency, provider, payment, deploy, PR, or Cost Calibration Gate state.
- Do not claim any seeded implementation task until this seed transaction is committed and integrated.
- Treat unscoped seed self-review output as diagnostic-only when it scans unrelated closed historical seeded tasks.
