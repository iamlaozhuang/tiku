# Module Run v2 Stopped Automation Hygiene Audit Review

## Verdict

APPROVE: Pass after focused smoke and live read-only hygiene inventory. No blocking findings.

## Review Focus

- read-only default behavior
- active lease and dirty worktree hard blocks
- cleanup path containment
- no product code, dependency, schema, migration, env/secret, provider, deploy, payment, external-service, or Cost
  Calibration Gate execution

## Findings

- No critical findings.
- The added gate is read-only by default and requires explicit `-Cleanup` before removing any residual artifact.
- Active leases, invalid leases, and dirty worktrees hard-block cleanup.
- Cleanup path containment is enforced for lease files, automation worktrees, and dry-run handoff temp directories.
- The mechanism does not touch product code, dependency files, schema, migration, env files, provider, deploy, payment, or
  external-service surfaces.

## Residual Risk

- A dirty automation worktree still requires manual inspection because automatic deletion would risk losing unreviewed
  work.
- A malformed lease file still requires manual inspection because the owning run cannot be trusted.
- `git worktree remove --force` is only attempted for clean stale automation worktrees under the configured Codex
  automation root; if Git cannot remove the worktree, the gate stops with `stop_manual_cleanup_required`.
- Cost Calibration Gate remains blocked.

## Recommendation

Keep `Test-ModuleRunV2StoppedAutomationHygiene.ps1` as the standard recovery command after a scheduled automation wakeup
stops on `stop_existing_run_active`, stale clean automation worktree, expired clean lease, or dry-run handoff temp
residuals. Use `-Cleanup` only after the read-only inventory classifies artifacts as cleanup candidates.
