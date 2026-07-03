# 2026-07-03 Organization Workspace Role Boundary Source Landing Audit Review

## Task

`organization-workspace-role-boundary-source-landing-2026-07-03`

## Review Status

pass_two_pass_review_after_permission_denial_mapping_fix

approvalStatus: approved_for_closeout_readiness_after_validation

## Pass 1 Checklist

- pass: Advanced organization surfaces require both advanced organization role and service-computed advanced `org_auth` capability.
- pass: Standard organization admin portal/layout copy clearly states read-only/status-only boundaries.
- pass: Direct route denial, permission-denied, and standard-unavailable behavior remain covered.
- pass: No employee write, global ops/content, Provider, raw answer, raw AI output, export, schema, or DB work is introduced.

## Pass 2 Checklist

- pass: File scope matches task materialization after adding the organization AI entry page to allowed files.
- pass: Focused tests cover helper, layout, portal, guard, and organization AI permission-denial behavior.
- pass: No schema, dependency, Provider, env, DB, browser/dev-server/e2e, deploy, PR, force push, Cost Calibration, release readiness, final Pass, or production-readiness work is introduced.

## Findings Fixed During Review

- Organization AI direct-route denial initially rendered the generic login-required state for an existing admin session. Fixed by mapping organization workspace denied access to the permission-denied surface in the organization AI entry page.
- The UI access helper initially trusted `canUseOrganizationAdvancedWorkspace` without checking role. Fixed by requiring `org_advanced_admin` or `super_admin` in addition to service-computed advanced `org_auth` capability.
