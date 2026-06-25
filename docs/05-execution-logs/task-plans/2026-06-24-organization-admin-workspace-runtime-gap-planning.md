# Task Plan: organization-admin-workspace-runtime-gap-planning-2026-06-24

## Task Metadata

- Task id: `organization-admin-workspace-runtime-gap-planning-2026-06-24`.
- Branch: `codex/org-admin-workspace-gap-planning-20260624`.
- Task kind: `docs_requirement_alignment`.
- Execution profile: `organization_admin_workspace_gap_planning_no_source_no_runtime`.
- Approval consumed: `current_user_serial_completion_approval_2026_06_24`.
- Approval source: current user request to serially continue tasks, then commit, merge to `master`, push, and delete the
  short branch after each task.
- Product closure contribution: `organization`.
- Runtime/browser execution by this task: blocked.
- Source/test implementation by this task: blocked.
- Standard/advanced MVP final Pass claim: blocked.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`.
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`.
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`.
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`.
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`.
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`.
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/01-user-auth.md`.
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/stories/epic-01-user-auth.md`.
- `docs/01-requirements/stories/epic-06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`.
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`.
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.

## Requirement Decision Map

- `US-06-01 AC-8`: broad backend UI/UX optimization must be preceded by a design artifact covering workspace
  separation, information architecture, navigation, list/detail layout, forms, empty/error/loading states, unauthorized
  states, upgrade states, conflict warnings, confirmation dialogs, component reuse, target routes, and allowed
  implementation scope.
- `US-06-13 AC-8..AC-9`: `ops_admin`, `content_admin`, `org_standard_admin`, and `org_advanced_admin` must land in their
  own workspaces, have visible logout, and see clear denial when directly accessing unrelated backend routes.
- `US-06-14 AC-3..AC-5`: organization admins require a first-class organization workspace. Standard organization admin
  is limited to employee management and organization authorization/status; advanced organization admin additionally
  gets enterprise training and organization `AI出题`/`AI组卷`.
- Role-separated alignment `R1`, `R2`, `R3`, and `R4`: backend workspaces are separated by role; organization admin is
  not an ordinary system operations admin with an organization filter; standard and advanced organization admin rows
  have different capabilities.
- Role-separated alignment `R14` and `R15`: employee import and employee management remain organization-bound; import
  templates must not accept `profession`, `level`, `edition`, or `orgAuthScopePublicId`.
- Advanced AI scope clarification: organization backend AI generation must be discoverable for advanced organization
  admins and must not write to platform formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or
  `mistake_book`.
- ADR-007 and edition-aware authorization requirements: UI visibility is not an authorization boundary; services must
  enforce computed `effectiveEdition`, organization scope, expiry, revocation, and upgrade state.

## Requirement Mapping

- This task maps the open `GAP-ORG-01` row from the post-repair gap refresh to an executable planning output.
- The planning output must not claim runtime repair. It must identify the next lowest-risk work package that satisfies
  the required design-first gate before any broad backend UI implementation.
- The required organization admin workspace repair must include:
  - role-aware landing for `org_standard_admin` and `org_advanced_admin`;
  - visible Chinese logout;
  - scoped employee management and authorization/status surfaces;
  - standard admin denial or unavailable state for enterprise training and organization AI;
  - advanced admin discoverable enterprise training and organization `AI出题`/`AI组卷` entries;
  - denial of global operations surfaces such as global users, global `org_auth`, global `redeem_code`, resources,
    audit logs, Provider, cost, staging/prod, payment, and content authoring;
  - Chinese UI validation for navigation, actions, states, and denial/unavailable copy.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-24-post-repair-gap-list-refresh-no-final-pass.md`.
- `docs/05-execution-logs/evidence/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair.md`.

These files are read as runtime history and prior closeout evidence only. They do not supersede the requirement SSOT.

## Conflict Check

- No SSOT conflict found for the planning conclusion.
- Standard MVP index still says standard baseline does not open an enterprise self-service backend, but the 2026-06-24
  role-separated alignment explicitly adds a first-class organization admin workspace for the standard/advanced
  role-separated repair track. The newer traceability decision controls this repair scope.
- Runtime evidence agrees with the gap list: organization admin rows reached global operations pages while organization
  workspace routes were unavailable. That evidence motivates the repair, but it is not used as a requirement source.
- Broad backend UI implementation is not allowed until the design-first artifact exists.

## Allowed File Scope

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-gap-planning.md`.
- `docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-runtime-gap-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-gap-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-gap-planning.md`.

## Blocked Scope

- Product source, tests, e2e specs, scripts, schema, migrations, seed data, and database reads or writes.
- Browser or Playwright runtime observation, dev-server start, credential entry, storage inspection, or account actions.
- `.env*`, Provider/model execution or configuration, prompt/provider payloads, quota or cost calibration.
- Staging, production, cloud deploy, payment, external services, PR creation/update, force push, and final MVP Pass.

## Documentation Approach

1. Materialize the task in `task-queue.yaml` and make `project-state.yaml.currentTask` point at this planning task.
2. Produce a planning output that splits `GAP-ORG-01` into an immediate design-first scope task and later implementation
   candidate.
3. Record SSOT read list, requirement mapping, role mapping, acceptance mapping, blocked gates, and next task.
4. Validate only the changed docs/state files.

## Validation Commands

1. `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-gap-planning.md docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-runtime-gap-planning.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-gap-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-gap-planning.md`.
2. `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-gap-planning.md docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-runtime-gap-planning.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-gap-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-gap-planning.md`.
3. `git diff --check`.
4. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-workspace-runtime-gap-planning-2026-06-24`.

## Closeout Plan

- Commit message: `docs(acceptance): plan organization admin workspace gap`.
- Merge target: `master`.
- Push target: `origin/master`.
- Cleanup: delete `codex/org-admin-workspace-gap-planning-20260624` after successful merge and push.
- Next recommended task: `organization-admin-workspace-design-first-scope-2026-06-24`.
