# Phase 18 Audit RA-06 Admin Ops Logs And Permissions

**Date:** 2026-05-27

**Task:** `phase-18-audit-ra-06-admin-ops-logs-permissions`

## Scope

Audit RA-06-01 through RA-06-13 against `docs/01-requirements/stories/epic-06-admin-ops.md`, `docs/01-requirements/modules/06-admin-ops.md`, architecture contracts, static implementation, unit coverage, and local browser/e2e evidence.

This report records facts and findings only. No business bug fixes are made in this audit task.

## Phase 17 Prerequisite Context

- Local DB, dev server, and Playwright e2e are generally usable.
- Real provider, staging/prod/cloud/deploy, env/secret, dependency, and destructive data gates remain blocked.
- Persistent `ops_admin` and `content_admin` local login accounts are incomplete, so browser evidence using those roles is partial unless synthetic fixture evidence is explicit.

## Item Results

| auditId  | requirementId | status      | findingId      | Code implementation conclusion                                                                                                                                                                                                                                     | Browser/e2e conclusion                                                                                                                |
| -------- | ------------- | ----------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| RA-06-01 | US-06-01      | partial     | F-RA-06-01-001 | Shared admin contracts define page sizes, sorting, filter refresh, confirmation dialogs, toast/status feedback, and conflict copy. Full cross-page enforcement and atomic/optimistic-lock proof for every key write path is incomplete.                            | Unit evidence exists for the shared baseline. Full browser proof across every admin page is incomplete.                               |
| RA-06-02 | US-06-02      | partial     | F-RA-06-02-001 | User list/reset/disable/enable APIs, session revocation, and redacted audit logs exist. Runtime mutation gates currently require `super_admin`; full user detail with authorization list and enterprise binding is incomplete.                                     | Synthetic UI/service evidence exists. Persistent `ops_admin` real-login evidence is incomplete.                                       |
| RA-06-03 | US-06-03      | partial     | F-RA-06-03-001 | Organization create/edit/disable, cascade option, employee create/disable, role gates, and redacted audit logs exist. Organization enable, employee batch import, employee unbind, and full auth-detail view evidence are incomplete.                              | Unit/UI evidence exists for core org mutations. Batch import/unbind and full browser evidence are incomplete.                         |
| RA-06-04 | US-06-04      | partial     | F-RA-06-04-001 | Org_auth create overlap guard, cancel, active practice/mock_exam termination, and audit logs exist. Detail/occupancy view evidence is incomplete, and admin routes use `/api/v1/org-auths` rather than the catalog-listed `/api/v1/authorizations`.                | Unit/UI evidence exists for create/cancel. Detail/occupancy browser proof is incomplete.                                              |
| RA-06-05 | US-06-05      | partial     | F-RA-06-05-001 | Redeem_code batch generation, UTC+8 deadline normalization, search/status filters, plaintext response for generated codes, and redacted audit logs exist. Dedicated detail view evidence is incomplete.                                                            | UI evidence covers generation/filtering. Detail browser proof is incomplete.                                                          |
| RA-06-06 | US-06-06      | partial     | F-RA-06-06-001 | Resource management UI covers list, upload, detail/Markdown preview, Markdown review/publish, rebuild, and disable. Enable/restore remains missing from RA-05.                                                                                                     | Synthetic UI/e2e evidence exists for upload/review/rebuild/disable. Persistent `ops_admin` browser login evidence remains incomplete. |
| RA-06-07 | US-06-07      | partial     | F-RA-06-07-001 | Model provider/config UI covers create/edit-style metadata, enable/disable, fallback controls, masked secrets, super_admin gates, and audit logs. Persisted admin configs are not clearly used for live AI runtime selection.                                      | UI/unit evidence exists without secrets. Real provider behavior is blocked.                                                           |
| RA-06-08 | US-06-08      | partial     | F-RA-06-08-001 | Question/material UI covers list fields, filters, create/edit/disable/copy, locked copy-only handling, rich text bounds, and recommendation review. Knowledge/tag binding/filter and confirmed recommendation gaps remain from RA-02/RA-04.                        | Synthetic UI evidence exists. Persistent `content_admin` browser login evidence remains incomplete.                                   |
| RA-06-09 | US-06-09      | partial     | F-RA-06-09-001 | Paper UI covers list/filter/sort, draft composition, publish/archive/copy, asset binding, and local source-file summaries. RA-02 publish/archive/copy lifecycle gaps remain.                                                                                       | Synthetic UI evidence exists. Real object storage remains blocked.                                                                    |
| RA-06-10 | US-06-10      | partial     | F-RA-06-10-001 | Knowledge_node UI covers tree/list behavior, create/edit/move/sort/disable, binding counts, and redacted audit logs. AI recommendation correction cannot fully complete durable bindings while RA-02/RA-04 binding gaps remain.                                    | Synthetic UI/runtime evidence exists. Real provider recommendation is blocked.                                                        |
| RA-06-11 | US-06-11      | implemented | null           | Audit_log list/query supports action/target/result/keyword/time-style filtering, read-only service surface, no delete/export route evidence, standard responses, and redacted metadata.                                                                            | Unit/UI evidence covers filtering and redaction. No fresh browser run was needed for this audit-only block.                           |
| RA-06-12 | US-06-12      | implemented | null           | AI call log list/summary supports function/status/profession/level/keyword filters, detail summaries, cost summaries, read-only service surface, and redaction of raw prompt/output/provider/chunk data.                                                           | Unit/UI evidence covers list, summary, and redaction. Real provider data remains blocked.                                             |
| RA-06-13 | US-06-13      | partial     | F-RA-06-13-001 | Role enum/guards, multi-role arrays, independent admin account markers, admin 8-hour multi-session login, and route separation exist. Admin user create/edit/disable UI is incomplete, and login lock policy is implemented as 3 failures for 5 minutes, not 5/15. | E2E synthetic role-denial coverage exists. Persistent role login prerequisites remain incomplete for `ops_admin` and `content_admin`. |

