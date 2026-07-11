# 0704 Ops Audit Log List Standardization Implementation Plan

## Task Metadata

- taskId: `0704-ops-audit-log-list-standardization-2026-07-11`
- branch: `codex/0704-ops-audit-log-list-standardization`
- base: `0aae1d2804ad0dc3efd6790b97edd27a3b7eef89`
- goal: standardize the read-only audit-log page on the shared admin list pattern, complete its existing server-backed filters, localize operational values, and move redacted detail into a focused drawer without changing authorization or log contracts.

## Required Reading

- `AGENTS.md`, current state/queue, code taste commandments, every ADR
- requirement indexes, advanced retention/log governance, role/authorization decisions, full-role UI/UX traceability, preview-risk and Provider-gate evidence
- approved super-admin and operations-admin log screenshots and the approved task-8 optimization proposal
- split audit-log route/page, shared admin-list components, audit list contract/validator/repository, and focused role/redaction/UI tests

## Frozen Business Semantics

- `/api/v1/audit-logs` remains GET-only and keeps the existing pagination, filter, response, retention, and governance contract.
- `super_admin` and `ops_admin` retain their current read scope; other roles remain denied by the server.
- Audit records remain summary-only and redacted. Raw request bodies, credentials, sessions, card-code plaintext, internal numeric identifiers, raw Prompt, Provider payloads, and full business content remain unavailable.
- AI call logs, cost summaries, model configuration, Prompt templates, content review, and Provider behavior remain outside this page and task.

## Scope

1. Add RED tests for the shared toolbar, table frame, pagination, result count, reset, action/target/result/date filters, readable labels, stable time, status icon/text, and a closed-by-default redacted detail drawer.
2. Reuse `AdminListToolbar`, `AdminTableFrame`, and `AdminPagination`; remove the page-specific summary band and pagination implementation.
3. Extend the existing frontend query state to send `actionType`, `targetResourceType`, `resultStatus`, `fromCreatedAt`, and `toCreatedAt` through the already-supported API contract.
4. Keep filter changes and reset on page one; keep the toolbar and pagination visible for filtered empty results.
5. Present fixed-width, horizontally scrollable table columns at desktop widths and format timestamps consistently for Chinese operations users.
6. Translate known roles, actions, target categories, results, and redaction states into user-facing Chinese while preserving unknown values as safe fallbacks.
7. Open selected summary-only metadata in an accessible right drawer with close button, Escape, backdrop close, and focus restoration.
8. Preserve the endpoint-isolation test proving the page requests audit logs only.

## Allowed Files

- state/queue and this task plan/evidence/audit
- `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx`
- `tests/unit/admin-ai-audit-log-ops-baseline.test.ts`
- `tests/unit/admin-ops-summary-first-ui.test.ts`

## Explicit Exclusions

- no server contract, validator, repository, authorization, retention, write-path, AI-call-log, model-config, Prompt, or Provider behavior change
- no schema, migration, seed, direct database execution, dependency, package/lockfile, env/secret, Cost Calibration, staging, production, deploy, new screenshot capture, raw DOM, PR, or force push

## TDD And Verification

1. RED focused tests for shared list structure, complete query mapping/reset, readable table, empty state, drawer interaction, redaction, and endpoint isolation.
2. GREEN with the minimum audit-page-only component migration.
3. Adversarial review of role, endpoint, sensitive-data, status-state, keyboard, pagination, and desktop table boundaries.
4. Run focused tests, full lint, typecheck, formatting, diff check, and Module Run v2.
5. Commit, fast-forward merge, master rerun, push, branch cleanup, and clean/aligned confirmation.

## Acceptance

- the page has one shared filter toolbar, result total, table frame, and shared pagination; no internal `summary-first` or `Admin Ops` wording is visible
- keyword, action, target, result, date range, page size, page, and reset use the existing server contract and reset page state correctly
- known roles/actions/targets/results are readable Chinese; result state uses icon plus text and table cells do not collapse into incoherent wrapping
- the table remains usable at 1280 px through stable minimum width and horizontal scrolling
- filtered empty, loading, error, ready, and disabled pagination states remain distinguishable
- details open in a right drawer and show only readable redacted metadata; public/internal identifiers, request IP, and raw sensitive payloads are not rendered
- the page requests only `/api/v1/audit-logs`; role permissions and all server behavior remain unchanged
