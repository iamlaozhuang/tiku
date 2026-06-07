# Phase 9 Content Admin UI Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for behavior changes. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Phase 9 content admin UI surface for questions, materials, papers, and knowledge nodes using existing protected runtime APIs.

**Architecture:** Keep UI work inside `src/app/(admin)/content/**` and `src/features/admin/**`. Client pages read the local session token, validate admin session through `/api/v1/sessions`, then fetch existing content runtime endpoints without exposing numeric `id`, tokens, secrets, or backend rows. Resource and RAG operations remain deferred to later queued tasks.

**Tech Stack:** Next.js App Router, React client components, TypeScript, existing shadcn/Tailwind tokens, Vitest, Playwright.

---

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/02-architecture/interfaces/phase-8-product-surface-contract.md`
- `docs/02-architecture/interfaces/phase-9-mvp-acceptance-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-paper-composition-lifecycle-runtime.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/*.md`
- `docs/01-requirements/stories/*.md`

## Scope And Boundaries

Allowed files are limited to this task's queue entry. Blocked files stay untouched: `package.json`, lockfiles, `.env.example`, and `drizzle/**`.

In scope:

- `/content/questions` and `/content/materials`: authenticated runtime loading, loading/empty/error/unauthorized states, filters, action affordances, public identifiers only.
- `/content/papers`: authenticated runtime loading from `/api/v1/papers`, summary, filters, lifecycle affordances, source file summary when present.
- `/content/knowledge-nodes`: dedicated content knowledge-node tree/list UI from `/api/v1/knowledge-nodes`.
- Unit tests for runtime loading, state handling, filtering, and redaction.
- E2E coverage that logs in as admin and verifies content admin pages render through the local runtime.

Out of scope:

- Resource upload, Markdown editing, vector rebuild, RAG ingestion, model config, or operations后台 expansion.
- Backend route/service/schema changes.
- Dependency, package, lockfile, environment, deployment, or external provider changes.

## Implementation Tasks

### Task 1: RED Unit Tests For Content Runtime UI

**Files:**

- Modify: `tests/unit/admin-question-material-ui.test.ts`
- Modify: `tests/unit/admin-paper-ui.test.ts`
- Modify: `tests/unit/admin-content-knowledge-ops-baseline.test.ts`

- [ ] Add tests that mock `/api/v1/sessions`, `/api/v1/questions`, `/api/v1/materials`, `/api/v1/papers`, and `/api/v1/knowledge-nodes`.
- [ ] Assert loading, unauthorized, empty, error, filtered ready states, and absence of numeric `id` / session token / secret-like fields.
- [ ] Run focused tests and confirm they fail because the current UI is fixture-only or knowledge-node page is too broad.

### Task 2: GREEN Content UI Runtime Components

**Files:**

- Add/modify under `src/features/admin/question-material-management/**`
- Add/modify under `src/features/admin/paper-management/**`
- Add under `src/features/admin/knowledge-node-management/**`
- Modify: `src/app/(admin)/content/knowledge-nodes/page.tsx`

- [ ] Implement client-side protected API loading with session token checks.
- [ ] Keep response parsing limited to standard `{ code, message, data, pagination? }` envelopes.
- [ ] Reuse existing tokens, button/input components, icons, and active feedback.
- [ ] Keep all external handles as `publicId`; never render internal `id` fields.
- [ ] Re-run focused unit tests and confirm pass.

### Task 3: E2E Coverage

**Files:**

- Modify: `e2e/local-business-flow.spec.ts`

- [ ] Extend admin browser flow to verify `/content/questions`, `/content/materials`, `/content/papers`, and `/content/knowledge-nodes`.
- [ ] Assert pages render meaningful headings, public-id based rows, and do not display tokens or internal secret markers.

### Task 4: Evidence, State, And Validation

**Files:**

- Add/modify: `docs/05-execution-logs/evidence/2026-05-23-phase-9-content-admin-ui-completion.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [ ] Record required command output and focused RED/GREEN notes.
- [ ] Mark task queue through implemented/validated/committed states as validation completes.
- [ ] Run required commands:
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-content-admin-ui-completion`
  - `npm.cmd run test:unit`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
  - `npm.cmd run build`
  - `npm.cmd run test:e2e`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- No dependency introduction; dependency gate not triggered.
- No security review artifact required by queue metadata because this task changes frontend runtime only and does not modify authenticated API behavior.
- Existing auth/session/authorization runtime remains the only source of protected admin data.
- Runtime responses are treated as untrusted: UI renders only documented DTO fields and ignores unknown internal fields.
- If Phase 9 matrix and allowedFiles conflict, allowedFiles wins and the residual gap is recorded in evidence instead of expanding scope.
