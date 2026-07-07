# Full-role UI/UX source implementation entry

Date: 2026-07-07

## Status

This is the current requirement-reading entry for later source implementation of the 2026-07-07 full-role UI/UX
remediation baseline.

It is a docs-only traceability artifact. It does not approve code, tests, browser runtime, DB reads/writes, Provider
execution, dependency changes, env/secret work, schema/migration/seed work, staging/prod/deploy work, release readiness,
production usability, final Pass, or Cost Calibration.

## Why This Entry Exists

The UI/UX baseline now exists in three layers:

1. an all-role summary baseline;
2. six detailed role or flow batch baselines;
3. a repository-external local design board plus a four-item review.

Future source branches must apply those outputs as requirements, not as optional notes. This entry makes the reading
order, citation rules, and implementation guardrails explicit so later code changes do not drift from the reviewed
baseline.

## Required Source Order For UI/UX Source Tasks

Any future source task that changes role navigation, page layout, state templates, AI pages, content lifecycle,
organization workspaces, learner shell, operations pages, or `super_admin` workspace behavior must read these sources in
this order:

1. `docs/01-requirements/00-index.md`
2. `docs/01-requirements/advanced-edition/00-index.md`
3. `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
4. `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
5. `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
6. The affected role or flow batch:
   - `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-1-operations-and-super-admin.md`
   - `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-org-admin-workspace.md`
   - `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-3-org-employee-workspace.md`
   - `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-4-personal-students.md`
   - `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-5-content-admin-cross-role-closure.md`
7. `docs/01-requirements/traceability/2026-07-07-full-role-uiux-local-design-board-materialization.md`
8. `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`
9. Repository-external local design board:
   `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux`

Additional required reads by domain:

- AI出题 / AI组卷 work must also read
  `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md` and
  `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`.
- Edition, authorization, organization, quota, `redeem_code`, or account-boundary work must also read
  `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`,
  `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`,
  `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`, and
  `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`.

## Per-Branch Application Rules

Each future source branch must record the following in its task plan before editing code:

| Required item           | What the branch must record                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| exact baseline items    | P1/P2/P3 rows or page-level recommendations being implemented.                                |
| affected role surfaces  | Role labels, page families, and route families, without credentials or private values.        |
| design-board references | Board section or page-matrix family used as visual direction, not screenshot pixels.          |
| out of scope            | Baseline items intentionally deferred, with reason.                                           |
| source mapping          | Components, routes, hooks, services, or contracts to inspect before changing code.            |
| boundary guards         | Role, `effectiveEdition`, organization context, quota, content lifecycle, and redaction risk. |
| validation plan         | Focused unit/source validation and browser verification only when approved for that branch.   |

The branch must not claim it implemented the whole full-role UI/UX baseline unless it has evidence for every affected
role/page family and the current task explicitly scopes that claim.

## Implementation Slicing Baseline

The current recommended implementation sequence is:

1. Shared role/workspace context bands and state templates.
2. Learner shell desktop-readable layout.
3. Learner AI five-zone workbench.
4. Organization admin training and AI cleanup.
5. Content lifecycle and AI adoption surfaces.
6. Operations summary-first workbench.
7. `super_admin` organization context handling.

AI组卷 plan-and-select remains a separate source-contract packet before any UI branch may claim AI组卷 completion under
the 2026-07-06 contract.

## Boundary Guards

- UI visibility is discovery only. Runtime services still enforce role, `effectiveEdition`, authorization scope,
  organization context, expiry, revocation, and quota.
- Standard personal, standard employee, and standard organization admin roles remain denied, hidden, upgrade-guided, or
  unavailable for advanced-only AI and enterprise-training capabilities.
- Advanced personal, advanced employee, advanced organization admin, and content admin retain their approved AI or
  training entries.
- Content AI output remains draft/review/adoption only and must not directly publish formal content.
- Organization AI output remains organization/training-domain output and must not directly write platform formal content.
- Learner AI output remains learner or employee-domain output and must not directly write formal `question`, `paper`,
  `practice`, `mock_exam`, `exam_report`, or `mistake_book` records.
- Eligible `ops_admin` and `super_admin` operations product UI may show plaintext `redeem_code` where required by the
  confirmed product decision. Evidence, logs, screenshots in repo, exports, non-eligible views, and committed docs remain
  redacted.
- `super_admin` oversight must not bypass content lifecycle, redaction, organization context, or authorization rules.

## Non-Claims

- This entry does not implement any UI/UX source change.
- It does not prove runtime acceptance, accessibility conformance, responsive behavior, or browser correctness.
- It does not create or approve screenshots, accounts, content, DB changes, Provider calls, dependencies, env changes,
  schema/migration/seed changes, staging/prod/deploy work, release readiness, production usability, final Pass, or Cost
  Calibration.

## Current Conclusion

The 2026-07-07 UI/UX baseline and design board are now promoted into the requirement-reading path for later source
implementation. Future code branches must cite this entry and the affected batch baseline before changing source.
