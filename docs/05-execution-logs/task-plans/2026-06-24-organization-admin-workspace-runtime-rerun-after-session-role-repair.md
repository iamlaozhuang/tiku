# Task Plan: organization-admin-workspace-runtime-rerun-after-session-role-repair-2026-06-24

## Summary

- Task id: `organization-admin-workspace-runtime-rerun-after-session-role-repair-2026-06-24`.
- Branch: `codex/org-admin-workspace-rerun-after-repair-20260625`.
- Task kind: `acceptance_runtime_walkthrough`.
- Status: planned.
- Final Pass claim: false.

The prior task `organization-admin-workspace-runtime-rerun-2026-06-24` is already terminal and recorded a strict runtime
failure. This task is a successor runtime rerun after
`organization-admin-session-role-mapping-runtime-repair-2026-06-24` closed with focused source/unit validation.

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
- `docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-runtime-rerun-scope-approval-package.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-session-role-mapping-runtime-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-session-role-mapping-runtime-repair.md`.

## Requirement Decision Map

- Latest role-separated MVP traceability remains the active requirement decision for role/workspace separation.
- ADR-007 remains active for edition-aware `authorization` source-of-truth boundaries.
- Prior runtime failure evidence is historical evidence only; it does not redefine requirements.
- The session role mapping source repair evidence is the reason to rerun browser acceptance, but does not itself prove
  browser runtime acceptance.

## Requirement Mapping

| Requirement area                     | Runtime acceptance focus                                                                                                                |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| User authentication/session boundary | Owner manually logs in each approved role; Codex does not read or type credentials.                                                     |
| Admin ops separation                 | Organization admins must not land in or directly access global `/ops/*` or `/content/*` workspaces.                                     |
| Organization admin workspace         | Both organization admin rows should land in organization workspace after login.                                                         |
| Standard/advanced edition behavior   | Standard admin should not expose advanced organization entries; advanced admin should expose approved organization advanced entries.    |
| Chinese UI                           | Landing, navigation, denial, unavailable, and logout states should be visible in Chinese, with no user-facing technical English labels. |

## Role Mapping Result

| Role row             | Required allow behavior                                                                                                                                    | Required deny or unavailable behavior                                             | Chinese UI check |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------- |
| `org_standard_admin` | Lands in `/organization/portal`; sees organization-scoped admin workspace.                                                                                 | No global ops/content access; advanced organization routes unavailable or denied. | Required.        |
| `org_advanced_admin` | Lands in `/organization/portal`; sees organization training, analytics, AI question generation, and AI paper generation entries inside organization scope. | No global ops/content access.                                                     | Required.        |

## Acceptance Mapping Result

- Strict row success requires all of these to pass: organization landing, allowed organization workspace, blocked
  `ops/content` direct access, visible Chinese UI, and logout returning to login state.
- If any row fails, record the row as fail and recommend a follow-up repair task. Do not claim final standard/advanced
  MVP Pass.

## Evidence-Only Sources

- Prior failed runtime rerun evidence is used only as the baseline failure.
- Prior session role mapping source repair evidence is used only as the reason this rerun is meaningful.
- No execution log is used as a replacement for requirement SSOT.

## Conflict Check

- No SSOT conflict was found: the active requirement sources and traceability expect organization admin role separation.
- The prior runtime failure conflicts with the intended behavior, which is why this successor runtime rerun exists after
  the source repair.

## Allowed Scope

- Local in-app browser observation on `http://127.0.0.1:3000` or `http://localhost:3000`.
- Owner manual credential entry for `org_standard_admin` and `org_advanced_admin`.
- Visible route and UI-state observation only.
- Docs/state/evidence/audit updates only.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-role-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-role-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-role-repair.md`.

## Blocked Scope

- Dev server start.
- Credential document reading by Codex.
- Credential entry by Codex.
- Account creation, disable, password reset, seed mutation, or owner account mutation by Codex.
- Database read/write/migration/seed.
- Product source, test, e2e, script, schema, dependency, lockfile, or `.env*` changes.
- Provider/model/cost calibration work.
- Staging/prod/deploy/payment/external service work.
- PR, force push, and final MVP Pass.

## Runtime Procedure

1. Connect to the existing in-app browser session and observe the current visible route without reading browser storage.
2. Ensure the owner can manually log in as `org_standard_admin`; after owner confirmation, record only redacted route and
   visible UI outcome summaries.
3. Verify `org_standard_admin`: landing, organization workspace visibility, advanced route denial/unavailability,
   `/ops/users`, `/ops/redeem-codes`, `/content/papers` denial, visible Chinese UI, and logout.
4. Ensure the owner can manually log in as `org_advanced_admin`; after owner confirmation, record only redacted route and
   visible UI outcome summaries.
5. Verify `org_advanced_admin`: landing, organization advanced entries, `/ops/users`, `/ops/redeem-codes`,
   `/content/papers` denial, visible Chinese UI, and logout.
6. Record row results and residual gaps without screenshots, HTML dumps, storage, cookies, tokens, or credentials.

## Validation Commands

- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-role-repair.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-role-repair.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-role-repair.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-workspace-runtime-rerun-after-session-role-repair-2026-06-24`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-workspace-runtime-rerun-after-session-role-repair-2026-06-24 -SkipRemoteAheadCheck`

## Stop Conditions

- App is unreachable and dev server start would be required.
- The owner cannot manually log in to a required role.
- Browser runtime would require reading or recording credentials, storage, cookies, tokens, screenshots, traces, HTML, or
  raw sensitive data.
- Source/schema/seed/database/provider/env/deploy/payment work becomes necessary.
- Evidence would need to declare final MVP Pass.
