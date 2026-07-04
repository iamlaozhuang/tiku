# 2026-07-04 Full-chain Scenario 2 Rerun Closeout SHA Repair Plan

## Task

- Task id: `full-chain-scenario-2-rerun-closeout-sha-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-2-rerun-closeout-sha-repair-2026-07-04`
- Source block: `full-chain-scenario-2-content-baseline-rerun-after-pack-provisioning-2026-07-04`
- Approval source: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-pack-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-pack-provisioning.md`
- `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`

## Boundary

- Allowed writes: state, queue, this plan, redacted evidence, audit.
- Blocked: source/test changes, package or lockfile changes, schema/migration/seed, DB read/write, browser/e2e,
  Provider/staging/prod/Cost, credentials, raw rows, raw DOM, screenshots, traces, release readiness/final Pass claim.

## Plan

1. Record the pre-push hard block as repository checkpoint drift.
2. Update `repository.lastKnownMasterSha` to the current local master head before the repair commit.
3. Update `repository.lastKnownOriginMasterSha` to the current `origin/master` head before the push retry.
4. Materialize redacted evidence and audit.
5. Run scoped prettier, diff checks, Module Run v2 pre-commit, commit, fast-forward merge to `master`, rerun pre-push,
   push `origin/master`, delete the short branch, then continue to Scenario 2 knowledge baseline provisioning.