## Findings

| findingId      | auditId  | Severity | Summary                                                                                                                                                | Follow-up task                                                         |
| -------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| F-RA-06-01-001 | RA-06-01 | P2       | Admin common UX and concurrency coverage is not proven consistently across all admin pages and key write paths.                                        | `phase-20-fix-ra-06-01-admin-common-ux-concurrency-coverage`           |
| F-RA-06-02-001 | RA-06-02 | P2       | User-management role/detail behavior is misaligned with the ops_admin requirement and lacks full detail evidence.                                      | `phase-20-fix-ra-06-02-user-management-role-detail-alignment`          |
| F-RA-06-03-001 | RA-06-03 | P2       | Organization enable, employee batch import/unbind, and full auth-detail view evidence are incomplete.                                                  | `phase-20-fix-ra-06-03-organization-employee-management-completion`    |
| F-RA-06-04-001 | RA-06-04 | P2       | Org_auth detail/occupancy view evidence is incomplete and route naming differs from the catalog path.                                                  | `phase-20-fix-ra-06-04-org-auth-detail-route-alignment`                |
| F-RA-06-05-001 | RA-06-05 | P3       | Redeem_code dedicated detail view evidence is incomplete.                                                                                              | `phase-20-fix-ra-06-05-redeem-code-detail-view`                        |
| F-RA-06-06-001 | RA-06-06 | P2       | Resource enable/restore is missing and ops_admin browser evidence remains partial.                                                                     | `phase-20-fix-ra-06-06-resource-enable-admin-evidence`                 |
| F-RA-06-07-001 | RA-06-07 | P2       | Admin model_config surfaces exist but live runtime selection from persisted admin config remains incomplete.                                           | `phase-20-fix-ra-06-07-model-config-runtime-admin-alignment`           |
| F-RA-06-08-001 | RA-06-08 | P2       | Question admin depends on unresolved knowledge/tag binding and confirmed recommendation gaps.                                                          | `phase-20-fix-ra-06-08-question-admin-knowledge-binding-completion`    |
| F-RA-06-09-001 | RA-06-09 | P2       | Paper admin depends on unresolved publish/archive/copy lifecycle gaps.                                                                                 | `phase-20-fix-ra-06-09-paper-admin-lifecycle-gap-completion`           |
| F-RA-06-10-001 | RA-06-10 | P2       | Knowledge UI recommendation correction cannot fully complete durable question bindings.                                                                | `phase-20-fix-ra-06-10-knowledge-ui-recommendation-binding-completion` |
| F-RA-06-13-001 | RA-06-13 | P1       | Admin account security policy is misaligned: lockout is 3 failures/5 minutes instead of 5 failures/15 minutes; admin user management UI is incomplete. | `phase-20-fix-ra-06-13-admin-account-security-policy-alignment`        |

## Follow-Up Tasks

The follow-up task ids above were registered in `docs/04-agent-system/state/task-queue.yaml` as Phase 20+ implementation/fix candidates. They are not implemented in this audit branch.

## Evidence Pointer

Per-item evidence and command logs are recorded in `docs/05-execution-logs/evidence/2026-05-27-phase-18-audit-ra-06-admin-ops-logs-permissions.md`.
