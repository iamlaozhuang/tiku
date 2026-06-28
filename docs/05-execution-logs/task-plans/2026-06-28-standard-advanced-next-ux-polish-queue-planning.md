# Standard Advanced Next UX Polish Queue Planning Task Plan

## Task

- Task id: `standard-advanced-next-ux-polish-queue-planning-2026-06-28`
- Branch: `codex/standard-advanced-next-ux-polish-planning-20260628`
- Task kind: `docs_state_planning`
- Scope: docs/state-only planning for the next organization backend standard/advanced UX polish queue.
- Runtime claim: none.
- Release claim: none.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`

## Requirement Decision Map

- ADR-007 and `edition-aware-authorization-requirements.md`: `effectiveEdition` is service-computed; UI visibility is not an authorization boundary.
- `modules/06-admin-ops.md`: backend workspaces are separated into operations, content, and organization; organization admin is first-class and organization-scoped.
- `modules/04-organization-training.md`: `org_standard_admin` cannot manage training; `org_advanced_admin` can manage organization training inside organization scope.
- `modules/05-organization-analytics.md`: organization analytics is summary-only and must not expose employee subjective answers or export without separate approval.
- `modules/08-organization-ai-generation.md`: organization AI entries are discoverable for advanced organization admins and unavailable to standard organization admins; Provider and formal adoption remain blocked.
- `2026-06-27-standard-advanced-backend-ux-design-first-contract.md`: future UX work must keep workspace IA, route states, denial/unavailable states, and component reuse boundaries explicit before source implementation.

## Requirement Mapping

This task maps organization backend UX polish into three follow-up execution packets:

1. Low-risk source-only UI polish for organization standard/advanced workspace states and copy.
2. Permission/capability contract TDD for polish-sensitive direct-route and state decisions.
3. Local browser validation after source and contract tasks, limited to localhost and redacted role/route/count evidence.

This task does not itself implement UI, permission code, tests, browser validation, schema, DB, Provider, staging, payment, or release gates.

## Evidence-Only Sources

Historical evidence read as implementation context only:

- `docs/05-execution-logs/evidence/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`
- `docs/05-execution-logs/evidence/2026-06-27-backend-workspace-role-guard-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-admin-standard-advanced-workspace-source-contract.md`
- `docs/05-execution-logs/evidence/2026-06-28-standard-advanced-backend-role-browser-validation.md`

These execution logs do not supersede `docs/01-requirements/**` or ADR-007.

## Conflict Check

No requirement conflict found.

The current durable sources agree that:

- organization standard backend should remain useful for employee/status/authorization summaries but unavailable for advanced-only training, analytics, and AI generation;
- organization advanced backend should expose discoverable training, analytics, and AI generation entries;
- service-computed capability summary remains the boundary for availability;
- Provider, Cost Calibration, staging/prod, payment, DB/schema, and release readiness stay blocked.

## Planned Documentation Changes

- Create `docs/01-requirements/traceability/2026-06-28-standard-advanced-next-ux-polish-queue-planning.md`.
- Update `docs/01-requirements/00-index.md` and `docs/01-requirements/advanced-edition/00-index.md` with a link to the new planning traceability document.
- Update `docs/04-agent-system/state/project-state.yaml` with this task state and planned follow-up recommendation.
- Update `docs/04-agent-system/state/task-queue.yaml` with this task and non-executable follow-up task packets requiring fresh approval.
- Create evidence, audit review, and acceptance documents for this planning task.

## Follow-Up Split Draft

Proposed follow-up tasks will be recorded as blocked until fresh approval:

1. `organization-workspace-state-polish-source-only-2026-06-28`
   - Risk: low-risk source-only UI.
   - Target: organization portal, training, analytics, and organization AI entry state/copy polish.
   - Blocked until fresh source approval.
2. `organization-workspace-polish-permission-contract-tdd-2026-06-28`
   - Risk: permission/authorization contract.
   - Target: direct-route, standard-unavailable, capability summary, and redacted state contract tests.
   - Blocked until fresh permission contract approval.
3. `organization-workspace-polish-local-browser-validation-2026-06-28`
   - Risk: local browser validation.
   - Target: localhost role/route matrix after the first two tasks.
   - Blocked until fresh local browser approval.

## Allowed Scope

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/**`
- `docs/05-execution-logs/task-plans/2026-06-28-standard-advanced-next-ux-polish-queue-planning.md`
- `docs/05-execution-logs/evidence/2026-06-28-standard-advanced-next-ux-polish-queue-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-standard-advanced-next-ux-polish-queue-planning.md`
- `docs/05-execution-logs/acceptance/2026-06-28-standard-advanced-next-ux-polish-queue-planning.md`

## Blocked Scope

- `src/**`
- `tests/**`
- `e2e/**`
- schema, migration, drizzle, seed
- `package.json`, lockfiles
- `.env*`
- browser, dev-server, e2e runtime
- DB connection or mutation
- Provider call or configuration
- Cost Calibration
- staging/prod/deploy
- payment or external service
- PR, force push
- release readiness or final Pass

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId standard-advanced-next-ux-polish-queue-planning-2026-06-28`

## Stop Conditions

- Any source/test/e2e/schema/package/env edit becomes necessary.
- Any browser/dev-server/DB/Provider/staging/payment runtime becomes necessary.
- Requirements conflict and need owner decision before task split.
- Evidence would need sensitive data or runtime proof.

Cost Calibration Gate remains blocked pending fresh explicit approval.
