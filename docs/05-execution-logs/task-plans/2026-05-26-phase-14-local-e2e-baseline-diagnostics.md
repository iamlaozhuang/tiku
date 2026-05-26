# Phase 14 Local E2E Baseline Diagnostics Task Plan

**Task id:** `phase-14-local-e2e-baseline-diagnostics`

**Branch/worktree:** `codex/phase-14-local-e2e-baseline-diagnostics` / `.worktrees/phase-14-local-e2e-baseline-diagnostics`

**Date:** 2026-05-26

## Goal

Read-only diagnose the local full e2e baseline blockers that remain outside the enterprise authorization implementation path:

- Student profile authorization API loading failure.
- `mistake_book` AI explanation response not OK.
- Role-based content readiness empty JSON response.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/02-architecture/interfaces/phase-11-role-based-full-flow-acceptance-contract.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest local e2e evidence from the blocked org auth task.

## Scope

Allowed:

- Read source, tests, docs, local generated test-results, local terminal output, and localhost/127.0.0.1 responses.
- Run targeted local e2e specs and read their redaction-safe outputs.
- Write only this task plan, evidence, and state/queue records.

Forbidden:

- Do not read, modify, output, or summarize `.env.local` or `.env.example`.
- Do not modify `src/**`, `e2e/**`, `tests/**`, `scripts/**`, `src/db/schema/**`, `drizzle/**`, package manifests, or lockfiles.
- Do not run seed reset, destructive data operations, migrations, deploys, PR creation, push, staging/prod/cloud, or real provider calls.
- Do not record secrets, tokens, Authorization headers, database URLs, raw provider payloads, raw prompts, raw answers, raw model responses, full papers, full textbooks, OCR full text, or customer-like private data.

## Debugging Plan

1. Reproduce each failing targeted spec one at a time in the isolated worktree.
2. Read e2e source around failing lines to identify the API/UI boundary under test.
3. Inspect local route/service/repository code read-only to trace each failing response path.
4. Use local browser/API probes only against `127.0.0.1` when needed, recording only status codes and redaction-safe response shape.
5. Classify each blocker as data readiness, API bug, test timing/race, local DB connection pressure, or unknown.
6. Record exact evidence and recommended next task scope without changing implementation.

## Validation Commands

- `npm.cmd run test:e2e -- e2e/local-business-flow.spec.ts`
- `npm.cmd run test:e2e -- e2e/student-practice-mock-entry.spec.ts`
- `npm.cmd run test:e2e -- e2e/role-based-acceptance/role-based-full-flow.spec.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
