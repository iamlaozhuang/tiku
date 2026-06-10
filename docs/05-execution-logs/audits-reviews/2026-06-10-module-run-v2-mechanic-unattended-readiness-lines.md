# Module Run v2 Mechanic Unattended Readiness Lines Audit Review

## Decision

APPROVE: mechanism-scoped repair is ready for local commit, fast-forward merge, and allowed push after final Git checks.

## Identity

- Mechanic automation id: `tiku-module-run-v2-mechanic-2`
- Target autopilot automation id: `tiku-module-run-v2-autopilot-2`

## Findings

- Root cause was a PowerShell parameter binding defect in unattended readiness, not product code.
- Pending pre-claim tasks are now aligned with the serial executor transaction model: declared paths are required, but
  evidence/audit files are not required before claim.
- Active automation id state now points to `tiku-module-run-v2-autopilot-2`; historical ids are not used for new
  mechanism writes.
- Pre-commit hardening now has a bounded `mechanic_repair` scope for mechanism-only repairs and still blocks product,
  dependency, env/secret, schema, migration, material, paper_asset, and requirement-story changes.
- Unattended readiness smoke no longer depends on live `origin/master` alignment when testing post-closeout handoff SHA
  ancestry; it now uses explicit test SHA overrides backed by real local commits.
- Serial unattended readiness now matches startup readiness for explicit `accepted_ancestor_checkpoint` repository SHA
  semantics, while still rejecting invalid or non-ancestor repository drift.
- Post-commit advisory helpers now tolerate blank YAML separator lines and no longer emit the prior `Lines` binding
  advisory error.
- Stopped-automation hygiene now cleans orphan active run registries when their worktree owner is no longer registered
  and no Git metadata remains at the path.
- Post-push stopped-automation hygiene is clean, startup readiness returns `prepare_next_task`, and the next primary
  autopilot can proceed to `batch-101` task claim.
- No business implementation, dependency, package, lockfile, env/secret, provider, schema, migration, Docker DB, deploy,
  PR, force-push, or Cost Calibration Gate action was performed.

## Review Checklist

- Scope limited to mechanism scripts/state and execution logs.
- Evidence contains no secrets, DB URLs, raw provider payloads, raw prompts, plaintext `redeem_code`, auto-increment id
  exposure, or full paper/material content.
- Cost Calibration Gate remains blocked.
