# Adversarial audit review: full-role UI/UX batch 4 personal students

Date: 2026-07-07

## Scope

Review target:

- personal student UI/UX baseline document;
- task plan;
- evidence;
- state and queue updates.

This review is docs-only. It does not approve code, DB, Provider, env, dependency, schema, migration, seed,
staging/prod/deploy, release readiness, production usability, or Cost Calibration work.

## Adversarial Checks

| Check                                    | Result | Notes                                                                  |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------- |
| Standard student got advanced AI?        | pass   | Baseline preserves hidden/unavailable/upgrade-guided standard outcome. |
| Advanced student AI discoverability?     | pass   | `AI训练` remains required as a visible learner entry.                  |
| AI output formal-write shortcut?         | pass   | Baseline repeats no automatic formal writes.                           |
| Personal versus organization context?    | pass   | Personal routes and enterprise-training missing-context state split.   |
| Quota owner auto-switch risk?            | pass   | Baseline requires explicit context selection.                          |
| Screenshot evidence redaction?           | pass   | Records only counts, role labels, and safe observations.               |
| Plaintext `redeem_code` evidence leak?   | pass   | No card values recorded.                                               |
| Full question/paper/material leak?       | pass   | Baseline avoids raw content and fixture values.                        |
| Source implementation accidentally done? | pass   | No `src/**` edits are part of this batch.                              |
| Release or production claim?             | pass   | Explicitly not claimed.                                                |

## Residual Risks

- Screenshot-only review cannot prove keyboard order, screen-reader labels, live-region behavior, or contrast.
- Contact sheets are enough for baseline analysis, but future source work should verify individual responsive states in
  browser.
- Standard-unavailable state is documented as the required target; this batch does not confirm or fix the source root
  cause for every runtime branch.
- Profile and `redeem_code` UI may display the signed-in user's own account/card-entered values in product UI; this audit
  only verifies that committed evidence stays redacted.

## Fix-Branch Guidance

Future implementation should split fixes into independent short branches:

1. learner shell desktop-readable layout;
2. standard personal AI pure unavailable template;
3. personal AI five-zone page structure;
4. personal authorization context and quota visibility;
5. enterprise-training personal missing-context copy.

Each branch must read the same requirement surface, confirm root cause first, preserve role/edition boundaries, run
focused validation, write redacted evidence, and avoid DB, Provider, env, dependency, schema, migration, seed,
staging/prod/deploy, release readiness, production usability, and Cost Calibration work unless separately approved.

## Current Conclusion

The batch 4 docs baseline is suitable as a remediation planning baseline, not as a runtime pass or implementation
completion claim.

## Validation Review

- Scoped formatting, diff check, redaction scan, Module Run v2 pre-commit hardening, lint, and typecheck passed.
- The change set remains limited to the six allowed docs/state/evidence/audit files.
- No source-code defect was fixed or claimed as fixed in this batch.
