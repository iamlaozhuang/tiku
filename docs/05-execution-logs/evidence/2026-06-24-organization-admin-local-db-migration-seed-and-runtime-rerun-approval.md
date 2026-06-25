# Evidence: organization-admin-local-db-migration-seed-and-runtime-rerun-approval-2026-06-24

## Summary

- Task id: `organization-admin-local-db-migration-seed-and-runtime-rerun-approval-2026-06-24`.
- Branch: `codex/org-admin-local-db-runtime-rerun-20260625`.
- Approval consumed: current user approved the next task and closeout on 2026-06-25.
- Status: closed.
- Runtime result: blocked; `org_standard_admin` strict runtime acceptance failed after local migration and seed.
- Database migration execution: completed.
- Database seed execution: completed.
- Final standard/advanced MVP Pass: not claimed.

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
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-role-persistence-schema-seed-approval.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-role-persistence-schema-seed-approval.md`.

## Requirement Mapping Result

| Requirement source                      | Result                                                                                                     |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| ADR-002 runtime architecture            | Failed runtime proof: owner-entered organization admin session still did not reach organization workspace. |
| ADR-004/ADR-005 environment isolation   | Passed boundary: migration, seed, and browser observation stayed local/localhost only.                     |
| ADR-007 authorization SSOT              | Failed runtime proof: persisted role source exists, but effective session/workspace behavior is wrong.     |
| 2026-06-24 role-separated MVP alignment | Failed row: organization admin is still not separated from global operations workspace at runtime.         |

## Role Mapping Result

| Role                 | Result                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| `org_standard_admin` | Failed: owner-entered row landed on global operations UI and was denied organization workspace. |
| `org_advanced_admin` | Not executed due stop condition after `org_standard_admin` failure.                             |
| `ops_admin`          | Out of scope; global operations workspace must not be used as organization admin proof.         |

## Acceptance Mapping Result

- Local migration acceptance: passed.
- Local seed acceptance: passed.
- Runtime acceptance: failed for `org_standard_admin`; `org_advanced_admin` not executed.
- Visible Chinese UI acceptance: partial only. Login and denial copy were Chinese, but expected organization workspace was
  unavailable and the global operations user list remained visible to the attempted organization admin row.
- Final standard/advanced MVP Pass: blocked and not claimed.

## Command Evidence

- Command:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId organization-admin-local-db-migration-seed-and-runtime-rerun-approval-2026-06-24 -Capability schemaMigration -Intent use_capability`
  - Result: exit code 0; `capability_ready`; `schemaMigration` state was `approved_migration_plan`.
- Command:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId organization-admin-local-db-migration-seed-and-runtime-rerun-approval-2026-06-24 -Capability localFullFlowGate -Intent use_capability`
  - Result: exit code 0; `capability_ready`; localhost-only full-flow state was `approved_localhost_only`.
- Command: `npx.cmd drizzle-kit migrate`
  - Result: exit code 0; local migrations applied successfully. Database URL and environment values were not recorded.
- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Seed-DevDatabase.ps1`
  - Result: exit code 0; local dev seed completed. Redacted safe counts reported:
    - `auth_user_count`: 4.
    - `admin_count`: 3.
    - `admin_organization_count`: 3.
    - `organization_count`: 1.
    - `org_auth_count`: 1.
    - `personal_auth_count`: 1.
    - `model_config_count`: 1.

## Closeout Validation Evidence

- Command: `npx.cmd prettier --check --ignore-unknown ...`
  - Result: exit code 0; all matched task files use Prettier code style.
- Command: `git diff --check`
  - Result: exit code 0; no whitespace errors.
- Command:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-local-db-migration-seed-and-runtime-rerun-approval-2026-06-24`
  - Result: exit code 0; `pre-commit hardening passed`.
- Command:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-local-db-migration-seed-and-runtime-rerun-approval-2026-06-24 -SkipRemoteAheadCheck`
  - Result: exit code 0; `pre-push readiness passed`.

## Runtime Evidence

- Previous session exit:
  - Started from `http://127.0.0.1:3000/ops/organizations`, which displayed global operations UI.
  - Used visible `退出登录` control.
  - Result: browser returned to `http://127.0.0.1:3000/login`; visible login form labels were Chinese (`登录`,
    `请输入手机号`, `请输入密码`).
- `org_standard_admin` runtime row:
  - First owner-entered login attempt after seed landed on `http://127.0.0.1:3000/ops/users`.
  - Direct probe to `http://127.0.0.1:3000/organization/portal` showed Chinese denial text:
    `无权访问此后台工作区`.
  - Direct probe to `http://127.0.0.1:3000/ops/users` showed global operations UI (`运营后台闭环`, `用户管理`,
    `企业管理`, `卡密管理`, `审计日志`).
  - Interpretation: current browser session did not behave as the target `org_standard_admin` row; logged out and
    returned to `http://127.0.0.1:3000/login` for a clean retry.
  - Second owner-entered login attempt reported as `org_standard_admin` again landed on
    `http://127.0.0.1:3000/ops/users`.
  - Direct probe to `http://127.0.0.1:3000/organization/portal` and
    `http://127.0.0.1:3000/organization/organization-training` showed Chinese denial text:
    `无权访问此后台工作区`.
  - Direct probe to `http://127.0.0.1:3000/ops/users` again showed global operations UI (`运营后台闭环`, `用户管理`,
    `企业管理`, `卡密管理`, `审计日志`, `AI 调用日志`).
  - Strict acceptance result: failed.
- `org_advanced_admin` runtime row: not executed because the task stop condition was reached after
  `org_standard_admin` failed.

## Source Orientation

- Read-only source orientation shows:
  - `src/server/contracts/user-auth/session-boundary.ts` routes pure `org_standard_admin` or `org_advanced_admin`
    sessions to `/organization/portal`.
  - `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx` allows organization workspace only for
    `org_standard_admin` or `org_advanced_admin`, and allows operations workspace only for `ops_admin` or `super_admin`.
  - Therefore the observed runtime behavior is not accepted as an organization-admin Pass and requires a separate source
    repair task to diagnose effective session/account role mapping.

## Boundary Evidence

- `.env*` values are not read, edited, printed, or recorded.
- Credential values, password hashes, DB URLs, raw DB rows, tokens, Provider payloads, raw prompts, cookies, browser
  storage/session contents, screenshots, traces, HTML dumps, Authorization headers, and plaintext `redeem_code` values
  are not recorded in this evidence.
- Provider, Cost Calibration, staging/prod, payment, external services, dependency/package/lockfile work, PR, force push,
  and final MVP Pass remain blocked.

## Next Recommended Task

- `organization-admin-session-role-mapping-runtime-repair-planning-2026-06-24`.
- Rationale: local migration and seed completed, but `org_standard_admin` still failed strict runtime acceptance. The next
  task should create a focused source repair plan with red test, SSOT Read List, Requirement/Role/Acceptance Mapping
  Result, allowed code scope, and acceptance standards before any further runtime or layer-2 business closure.
