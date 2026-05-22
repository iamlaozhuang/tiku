# Phase 9 Requirements Runtime Gap Inventory Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:verification-before-completion before claiming completion. This task is documentation and queue-state work only; do not implement runtime features.

**Goal:** Build a traceable Phase 9 requirements-to-runtime acceptance matrix before any Phase 9 feature implementation.

**Architecture:** The audit maps `docs/01-requirements/stories/epic-01` through `epic-06` to the current Next.js REST route handlers, service boundaries, UI pages, unit tests, and E2E evidence. It preserves ADR-002 by treating REST APIs as the multi-client boundary while explicitly keeping the WeChat mini program client out of this implementation phase.

**Tech Stack:** Next.js App Router, TypeScript service/repository layering, Vitest, Playwright, project PowerShell readiness gates.

---

## Required Reading Completed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/02-architecture/interfaces/phase-8-product-surface-contract.md`
- `docs/02-architecture/interfaces/phase-9-mvp-acceptance-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-planning-and-queue-seeding.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md` through `06-admin-ops.md`
- `docs/01-requirements/stories/epic-01-user-auth.md` through `epic-06-admin-ops.md`

## Scope

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-9-requirements-runtime-gap-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-requirements-runtime-gap-inventory.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-requirements-runtime-gap-inventory.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `src/**`
- `drizzle/**`

## Execution Steps

1. Confirm recovery state on `master`, then create `codex/phase-9-requirements-runtime-gap-inventory`.
2. Run `Test-TaskClaimReadiness.ps1 -TaskId phase-9-requirements-runtime-gap-inventory`.
3. Inventory REST route files, UI pages, service files, tests, Phase 8 browser evidence, and unavailable runtime markers.
4. Create the acceptance matrix with one row per MVP story and explicit AC coverage notes.
5. Review whether the existing Phase 9 queue covers the matrix; record dependency, schema, security, browser, and deferral risks.
6. Keep mini program implementation out of scope and verify only REST boundary compatibility.
7. Run required local gates and record results in evidence.
8. Commit the task-scoped documentation and state changes without merge, push, PR, deployment, or production changes.

## Risk Controls

- This task does not modify runtime code, schema, migrations, environment files, package files, or lockfiles.
- P0 gaps are treated as Phase 9 blockers mapped to queued implementation tasks.
- P1/P2 gaps may be `deferred_candidate` only if closeout later records product approval.
- AI/RAG rows remain mock-provider-first and must not connect to real model providers.
- REST multi-client compatibility is checked as a contract boundary only; no mini program client is implemented.
