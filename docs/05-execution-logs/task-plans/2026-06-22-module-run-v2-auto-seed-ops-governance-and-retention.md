# Module Run v2 Auto-Seed Ops Governance And Retention Plan

## Task

- Task id: `module-run-v2-auto-seed-ops-governance-and-retention`
- Date: 2026-06-22
- Branch: `codex/ops-governance-retention-guarded-seed`
- Scope: guarded queue seeding for `ops-governance-and-retention` after organization-analytics batch 256-259 closed.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `scripts/agent-system/New-ModuleRunV2ImplementationSeed.ps1`
- `scripts/agent-system/Test-ModuleRunV2ImplementationSeedSelfReview.ps1`

## Proposal

- seedModule: `ops-governance-and-retention`
- seedSourcePlanningTask: `phase-75-advanced-retention-log-governance-implementation-planning`
- localFullLoopGate: `L6`
- seeded candidate count: 4
- candidate tasks:
  - `batch-260-ops-governance-and-retention-operations-facing-authorization-and-quota-go`
  - `batch-261-ops-governance-and-retention-redeem-code-redacted-reference`
  - `batch-262-ops-governance-and-retention-audit-log-and-ai-call-log-retention-and-reda`
  - `batch-263-ops-governance-and-retention-local-recovery-and-expired-hidden-boundary-c`

## Approval Boundary

- Fresh user approval: current user approved batch-serial continuation on 2026-06-22 covering closeout reconcile, ops-governance-and-retention seed proposal review, guarded seed, and serial local closeout for low-risk local implementation or historical reconcile tasks only.
- Standing closeout approval: applies to low-risk Module Run v2 local implementation tasks only when task closeoutPolicy and readiness gates pass.
- Blocked without fresh task-specific approval: Provider/model calls, env/secret access or changes, prompt/provider payload exposure, dependency/package/lockfile changes, schema/migration/seed/database work, dev-server/browser/e2e runtime, deploy, PR, force-push, payment/external service, org_auth runtime changes, raw employee answer exposure, full paper content exposure, plaintext `redeem_code`, and Cost Calibration Gate.

## Implementation Plan

1. Run read-only proposal confirmation.
2. Run `New-ModuleRunV2ImplementationSeed.ps1 -MaxBatchCount 4 -Apply` with explicit `autoDriveLocalImplementationApproval`.
3. Let the seed script append guarded pending implementation tasks and generate seeded evidence/audit templates.
4. Register the seed transaction itself in `task-queue.yaml`.
5. Add `opsGovernanceAndRetentionGuardedImplementationBatch20260622` in `project-state.yaml`.
6. Run seed self-review, readiness checks, formatting, lint, typecheck, git completion, precommit, closeout, and prepush.
7. Commit, fast-forward merge to `master`, push `origin/master`, clean the short branch, then claim batch-260.

## Non-Goals

- No product source implementation during seed.
- No package or lockfile changes.
- No schema, migration, seed, database connection, data mutation, script changes, env/secret access, Provider calls, dev server, browser/e2e, deployment, PR, force-push, payment, external service, org_auth runtime behavior changes, raw employee answer exposure, full paper content exposure, plaintext `redeem_code`, or Cost Calibration Gate work.
