# Task Plan: admin-ai-generation-entry-repair-2026-06-24

## Required Reading

- AGENTS.md
- docs/03-standards/code-taste-ten-commandments.md
- docs/03-standards/ui-code.md
- docs/02-architecture/adr/
- docs/04-agent-system/operating-manual.md
- docs/04-agent-system/sop/requirement-ssot-reading-governance.md
- docs/04-agent-system/sop/task-lifecycle-governance.md
- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml

## SSOT Read List

- docs/01-requirements/00-index.md
- docs/01-requirements/modules/06-admin-ops.md
- docs/01-requirements/stories/epic-06-admin-ops.md
- docs/01-requirements/advanced-edition/00-index.md
- docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md
- docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md
- docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md
- docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md
- docs/01-requirements/traceability/role-experience-fulfillment-matrix.md
- docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md

## Requirement Decision Map

- R4 requires `org_advanced_admin` to have a first-class organization backend with organization-owned `AI出题` and
  `AI组卷` entries.
- R7 requires `content_admin` to discover content backend `AI出题` and `AI组卷` entries that lead to a content AI
  draft/review domain instead of direct formal `question` or `paper` writes.
- R8 requires `ops_admin` to be denied from content authoring surfaces and content draft creation.
- Advanced AI scope clarification requires content backend and organization backend AI entries to be discoverable
  without manual URL entry, while standard edition remains excluded from AI question generation and AI `paper`
  generation.
- ADR-006 records installed AI SDK packages only as dependency reality. It does not approve Provider use.
- ADR-007 requires UI visibility not to be treated as the authorization boundary; later service checks remain required.

## Requirement Mapping

- `content_admin`: content backend navigation exposes `AI出题` and `AI组卷`; target pages show draft/review boundary and
  no formal write execution.
- `org_advanced_admin`: organization backend workspace exposes `AI出题` and `AI组卷`; target pages remain
  organization-owned and do not route through system operations or content authoring paths.
- `org_standard_admin`: organization backend does not expose AI generation entries; direct organization AI routes show a
  clear standard-unavailable or denied state.
- `ops_admin`: content backend AI entries remain hidden by workspace guard; direct content workspace access remains
  denied by existing layout behavior.

## Requirement Mapping Result

- Planned mapping status: pending RED/GREEN evidence.
- This task implements entry discoverability and role visibility only. It does not implement Provider execution, prompt
  handling, formal content adoption, organization AI task persistence, schema changes, or database authorization checks.

## Role Mapping Result

- In scope: `content_admin`, `org_standard_admin`, `org_advanced_admin`, `ops_admin`.
- Out of scope: learner-side personal and employee home entries already handled by
  `student-home-ai-organization-training-entry-repair-2026-06-24`.
- `super_admin` may continue to access admin workspaces, but this task does not claim super-admin runtime acceptance.

## Acceptance Mapping Result

- Content backend acceptance: discoverable `AI出题` and `AI组卷` links exist and open a draft/review placeholder surface.
- Organization backend acceptance: `org_advanced_admin` can discover organization `AI出题` and `AI组卷`; `org_standard_admin`
  cannot discover them and direct route access does not expose enabled actions.
- Safety acceptance: pages do not call Provider, do not expose prompts/raw AI output, and do not write formal `question`
  or `paper`.

## Evidence-Only Sources

- docs/05-execution-logs/evidence/2026-06-24-backend-workspace-landing-logout-separation-repair.md
- docs/05-execution-logs/audits-reviews/2026-06-24-backend-workspace-landing-logout-separation-repair.md
- docs/05-execution-logs/evidence/2026-06-24-student-home-ai-organization-training-entry-repair.md
- docs/05-execution-logs/audits-reviews/2026-06-24-student-home-ai-organization-training-entry-repair.md

These files are historical context for prior packages only. The requirement scope comes from `docs/01-requirements`.

## Conflict Check

- Existing organization admin surfaces still use a legacy `organization_admin` label in tests and routes. The current
  requirement uses `org_standard_admin` and `org_advanced_admin`; this task may support those frontend session labels
  without changing database enums or schema.
- Existing organization training and analytics pages live under `/content/...`. To avoid new organization AI entries
  routing through content authoring paths, this task will add `/organization/...` aliases for organization workspace
  entry links.
- Full service-layer authorization, AI task persistence, and formal adoption workflows are outside this repair and must
  stay blocked unless a later task approves them.

## Scope

- Task id: admin-ai-generation-entry-repair-2026-06-24
- Branch: codex/admin-ai-generation-entries-20260624
- Task kind: implementation
- Product closure contribution: content backend and organization backend AI entry discoverability for role-separated MVP
  repair.

Allowed files:

- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml
- src/components/AdminDashboardLayout/AdminDashboardLayout.tsx
- src/server/contracts/user-auth/session-boundary.ts
- src/features/admin/organization-portal/AdminOrganizationPortalPage.tsx
- src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx
- src/app/(admin)/content/ai-question-generation/page.tsx
- src/app/(admin)/content/ai-paper-generation/page.tsx
- src/app/(admin)/organization/portal/page.tsx
- src/app/(admin)/organization/organization-training/page.tsx
- src/app/(admin)/organization/organization-analytics/page.tsx
- src/app/(admin)/organization/ai-question-generation/page.tsx
- src/app/(admin)/organization/ai-paper-generation/page.tsx
- tests/unit/admin-dashboard-layout-navigation.test.ts
- tests/unit/organization-portal-admin-entry-surface.test.ts
- tests/unit/admin-ai-generation-entry-surface.test.ts
- tests/unit/auth/session-personal-auth-boundary.test.ts
- docs/05-execution-logs/task-plans/2026-06-24-admin-ai-generation-entry-repair.md
- docs/05-execution-logs/evidence/2026-06-24-admin-ai-generation-entry-repair.md
- docs/05-execution-logs/audits-reviews/2026-06-24-admin-ai-generation-entry-repair.md

Blocked files and actions:

- `.env*`
- package files and lockfiles
- `src/db/schema/**`
- `drizzle/**`
- `e2e/**`
- `scripts/**`
- database reads/writes, seed, schema migration, Provider call/configuration, Cost Calibration Gate, browser/e2e runtime,
  staging/prod/cloud/deploy, payment, external services, PR, force push, final acceptance Pass.

## Implementation Plan

1. Add RED unit tests for layout navigation:
   - content backend sidebar exposes `AI出题` and `AI组卷` for `content_admin`.
   - organization backend sidebar exposes `AI出题` and `AI组卷` for `org_advanced_admin`.
   - organization backend sidebar hides AI entries for `org_standard_admin`.
   - existing ops/content workspace denials remain.
2. Add RED unit tests for organization portal:
   - `org_advanced_admin` sees organization AI destinations using `/organization/...` links.
   - `org_standard_admin` does not see AI destinations.
3. Add RED unit tests for target pages:
   - content AI pages render draft/review status and no Provider/formal write action.
   - organization AI pages render for `org_advanced_admin`, deny/unavailable for `org_standard_admin`, and do not expose
     raw AI/provider content.
4. Add RED unit test for post-login landing:
   - `org_standard_admin` and `org_advanced_admin` land on `/organization/portal`.
5. Implement the smallest frontend changes:
   - add organization workspace recognition to `AdminDashboardLayout`;
   - add role-aware menu filtering using session role labels only;
   - add content and organization AI entry pages as local placeholder surfaces;
   - add organization route aliases for portal/training/analytics;
   - update organization portal destinations.
6. Run focused tests, lint, typecheck, scoped Prettier, `git diff --check`, and Module Run v2 pre-commit hardening.
7. Update evidence and audit review with RED/GREEN results, changed files, blocked remainder, and closeout facts.

## Risk Defense

- Do not change `adminRoleValues`, database enums, schema, migrations, repositories, or auth persistence.
- Do not call Provider, construct prompts, persist generated content, or claim AI runtime readiness.
- Do not claim frontend visibility as the final authorization boundary.
- Do not expose tokens, cookies, localStorage values, database rows, prompts, Provider payloads, raw generated output,
  employee answers, full `paper` content, or plaintext `redeem_code` in evidence.
- Do not claim standard/advanced MVP final Pass after local unit validation.

## Validation Commands

```powershell
npm.cmd run test:unit -- tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts
npm.cmd run lint
npm.cmd run typecheck
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/components/AdminDashboardLayout/AdminDashboardLayout.tsx src/server/contracts/user-auth/session-boundary.ts src/features/admin/organization-portal/AdminOrganizationPortalPage.tsx src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx src/app/(admin)/content/ai-question-generation/page.tsx src/app/(admin)/content/ai-paper-generation/page.tsx src/app/(admin)/organization/portal/page.tsx src/app/(admin)/organization/organization-training/page.tsx src/app/(admin)/organization/organization-analytics/page.tsx src/app/(admin)/organization/ai-question-generation/page.tsx src/app/(admin)/organization/ai-paper-generation/page.tsx tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts docs/05-execution-logs/task-plans/2026-06-24-admin-ai-generation-entry-repair.md docs/05-execution-logs/evidence/2026-06-24-admin-ai-generation-entry-repair.md docs/05-execution-logs/audits-reviews/2026-06-24-admin-ai-generation-entry-repair.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-entry-repair-2026-06-24
```

## Stop Conditions

- The repair requires schema/migration, database seed/write, dependency changes, env/secret, Provider execution, browser/e2e
  runtime, staging/prod, payment, external services, PR, force push, or final acceptance Pass claims.
- New route or menu work cannot distinguish standard versus advanced organization admin without changing the
  authorization model.
- Evidence would need to record tokens, cookies, localStorage values, passwords, prompt text, Provider payloads, raw AI
  outputs, database rows, private employee answers, full `paper` content, or plaintext `redeem_code`.
