# Evidence: admin-ai-generation-entry-repair-2026-06-24

## Status

- Current status: closed on `master` after fast-forward merge and local post-merge validation; push and short-branch
  cleanup remain approved closeout actions for this run.
- Branch: codex/admin-ai-generation-entries-20260624.
- Scope: content backend and organization backend `AI出题` / `AI组卷` entry discoverability.
- Explicit non-claim: this evidence does not declare standard/advanced MVP final Pass.

## Approval Boundary

- Approval source: user approved serial advancement through candidates 1, 2, 3, and 4, then instructed to continue after
  candidate 2 closeout.
- Approved local actions: scoped task registration, task plan/evidence/audit creation, local source/test implementation,
  focused unit validation, local commit, fast-forward merge to `master`, push to `origin/master`, and merged short-branch
  cleanup if all task gates pass.
- Still blocked: PR, force push, schema/migration/database write, dependency or lockfile change, `.env*`, Provider,
  Cost Calibration, browser/e2e runtime, staging/prod/deploy, payment/external services, and final acceptance Pass.

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

## Requirement Mapping Result

- R7 content backend AI requirement maps to content sidebar entries `AI出题` and `AI组卷`, plus local target pages that
  show the content AI draft/review boundary.
- R4 organization advanced admin AI requirement maps to `/organization` workspace navigation and organization portal
  destinations for `AI出题` and `AI组卷`.
- Standard organization admin exclusion maps to hidden organization AI navigation and a direct-route `标准版暂不可用` state.
- R8 ops/content denial remains mapped to `AdminDashboardLayout` workspace authorization: `ops_admin` cannot enter the
  `/content` workspace and does not receive content AI links.

## Role Mapping Result

- In scope: `content_admin`, `org_standard_admin`, `org_advanced_admin`, `ops_admin`.
- Out of scope: learner personal/employee home entries already closed in the previous task.

## Acceptance Mapping Result

- Content backend discoverability: unit tests assert visible `AI出题` and `AI组卷` links under `/content`.
- Content draft/review boundary: source-level route wiring test asserts the shared surface contains `内容 AI 草稿/评审`
  and `正式 question / paper 写入仍需评审`, and does not contain provider payload markers.
- Organization backend discoverability: unit tests assert `org_advanced_admin` sees `AI出题` and `AI组卷` under
  `/organization`.
- Organization standard denial: unit tests assert `org_standard_admin` has no organization AI navigation or portal links,
  and source wiring contains the `标准版暂不可用` state for direct route access.

## Changed Files

- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml
- docs/05-execution-logs/task-plans/2026-06-24-admin-ai-generation-entry-repair.md
- docs/05-execution-logs/evidence/2026-06-24-admin-ai-generation-entry-repair.md
- docs/05-execution-logs/audits-reviews/2026-06-24-admin-ai-generation-entry-repair.md
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

## Implementation Evidence

- `AdminDashboardLayout` now recognizes `/organization` as a separate organization backend workspace.
- Content backend menu now includes `AI出题` and `AI组卷`.
- Organization backend menu now includes `AI出题` and `AI组卷` only for `org_advanced_admin` or `super_admin`.
- `org_standard_admin` can enter the organization workspace but does not see AI/training/analytics advanced links.
- Post-login session boundary now routes `org_standard_admin` and `org_advanced_admin` to `/organization/portal`.
- Organization portal links now use `/organization/...` aliases instead of `/content/...` for organization workspace
  destinations.
- New AI entry pages are local placeholder surfaces only; they do not call Provider, build prompts, persist AI output, or
  write formal `question` / `paper`.

## Verification Log

| Command                                                                                                                                                                                                                                                | Status                         | Evidence                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts` | RED fail before implementation | 4 files ran; 8 expected failures: missing content AI links, missing `/organization` workspace authorization/menu, missing AI route files, old organization portal `/content` links, and old org admin login landing. |
| Same focused unit command                                                                                                                                                                                                                              | GREEN pass                     | 4 files passed; 16 tests passed after implementation.                                                                                                                                                                |
| `npm.cmd run lint`                                                                                                                                                                                                                                     | pass                           | ESLint completed with exit 0.                                                                                                                                                                                        |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                | pass                           | `tsc --noEmit` completed with exit 0.                                                                                                                                                                                |
| `npx.cmd prettier --write --ignore-unknown ...`                                                                                                                                                                                                        | pass                           | Scoped formatting ran on the task allowlist; only formatting changes were applied.                                                                                                                                   |
| Same focused unit command after formatting                                                                                                                                                                                                             | pass                           | 4 files passed; 16 tests passed.                                                                                                                                                                                     |
| Final focused unit command                                                                                                                                                                                                                             | pass                           | 4 files passed; 16 tests passed.                                                                                                                                                                                     |
| Final `npm.cmd run lint`                                                                                                                                                                                                                               | pass                           | ESLint completed with exit 0.                                                                                                                                                                                        |
| Final `npm.cmd run typecheck`                                                                                                                                                                                                                          | pass                           | `tsc --noEmit` completed with exit 0.                                                                                                                                                                                |
| `npx.cmd prettier --check --ignore-unknown ...`                                                                                                                                                                                                        | pass                           | All matched files use Prettier code style.                                                                                                                                                                           |
| `git diff --check`                                                                                                                                                                                                                                     | pass                           | Exit 0 with no whitespace findings.                                                                                                                                                                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-entry-repair-2026-06-24`                                                                            | pass                           | Module Run v2 hardening passed; SSOT Read List and Requirement Mapping Result were accepted; 20 files scanned in task scope.                                                                                         |

## Master Closeout Verification

- Implementation commit: `e7a770ece811c00678fbd93c02164b4d24646aae`.
- `git merge --ff-only codex/admin-ai-generation-entries-20260624`: pass; `master` fast-forwarded to
  `e7a770ece811c00678fbd93c02164b4d24646aae`.
- `npm.cmd run test:unit -- tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts`:
  pass on `master`; 4 files passed, 16 tests passed.
- `npm.cmd run lint`: pass on `master`; ESLint exit 0.
- `npm.cmd run typecheck`: pass on `master`; `tsc --noEmit` exit 0.
- `npx.cmd prettier --check --ignore-unknown ...`: pass on `master`; all matched files use Prettier code style.
- `git diff --check`: pass on `master`; no whitespace findings.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-entry-repair-2026-06-24`:
  pass on `master`; no changed files before closeout status update.

## Blocked Remainder

- Real AI generation execution, Provider setup/calls, prompt handling, cost/quota measurement, AI task persistence,
  content adoption into formal `question` or `paper`, schema/migration, and runtime browser evidence remain blocked or
  deferred.
