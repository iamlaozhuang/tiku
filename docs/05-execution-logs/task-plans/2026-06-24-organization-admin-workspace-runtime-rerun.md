# Task Plan: organization-admin-workspace-runtime-rerun-2026-06-24

## Summary

- Task id: `organization-admin-workspace-runtime-rerun-2026-06-24`.
- Branch: `codex/org-admin-workspace-runtime-rerun-20260625`.
- Task kind: `acceptance_runtime_walkthrough`.
- Approval package: `ORGANIZATION_ADMIN_WORKSPACE_RUNTIME_RERUN_SCOPE_2026_06_24`.
- Scope: local runtime observation for `org_standard_admin` and `org_advanced_admin` only.
- Product source changes: none.
- Final MVP Pass claim: blocked.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/01-user-auth.md`.
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/stories/epic-06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`.
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.

## Requirement Decision Map

- The active role-separated decision is `2026-06-24-role-separated-mvp-requirement-alignment.md`.
- Organization admin runtime targets come from R2, R3, R4, US-06-13, US-06-14, organization training, organization AI
  generation, and edition-aware authorization requirements.
- UI visibility is not an authorization boundary; route/service outcomes must also deny unrelated surfaces.
- Provider-backed AI generation and Cost Calibration remain blocked.

## Requirement Mapping

### Requirement Mapping Result

- `org_standard_admin` must land in a dedicated organization workspace and see organization employee/auth summaries only.
- `org_advanced_admin` must land in a dedicated organization workspace and see employee/auth summaries, enterprise
  training, statistics, organization `AI出题`, and organization `AI组卷`.
- Both roles must be denied from global operations and content authoring surfaces.
- Visible UI text in the observed workflow must be Chinese. Technical English labels such as `Organization Portal`,
  `runtime API`, `publicId`, `Provider`, raw route names, or raw role names are acceptance gaps when visible to the user.

### Role Mapping Result

| Role row             | Allow target                                                                                          | Deny target                                                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `org_standard_admin` | `/organization/portal`; employee/auth summaries; visible logout entry; Chinese UI.                    | No `企业训练`, `统计摘要`, `AI出题`, or `AI组卷`; direct advanced/org AI routes unavailable; no `/ops/*` or `/content/*`. |
| `org_advanced_admin` | `/organization/portal`; `企业训练`; `统计摘要`; `AI出题`; `AI组卷`; visible logout entry; Chinese UI. | No global ops/content authoring; no Provider/cost/payment/staging/prod surfaces.                                          |

### Acceptance Mapping Result

- Runtime observation may produce `pass`, `fail`, or `blocked` per role row.
- A row is strict pass only when allow behavior, deny behavior, and Chinese UI check all pass.
- This task may close as runtime evidence even if a row fails, provided gaps are recorded and final Pass is not claimed.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-design-first-scope.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-repair.md`.
- `docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-runtime-rerun-scope-approval-package.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun-scope-approval.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun-scope-approval.md`.

## Conflict Check

- No SSOT conflict found. The scope approval package allows a later local browser runtime observation after fresh user
  approval, which is provided by the current user request.
- The task does not approve dev server start. It may use the already open local app if reachable.
- Credentials must be entered manually by the owner. Codex must not type, read, store, or reveal credentials.
- Codex must not inspect local storage, session/cookie contents, screenshots, traces, raw HTML dumps, database rows, or
  private files.

## Allowed File Scope

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun.md`.

## Allowed Runtime Scope

- Local targets:
  - `http://127.0.0.1:3000`.
  - `http://localhost:3000`.
- Allowed role rows:
  - `org_standard_admin`.
  - `org_advanced_admin`.
- Allowed route probes:
  - `/organization/portal`.
  - `/organization/organization-training`.
  - `/organization/organization-analytics`.
  - `/organization/ai-question-generation`.
  - `/organization/ai-paper-generation`.
  - `/ops/users`.
  - `/ops/redeem-codes`.
  - `/content/papers`.

## Blocked Scope

- Dev server start, source/test/script/e2e changes, schema/migration/seed/database access, dependency or lockfile changes,
  `.env*`, Provider/model calls, Provider configuration, provider payload evidence, Cost Calibration, staging/prod/deploy,
  payment, external services, PR, force push, credential entry by Codex, credential document reading, account mutation,
  and final acceptance Pass.

## Runtime Method

1. Ask the owner to manually log in as `org_standard_admin`.
2. Observe only visible page state and current route for the allowed route probes.
3. Ask the owner to switch accounts manually as needed.
4. Repeat for `org_advanced_admin`.
5. Record redacted allow/deny/UI-language summaries in evidence.

## Validation Commands

1. `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-rerun.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun.md`.
2. `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-rerun.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun.md`.
3. `git diff --check`.
4. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-workspace-runtime-rerun-2026-06-24`.
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-workspace-runtime-rerun-2026-06-24 -SkipRemoteAheadCheck`.

## Stop Conditions

- Stop if the local app is unreachable and dev server start would be required.
- Stop if the owner cannot log in manually for a required role row.
- Stop if runtime observation would require Codex to type credentials, read secrets, mutate account state, inspect storage,
  or access database/env/provider surfaces.
- Stop if changed files leave the allowed docs/state/evidence range.
