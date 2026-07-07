# Shared UI State Templates And Context Bands Task Plan

Date: 2026-07-07
Branch: `codex/shared-ui-state-context-bands-2026-07-07`

## Scope

Implement the first source branch from the full-role UI/UX source entry: shared admin-side state templates and role/workspace context bands.

This task is source-only and documentation/evidence-only. It does not change database content, schema, migrations, seed files, packages, lockfiles, env files, Provider behavior, prompt execution, deployment state, staging, production, Cost Calibration, or account fixtures.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-1-operations-and-super-admin.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-organization-admin.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-3-organization-employee.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-4-personal-students.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-5-content-admin-cross-role-closure.md`

## Implemented Baseline Items

- Batch 0 P1: reusable admin state templates for loading, unauthorized, forbidden, missing organization context, and standard/advanced unavailable states.
- Batch 0 P1/P2: role/workspace context band before admin page content with human-readable scope and guarded capability wording.
- Batch 1 P1: super admin organization workspace must show a valid-session missing organization-context state instead of a misleading login/permission failure.
- Batch 2 shared rule: standard organization workspace states must explain standard-edition unavailability without implying authentication failure.
- Batch 5 closure rule: super admin context copy may add oversight wording but must not bypass workspace lifecycle or authorization boundaries.

## Requirement Mapping Result

| Requirement source                        | Implemented file(s)                                                                                                              | Mapping result                                                                                                                |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Batch 0 shared state templates            | `src/components/admin/AdminStateTemplate/AdminStateTemplate.tsx`                                                                 | Implemented reusable admin loading, forbidden, missing context, unauthorized, and standard unavailable templates.             |
| Batch 0 role/workspace context bands      | `src/components/admin/AdminStateTemplate/AdminStateTemplate.tsx`, `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx` | Implemented a reusable context band and placed it before admin page content.                                                  |
| Batch 1 super admin organization context  | `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`                                                                   | Mapped existing `organization_context_required` route decision to `需要选择组织上下文`, without changing authorization logic. |
| Batch 2 organization standard unavailable | `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`                                                                   | Mapped existing `standard_unavailable` route decision to an explicit standard-edition unavailable state.                      |
| Branch regression coverage                | `src/components/AdminDashboardLayout/AdminDashboardLayout.test.tsx`                                                              | Covered missing context, unauthenticated, authorized operations context, and standard organization advanced-route blocking.   |

## Deferred Items

- Learner shell redesign, mobile-first tab structure, and learner-specific context bands.
- AI generation five-zone page split and Provider/result lifecycle changes.
- Content lifecycle-first list/detail split.
- Organization employee training and analytics page restructuring.
- Operations guided CRUD/data-flow redesign.

## Risk Controls

- Keep authorization checks and service contracts unchanged; UI visibility remains non-authoritative.
- Do not expose internal ids, raw DB rows, credentials, session/cookie/token values, Provider payloads, prompts, raw AI outputs, full question/paper/material content, or plaintext card values in evidence.
- Preserve the approved operations plaintext `redeem_code` UI exception; only evidence/logs remain redacted.
- No destructive DB action, no Provider-enabled flow, no dependency change.

## Verification Plan

- Static inspection of modified components for role/edition boundary regressions.
- Type/lint/build or available local gate commands without Provider or DB mutation.
- Focused component tests if the existing test harness supports the changed surface.
- Adversarial review covering misleading login copy, role bypass, standard-edition capability leakage, sensitive evidence leakage, and unrelated UI churn.
