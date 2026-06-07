# Task Plan: phase-11-mvp-ai-call-log-coverage-hardening

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for runtime changes and superpowers:verification-before-completion before commit/merge/push. Track steps with checkbox syntax.

**Goal:** Close the local `ai_call_log` coverage part of MVP-GAP-013 by proving AI call logs and summaries are redacted, publicId-safe, filterable, and reviewable in local runtime without recording raw prompts, raw answers, raw model responses, provider payloads, tokens, or secrets.

**Architecture:** Preserve ADR-002 route-handler -> service -> repository/model layering. API responses must stay `{ code, message, data, pagination? }`; JSON fields must stay camelCase. AI evidence must only use summaries and public identifiers.

**Boundary:** Allowed files cover AI call log API routes, admin UI, contracts, services, tests/e2e, and task docs/state. Repository, schema, migration, script, dependency, env, staging/prod, cloud, destructive data, raw provider, real provider, and lockfile work are not approved. Exact repository-level filtered pagination remains approval-blocked because repository files were outside allowedFiles.

## Task Claim

- Task id: `phase-11-mvp-ai-call-log-coverage-hardening`
- Branch: `codex/phase-11-mvp-ai-call-log-coverage-hardening`
- Source gap: `MVP-GAP-013`
- Human approval: user approved routine commit/merge/push/cleanup for the MVP gap queue. Hard-stop gates still require explicit task-specific approval.
- Claim readiness: passed while queue status was `pending`.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/04-agent-system/sop/mvp-queue-runner.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-mvp-functional-completeness-gap-audit.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-mvp-audit-log-coverage-hardening.md`

## AC-to-Runtime Matrix

| Acceptance criterion                                                        | Runtime surface                         | Current state   | Implementation evidence                                                                       | Downstream effect                                   | Remaining gap          | Decision     |
| --------------------------------------------------------------------------- | --------------------------------------- | --------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------- | ------------ |
| AI call logs expose publicId-safe redacted operational history              | `/api/v1/ai-call-logs`, service DTO     | runtime_closed  | RED/GREEN unit proves publicId-safe rows and no token/provider/raw response fields            | Operators can review AI activity without raw data   | none                   | implemented  |
| AI call log filters cover function/status/provider summary without raw data | contract/service/list query             | runtime_closed  | Query factory normalizes `aiFuncType`, `callStatus`, `profession`, `level`, and `keyword`     | AI/RAG failures and fallback behavior can be traced | none                   | implemented  |
| AI call summary aggregates are reviewable without leaking prompt/output     | `/api/v1/ai-call-logs/summary`, service | runtime_closed  | Summary route filters returned summaries by function/status/keyword and keeps aggregate shape | Release review can inspect cost/success patterns    | none                   | implemented  |
| Evidence excludes raw prompt/answer/model response/provider payload         | tests/evidence/admin DTO                | runtime_closed  | Unit assertions reject provider payload, raw model response, token, request body, and raw id  | Safe local validation                               | none                   | implemented  |
| Repository-level AI log filtering across all pages                          | Postgres repository                     | partial_runtime | Service-level returned-page filtering implemented; repository edits were outside allowedFiles | Local UI/API can filter returned runtime rows       | blocked_by_approval P2 | not_in_scope |

## TDD Plan

1. [x] Inspect existing ai_call_log routes, services, contracts, admin UI, and tests.
2. [x] RED: add focused failing tests for filter coverage, summary coverage, and redaction.
3. [x] GREEN: implement the smallest local runtime hardening within allowed files.
4. [x] Record repository/provider/schema residuals as approval-blocked if encountered.
5. [x] Run validation, update evidence, commit, merge, push, cleanup, then claim the next task only from a clean repo.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-ai-call-log-coverage-hardening`
- `npm.cmd run test:unit -- tests/unit/phase-11-ai-call-log-coverage-hardening.test.ts`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- Do not read or output `.env.local`.
- Do not call real providers, staging/prod, cloud resources, vector services, OCR, or object storage.
- Do not record tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR/resource text, raw chunk text, embeddings, or private data.
- Do not change package files, lockfiles, schema, migrations, scripts, env files, or cloud/deploy configuration.
