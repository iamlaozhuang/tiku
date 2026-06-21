# Task Plan: Org Auth Schema Implementation Plan

## Scope

- Task id: `org-auth-schema-implementation-plan`.
- Branch: `codex/org-auth-schema-implementation-plan`.
- User decision: option A, create a docs-only implementation plan before any schema or migration change.
- Allowed files are limited to governance state, the org_auth architecture interface docs, and this task's plan,
  evidence, and audit review.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/2026-06-21-org-auth-scope-contract-security-preflight.md`
- `docs/02-architecture/interfaces/2026-06-21-org-auth-schema-approval-package.md`
- `docs/02-architecture/interfaces/2026-06-21-org-auth-implementation-split.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Plan

1. Register `org-auth-schema-implementation-plan` in `project-state.yaml` and `task-queue.yaml`.
2. Add `docs/02-architecture/interfaces/2026-06-21-org-auth-schema-implementation-plan.md`.
3. Link the new package from the existing schema approval and implementation split documents.
4. Record evidence and audit review for the docs-only boundary.
5. Run scoped formatting and Module Run v2 gates.

## Risk Controls

- No edits to `src/**`, `src/db/schema/**`, `drizzle/**`, `tests/**`, `e2e/**`, `.env*`, package files, or lockfiles.
- No migration generation, database connection, seed, backfill, Provider call, dev server, browser, Playwright/e2e,
  deploy, PR, or force-push.
- Future schema and migration work stays behind separate approval gates.
