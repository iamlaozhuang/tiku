# 2026-07-02 Current Thread Decision Package Adversarial Recheck Evidence

## Scope

Docs-only recheck after the owner requested a more careful pass for omissions, errors, and underspecified details in the
current-thread requirement decision package.

Branch: `codex/current-thread-decision-recheck-2026-07-02`

Cost Calibration Gate remains blocked.

## Recheck Findings Recorded

The recheck found ten concrete issues worth correcting before the next UI/UX contract work:

1. ADR-007 still had blanket wording that could be read as forbidding all plaintext `redeem_code` exposure, conflicting
   with the later eligible-operations plaintext UI decision.
2. Operations/system resource management wording still contained write-capability bullets after the current decision
   moved resource management to the content workspace.
3. User-management requirements were too coarse for no-auth, standard, advanced, employee, disabled, and backend-admin
   distinctions.
4. Organization analytics stable module did not clearly backfill the later decision to show formal `practice` /
   `mock_exam` aggregate signals separately from enterprise-training analytics.
5. Organization AI result-to-training draft handoff needed the confirmed 12 interaction details recorded so later source
   work does not re-ask or omit them.
6. Admin AI-call-log wording still allowed a broad "complete input/output summary" reading; this needed explicit
   redaction boundaries.
7. User-auth stable wording still said the enterprise backend was not open, and phone-domain wording could be read as
   blocking the existing learner-to-employee binding model.
8. Employee create/import wording still implied manual-only single-create passwords and did not explicitly place target
   organization selection before import.
9. User-auth stories had generation type rows but did not fully carry the matching redemption semantics, upgrade target
   selection, and eligible-role plaintext list/detail wording.
10. Organization AI module wording could be read as denying generated-output/task-summary visibility entirely, which
    would break the confirmed copy-to-training-draft handoff.

## Corrections Applied

- Added `CT-REQ-044` through `CT-REQ-053` to the reconciliation ledger.
- Added decision-package corrections D19 through D28 and implementation gaps `G17` through `G22`.
- Clarified ADR-007 with the narrow eligible-operations plaintext exception.
- Tightened operations user management, resource migration, and backend-account wording in stable admin requirements.
- Replaced broad AI-call-log detail wording with redacted-summary-only language.
- Clarified user-auth organization-backend scope and account-domain phone reuse boundaries.
- Clarified employee create/import fields, target-node selection, and one-time generated-password distribution.
- Backfilled card redemption and plaintext story acceptance criteria.
- Clarified organization AI generated-output visibility versus forbidden raw AI/log surfaces.
- Backfilled formal-learning separation into the organization analytics module.
- Added UI/UX baseline addendum for the ten recheck findings.

## Non-Actions

- No product source files changed.
- No tests changed.
- No schema or migration changed.
- No dependency or lockfile changed.
- No Provider, Prompt execution, env/secret, database, browser, deployment, payment, release readiness, final Pass, or
  production usability action.

## Validation Results

- `npm.cmd exec -- prettier --write --ignore-unknown ...`: completed.
- `npm.cmd exec -- prettier --check --ignore-unknown ...`: passed, all matched files use Prettier style.
- `git diff --check`: passed.
- Reconciliation ledger table rows: `row_count=53`, `missing=`, `duplicates=`.
- Stale-marker search: no pending marker remains after this evidence update; the only remaining
  `"完整输入输出摘要"` hit is inside the UI/UX baseline row that explicitly records the old wording as a risk and resolves
  it to redacted summaries only.
