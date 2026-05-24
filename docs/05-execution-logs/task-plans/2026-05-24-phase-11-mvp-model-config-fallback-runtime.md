# Task Plan: phase-11-mvp-model-config-fallback-runtime

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for runtime changes and superpowers:verification-before-completion before commit/merge/push. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close MVP-GAP-005 with local mock-provider-first `model_config` / `prompt_template` primary/fallback runtime evidence, safe admin visibility, service consumption, and redacted `ai_call_log` snapshots without reading secrets or calling a real provider.

**Architecture:** Preserve ADR-002 route-handler -> service -> repository/model layering. Keep route handlers thin and use standard `{ code, message, data }` responses. Use redaction-safe `model_config` snapshots in AI services; do not expose API keys, raw prompts, raw answers, raw model responses, Authorization headers, or raw provider payloads.

**Tech Stack:** Next.js App Router route handlers, TypeScript service layer, existing admin AI/audit log services, local deterministic/mock-provider runtimes, Vitest, and Playwright where relevant.

---

## Task Claim

- Task id: `phase-11-mvp-model-config-fallback-runtime`
- Branch: `codex/phase-11-mvp-model-config-fallback-runtime`
- Phase: `phase-11-staging-release-planning`
- Human approval: user approved continuing the 16 MVP gap tasks with commit, merge, push, and safe branch cleanup. This task remains local mock-provider-first; real provider, secret/env, dependency, schema, migration, script, cloud, deployment, staging/prod work is not approved.

## Boundary

This task may modify model config/admin AI audit log API, service, contract, tests, task plan/evidence, and queue state only.

This task must not:

- change dependencies, `package.json`, or lockfiles;
- read or output `.env.local`;
- change secrets or env files;
- change schema, migration, or scripts;
- create cloud resources or object storage buckets;
- deploy;
- connect to `staging` or `prod`;
- call external or real model providers;
- record secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, generated plaintext `redeem_code` values, or private data.

If completing this loop requires schema, migration, script, dependency, real provider, storage, encrypted secret persistence, or major permission-model work, stop and record an approval-gated follow-up.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/04-agent-system/sop/mvp-queue-runner.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-mvp-functional-completeness-gap-audit.md`

## AC-to-Runtime Matrix

| Acceptance criterion                                                             | Runtime surface                                         | Current state | Implementation evidence                                                                                        | Downstream effect                                            | Remaining gap                                                                        | Decision                           |
| -------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ---------------------------------- |
| MVP-GAP-005: configurable AI model usage with primary/fallback is proven locally | `/api/v1/model-configs`, AI service selection logic     | implemented   | `createModelConfigRuntimeResolver` tests cover primary, fallback, disabled, mismatched fallback                | AI services consume safe local config rather than hardcoding | none                                                                                 | implemented                        |
| Prompt template versioning is visible and snapshotted                            | service snapshot, `ai_call_log`, admin API/service      | implemented   | Resolver and mistake_book runtime tests assert prompt key/version/hash snapshots                               | Call evidence remains repeatable after config changes        | none                                                                                 | implemented                        |
| Key masking and secret hygiene are preserved                                     | admin model config API/service                          | implemented   | Admin baseline tests assert `apiKeyDisplay` only and absence of raw key/provider secret fields                 | Super-admin can inspect config without secret leakage        | none                                                                                 | implemented                        |
| Primary/fallback consumption is reflected in business AI runtimes                | mock_exam, mistake_book, report, content recommendation | implemented   | student_flow consumes resolver for scoring/report; mistake_book test proves fallback snapshot in `ai_call_log` | Student AI outputs use reviewable config metadata            | content recommendation remains on existing local static config until its queued task | implemented with bounded follow-up |
| ai_call_log redaction and metadata evidence                                      | `/api/v1/ai-call-logs`, service append/list/summary     | implemented   | mistake_book fallback test captures redacted log input; admin tests keep logs summary-only                     | Ops can audit AI config behavior safely                      | deeper coverage queued in ai_call_log hardening task                                 | implemented with bounded follow-up |

## TDD Plan

1. [x] Inspect current `model_config`, `model_provider`, `prompt_template`, admin AI log, and AI runtime selection code.
2. [x] RED: add focused failing tests for primary/fallback selection and prompt snapshot behavior.
3. [x] GREEN: wire the smallest local mock-provider-first resolver/service path needed to satisfy RED tests.
4. [x] Extend tests for key masking, disabled primary, disabled fallback, no raw payload/log leakage, and admin API/service visibility where existing surfaces support it.
5. [x] Run validation commands, update evidence, closeout checklist, commit, merge, push, cleanup, then claim the next queued task only from a clean repo.

## Allowed Files

- `src/app/api/v1/model-configs/**`
- `src/features/admin/**`
- `src/server/contracts/**`
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

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-model-config-fallback-runtime`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- Mock-provider-first only; do not call real providers.
- Do not read or output `.env.local` or any secret value.
- Do not add encrypted key persistence without explicit approval, because schema/secret design is out of scope.
- Treat real provider credential mutation as approval-gated follow-up.
- Keep admin API/service redaction strict: no raw API key, provider secret, raw prompt, raw answer, raw model response, raw provider payload, or Authorization header.
- Preserve existing list/read-only behaviors unless tests prove a local mutation is already within approved surfaces.
