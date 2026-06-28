# Content Ops Organization Nav Entry Source-Only Plan

## Task

- Task id: `content-ops-organization-nav-entry-source-only-2026-06-27`
- Branch: `codex/content-ops-org-nav-source-20260627`
- Task kind: `implementation_tdd`
- Risk tier: pure UI/source-only
- Local full-loop target: L2 focused unit behavior plus L1 lint/typecheck/static gates

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`

## SOP Read List

- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/standing-autonomy-policy-governance.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/advanced-edition-implementation-boundary-checklist.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`

## Requirement Decision Map

- The 2026-06-27 backend UX contract requires scoped menu entries for operations, content, and organization admin workspaces.
- Operations navigation must make `user`, `organization`, `redeem_code`, `authorization`, `org_auth`, resource, `audit_log`, and `ai_call_log` governance discoverable without implying formal content authoring.
- Content navigation must keep formal `question`, `material`, `paper`, knowledge node, and content AI draft/review entries discoverable without global operations authority.
- Organization navigation must keep standard organization surfaces separate from advanced-only `企业训练`, `统计摘要`, `AI出题`, and `AI组卷` entries.
- UI visibility remains advisory only. Direct route denial, `effectiveEdition`, and permission enforcement remain deferred to later contract tasks.

## Requirement Mapping

This task maps only the `source_only` label for navigation-entry visibility:

- Harden existing `AdminDashboardLayout` navigation copy and focused unit coverage for operations/content/organization workspace scopes.
- Prefer existing routes and existing components. Do not create new runtime flows, DB contracts, API routes, schemas, provider calls, or browser observations.
- Keep advanced-only organization entries gated by the existing source capability summary.
- Record any conceptual route gap as residual risk instead of pretending source-only navigation proves runtime closure.

This task does not close permission enforcement, browser validation, DB/schema, Provider/Cost, staging/prod, payment/export/OCR, release readiness, or final Pass labels.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-27-backend-workspace-shell-source-only.md`
- `docs/05-execution-logs/task-plans/2026-06-27-backend-workspace-shell-source-only.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-backend-workspace-shell-source-only.md`

These execution logs are historical implementation evidence only. Requirements are mapped back to `docs/01-requirements/**`, ADR-007, and the active 2026-06-27 UX contract.

## Conflict Check

No blocking conflict was found. Older MVP text excludes enterprise self-service for the original standard MVP, while the 2026-06-24 role-separated alignment and 2026-06-27 UX contract explicitly add standard/advanced backend workspace repair scope. The newer traceability decisions govern this source-only navigation task.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`
- `tests/unit/admin-dashboard-layout-navigation.test.ts`
- `docs/05-execution-logs/task-plans/2026-06-27-content-ops-organization-nav-entry-source-only.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-ops-organization-nav-entry-source-only.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-content-ops-organization-nav-entry-source-only.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-ops-organization-nav-entry-source-only.md`

## Blocked Scope

- No `src/db/schema/**`, `drizzle/**`, migrations, seed, DB connection, or DB mutation.
- No `package.json`, lockfile, dependency, CLI, or test framework change.
- No `.env*` read or write.
- No browser, dev server, e2e, Playwright, staging, prod, deploy, payment, OCR, export, or external-service action.
- No Provider call/configuration and no Cost Calibration Gate execution.
- No PR, force push, release readiness, or final Pass claim.

## TDD Plan

1. Inspect the existing admin dashboard layout and focused navigation tests.
2. Add focused RED assertions for operations menu entries that must cover `org_auth`/`authorization` governance and redacted `audit_log`/`ai_call_log` summaries.
3. Add or keep assertions that content and organization navigation remain scoped and do not borrow operations entries.
4. Run `npm.cmd run test:unit -- tests/unit/admin-dashboard-layout-navigation.test.ts` and record the expected failure.
5. Implement the smallest source-only navigation copy/entry change in `AdminDashboardLayout.tsx`.
6. Rerun the same focused unit command for GREEN.

## Implementation Approach

- Reuse the existing `CONTENT_MENU`, `OPS_MENU`, and `ORGANIZATION_MENU` structures.
- Prefer copy-level or menu-entry-level changes that map existing pages to the UX contract without creating unsupported routes.
- Keep organization advanced entries behind existing `advancedOnly` filtering.
- Preserve visible logout and workspace switcher behavior from the previous task.
- Use existing lucide icons and token-based Tailwind classes; avoid hard-coded colors or new visual systems.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/admin-dashboard-layout-navigation.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/components/AdminDashboardLayout/AdminDashboardLayout.tsx tests/unit/admin-dashboard-layout-navigation.test.ts docs/05-execution-logs/task-plans/2026-06-27-content-ops-organization-nav-entry-source-only.md docs/05-execution-logs/evidence/2026-06-27-content-ops-organization-nav-entry-source-only.md docs/05-execution-logs/audits-reviews/2026-06-27-content-ops-organization-nav-entry-source-only.md docs/05-execution-logs/acceptance/2026-06-27-content-ops-organization-nav-entry-source-only.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/components/AdminDashboardLayout/AdminDashboardLayout.tsx tests/unit/admin-dashboard-layout-navigation.test.ts docs/05-execution-logs/task-plans/2026-06-27-content-ops-organization-nav-entry-source-only.md docs/05-execution-logs/evidence/2026-06-27-content-ops-organization-nav-entry-source-only.md docs/05-execution-logs/audits-reviews/2026-06-27-content-ops-organization-nav-entry-source-only.md docs/05-execution-logs/acceptance/2026-06-27-content-ops-organization-nav-entry-source-only.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-ops-organization-nav-entry-source-only-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId content-ops-organization-nav-entry-source-only-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-ops-organization-nav-entry-source-only-2026-06-27 -SkipRemoteAheadCheck`

## Evidence And Audit

- Evidence path: `docs/05-execution-logs/evidence/2026-06-27-content-ops-organization-nav-entry-source-only.md`
- Audit review path: `docs/05-execution-logs/audits-reviews/2026-06-27-content-ops-organization-nav-entry-source-only.md`
- Acceptance path: `docs/05-execution-logs/acceptance/2026-06-27-content-ops-organization-nav-entry-source-only.md`

Evidence must include RED/GREEN focused unit results, forbidden-action checklist, changed-file inventory, validation summaries, residual route/permission/browser gaps, and redaction statement.

## Stop Conditions

- Any needed change exceeds the allowed files.
- The navigation task requires new route pages, API routes, route/service authorization changes, or runtime browser verification.
- Browser/e2e, DB, Provider, dependency, schema/migration, env/secret, staging/prod, payment/export/OCR, Cost Calibration, PR, force push, release readiness, or final Pass becomes necessary.
- Evidence would need to record secrets, credentials, provider payloads, prompts, raw AI output, raw employee answers, DB rows, plaintext `redeem_code`, or full `paper` content.
