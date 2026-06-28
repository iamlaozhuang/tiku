# Organization Backend Shell Nav Gated Copy Polish Source-Only Plan

## Task

- Task id: `organization-backend-shell-nav-gated-copy-polish-source-only-2026-06-28`
- Branch: `codex/organization-backend-shell-nav-gated-copy-polish-20260628`
- Task kind: `implementation_tdd`
- Execution profile: `local_low_risk_source_only_ui`
- Approval source: current user batch approval on 2026-06-28 for serial local low-risk tasks and per-task commit/merge/push/cleanup closeout.

## Required Reading

### Governance And Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/sop/advanced-edition-implementation-boundary-checklist.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`
- `docs/04-agent-system/sop/batch-execution-package-governance.md`

### SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`
- `docs/01-requirements/traceability/2026-06-28-standard-advanced-next-ux-polish-queue-planning.md`
- `docs/01-requirements/traceability/2026-06-28-standard-advanced-ux-polish-queue-planning.md`

### Source And Test Files

- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`
- `src/features/admin/content-admin-runtime.tsx`
- `tests/unit/admin-dashboard-layout-navigation.test.ts`
- `tests/unit/admin-common-ux-state-audit.test.ts`

## Requirement Decision Map

| Decision                                                                                                | Source                                                      | Impact                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Backend workspaces remain role-separated.                                                               | Role-separated MVP traceability and admin ops requirements. | Shell copy must avoid mixing ops/content/organization entry points for constrained roles.                                                        |
| `effectiveEdition` is service-computed.                                                                 | ADR-007 and edition-aware authorization requirements.       | UI may hide or describe advanced entries, but cannot become the authorization boundary.                                                          |
| Standard organization admin needs useful organization workspace copy without advanced control exposure. | 2026-06-28 UX polish planning matrix.                       | Standard role shell should explain advanced-only work is unavailable through guidance/return actions, not through usable advanced menu controls. |
| Advanced organization admin receives training, analytics, and AI entry cluster.                         | 2026-06-28 UX polish planning matrix.                       | Advanced role shell should group the advanced capability entries coherently.                                                                     |

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-27-backend-workspace-shell-source-only.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-admin-standard-advanced-workspace-source-contract.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-workspace-polish-local-browser-validation.md`

These are history and local evidence only. They are not release readiness and do not approve browser, DB, Provider, staging/prod, or final Pass work in this task.

## Conflict Check

The requirements, ADRs, and current task queue agree on this task boundary: low-risk source-only UI plus focused unit tests for shell/navigation/gated copy. No source document authorizes DB, schema, Provider, browser/e2e, deploy, payment, OCR/export, Cost Calibration, release readiness, or final Pass.

## Allowed Scope

- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`
- `src/features/admin/content-admin-runtime.tsx`
- `tests/unit/admin-dashboard-layout-navigation.test.ts`
- `tests/unit/admin-common-ux-state-audit.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- This task plan, evidence, audit review, and acceptance docs.

## Blocked Scope

- `schema`, `drizzle`, `migration`, `seed`
- `package.json` and lockfiles
- `.env*`
- Browser/dev-server/e2e
- DB connection/read/write
- Provider call/configuration
- Cost Calibration
- staging/prod/deploy
- payment/OCR/export/external-service
- PR, force push, release readiness, final Pass

## TDD Plan

1. Add focused unit expectations for the organization shell polish:
   - advanced organization menu has a visible advanced capability group label;
   - standard organization shell exposes safe upgrade/support guidance and return action without advanced menu links;
   - forbidden direct-route state offers a return action to the active workspace.
2. Run the focused unit command and confirm the new expectations fail for the intended missing UI copy.
3. Implement the smallest source-only UI changes in `AdminDashboardLayout.tsx` and shared state components needed to pass.
4. Re-run focused unit tests, then the full task validation list.

## Risk Defenses

- Keep capability decisions sourced from `getAdminWorkspaceCapabilitySummary` and `canUseOrganizationAdvancedWorkspaceCapability`.
- Do not change authorization role computation, route handlers, service contracts, DB schema, or Provider code.
- Use existing design token classes and existing lucide icons.
- Evidence records command summaries only and no credentials, tokens, raw DOM, screenshots, traces, DB rows, provider payloads, prompts, raw AI output, plaintext `redeem_code`, employee subjective answers, or full `question`/`paper` content.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/admin-common-ux-state-audit.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/components/AdminDashboardLayout/AdminDashboardLayout.tsx src/features/admin/content-admin-runtime.tsx tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/admin-common-ux-state-audit.test.ts docs/05-execution-logs/task-plans/2026-06-28-organization-backend-shell-nav-gated-copy-polish-source-only.md docs/05-execution-logs/evidence/2026-06-28-organization-backend-shell-nav-gated-copy-polish-source-only.md docs/05-execution-logs/audits-reviews/2026-06-28-organization-backend-shell-nav-gated-copy-polish-source-only.md docs/05-execution-logs/acceptance/2026-06-28-organization-backend-shell-nav-gated-copy-polish-source-only.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/components/AdminDashboardLayout/AdminDashboardLayout.tsx src/features/admin/content-admin-runtime.tsx tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/admin-common-ux-state-audit.test.ts docs/05-execution-logs/task-plans/2026-06-28-organization-backend-shell-nav-gated-copy-polish-source-only.md docs/05-execution-logs/evidence/2026-06-28-organization-backend-shell-nav-gated-copy-polish-source-only.md docs/05-execution-logs/audits-reviews/2026-06-28-organization-backend-shell-nav-gated-copy-polish-source-only.md docs/05-execution-logs/acceptance/2026-06-28-organization-backend-shell-nav-gated-copy-polish-source-only.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-backend-shell-nav-gated-copy-polish-source-only-2026-06-28`

## Stop Conditions

- Any required behavior needs DB, schema, Provider, browser/e2e, env, dependency, staging/prod, deploy, payment, OCR/export, Cost Calibration, PR, force push, release readiness, or final Pass.
- Focused tests fail for reasons unrelated to this task and cannot be isolated.
- Changed files exceed the queue-listed allowed files.
