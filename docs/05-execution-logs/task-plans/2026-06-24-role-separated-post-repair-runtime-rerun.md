# Task Plan: role-separated-post-repair-runtime-rerun-2026-06-24

## Task Metadata

- Task id: `role-separated-post-repair-runtime-rerun-2026-06-24`.
- Branch: `codex/post-repair-runtime-rerun-20260624`.
- Task kind: `acceptance_runtime_walkthrough`.
- Execution profile: `acceptance_role_separated_post_repair_local_runtime_rerun`.
- Approval consumed: `ROLE_SEPARATED_POST_REPAIR_RUNTIME_RERUN_SCOPE_2026_06_24`, approved by laozhuang in chat on
  2026-06-24.
- Runtime target: local only, `http://127.0.0.1:3000` or `http://localhost:3000`.
- Dev server start: not approved by the package.
- Non-claim: this task must not declare standard/advanced MVP final Pass.

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
- `docs/01-requirements/stories/epic-06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`.
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`.
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`.
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`.
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`.

## Requirement Decision Map

- The active role-separated decision is
  `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- The active approval package is
  `docs/05-execution-logs/acceptance/2026-06-24-role-separated-post-repair-runtime-rerun-scope-approval-package.md`.
- The strict runtime gate requires all eight role rows to pass fresh redacted observation before final acceptance can be
  discussed.
- ADR-004 and ADR-005 keep env/secret, staging/prod, Provider, deployment, payment, and production-like actions blocked.
- ADR-007 keeps source `edition`, `auth_upgrade`, and computed `effectiveEdition` as service/authorization source
  concerns, not UI-only claims.

## Requirement Mapping Result

This runtime rerun maps to R1-R15 from the 2026-06-24 role-separated MVP alignment.

## Role Mapping Result

This task observes `personal_standard_student`, `personal_advanced_student`, `org_standard_employee`,
`org_advanced_employee`, `org_standard_admin`, `org_advanced_admin`, `content_admin`, and `ops_admin`.

## Acceptance Mapping Result

Each row may close only as `pass`, `fail`, or `blocked` with redacted role/route/status evidence. This task cannot claim
final MVP Pass, Provider readiness, staging readiness, release readiness, or production readiness.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-24-role-separated-mvp-post-repair-gap-analysis.md`.
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-local-account-runtime-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-role-separated-account-local-account-runtime-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-24-backend-workspace-landing-logout-separation-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-student-home-ai-organization-training-entry-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-admin-ai-generation-entry-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-ops-auth-runtime-validation-redacted.md`.

## Conflict Check

- No requirement conflict was found.
- The previous repair package provides source/unit evidence only. It does not prove post-repair runtime acceptance.
- The approval package permits local browser/runtime observation with owner-entered credentials only.
- The approval package does not approve starting a dev server. If no approved local target is already listening, this
  task records a blocked result and stops.

## Runtime Rows

| role                        | expected allowed observation                                                                  | expected denied or unavailable observation                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `personal_standard_student` | Standard learner home and authorized standard learning surfaces.                              | No advanced `AI训练`; direct advanced AI routes denied or standard-unavailable; backend routes denied.                 |
| `personal_advanced_student` | Discoverable learner `AI训练` with `AI出题` and `AI组卷` actions where local gates permit.    | No direct write to formal `question` or `paper`; backend routes denied.                                                |
| `org_standard_employee`     | Standard organization-authorized learner home.                                                | No `AI训练`; no `企业训练`; direct advanced or enterprise-training routes denied or standard-unavailable.              |
| `org_advanced_employee`     | Discoverable learner `AI训练` and assigned `企业训练` under valid organization context.       | No access outside scoped `organization`; no admin/global operations surfaces.                                          |
| `org_standard_admin`        | Organization workspace for employee management and organization authorization/status viewing. | No enterprise training management; no organization AI generation; no system operations or content workspace.           |
| `org_advanced_admin`        | Organization workspace with employee/auth status, enterprise training, and organization AI.   | No global system operations or content authoring outside scoped `organization`.                                        |
| `content_admin`             | Content workspace with content management plus `AI出题` and `AI组卷` draft/review entries.    | No global operations `redeem_code`, global `org_auth`, Provider, cost, or organization admin surfaces.                 |
| `ops_admin`                 | System operations workspace with users, organizations, `redeem_code`, `org_auth`, and logs.   | Content authoring routes denied; no content draft creation or content AI draft/review workspace unless later approved. |

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-role-separated-post-repair-runtime-rerun.md`.

## Blocked Files And Work

- No product source, tests, e2e, scripts, schema, migration, database read/write, account action, seed, package,
  lockfile, `.env*`, Provider, Cost Calibration, staging/prod/cloud/deploy, payment, external-service, PR, force push,
  screenshot evidence, HTML dump, browser storage inspection, token/cookie capture, credential entry by Codex, or final
  MVP Pass claim.

## Execution Plan

1. Materialize the approval in `project-state.yaml` and `task-queue.yaml`.
2. Check whether `127.0.0.1:3000` is already listening.
3. If the local target is unavailable, record `blocked_local_target_not_running_dev_server_start_not_approved` and stop.
4. If available, use the in-app Browser against the local target only.
5. For each role row, ask laozhuang to log in manually. Codex must not read credential files, type passwords, or record
   credential values.
6. Observe only visible role/workspace/route labels, allowed/denied states, and redacted blocker notes.
7. Write final evidence and audit review with no screenshots, traces, storage dumps, raw page dumps, or secrets.
8. Run scoped formatting, diff, and Module Run v2 hardening.
9. Stop for closeout approval if local commit/merge/push/cleanup is not separately approved.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-role-separated-post-repair-runtime-rerun.md docs/05-execution-logs/evidence/2026-06-24-role-separated-post-repair-runtime-rerun.md docs/05-execution-logs/audits-reviews/2026-06-24-role-separated-post-repair-runtime-rerun.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-role-separated-post-repair-runtime-rerun.md docs/05-execution-logs/evidence/2026-06-24-role-separated-post-repair-runtime-rerun.md docs/05-execution-logs/audits-reviews/2026-06-24-role-separated-post-repair-runtime-rerun.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId role-separated-post-repair-runtime-rerun-2026-06-24`

## Stop Conditions

- Stop if the local target is not already listening.
- Stop if a row requires Codex to read, type, receive, reveal, or record credentials.
- Stop if evidence would need token, cookie, localStorage, sessionStorage, Authorization header, `.env*`, database row,
  Provider payload, prompt, raw generated content, private answer text, plaintext `redeem_code`, full `question`, or full
  `paper` content.
- Stop if proving a row requires account mutation, seed, database write, schema/migration, source/test/e2e/script edit,
  dependency change, Provider, staging/prod, payment, external service, Cost Calibration, PR, force push, or final Pass.
