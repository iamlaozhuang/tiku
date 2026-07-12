# 0704 Content List Foundation Implementation Plan

## Task Metadata

- taskId: `0704-content-list-foundation-2026-07-11`
- branch: `codex/0704-content-list-foundation`
- base: `1d7310e918e42d9e95af0904e75145c0226b50cd`
- goal: establish one server-paginated, filterable, readable list baseline for content-admin papers, questions, and materials without changing content write semantics.

## Required Reading

- `AGENTS.md`, current project state and task queue, code taste commandments, and every ADR
- requirement indexes, question/paper module and story, full-role UI/UX source entry and content-admin closure baseline
- latest content-admin UI/UX, 0704 acceptance, preview-risk, and Provider-gate evidence
- approved private paper/question/material screenshots, existing list clients, shared admin-list components, query validators, repositories, and focused tests

## Frozen Business Semantics

- Existing paper, question, and material create/update/copy/disable/publish/archive endpoints, request bodies, lifecycle rules, locks, snapshots, and confirmations remain unchanged.
- Existing `content_admin` and `super_admin` server authorization remains authoritative; no client-side hiding substitutes for server checks.
- Default lists remain summary-only. Full question/material content, internal numeric identifiers, raw AI data, Provider data, credentials, sessions, and database rows remain outside evidence and default list rows.
- Provider stays disabled. No Provider, direct database, staging, production, deployment, env/secret, or Cost Calibration action is allowed.

## Scope

1. Add RED tests proving paper, question, and material filters, sorting, page size, page navigation, reset, result totals, and URL state drive server queries instead of client slicing.
2. Complete existing read-only list query parsing for current paper filters and material keyword search; preserve response envelopes and write contracts.
3. Reuse `AdminListToolbar`, `AdminTableFrame`, `AdminPagination`, and `useAdminListInteraction` for all three content ledgers.
4. Replace split filter/common-control panels with one ordered toolbar: keyword, business filters, sorting, page size, reset, result count, and existing primary create action.
5. Render compact, horizontally scrollable ledgers with readable summaries and existing safe row actions; do not render complete bodies or internal identifiers.
6. Keep list controls and pagination visible for filtered empty results; distinguish initial empty from filtered empty.
7. Persist list query state in the route URL and reset page to one whenever a filter, sort, or page-size value changes.
8. Label lifecycle counts derived from fetched rows as current-page information; do not present partial-page counts as global totals.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-11-0704-content-list-foundation.md`
- `docs/05-execution-logs/evidence/2026-07-11-0704-content-list-foundation-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-11-0704-content-list-foundation-audit.md`
- `src/components/admin/AdminList/index.tsx`
- `src/components/admin/AdminList/AdminList.test.tsx`
- `src/hooks/useAdminListInteraction.ts`
- `src/features/admin/paper-management/AdminPaperManagementClient.tsx`
- `src/features/admin/paper-management/AdminPaperManagementClient.test.tsx`
- `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`
- `src/features/admin/content-admin-runtime.tsx`
- `src/server/contracts/admin-content-knowledge-ops-contract.ts`
- `src/server/services/admin-flow-runtime.ts`
- `src/server/repositories/admin-flow-runtime-repository.ts`
- `src/server/services/content-question-material-runtime.ts`
- `src/server/validators/material.ts`
- `src/server/repositories/material-repository.ts`
- `src/server/repositories/question-repository.ts`
- `tests/unit/admin-paper-ui.test.ts`
- `tests/unit/admin-question-material-ui.test.ts`
- `tests/unit/phase-7-admin-flow-runtime-smoke.test.ts`
- `tests/unit/phase-9-content-question-material-runtime.test.ts`
- `tests/unit/phase-9-multi-client-rest-contract-verification.test.ts`
- `src/server/validators/question.test.ts`

## Explicit Exclusions

- no write-endpoint, authorization, lifecycle, lock, snapshot, publish, archive, copy, disable, or confirmation behavior change
- no schema, migration, seed, dependency, package/lockfile, object storage, Provider, env/secret, direct database, staging, production, deployment, PR, force push, new screenshot, or raw DOM capture
- no paper composer, detail drawer/page, resource, knowledge-node, or AI generation implementation in this task

## TDD And Verification

1. RED focused UI and route/runtime tests for real server pagination, complete query forwarding, reset, URL persistence, shared list structure, and filtered empty behavior.
2. GREEN with minimum query-contract completion and three-list UI migration.
3. Adversarial review of role, content lifecycle, sensitive data, pagination correctness, write isolation, empty/error/loading, keyboard labels, and desktop overflow.
4. Run focused tests, lint, typecheck, full format check, `git diff --check`, and Module Run v2 pre-commit/pre-push gates.
5. Write redacted evidence/audit, commit, fast-forward merge, rerun on master, push, delete the short branch, and confirm clean/aligned.

## Acceptance

- page two requests and renders the next server page; no page is produced by slicing the first response
- page sizes 20, 50, and 100 and displayed totals match the response pagination contract
- paper, question, and material filters are sent to the server; filter, sort, and page-size changes return to page one
- all three pages use the shared toolbar, table frame, list states, and bottom pagination with consistent ordering and labels
- query state survives refresh through the URL, and reset restores the route and default query
- initial empty and filtered empty states are distinct while controls and pagination remain usable
- full question/material bodies and internal numeric identifiers are absent from default rows; existing row actions and permissions remain unchanged
