# Phase 2 Auth Dependency Repair Plan

**Task id:** `phase-2-auth-dependency-repair`

**Goal:** Reconcile the Phase 2 auth dependency state before implementing session login. The queue marks auth dependency installation as done, but `package.json` does not contain the runtime dependencies selected by ADR-001.

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-auth-adapter-boundary.md`

## Dependency Gate Record

### `better-auth`

- Package name: `better-auth`
- Version range: package-manager resolved current compatible version
- Change type: add
- Purpose: Provide the approved authentication runtime for Phase 2 session/login work.
- Import boundary: Only project-owned auth adapter modules under `src/server/auth/**` may import it.
- License compatibility: ADR-001 records Better Auth as MIT.
- Alternative considered: Continue with local-only placeholder auth interfaces.
- Reason rejected: Placeholder-only implementation would make session login a fake integration and defer core runtime risk.
- Abandonment risk: Medium; ADR-001 already records Better Auth v1.x breaking-change risk.
- Security or maintenance risk: Medium because auth dependencies are high-sensitivity runtime code.
- Compatibility impact: Server-side TypeScript dependency; no browser bundle import intended.
- Bundle/runtime impact: Runtime auth code must remain server-only behind the adapter boundary.
- Validation command: `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run test:unit`, `npm.cmd run format:check`.
- Human approval evidence: human approval provided in chat on 2026-05-17: "如果有的话，批准执行".

### `@better-auth/drizzle-adapter`

- Package name: `@better-auth/drizzle-adapter`
- Version range: package-manager resolved current compatible version
- Change type: add
- Purpose: Provide the approved Drizzle adapter for Better Auth database-backed session integration.
- Import boundary: Only project-owned auth adapter modules under `src/server/auth/**` may import it.
- License compatibility: ADR-001 records the Better Auth ecosystem as MIT.
- Alternative considered: Hand-written adapter against the `auth_` tables.
- Reason rejected: It would duplicate the selected auth provider's adapter contract and increase drift risk.
- Abandonment risk: Medium; adapter compatibility follows Better Auth release behavior.
- Security or maintenance risk: Medium because adapter changes can affect session persistence.
- Compatibility impact: Server-side TypeScript dependency; no browser bundle import intended.
- Bundle/runtime impact: Runtime auth adapter code must stay server-only.
- Validation command: `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run test:unit`, `npm.cmd run format:check`.
- Human approval evidence: human approval provided in chat on 2026-05-17: "如果有的话，批准执行".

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-17-phase-2-auth-dependency-repair.md`
- `docs/05-execution-logs/evidence/2026-05-17-phase-2-auth-dependency-repair.md`
- `package.json`
- `pnpm-lock.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files

- `package-lock.json`
- `src/**`
- `drizzle/**`
- `.env.example`

## Execution Steps

1. Record this plan and human approval evidence before package changes.
2. Add `better-auth` and `@better-auth/drizzle-adapter` with pnpm.
3. Run validation commands.
4. Write evidence.
5. Record `phase-2-auth-dependency-repair` as done and keep next action at `claim_phase_2_session_login_baseline`.
