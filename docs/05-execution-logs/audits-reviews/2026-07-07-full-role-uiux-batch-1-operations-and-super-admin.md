# Adversarial audit review: Full-role UI/UX batch 1 operations and super admin

Date: 2026-07-07

## Scope

This review challenges the batch 1 docs-only baseline for operations and super
admin pages. It checks whether the baseline is grounded in actual screenshots
and code structure, whether it respects product boundaries, and whether it
avoids over-claiming.

## Findings

### Pass: Scope Stayed Docs-Only

The batch creates requirement/evidence/audit/state documents only. It does not
modify code, tests, packages, lockfiles, env files, schema, migrations, seed
files, or DB content.

### Pass: Plaintext Redeem Code Requirement Preserved

The baseline explicitly preserves the eligible operations UI exception for
plaintext `redeem_code` display. It recommends scanability, status, copy
feedback, and evidence redaction, not masking the product UI.

### Pass: Super Admin Organization Entry Is Not Over-Claimed

The super admin organization workspace issue is recorded as a P1 follow-up
candidate. The baseline does not assert root cause or fix correctness. A later
fix branch must reproduce and trace role/session/organization context before
changing implementation.

### Pass: Sensitive Evidence Excluded

The evidence records page labels, role labels, counts, file paths, and safe
observations only. It does not include credentials, session/cookie/token values,
env values, DB URLs, raw rows, internal ids, Provider payloads, raw prompts, raw
AI outputs, full questions, full papers, or full materials.

### Risk: Screenshot-Only Accessibility Limits

Accessibility findings are limited to visible risks. The baseline correctly
does not claim full accessibility compliance. Later code work still needs
keyboard, focus, screen-reader, contrast, zoom, and responsive verification.

### Risk: Menu Rename Recommendations Require Product Confirmation

The baseline proposes menu naming directions. These are not implementation
approvals. A later code branch must confirm terminology with the requirements
source and avoid breaking navigation, route tests, and existing acceptance
expectations.

### Risk: Long-Page Refactor Could Affect Permissions Indirectly

Later UI implementation could accidentally move or expose actions across role
boundaries. The batch baseline requires future implementation to keep role,
edition, and workspace authorization checks in existing service/layout
boundaries and verify denial states after any UI changes.

## Forced Self-Review

- Read gate complete: pass.
- Batch 0 principles applied: pass.
- Operations and super admin screenshots reviewed: pass.
- Source files reviewed read-only: pass.
- No code/database/provider/env/dependency change: pass.
- Evidence redaction: pass.
- Release/staging/prod/Cost Calibration claims avoided: pass.
- Current-code defect fixed in this branch: no.

## Validation Review

Final validation status: pass.

- Scoped Prettier write/check: pass.
- Redaction scan: pass, no sensitive values found.
- `git diff --check`: pass.
- Module Run v2 pre-commit hardening: pass after making this task's blocked
  path patterns explicit in the queue entry.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.

## Conclusion

Batch 1 passes docs-only validation. The only P1 follow-up candidate is the
super admin organization workspace state strategy; it must be handled later
through root-cause analysis and a separate fix branch if confirmed as a
current-code defect.
