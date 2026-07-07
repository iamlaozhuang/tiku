# 2026-07-06 AI Generation DB/Provider Next Decision Audit Review

## Findings

No source defect is claimed or fixed in this task. The review is a pre-execution decision audit.

| Finding                                                                                                   | Severity | Evidence                                                                                                      | Required handling                                                            |
| --------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| The current post-recontract DB-backed runtime gap is real.                                                | Medium   | Final local rollup marks DB-backed runtime not tested for the new plan-and-select generation mutation.        | Run DB-backed local runtime replay only after separate fresh approval.       |
| Provider-enabled smoke is still useful but should not be first.                                           | Medium   | Provider count-timeout evidence is partial: tiny count passed, default count failed after Provider execution. | Defer until DB replay passes or owner explicitly waives DB-first sequencing. |
| Older 0704 runtime/provider evidence is historical, not a current pass claim for the new AI组卷 contract. | Medium   | Recontract traceability says older nested generated-question paper evidence cannot prove plan-and-select.     | Do not reuse old evidence as post-recontract acceptance.                     |
| Cost Calibration can be accidentally conflated with Provider smoke.                                       | High     | Prior Provider evidence explicitly excludes cost/quota/performance claims.                                    | Keep Cost Calibration as a separate approval-gated task.                     |

## Decision Audit

Recommended next step: `DB-backed local runtime replay`.

Reason:

- it directly tests the highest-confidence missing product question after recontract;
- it avoids Provider nondeterminism while validating local role/source/container/handoff behavior;
- it produces stronger evidence before any Provider-enabled smoke.

Provider-enabled bounded smoke should follow only as a separate approval-gated task.

## Required Approval Boundary For DB Replay

The approval must be explicit that it permits only:

- localhost and local DB runtime;
- non-destructive product actions;
- credential-backed role walkthrough without recording fixture values;
- redacted aggregate evidence only.

It must not permit:

- Provider execution;
- env/secret read/write;
- schema/migration/seed/destructive DB work;
- staging/prod/deploy;
- release readiness, production usability, final Pass, or Cost Calibration claims.

## Required Approval Boundary For Provider Smoke

The approval must be explicit that it permits only:

- local Provider-enabled bounded smoke;
- limited attempts and safe stop conditions;
- redacted aggregate evidence for grounding, parse status, count category, safe error category, and duration bucket.

It must not permit:

- Cost Calibration;
- cost, quota, latency, quality, staging/prod, deploy, release, or production claims;
- raw prompt, raw Provider payload, raw AI output, full generated content, DB rows, internal ids, credentials, sessions, cookies, tokens, or env values.

## Non-Claims

- No DB-backed runtime pass.
- No Provider-enabled pass.
- No browser replay pass beyond prior role entry/denial evidence.
- No Provider-disabled rerun.
- No release readiness or production usability.
- No staging/prod/deploy.
- No Cost Calibration.
- No source, dependency, schema, or migration change.

## Validation

| Command                            | Result |
| ---------------------------------- | ------ |
| `git diff --check`                 | pass   |
| scoped `prettier --check`          | pass   |
| Module Run v2 pre-commit hardening | pass   |

The decision package is ready for local commit. Merge, push, and branch cleanup still require fresh approval.
