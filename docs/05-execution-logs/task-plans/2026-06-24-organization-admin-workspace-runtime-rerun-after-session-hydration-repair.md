# Task Plan: organization-admin-workspace-runtime-rerun-after-session-hydration-repair-2026-06-24

## Summary

- Task id: `organization-admin-workspace-runtime-rerun-after-session-hydration-repair-2026-06-24`.
- Branch: `codex/org-admin-workspace-rerun-after-session-hydration-20260625`.
- Task kind: `acceptance_runtime_walkthrough`.
- Status: closed.
- Scope: local in-app browser observation for `org_standard_admin` and `org_advanced_admin` after session hydration/logout repair.
- Product source changes: blocked.
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
- `docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-runtime-rerun-scope-approval-package.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-role-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-role-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-runtime-session-hydration-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-runtime-session-hydration-repair.md`.

## Requirement Mapping Result

- User auth/session boundary: owner manually logs in; Codex observes only route and visible page state.
- Organization admin workspace: both approved organization admin rows must land in `/organization/portal`, not global `/ops/*`.
- Admin ops separation: both rows must be denied from global `/ops/users`, `/ops/redeem-codes`, and `/content/papers`.
- Edition behavior: `org_standard_admin` must not expose advanced organization AI/training routes; `org_advanced_admin` should expose approved organization advanced entries.
- Logout: visible logout must return to `/login` and should not preserve an authenticated workspace.
- Chinese UI: observed landing, denial, unavailable, and logout states must be visible in Chinese and must not expose user-facing technical labels.

## Role Mapping Result

| Role row             | Required allow behavior                                                                                                                                     | Required deny or unavailable behavior                                          | Chinese UI check |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------- |
| `org_standard_admin` | Lands in `/organization/portal`; sees organization-scoped admin workspace and visible logout.                                                               | No global ops/content access; advanced organization AI/training routes denied. | Required.        |
| `org_advanced_admin` | Lands in `/organization/portal`; sees organization training, analytics, AI question generation, AI paper generation, and visible logout in organization UI. | No global ops/content access; no Provider/cost/payment/staging/prod surfaces.  | Required.        |

## Acceptance Mapping Result

- Strict row success requires organization landing, organization allow routes, ops/content direct denial, visible Chinese UI, and logout all passing.
- A row may be recorded as `fail` or `blocked` without declaring final Pass.
- If either row fails, the next task must be a focused repair or planning task before layer-2 business closure.

## Allowed File Scope

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-hydration-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-hydration-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-hydration-repair.md`.

## Allowed Runtime Scope

- Local targets: `http://127.0.0.1:3000`, `http://localhost:3000`.
- Rows: `org_standard_admin`, `org_advanced_admin`.
- Route probes: `/organization/portal`, `/organization/organization-training`, `/organization/organization-analytics`, `/organization/ai-question-generation`, `/organization/ai-paper-generation`, `/ops/users`, `/ops/redeem-codes`, `/content/papers`.

## Blocked Scope

- Dev server start unless separately approved.
- Credential entry by Codex or credential document reading by Codex.
- Account creation, disable, password reset, seed mutation, database read/write, migration, or schema work.
- Source, test, e2e, script, dependency, lockfile, `.env*`, Provider, Cost Calibration, staging/prod, payment, external service, PR, force push, and final MVP Pass.

## Runtime Procedure

1. Confirm the local app is reachable in the existing in-app browser.
2. Ask the owner to manually log in as `org_standard_admin`.
3. Observe only visible route and UI state for required allow/deny/logout/Chinese UI checks.
4. Ask the owner to manually log in as `org_advanced_admin`.
5. Repeat the same checks and record redacted evidence.

## Validation Commands

1. `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-hydration-repair.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-hydration-repair.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-hydration-repair.md`.
2. `git diff --check`.
3. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-workspace-runtime-rerun-after-session-hydration-repair-2026-06-24`.
4. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-workspace-runtime-rerun-after-session-hydration-repair-2026-06-24 -SkipRemoteAheadCheck`.

## Stop Conditions

- Stop if the local app is unreachable and dev server start would be required.
- Stop if the owner cannot log in manually for a required role row.
- Stop if observation would require Codex to type credentials, read secrets, inspect browser storage, mutate account state, access database/env/provider surfaces, or claim final Pass.
