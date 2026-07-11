# 0704 Ops Organization Tree Completion

## Task Metadata

- taskId: `0704-ops-organization-tree-completion-2026-07-11`
- branch: `codex/0704-ops-organization-tree-completion`
- base: `fccaadaa511de61344b86df88550fdcb1b313825`
- goal: replace the globally paginated organization list with a branch-loaded four-level tree and a non-technical operations workflow while preserving every organization write contract.

## Required Reading

- `AGENTS.md`, current state/queue, code taste commandments, every ADR
- requirements indexes, admin operations, role-separated organization, edition-aware authorization, and ADR-007
- latest organization management split, organization-tree inheritance/transfer, UI/UX, preview-risk, and Provider-gate evidence/audits
- approved organization-management screenshot and the confirmed hierarchy `省 -> 地市 -> 县区 -> 站点`
- organization contracts, validators, runtime route/service/repository, organization management UI, and focused tests

## Existing Business Semantics

- `province -> city -> district -> station` is the complete four-level hierarchy; UI labels are `省`、`地市`、`县区`、`站点`.
- Organization create/update/enable/disable continues through the existing routes, validators, confirmation dialogs, and request bodies.
- No drag/drop, automatic parent correction, implicit movement, authorization recalculation, employee transfer, or edition rule is introduced.
- Organization authorization, employee import, transfer, unbind, quota, and effective-edition behavior are frozen.

## Scope

1. TDD a read-only `GET /api/v1/organization-tree-nodes` standard response.
2. Query direct children by parent public operation reference with independent branch pagination; root queries return root nodes and never split descendants away from an unseen parent.
3. Search by organization name with optional status/tier filters and return each match with its complete ancestor path; ancestry resolution uses bounded bulk queries, not per-row queries.
4. Return display-safe fields only: name, tier, status, direct employee count, direct child count, authorization summary, public operation reference, and ancestor path.
5. Refactor the organization-structure view into a left tree and right node detail workspace with search, tier/status filters, expand/collapse, branch load-more, selected path, clear actions, and localized loading/empty/error states.
6. Keep organization names left-aligned; indentation only communicates hierarchy. Do not expose public references in visible copy.
7. Move create/edit UI behind explicit `新增省级组织`、`新增下级组织`、`编辑组织` actions while reusing the existing form, validation, confirmation, and mutation handlers.
8. Refresh the tree after successful create/update/enable/disable without changing the write request or response contract.

## Allowed Files

- state/queue and this task plan/evidence/audit
- `src/app/api/v1/organization-tree-nodes/route.ts`
- `src/server/contracts/admin-user-org-auth-ops-contract.ts`
- `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`
- directly related repository tests
- `src/server/services/admin-organization-org-auth-runtime.ts`
- directly related route/service tests
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- focused organization UI/runtime tests

## Explicit Exclusions

- no organization schema, migration, seed, raw SQL string, direct DB execution, or hierarchy enum change
- no organization authorization, employee import/transfer/unbind, quota, edition, session, or audit business-rule change
- no dependency, package/lockfile, Provider, Cost Calibration, env/secret, staging, production, deploy, screenshot capture, raw DOM, PR, or force push

## TDD And Verification

1. RED route/repository/UI tests for branch loading, search ancestry, four-level order, left alignment, filters, localized states, and existing mutation payload freeze.
2. GREEN with the minimum read contract, repository, route, and tree workspace changes.
3. Adversarial review of role scope, parent/tier validation, organization isolation, authorization/edition immutability, employee lifecycle, sensitive fields, and state completeness.
4. Run targeted tests, lint, typecheck, formatting, diff check, Module Run v2.
5. Commit, fast-forward merge, master rerun, push, branch cleanup, clean/aligned confirmation.

## Acceptance

- root and expanded branches preserve `省 -> 地市 -> 县区 -> 站点`; children never appear without a visible ancestor context
- searching a station shows the complete ancestor path and highlights the match
- direct-child pagination/load-more does not truncate other branches or flatten hierarchy
- names are left-aligned and indentation communicates hierarchy without changing text alignment
- non-technical operators can select a node, understand its path/status/direct counts/auth summary, and find explicit create/edit/enable/disable actions
- organization write endpoint paths, bodies, validator behavior, confirmations, and permission tests remain unchanged
- no drag/drop, automatic move, internal numeric identifier, credential, session, raw row, or sensitive authorization content is introduced
