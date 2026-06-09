# Module Run v2 Stale Clean Worktree Autocleanup Routing Audit Review

## Verdict

APPROVE: the repair is mechanism-scoped, test-first, and keeps cleanup delegated to the existing guarded hygiene script.

## Review Scope

- Startup routing for clean stale automation worktrees.
- Autopilot orchestration of startup cleanup and post-cleanup startup rerun.
- SOP/state/queue/evidence alignment.

## Findings

- Startup now stops next-task selection when clean stale automation worktrees exist and emits
  `startupDecision: cleanup_stale_artifacts`.
- Autopilot cleanup behavior is opt-in through `-RunStartupReadiness`; cleanup itself remains constrained to
  `Test-ModuleRunV2StoppedAutomationHygiene.ps1 -Cleanup`.
- Cleanup failures remain hard stops; the implementation does not delete dirty worktrees or broaden cleanup roots.
- Temporary-repository invocation no longer depends on a caller-relative lease readiness script path.
- No product code, dependency, schema, migration, env/secret, provider, staging/prod/cloud/deploy, payment, or
  external-service surfaces were changed.
- Evidence avoids secrets, provider payloads, raw prompts, raw generated AI content, DB URLs, Authorization headers,
  plaintext `redeem_code`, and full `paper` content.

## Residual Risk

- Windows may still block `git worktree remove` when another process holds a stale directory. The mechanism now stops and
  reports that failure instead of treating it as safe completion.
- The parked `aac4` worktree remains clean and aligned with `origin/master`, so it is not a stale-clean blocker.
- Cost Calibration Gate remains blocked.
