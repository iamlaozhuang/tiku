# Resource Knowledge Admin UI Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Phase 9 admin UI for RAG resources and knowledge_node management against the protected runtime without leaking internal identifiers or sensitive fields.

**Architecture:** Keep UI work inside the allowed admin route and feature folders. Client components use the existing local admin session token boundary, call protected `/api/v1/resources` and `/api/v1/knowledge-nodes` routes, render explicit loading/empty/error/unauthorized states, and never expose database `id`, object storage paths, chunk text, session token, password, secret, or API key values.

**Tech Stack:** Next.js App Router, React client components, TypeScript, existing shadcn/Tailwind UI primitives, Vitest + Testing Library, Playwright e2e.

---

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-9-mvp-acceptance-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-rag-resource-knowledge-runtime.md`

## Scope And Risk Strategy

- Allowed files are limited to this task plan, task evidence, `src/app/(admin)/content/**`, `src/app/(admin)/ops/**`, `src/features/admin/**`, `tests/unit/**`, `e2e/**`, and agent state files.
- Blocked files remain `package.json`, lockfiles, `.env.example`, and `drizzle/**`.
- No dependency changes, no real AI provider, no production resource access, no auth/session bypass, and no self-increment `id` in URLs or visible DTOs.
- If requirements ask for upload, download, Markdown editing, resource enable/disable, or persistence not exposed by the current allowed runtime, the UI will render disabled boundary controls and document the deferral rather than modifying blocked server/runtime files.

## Implementation Tasks

### Task 1: Resource Admin UI Tests

**Files:**

- Modify: `tests/unit/admin-content-knowledge-ops-baseline.test.ts`

- [ ] Add a failing unit test that renders the new resource admin UI with a stored admin session token, mocks `/api/v1/sessions`, `/api/v1/resources`, and `POST /api/v1/resources/{publicId}/rebuild-vector`, then asserts:
  - loading state appears first.
  - resource row uses `data-public-id` and has no `data-id`.
  - title, profession, level, type, status, upload time, stale vector marker, Markdown preview availability, and `publicId` render.
  - internal fields such as `id`, `objectStoragePath`, `embedding`, raw chunk text, and the session token are absent from visible text.
  - rebuild action opens a confirmation dialog and posts to the publicId URL.
  - successful rebuild toast shows chunk count/evidence summary without raw chunk text.

- [ ] Add failing unit coverage for empty, unauthorized, runtime error, filtered-empty, and invalid publicId boundaries.

- [ ] Run focused RED command:

```powershell
npm.cmd run test:unit -- tests/unit/admin-content-knowledge-ops-baseline.test.ts
```

Expected: fail because the resource admin UI component and/or assertions are not implemented yet.

### Task 2: Resource Admin Runtime Component

**Files:**

- Create: `src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx`
- Create: `src/app/(admin)/ops/resources/page.tsx`

- [ ] Implement `AdminResourceKnowledgeManagement` as a client component using existing helpers from `src/features/admin/content-admin-runtime.tsx`.
- [ ] Fetch `/api/v1/sessions` first and require an admin context before calling `/api/v1/resources?page=1&pageSize=20&sortBy=updatedAt&sortOrder=desc`.
- [ ] Render explicit loading, unauthorized, error, empty, and filtered-empty states.
- [ ] Render resource rows keyed and addressed by `publicId`, with no internal `id` attributes.
- [ ] Add keyword/profession/status/type filters using immutable derived data.
- [ ] Add resource rebuild confirmation that refuses malformed publicId values and posts only to `/api/v1/resources/{publicId}/rebuild-vector`.
- [ ] Display success/error toast feedback; success can show chunk count and safe evidence summary returned by the runtime.
- [ ] Render disabled boundary controls for upload, original file download, Markdown proofreading/publish, and enable/disable when the current runtime lacks allowed endpoints; label these as unavailable without claiming completion.

- [ ] Run focused GREEN command:

```powershell
npm.cmd run test:unit -- tests/unit/admin-content-knowledge-ops-baseline.test.ts
```

Expected: pass for the focused file.

### Task 3: Knowledge Node Interaction Completion

**Files:**

- Modify: `src/features/admin/knowledge-node-management/AdminKnowledgeNodeManagement.tsx`
- Modify: `tests/unit/admin-content-knowledge-ops-baseline.test.ts`

- [ ] Add RED tests for create/edit/disable confirmation flows through publicId-safe `/api/v1/knowledge-nodes` endpoints.
- [ ] Implement minimal create/edit/disable interaction states that call the existing runtime endpoints and update visible rows from returned `knowledgeNode`.
- [ ] Keep move/sort as disabled boundary controls if no allowed runtime endpoint exists in this task.
- [ ] Preserve existing loading, empty, unauthorized, error, filter, and no-internal-field behavior.

- [ ] Run focused command:

```powershell
npm.cmd run test:unit -- tests/unit/admin-content-knowledge-ops-baseline.test.ts
```

Expected: pass.

### Task 4: E2E Coverage

**Files:**

- Modify: `e2e/local-business-flow.spec.ts`

- [ ] Extend admin flow to visit `/ops/resources`.
- [ ] Assert heading, row or empty state, `data-public-id` without `data-id`, no admin token leakage, no `objectStoragePath`, no `embedding`, and a rebuild confirmation path when a resource row is present.
- [ ] Keep existing admin content route coverage intact.

### Task 5: Evidence And State Closeout

**Files:**

- Create: `docs/05-execution-logs/evidence/2026-05-23-phase-9-resource-knowledge-admin-ui-completion.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [ ] Record all required validation commands and outcomes in evidence.
- [ ] Update task status to closed only after validation passes.
- [ ] Update project state to the current task, branch, and commit after commit creation.

## Required Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-resource-knowledge-admin-ui-completion
npm.cmd run test:unit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
npm.cmd run test:e2e
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

## Plan Self-Review

- Spec coverage: covers resource list, loading/empty/error, publicId boundary, vector rebuild confirmation, knowledge_node management interaction, and sensitive-field redaction. Upload/download/Markdown publish/enable-disable resource runtime is documented as deferred because current task allowedFiles exclude API/service changes.
- Placeholder scan: no TBD/TODO placeholders; deferred items are explicit scope-boundary decisions.
- Type consistency: uses existing `AdminResourceOpsSummaryDto`, `AdminKnowledgeNodeOpsSummaryDto`, `ResourceVectorRebuildResultDto`, `Profession`, `ResourceType`, `ResourceStatus`, and `KnStatus` naming.
