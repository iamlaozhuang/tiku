# 2026-07-07 Super Admin Organization Context

## Task

- Branch: `codex/super-admin-organization-context-2026-07-07`
- Matrix item: Branch 7, `super_admin` organization context handling.
- Goal: make the `super_admin` organization workspace entry and direct organization routes clearly express missing organization context, without granting implicit organization proxy authority.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-1-operations-and-super-admin.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-org-admin-workspace.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-local-design-board-materialization.md`
- `docs/05-execution-logs/task-plans/2026-07-07-full-role-uiux-source-remediation-control-matrix.md`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/README.md`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/manifest.redacted.json`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/page-matrix.html`

## Scope

Allowed:

- `src/components/AdminDashboardLayout/**`
- `src/features/admin/organization-workspace/**`
- `src/app/(admin)/organization/**`
- `tests/unit/admin-workspace-role-guard-contract.test.ts`
- `tests/unit/admin-shell-common-interaction.test.ts`
- `tests/unit/admin-common-ux-state-audit.test.ts`
- State, queue, plan, evidence, and adversarial audit docs.

Forbidden:

- Login, role, authorization, `effectiveEdition`, edition, organization selection, or service authorization semantics.
- Implicit organization proxy authority for `super_admin`.
- DB, account fixtures, seeds, schema, migrations, Provider calls, env files, package or lockfiles.
- Credentials, sessions, cookies, tokens, env values, DB URLs, DB raw rows, internal ids, Provider payloads, raw prompts, raw AI outputs, full question/paper/material content, plaintext `redeem_code`, screenshots, traces, raw DOM, or private fixture values in evidence.
- Staging, production, deployment, Cost Calibration, release readiness, final Pass, or production usability claims.

## Checklist

| Area                    | Required branch 7 check                                                                                                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Roles                   | `super_admin` retains operations/content authority; organization workspace requires explicit selected organization context.                                                                          |
| Pages                   | Workspace switcher organization entry plus `/organization/portal`, training, analytics, AI question, and AI paper routes.                                                                            |
| Baseline/design sources | Batch 0 missing-context template, Batch 1 P1, Branch 7 matrix row, design board rows `super_admin__organization-*`.                                                                                  |
| Allowed code            | Presentation, copy, disabled/switcher affordance, route-level state rendering, and targeted source tests.                                                                                            |
| Permission boundary     | No new role grant; UI remains discovery only; service guard remains the authorization source.                                                                                                        |
| Edition boundary        | Standard/advanced organization capability copy stays descriptive and does not compute or mutate edition.                                                                                             |
| Empty/error/disabled    | Missing-context, wrong-context, unavailable route, disabled switch action, and route error states must be explicit.                                                                                  |
| Evidence/audit          | `docs/05-execution-logs/evidence/2026-07-07-super-admin-organization-context-evidence.md`; `docs/05-execution-logs/audits-reviews/2026-07-07-super-admin-organization-context-adversarial-audit.md`. |

## Implementation Plan

1. Add red targeted assertions for `super_admin` workspace switcher behavior when no organization context exists.
2. Keep the existing guard service semantics intact; only adjust layout presentation and missing-context copy.
3. Make the organization entry visibly context-gated for `super_admin` without selected organization context, and route it back to operations guidance rather than a normal organization destination.
4. Preserve organization admin behavior and standard-unavailable states.
5. Run focused layout/guard/state tests, lint, typecheck, full unit tests, diff check, and Module Run v2 gates.
6. Write redacted evidence and adversarial audit, commit, merge to `master`, run master gates, push, delete branch, and verify clean/aligned before Branch 8.

## Risk Defense

- `super_admin` organization workspace remains context-gated; no hidden organization proxy is introduced.
- Missing-context copy says the admin session is valid and does not use login wording.
- Organization admins still return to organization overview and keep standard/advanced boundaries.
- Evidence records command status and file labels only, with no private values or screenshot pixels.
