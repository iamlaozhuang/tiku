# 0704 Ops Redeem Code Flow Separation Implementation Plan

## Task Metadata

- taskId: `0704-ops-redeem-code-flow-separation-2026-07-11`
- branch: `codex/0704-ops-redeem-code-flow-separation`
- base: `a2233b4722eca263d706e07fa3a8a5806413c349`
- goal: make card-code search and distribution history the default page workflow while moving the existing generation operation into a focused right drawer without changing generation or plaintext-access semantics.

## Required Reading

- `AGENTS.md`, current state/queue, code taste commandments, every ADR
- requirement indexes, edition-aware authorization, ADR-007, card-code edition/plaintext operations decision, and full-role UI/UX traceability
- latest card-code runtime/UI, plaintext/redaction, preview-risk, and Provider-gate evidence/audits
- approved super-admin and operations-admin card-code screenshots and the approved task-7 optimization proposal
- card-code UI, shared admin-list primitives, generation contracts, and focused list/generation/detail tests

## Frozen Business Semantics

- Card-code generation keeps the existing endpoint, request body, type, profession, level, duration, deadline, count ceiling, validation, and second confirmation.
- `personal_standard_activation`, `personal_advanced_activation`, and `edition_upgrade` meanings remain unchanged.
- Eligible `super_admin` and `ops_admin` plaintext list/detail copy behavior remains unchanged; other roles remain denied.
- Generation success keeps the controlled distribution window and one-operation copy behavior.
- Audit redaction, hash secrecy, card-code plaintext evidence prohibition, and server permission checks remain unchanged.

## Scope

1. Add RED UI tests proving the default page contains the shared filter toolbar, list table, result count, reset, and shared pagination while the generation form is absent.
2. Make `生成卡密` the only page-level primary action and open the existing generation workflow in a right drawer with Escape, backdrop close, and focus restoration.
3. Keep filter state independent from generation state. Search, status, sort, page size, page, and reset continue to use the existing server list contract and return to page one when appropriate.
4. Reuse `AdminListToolbar`, `AdminTableFrame`, `AdminPagination`, and the existing task drawer instead of maintaining card-code-specific list chrome.
5. Order generation fields as mode, type, batch quantity when applicable, profession and level, duration and deadline, validation summary, and final action.
6. Hide the quantity input in single mode and show it only in batch mode. Keep validation adjacent to the final action.
7. Keep the generated plaintext distribution window inside the generation drawer so list and generation states do not visually interleave.
8. Preserve list/detail copy visibility, detail loading/error behavior, empty/filter-empty states, and all existing mutation payload tests.

## Allowed Files

- state/queue and this task plan/evidence/audit
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- focused card-code UI, generation, detail, summary, and baseline regression tests

## Explicit Exclusions

- no API, service, repository, validator, generation payload, plaintext permission, audit, redemption, authorization, edition, or database behavior change
- no schema, migration, seed, direct database execution, dependency, package/lockfile, env/secret, Provider, Cost Calibration, staging, production, deploy, new screenshot capture, raw DOM, PR, or force push

## TDD And Verification

1. RED card-code page test for shared list-first layout, reset, closed generation drawer, drawer field ordering, single/batch quantity visibility, and unchanged generation request.
2. GREEN with the minimum UI component split and shared-list migration.
3. Adversarial review of role, plaintext, audit, edition, standard/advanced, generation count, list/generation state isolation, and sensitive evidence boundaries.
4. Run focused tests, full lint, typecheck, formatting, diff check, and Module Run v2.
5. Commit, fast-forward merge, master rerun, push, branch cleanup, and clean/aligned confirmation.

## Acceptance

- the initial card-code page shows one filter toolbar, result total, list table, and shared pagination; generation controls are not mounted
- search, status, sort, page size, page, and reset remain server-backed and reset page state correctly
- `生成卡密` opens a focused right drawer and closing it does not change active list filters
- single mode does not show a quantity input; batch mode shows it and keeps the existing 1-100 validation
- generation confirmation displays count, type, scope, duration, and deadline without exposing plaintext before success
- successful generation preserves controlled plaintext distribution and existing eligible-role copy behavior
- list and detail never expose hashes, numeric IDs, sessions, credentials, or plaintext to unauthorized roles
- loading, ready, initial/filtered empty, error, disabled pagination, drawer, confirmation, and distribution states remain distinguishable
