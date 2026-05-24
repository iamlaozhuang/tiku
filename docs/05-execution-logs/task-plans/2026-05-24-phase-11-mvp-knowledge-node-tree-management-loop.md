# Task Plan: phase-11-mvp-knowledge-node-tree-management-loop

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for runtime changes and superpowers:verification-before-completion before commit/merge/push. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close MVP-GAP-011 with local, fixture-safe knowledge_node tree management evidence for create, edit, sort, move, disable, question count visibility, audit logging, and recommendation-correction readiness without schema, dependency, script, staging/prod, cloud, secret/env, or real-provider changes.

**Architecture:** Preserve ADR-002 route-handler -> service -> repository/model layering. Route handlers remain thin adapters. API responses use `{ code, message, data, pagination? }`; JSON fields remain camelCase; public routes use `publicId`, not internal auto-increment ids.

**Tech Stack:** Next.js App Router route handlers, TypeScript services, existing knowledge_node runtime surfaces, Vitest, existing admin UI tests, Playwright only if required by validation.

---

## Task Claim

- Task id: `phase-11-mvp-knowledge-node-tree-management-loop`
- Branch: `codex/phase-11-mvp-knowledge-node-tree-management-loop`
- Phase: `phase-11-staging-release-planning`
- Human approval: user approved continuing the 16 MVP gap tasks with commit, merge, push, and safe branch cleanup. This task remains local-only; dependency, schema, migration, script, cloud, deployment, staging/prod, secret/env, package, lockfile, real-provider, or destructive data work is not approved.

## Boundary

This task may modify local knowledge_node API route handlers, admin feature code, service contracts, repositories, services, tests, e2e, task plan/evidence, and queue state only under the queue's allowed roots.

This task must not:

- change dependencies, `package.json`, or lockfiles;
- read or output `.env.local`;
- change secrets or env files;
- change schema, migration, or scripts;
- create cloud resources;
- deploy;
- connect to `staging` or `prod`;
- connect to real providers;
- perform destructive data operations;
- record secrets, tokens, Authorization headers, raw payloads, raw prompts/answers/model responses, full paper/material/OCR/resource text, raw chunk text, embeddings, object storage secrets, generated private data, or customer-like private data.

Boundary correction recorded before implementation: existing knowledge_node tree state transitions and DTO mapping are owned by `src/server/repositories/rag-resource-knowledge-runtime-repository.ts`; this task therefore adds `src/server/repositories/**` to allowed files for local runtime safety and question count visibility inspection. If completing the loop requires model edits, schema, migration, script, dependency, secret/env, staging/prod, real provider, object storage, major permission-model, or destructive data work, stop and record an approval-gated boundary correction or follow-up before implementation.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/04-agent-system/sop/mvp-queue-runner.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-mvp-functional-completeness-gap-audit.md`

## AC-to-Runtime Matrix

| Acceptance criterion                                                 | Runtime surface                                      | Current state   | Implementation evidence                                                                                                              | Downstream effect                                                                            | Remaining gap | Decision               |
| -------------------------------------------------------------------- | ---------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------- | ---------------------- |
| Content ops can create and edit knowledge_node records               | `/api/v1/knowledge-nodes`, admin knowledge_node UI   | runtime_closed  | Unit route/UI tests cover create/edit publicId actions                                                                               | Content ops can maintain public tree nodes                                                   | none          | implemented            |
| Content ops can sort and move knowledge_node nodes safely            | `PATCH /api/v1/knowledge-nodes/{publicId}`, admin UI | runtime_closed  | RED/GREEN UI move test plus route PATCH test                                                                                         | Tree order/path stays reviewable                                                             | none          | implemented            |
| Content ops can disable but not delete nodes                         | `/disable` action, admin UI, route exports           | runtime_closed  | Unit no-delete route export check and disable tests                                                                                  | Historical bindings remain stable                                                            | none          | implemented            |
| Question count and recommendable state are visible without internals | list/detail DTO and admin UI                         | partial_runtime | Unit UI/route tests preserve `questionCount` and `isRecommendable`; true question binding aggregation has no approved schema surface | Content ops can judge visible impact; exact persisted question binding count remains blocked | P1            | deferred_with_approval |
| Audit logs are redacted and complete for tree mutations              | audit_log append calls from knowledge_node mutations | runtime_closed  | Route mutation tests assert redacted `knowledge_node.update` audit metadata                                                          | Ops can review tree changes without raw data                                                 | none          | implemented            |

## TDD Plan

1. [x] Inspect current knowledge_node route/service/UI/tests and determine whether allowed files are sufficient.
2. [x] RED: add focused failing tests for create/edit/sort/move/disable, question count visibility, no-delete behavior, and audit redaction.
3. [x] GREEN: wire the smallest local runtime behavior needed without schema/dependency/script changes.
4. [x] Extend tests for fixture/mock boundaries, publicId-only routing, read-only/entry-only false positives, and Repository Hygiene Closeout Checklist.
5. [ ] Run validation commands, update evidence, closeout checklist, commit, merge, push, cleanup, then claim the next queued task only from a clean repo.

## Allowed Files

- `src/app/api/v1/knowledge-nodes/**`
- `src/features/admin/**`
- `src/server/contracts/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `tests/unit/**`
- `e2e/**`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `drizzle/**`
- `scripts/**`

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-knowledge-node-tree-management-loop`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- Keep work local-only and fixture/mock backed.
- Do not read or output `.env.local` or any secret value.
- Do not add schema/migration/script/dependency changes.
- Do not call real model, vector, OCR, object-storage, staging, or prod providers.
- Do not record raw content, raw chunks, embeddings, prompts, answers, model responses, Authorization headers, raw request payloads, or private data.
- Keep audit evidence redacted: operation names, public ids, counts, status transitions, and short metadata summaries only.
