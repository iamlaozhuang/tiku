# Task Plan: phase-11-mvp-resource-knowledge-base-publish-index-loop

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for runtime changes and superpowers:verification-before-completion before commit/merge/push. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close MVP-GAP-010 with local, fixture-safe resource and knowledge_base publish/index evidence for resource lifecycle state transitions, Markdown publish proof, chunk/vector indexing readiness, citation source behavior, permission-filtered retrieval, audit logging, and rebuild failure handling.

**Architecture:** Preserve ADR-002 route-handler -> service -> repository/model layering. Keep route handlers thin, return standard `{ code, message, data, pagination? }` envelopes, and do not record raw resource full text, raw OCR, raw provider payloads, embeddings, prompts, answers, model responses, object storage secrets, or private data in evidence.

**Tech Stack:** Next.js App Router route handlers, TypeScript services, existing RAG/resource runtime surfaces, Vitest, existing Playwright e2e only if required by validation.

---

## Task Claim

- Task id: `phase-11-mvp-resource-knowledge-base-publish-index-loop`
- Branch: `codex/phase-11-mvp-resource-knowledge-base-publish-index-loop`
- Phase: `phase-11-staging-release-planning`
- Human approval: user approved continuing the 16 MVP gap tasks with commit, merge, push, and safe branch cleanup. This task remains local-only; dependency, schema, migration, script, cloud, deployment, staging/prod, secret/env, package, lockfile, real-content commit, real-provider, or object-storage work is not approved.

## Boundary

This task may modify resource, knowledge_base, RAG, citation, admin feature code under allowed roots, service contracts, service models, repositories, services, tests, e2e, task plan/evidence, and queue state only.

This task must not:

- change dependencies, `package.json`, or lockfiles;
- read or output `.env.local`;
- change secrets or env files;
- change schema, migration, or scripts;
- create cloud resources;
- deploy;
- connect to `staging` or `prod`;
- connect to real object storage or real model/vector providers;
- perform destructive data operations;
- record secrets, tokens, Authorization headers, raw payloads, raw prompts/answers/model responses, full paper/material/OCR/resource text, raw chunks, embeddings, object storage secrets, generated private data, or customer-like private data.

If completing the loop requires schema, migration, script, dependency, secret/env, staging/prod, real provider, object storage, major permission-model, or destructive data work, stop and record an approval-gated follow-up.

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

| Acceptance criterion                                                   | Runtime surface                                  | Current state   | Implementation evidence                | Downstream effect                                  | Remaining gap | Decision              |
| ---------------------------------------------------------------------- | ------------------------------------------------ | --------------- | -------------------------------------- | -------------------------------------------------- | ------------- | --------------------- |
| Content ops can publish a resource/knowledge_base Markdown draft       | `/api/v1/resources`, admin resource service      | partial_runtime | Pending RED/GREEN tests                | Resource becomes eligible for indexing             | P1 pending    | inspect and implement |
| Indexing creates chunk/vector lifecycle without real provider calls    | resource rebuild-vector route, RAG service       | partial_runtime | Pending local fixture-safe index tests | RAG can retrieve bounded fixture chunks            | P1 pending    | inspect and implement |
| Citation source metadata is redacted and externally safe               | citation/resource contracts                      | partial_runtime | Pending citation DTO tests             | Student AI references remain source-aware          | P1 pending    | inspect and implement |
| Retrieval is permission-filtered and excludes disabled/unready content | RAG retrieval service                            | partial_runtime | Pending retrieval filter tests         | Students only receive authorized ready evidence    | P1 pending    | inspect and implement |
| Audit and rebuild failure handling are visible without raw text        | audit_log, resource status/error summary runtime | partial_runtime | Pending audit/failure tests            | Ops can review rebuild attempts without data leaks | P1 pending    | inspect and implement |

## TDD Plan

1. [x] Inspect current resource, knowledge_base, RAG retrieval, citation, rebuild-vector, and audit runtime code.
2. [x] RED: add focused failing tests for publish/index lifecycle, ready/failed status transitions, citation metadata, permission filtering, and audit redaction.
3. [x] GREEN: wire the smallest local service/runtime behavior needed to satisfy RED tests without schema/dependency/script changes.
4. [x] Extend tests for fixture/mock boundaries, no raw text/embedding leakage, and read-only/entry-only false positives.
5. [x] Run validation commands, update evidence, closeout checklist, commit, merge, push, cleanup, then claim the next queued task only from a clean repo.

## Allowed Files

- `src/app/api/v1/resources/**`
- `src/features/admin/**`
- `src/server/contracts/**`
- `src/server/models/**`
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

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-resource-knowledge-base-publish-index-loop`
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
- Do not record raw resource text, raw chunks, embeddings, prompts, answers, model responses, Authorization headers, raw request payloads, or private data.
- Keep audit evidence redacted: operation names, public ids, counts, status transitions, and short metadata summaries only.

## Boundary Correction

- Runtime inspection showed the existing default resource/RAG route handlers delegate resource state changes to `src/server/repositories/rag-resource-knowledge-runtime-repository.ts` and resource status transitions to `src/server/models/ai-rag.ts`.
- This task therefore adds `src/server/repositories/**` and `src/server/models/**` to allowed files for local-only resource publish/index runtime wiring.
- This is not a schema, migration, dependency, script, secret/env, staging/prod, deployment, object-storage, or real-provider change.
