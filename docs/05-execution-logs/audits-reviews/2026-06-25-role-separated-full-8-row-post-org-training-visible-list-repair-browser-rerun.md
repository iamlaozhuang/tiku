# Role-Separated Full 8 Row Post Org-Training Visible-List Repair Browser Rerun Audit Review

Task id: `role-separated-full-8-row-post-org-training-visible-list-repair-browser-rerun-2026-06-25`

## Review Scope

Audit full eight-row local browser rerun after the organization-training visible-list repair:

- Credential redaction.
- Browser-only runtime scope.
- No source/DB/seed/schema/migration/account/provider/cost/staging/prod/payment expansion.
- No final MVP Pass claim unless all required rows pass and the task explicitly remains non-final.

## Findings

1. Strict full eight-row acceptance remains blocked: `2 pass / 6 fail / 0 blocked`.
2. `org_advanced_employee` organization-training visible-list is repaired at runtime: direct route returned `200/0`
   with `1` training row, `3` numeric inputs, and `3` available row actions.
3. Learner/employee AI residual blockers remain:
   - `personal_standard_student` and `org_standard_employee` direct `/ai-generation` still render the AI page instead of
     an explicit denial or standard-unavailable state.
   - `personal_advanced_student` and `org_advanced_employee` have `AI出题` enabled but `AI组卷` disabled.
4. Admin functional boundaries improved:
   - `org_standard_admin` and `org_advanced_admin` passed the sampled organization/content/ops separation checks.
   - `content_admin` and `ops_admin` passed sampled allow/deny boundaries but still fail strict UI cleanliness due visible
     technical labels.

## Scope Audit

- Browser-only runtime scope was respected for the primary evidence run.
- Source, tests, package/lockfile, DB write, seed/schema/migration, and account mutation were not touched.
- The credential document was read and credentials were entered only into local browser login forms under the active goal
  approval; no credential value was written to evidence.
- One discarded full-json observation loaded a local ops AI audit route and passively triggered local read-only
  `model-provider`/`model-config` GETs. No Provider configuration, enablement, external call, prompt/model payload, cost
  measurement, staging/prod/deploy, payment, or external service action was performed. The final compact evidence run
  avoided that route.

## Redaction Audit

- Evidence contains only role labels, local paths, status/code pairs, visible counts, and summarized blockers.
- Evidence does not contain phone numbers, passwords, tokens, cookies, local/session storage, raw public ids, raw DB rows,
  raw DOM, screenshots, traces, prompts, generated content, or private answer content.
- The visible technical-label names recorded in evidence are UI strings, not account identifiers or credentials.

## Acceptance Boundary

This task may report the strict role-separated eight-row runtime observation result. It must not claim Standard/Advanced
MVP final Pass.

## Review Decision

Closed as `runtime_observation_completed_8_rows_2_pass_6_fail_no_final_pass`.

The task may be committed and merged as a browser rerun closeout. It must not be used as Standard/Advanced MVP final Pass
evidence. Recommended next smallest source repair lane: learner/employee AI route strictness and `AI组卷` enabled-state
repair before another full eight-row rerun.
