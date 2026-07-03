# 2026-07-02 Current Thread Decision Package Second-Pass Recheck Evidence

## Scope

Docs-only second-pass recheck after the owner warned that the previous recheck could still contain omissions, errors, or
underspecified details.

Branch: `codex/current-thread-decision-recheck-2026-07-02`

Cost Calibration Gate remains blocked.

## Recheck Findings Recorded

The second pass found eight additional issue groups worth correcting before the next UI/UX contract work:

1. Older advanced organization-training, backend UX, and role-separated traceability wording still said organization
   admins can "manage employees", which conflicted with the confirmed platform-owned employee write boundary.
2. Advanced index, organization modules, and older traceability matrices used generic "organization admin" wording for
   advanced-only training and AI capabilities, which could be misread as allowing `org_standard_admin`.
3. Stable future-extension and account-domain wording could still imply that all organization admin workspaces are future
   work, or that learner-to-employee binding is blocked by phone-domain separation.
4. Older role-experience and backend UX matrices still listed resources in `ops_admin` allowed behavior after resource
   ownership moved to the content workspace.
5. Advanced module/story text still had residual generic "organization admin" wording around advanced-only training,
   organization AI, organization analytics, and learner-AI summary visibility.
6. Older backend UX, source index, capability, use-case, and delta matrices still had blanket plaintext/cleartext
   `redeem_code` wording that could override the confirmed eligible operations product UI exception.
7. Requirement fulfillment still mapped resource management to `ops_admin`, despite the confirmed content-workspace
   resource ownership migration.
8. Requirement fulfillment still allowed employee import for "organization admins where allowed", despite the confirmed
   platform-owned employee write/import boundary.

## Corrections Applied

- Added `CT-REQ-054` through `CT-REQ-057` to the reconciliation ledger.
- Added decision-package corrections D29 through D32 and implementation gaps `G23` through `G26`.
- Narrowed organization-admin employee wording to scoped roster/status visibility; platform operations keeps employee
  import/mutation/transfer/disable/unbind/password reset.
- Replaced broad advanced-capability "organization admin" wording with explicit `org_advanced_admin` scope where needed.
- Clarified future-extension wording and phone-domain separation so current bounded organization workspaces and
  learner-to-employee binding remain intact.
- Removed the stale operations resource-write implication from older role-experience and backend UX matrices.
- Narrowed residual advanced module/story wording to eligible `org_advanced_admin` where surfaces are advanced-only.
- Added eligible operations plaintext exception wording to older source/capability/use-case/delta matrices while keeping
  evidence, logs, screenshots, exports, and non-eligible views redacted.
- Changed the requirement fulfillment resource row from `ops_admin` resource management to content-workspace ownership
  and old-route cleanup.
- Changed employee-import fulfillment rows to `ops_admin` / `super_admin` only and kept organization admins read-only for
  roster/status in the first release.

## Non-Actions

- No product source files changed.
- No tests changed.
- No schema or migration changed.
- No dependency or lockfile changed.
- No Provider, Prompt execution, env/secret, database, browser, deployment, payment, release readiness, final Pass, or
  production usability action.

## Validation Results

- `npm.cmd exec -- prettier --write --ignore-unknown ...`: completed.
- `npm.cmd exec -- prettier --check --ignore-unknown ...`: passed.
- `git diff --check`: passed.
- Reconciliation ledger row check: `row_count=57`, `missing=`, `duplicates=`.
- Residual stale-wording search for plaintext exception, advanced organization-admin actor wording, phone-domain
  uniqueness, resource ownership, and employee-import delegation found only expected positive/explanatory hits:
  `UX-REQ-03` for the allowed plaintext UI decision and `G30` documenting the removed employee-import stale wording.
