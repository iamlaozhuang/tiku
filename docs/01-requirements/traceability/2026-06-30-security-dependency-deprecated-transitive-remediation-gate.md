# Security Dependency Deprecated Transitive Remediation Gate Traceability

- Task id: `security-dependency-deprecated-transitive-remediation-gate-2026-06-30`
- Branch: `codex/security-dep-transitive-gate-20260630`
- Approval source: `securityFollowupCentralApproval20260630`
- Scope: local dependency gate recheck with public registry metadata lookup.
- Status: closed_pass_no_package_change.

## Requirement Alignment

| Requirement / governance item                         | Status | Notes                                                                                                |
| ----------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| Recheck before dependency/package mutation            | pass   | Lockfile and public registry metadata were checked before any package or lockfile change.            |
| Avoid blind package/lockfile modification             | pass   | No package, lockfile, or workspace change was made because no safe minimal local remediation exists. |
| Keep DB/Provider/browser/release/final/cost blocked   | pass   | No DB, Provider/AI, browser/e2e, deploy, release readiness, final Pass, or Cost Calibration ran.     |
| Preserve evidence redaction                           | pass   | Evidence records package names, versions, chain summaries, counts, and command statuses only.        |
| Split remaining dependency governance work separately | pass   | Next candidate remains install-script policy decision under a separately materialized task.          |

## Current Finding Map

| Finding      | Current status          | Local dependency chain summary                                            | Decision                                             |
| ------------ | ----------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------- |
| dep-depr-001 | still_present           | `drizzle-kit@0.31.10` -> `@esbuild-kit/esm-loader@2.6.5`                  | no safe minimal local remediation; upstream blocked  |
| dep-depr-002 | still_present           | `@esbuild-kit/esm-loader@2.6.5` -> `@esbuild-kit/core-utils@3.3.2`        | no safe minimal local remediation; upstream blocked  |
| dep-depr-003 | no_current_lockfile_hit | prior `node-domexception@1.0.0` chain was not present in current lockfile | closed by current lockfile state; no action required |

## Decision

No `package.json`, `pnpm-lock.yaml`, or `pnpm-workspace.yaml` change is made in this task. `drizzle-kit@latest` is the
current direct dependency version and still declares the deprecated `@esbuild-kit/esm-loader` dependency. Replacing that
transitive package with `tsx` would be an upstream dependency design change, not a local minimal remediation.

## Next Recommended Task

`security-dependency-install-script-policy-decision-2026-06-30`.
