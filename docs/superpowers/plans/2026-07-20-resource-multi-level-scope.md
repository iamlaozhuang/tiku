# Resource Multi-Level Scope Implementation Plan

> **Execution:** Inline in the main thread. Subagents are prohibited by the user's current Goal constraints.

**Goal:** Close F-0088 by carrying exact resource level coverage through persistence, upload, indexing, retrieval, and operator UI without treating unknown legacy rows as profession-general.

**Architecture:** Add nullable PostgreSQL `integer[]` `resource.level_list` while retaining legacy `resource.level` for non-destructive compatibility. `null` is legacy-unclassified and fail-closed, `[]` is explicitly profession-general, and a normalized non-empty list is exact coverage. All active consumers move to `levelList`; the scalar query level remains the caller's already-authorized level.

**Tech Stack:** TypeScript, React, Drizzle ORM/PostgreSQL migration source, Vitest, ESLint, Next.js.

## Global Constraints

- Approval: `fresh-schema-start-f0088-resource-level-scope-2026-07-20`.
- Do not execute migrations, access real data, add dependencies, call Providers/external services, touch secrets/env, deploy, modify the safety kernel, or create Subagents.
- Preserve resource lifecycle, API envelope, authorization public-id filtering, knowledge-node scope, citation redaction, and scalar requested authorization level.
- One task, one reviewable commit; final commit/push requires a candidate-tree-bound fresh approval.

---

### Task 1: Encode schema and migration invariants

**Files:**

- Modify: `src/db/schema/ai-rag.ts`
- Test: `src/db/schema/ai-rag.test.ts`
- Create: `tests/unit/p1-resource-multi-level-scope.test.ts`
- Generate: `drizzle/20260720173000_p1_rc_03_resource_multi_level_scope.sql`
- Generate: `drizzle/meta/20260720173000_snapshot.json`
- Modify: `drizzle/meta/_journal.json`

- [x] Add RED assertions for nullable `level_list`, retained legacy `level`, and migration text that backfills only non-null legacy levels to singleton arrays.
- [x] Verify RED fails because the column and migration do not exist.
- [x] Add `level_list` as nullable native integer array plus a GIN index.
- [x] Generate the named migration without connecting to or applying against a database; verify legacy `null` remains `null`.

### Task 2: Define one level-coverage contract

**Files:**

- Modify: `src/server/models/ai-rag.ts`
- Test: `src/server/models/ai-rag.test.ts`
- Modify: `src/server/contracts/ai-rag-contract.ts`
- Modify: `src/server/contracts/admin-content-knowledge-ops-contract.ts`
- Modify: `src/server/mappers/ai-rag-mapper.ts`
- Test: `src/server/mappers/ai-rag-mapper.test.ts`

- [x] Add RED tests for normalization of distinct sorted levels 1-5 and the three states `null`, `[]`, and non-empty list.
- [x] Implement immutable normalization, eligibility, and rank helpers.
- [x] Expose camelCase `levelList` while retaining scalar `level` only as legacy compatibility data.

### Task 3: Carry coverage through upload, catalog, and indexing

**Files:**

- Modify: `src/server/services/rag-resource-knowledge-runtime.ts`
- Modify: `src/server/repositories/rag-resource-knowledge-runtime-repository.ts`
- Modify: `src/db/owner-preview-runtime-rag-resource-import.ts`
- Modify: `src/rag/chunking.ts`
- Test: `src/rag/chunking.test.ts`
- Modify: `src/server/services/rag-chunking-service.ts`
- Test: `src/server/services/rag-chunking-service.test.ts`
- Modify: `src/server/services/local-rag-mock-embedding-pipeline.ts`
- Test: `tests/unit/phase-9-rag-resource-knowledge-runtime.test.ts`
- Test: `tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts`
- Test: `tests/unit/owner-preview-runtime-rag-resource-import.test.ts`

- [x] Add RED tests proving multi-level upload/index metadata is preserved and missing legacy coverage fails closed.
- [x] Require explicit upload coverage mode; specified mode requires at least one valid distinct level, general mode writes `[]`.
- [x] Convert old local singleton `level` to `[level]`, keep old local `null` as unresolved, and propagate lists immutably into chunk snapshots.
- [x] Persist `level_list`; dual-write legacy `level` only for singleton coverage.

### Task 4: Enforce retrieval eligibility and rank

**Files:**

- Modify: `src/rag/retrieval.ts`
- Test: `src/rag/retrieval.test.ts`
- Modify: `src/server/services/rag-retrieval-service.ts`
- Test: `src/server/services/rag-retrieval-service.test.ts`
- Modify: `src/server/repositories/rag-resource-knowledge-runtime-repository.ts`
- Modify: `src/server/repositories/knowledge-recommendation-runtime-repository.ts`
- Modify: `src/server/repositories/rag-knowledge/rag-knowledge-repository.ts`
- Modify: `src/server/repositories/rag-knowledge/in-memory-rag-knowledge-repository.ts`
- Test: `tests/unit/rag-knowledge/rag-layering-retrieval-governance.test.ts`

- [x] Add RED tests proving exact singleton ranks before multi-level coverage, multi-level before explicit general, mismatched and unresolved coverage are excluded, and public-id authorization still filters first.
- [x] Replace scalar candidate-level checks with `levelList` eligibility/rank.
- [x] Update both durable retrieval queries to exclude `null` and accept only requested-level containment or explicit empty arrays.

### Task 5: Make operator selection and display explicit

**Files:**

- Modify: `src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx`
- Test: `tests/unit/admin-resource-knowledge-ui-layout.test.ts`

- [x] Add RED assertions for explicit profession-general mode, multi-select levels, multi-level display, and unresolved warning text.
- [x] Replace the single level select with explicit coverage mode plus level checkboxes; submit repeated `levelList` values.
- [x] Display `null` as “等级待确认”, `[]` as “专业通用资料”, and specified lists without collapsing them.

### Task 6: Freeze and verify

- [ ] Run focused tests, affected regressions, lint, typecheck, exact-file format, migration/schema inspection, build, P0 baselines, and `git diff --check`.
- [x] Perform one main-thread adversarial review covering unknown/null bypass, empty-array ambiguity, invalid/duplicate/out-of-range levels, authorization-public-id filtering, general-resource ranking, stale local catalogs, and absence of migration execution/real-data access.
- [ ] Stage only the exact allowlist, compute the candidate tree, and request candidate-bound database approval plus one ordinary canonical push approval.
