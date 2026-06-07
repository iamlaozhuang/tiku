# Dependency And Format Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:verification-before-completion before handoff. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce the minimum database dependency baseline needed by upcoming schema/repository work and clean the repository Prettier baseline.

**Architecture:** Keep third-party packages behind project-owned `src/db/schema`, `src/server/repositories`, and future database adapter boundaries. Do not introduce auth, AI, RAG, markdown, or cloud SDK dependencies until their active queue tasks need them.

**Tech Stack:** Next.js, TypeScript, Drizzle ORM, PostgreSQL driver, drizzle-kit, Prettier.

---

## Why Now

The previous `phase-1-server-boundary-skeleton` task had to keep `src/db/schema` as a placeholder because dependency files were blocked. The next backend tasks need the selected ADR-001 database stack to exist before real schema and repository code can be validated.

Repository-level `npm.cmd run format:check` also reports broad existing formatting drift after the formatting gate was introduced. A one-time format baseline is appropriate before more code lands, so future checks identify real regressions instead of historical noise.

## Dependency Gate Record

### `drizzle-orm`

- Package name: `drizzle-orm`
- Version range: latest compatible range selected by pnpm
- Change type: add
- Purpose: type-safe ORM runtime selected by ADR-001 for database schema and query code.
- Import boundary: `src/db/schema/**`, future database client modules, and `src/server/repositories/**`.
- License compatibility: Apache-2.0, compatible with project use.
- Alternative considered: Prisma.
- Reason rejected: ADR-001 rejected Prisma due to larger bundle/runtime footprint and weaker fit with selected Better Auth/Vercel patterns.
- Abandonment risk: low; active TypeScript ORM ecosystem package.
- Security or maintenance risk: moderate supply-chain risk typical for runtime database libraries; mitigated by lockfile and project-owned repository boundary.
- Compatibility impact: supports Node/Next.js server runtime; no browser import is allowed.
- Bundle or runtime impact: server-only runtime dependency; must not be imported into client components.
- Validation command: `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run test`.
- Human approval evidence: human approval from user message on 2026-05-17: “如果合适的话，可以先处理这两个问题，并更新相关文档？”

### `postgres`

- Package name: `postgres`
- Version range: latest compatible range selected by pnpm
- Change type: add
- Purpose: PostgreSQL driver selected by ADR-001 for Drizzle runtime connectivity.
- Import boundary: future database client adapter only, not UI or route handler code directly.
- License compatibility: Unlicense/MIT-style permissive package metadata to be locked by package manager.
- Alternative considered: `pg`.
- Reason rejected: ADR-001 examples and Drizzle serverless guidance use `postgres`; it keeps a compact direct driver path for the current monolith.
- Abandonment risk: low; widely used PostgreSQL driver.
- Security or maintenance risk: database connection string handling must stay server-only and environment-based.
- Compatibility impact: Node server runtime only; no browser import.
- Bundle or runtime impact: server-only database driver.
- Validation command: `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run test`.
- Human approval evidence: human approval from user message on 2026-05-17: “如果合适的话，可以先处理这两个问题，并更新相关文档？”

### `drizzle-kit`

- Package name: `drizzle-kit`
- Version range: latest compatible range selected by pnpm
- Change type: add dev dependency
- Purpose: migration generation and schema workflow selected by ADR-001.
- Import boundary: CLI/dev tooling only; no runtime imports in application code.
- License compatibility: MIT, compatible with project use.
- Alternative considered: manual SQL migration authoring only.
- Reason rejected: project standard requires `drizzle-kit generate` and `migrate` workflow instead of ad hoc schema changes.
- Abandonment risk: low while Drizzle remains selected stack.
- Security or maintenance risk: dev-tool supply-chain risk; mitigated by lockfile and no runtime import.
- Compatibility impact: local Windows/Codex desktop CLI usage must be validated through npm scripts or direct command help when needed.
- Bundle or runtime impact: dev dependency only.
- Validation command: `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run test`.
- Human approval evidence: human approval from user message on 2026-05-17: “如果合适的话，可以先处理这两个问题，并更新相关文档？”

## Scope

Expected package changes:

- `package.json`
- `pnpm-lock.yaml`

Expected formatting baseline changes:

- Existing tracked Markdown, YAML, JSON, TS, TSX, CSS, and config files touched by Prettier.

Expected documentation/state changes:

- `docs/05-execution-logs/task-plans/2026-05-17-dependency-format-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-17-dependency-format-baseline.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Steps

- [ ] Add `drizzle-orm` and `postgres` runtime dependencies.
- [ ] Add `drizzle-kit` dev dependency.
- [ ] Run Prettier across the repository to establish a clean format baseline.
- [ ] Run `npm.cmd run format:check`.
- [ ] Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`.
- [ ] Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`.
- [ ] Write evidence with exact command outputs and residual risk.
- [ ] Update project state so the next recommended action remains `claim_phase_1_api_contract_baseline`.
