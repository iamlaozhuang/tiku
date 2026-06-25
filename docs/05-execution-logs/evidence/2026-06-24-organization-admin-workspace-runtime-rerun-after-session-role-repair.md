# Evidence: organization-admin-workspace-runtime-rerun-after-session-role-repair-2026-06-24

## Summary

- Task id: `organization-admin-workspace-runtime-rerun-after-session-role-repair-2026-06-24`.
- Branch: `codex/org-admin-workspace-rerun-after-repair-20260625`.
- Task kind: `acceptance_runtime_walkthrough`.
- Status: closed.
- Runtime/browser execution: completed for `org_standard_admin` and `org_advanced_admin`.
- Final MVP Pass claim: none.

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

## Requirement Mapping Result

| Requirement area                     | Evidence status                                                                                                                                                |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User authentication/session boundary | Owner-manual login completed for both rows; Codex did not type/read credentials; logout returned to `/login` for both rows.                                    |
| Admin ops separation                 | Fail for both rows: `/ops/users` and `/ops/redeem-codes` remained accessible.                                                                                  |
| Organization admin workspace         | Fail for both rows: post-login route was `/ops/users`, and `/organization/portal` was denied.                                                                  |
| Standard/advanced edition behavior   | Fail: standard advanced routes were denied as expected, but base portal was also denied; advanced organization routes were denied when they should be allowed. |
| Chinese UI                           | Fail: Chinese UI signal was present, but internal technical labels were visible on the global ops surface.                                                     |

## Role Mapping Result

| Role row             | Allow result | Deny result | Chinese UI result | Logout result | Row result | Notes                                                                                                                                                                                   |
| -------------------- | ------------ | ----------- | ----------------- | ------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `org_standard_admin` | fail         | fail        | fail              | pass          | fail       | Landed in global ops route, organization portal denied, ops direct routes accessible, Chinese UI present but internal technical labels remain visible.                                  |
| `org_advanced_admin` | fail         | fail        | fail              | pass          | fail       | Landed in global ops route, organization portal and advanced organization routes denied, ops direct routes accessible, Chinese UI present but internal technical labels remain visible. |

## Acceptance Mapping Result

- Runtime acceptance: strict fail for both approved organization admin rows.
- Strict row Pass requires landing, organization workspace allow, global ops/content denial, Chinese UI, and logout all
  passing.
- This task will not declare standard/advanced MVP final Pass.

## Runtime Observation Log

- Owner manually logged in `org_standard_admin`; Codex did not type or read credentials.
- `org_standard_admin` observation:
  - Post-login visible route: `/ops/users`, not `/organization/portal`.
  - `/organization/portal`: denied with Chinese no-access state.
  - `/organization/organization-training`: denied with Chinese no-access state.
  - `/organization/organization-analytics`: denied with Chinese no-access state.
  - `/organization/ai-question-generation`: denied with Chinese no-access state.
  - `/organization/ai-paper-generation`: denied with Chinese no-access state.
  - `/ops/users`: accessible, with global operations cues.
  - `/ops/redeem-codes`: accessible, with global operations cues.
  - `/content/papers`: denied with Chinese no-access state.
  - Visible Chinese UI signal: present on observed states.
  - Visible technical-label gap: internal authorization/code identifiers remain visible on the global ops surface.
  - Logout check: passed; route returned to `/login`.
- Owner manually logged in `org_advanced_admin`; Codex did not type or read credentials.
- `org_advanced_admin` observation:
  - Post-login visible route: `/ops/users`, not `/organization/portal`.
  - `/organization/portal`: denied with Chinese no-access state.
  - `/organization/organization-training`: denied with Chinese no-access state.
  - `/organization/organization-analytics`: denied with Chinese no-access state.
  - `/organization/ai-question-generation`: denied with Chinese no-access state.
  - `/organization/ai-paper-generation`: denied with Chinese no-access state.
  - `/ops/users`: accessible, with global operations cues.
  - `/ops/redeem-codes`: accessible, with global operations cues.
  - `/content/papers`: denied with Chinese no-access state.
  - Visible Chinese UI signal: present on observed states.
  - Visible technical-label gap: internal authorization/code identifiers remain visible on the global ops surface.
  - Logout check: passed; route returned to `/login`.
- No screenshots, raw HTML dumps, credentials, browser storage/session contents, cookies, database rows, raw generated
  content, Provider payloads, plaintext `redeem_code`, or secrets were recorded.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-role-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-role-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-role-repair.md`.

## Validation Results

1. `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-role-repair.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-role-repair.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-role-repair.md`
   - Result: pass.
   - Output summary: scoped docs/state files formatted or unchanged.
2. `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-role-repair.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-role-repair.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-role-repair.md`
   - Result: pass.
   - Output summary: all matched files use Prettier code style.
3. `git diff --check`
   - Result: pass.
   - Output summary: no whitespace errors.
4. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-workspace-runtime-rerun-after-session-role-repair-2026-06-24`
   - Result: pass.
   - Output summary: `OK_SSOT_READ_LIST`, `OK_REQUIREMENT_MAPPING_RESULT`, all 5 changed files in task scope, and
     pre-commit hardening passed.
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-workspace-runtime-rerun-after-session-role-repair-2026-06-24 -SkipRemoteAheadCheck`
   - Result: pass.
   - Output summary: branch, `master`, `origin/master`, state master, and state origin master aligned at
     `7a60dfe73de177e4890d8e5ccf8c62135a64cad7`; evidence and audit paths present; pre-push readiness passed.

## Result

- Result: `runtime_observation_completed_2_rows_strict_acceptance_fail_after_session_role_repair_no_final_pass`.
- Strict pass count: `0`.
- Strict fail count: `2`.
- Next recommended task: focused repair planning or implementation for real session/account role mapping still resolving
  organization admin accounts into global ops instead of organization workspace.

## Blocked Scope Confirmation

- Dev server start, credential entry by Codex, credential document read, account mutation, source/test/script/e2e changes,
  schema/migration/seed/database access, dependency or lockfile changes, `.env*`, Provider/model/cost,
  staging/prod/deploy, payment, external services, PR, force push, and final Pass remain blocked.
