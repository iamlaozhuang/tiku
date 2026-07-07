# Adversarial audit review: full-role UI/UX batch 5 content admin and cross-role closure

Date: 2026-07-07

## Scope

Review target:

- content-admin and super-admin content-workspace UI/UX baseline document;
- task plan;
- evidence;
- state and queue updates.

This review is docs-only. It does not approve code, DB, Provider, env, dependency, schema, migration, seed,
staging/prod/deploy, release readiness, production usability, or Cost Calibration work.

## Adversarial Checks

| Check                                      | Result | Notes                                                                |
| ------------------------------------------ | ------ | -------------------------------------------------------------------- |
| AI paper described as direct formal output | pass   | Baseline requires plan-and-select plus reviewable paper draft.       |
| AI draft can bypass review                 | pass   | Baseline requires editable draft/review before formal adoption.      |
| Super admin bypasses content lifecycle     | pass   | Same lifecycle and redaction rules are required.                     |
| Operations workspace owns content writes   | pass   | Baseline keeps content writes in content workspace.                  |
| Learner/org AI mixed into formal content   | pass   | Baseline keeps learner, organization, and formal content domains.    |
| Screenshot evidence redaction              | pass   | Records only counts, role labels, and safe observations.             |
| Plaintext `redeem_code` evidence leak      | pass   | No card values recorded; earlier product decision remains untouched. |
| Full question/paper/material leak          | pass   | Baseline avoids raw content and fixture values.                      |
| Source implementation accidentally done    | pass   | No `src/**` edits are part of this batch.                            |
| Release or production claim                | pass   | Explicitly not claimed.                                              |

## Residual Risks

- Screenshot and source-entry review cannot prove keyboard order, screen-reader labels, live regions, contrast, or actual
  runtime state transitions.
- Current runtime may still have historical AI paper generation behavior; this batch records the target contract and does
  not fix source code.
- Content pages may contain private business text in local screenshots; committed evidence intentionally avoids
  transcription.
- Source code files were read structurally, but no root-cause confirmation or implementation work is claimed.

## Fix-Branch Guidance

Future implementation should split fixes into independent short branches:

1. shared content lifecycle context bands and state templates;
2. AI paper plan-and-select contract alignment;
3. AI draft review/adoption flow;
4. papers/questions/materials list-detail restructuring;
5. resource and knowledge state-machine UI;
6. super-admin content workspace context parity.

Each branch must first confirm root cause, preserve role and lifecycle boundaries, run focused validation, write redacted
evidence, and avoid DB, Provider, env, dependency, schema, migration, seed, staging/prod/deploy, release readiness,
production usability, and Cost Calibration work unless separately approved.

## Current Conclusion

The batch 5 docs baseline is suitable as the final remediation planning baseline for content workspace and cross-role
closure, not as a runtime pass or implementation completion claim.

## Validation Review

- Scoped formatting, diff check, redaction scan, Module Run v2 pre-commit hardening, lint, and typecheck passed.
- The change set remains limited to the six allowed docs/state/evidence/audit files.
- No source-code defect was fixed or claimed as fixed in this batch.
