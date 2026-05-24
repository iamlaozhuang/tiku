# Task Plan: phase-11-mvp-ai-knowledge-recommendation-review-loop

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for runtime changes and superpowers:verification-before-completion before commit/merge/push. Track steps with checkbox syntax.

**Goal:** Close MVP-GAP-012 as far as the approved local boundary allows: content ops can trigger mock-provider-first `kn_recommendation`, review recommendations, discard stale results, and record redacted audit/ai_call_log evidence without real provider, dependency, schema, migration, script, staging/prod, cloud, secret/env, package, or lockfile changes.

**Architecture:** Preserve ADR-002 route-handler -> service -> repository/model layering. Routes remain thin. API responses use `{ code, message, data, pagination? }`, JSON fields use camelCase, and all external identifiers use public ids.

**Boundary:** Current queue allowed files cover `src/app/api/v1/questions/**`, `src/app/api/v1/knowledge-nodes/**`, `src/features/admin/**`, `src/server/contracts/**`, `src/server/services/**`, tests/e2e, and task docs/state only. Repository, schema, migration, script, dependency, env, staging/prod, real provider, object storage, or destructive data work is not approved. If exact question-to-knowledge_node persistence requires repository/schema work, record it as `deferred_with_approval` and stop before touching blocked files.

## Task Claim

- Task id: `phase-11-mvp-ai-knowledge-recommendation-review-loop`
- Branch: `codex/phase-11-mvp-ai-knowledge-recommendation-review-loop`
- Source gap: `MVP-GAP-012`
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
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-mvp-knowledge-node-tree-management-loop.md`

## AC-to-Runtime Matrix

| Acceptance criterion                                                           | Runtime surface                                               | Current state   | Implementation evidence              | Downstream effect                             | Remaining gap | Decision              |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------- | --------------- | ------------------------------------ | --------------------------------------------- | ------------- | --------------------- |
| Content ops can trigger `kn_recommendation` for a question                     | `POST /api/v1/questions/{publicId}/recommend-knowledge-nodes` | partial_runtime | Pending runtime inspection/RED tests | Content ops can request local recommendations | P1 pending    | inspect and implement |
| Content ops can review recommendation confidence and stale/discard state       | Admin question/knowledge UI, service DTO                      | partial_runtime | Pending UI/contract tests            | Human review controls weak/stale suggestions  | P1 pending    | inspect and implement |
| Correction loop updates intended question-to-knowledge_node selection boundary | Question API/service contract or approved deferred record     | not_present     | Pending boundary inspection          | Accepted suggestions become content metadata  | P1 pending    | inspect or defer      |
| Audit and ai_call_log evidence is redacted                                     | audit_log and ai_call_log safe snapshots                      | partial_runtime | Pending audit/log tests              | Review evidence avoids raw prompt/model data  | P1 pending    | inspect and implement |
| No real provider, raw prompt, raw answer, raw model response, or secrets       | Mock provider/local deterministic runner only                 | partial_runtime | Pending fixture/mock boundary tests  | Safe local validation                         | P1 pending    | inspect and implement |

## TDD Plan

1. [x] Inspect existing recommendation route/service/UI/tests and confirm whether allowed files are sufficient.
2. [x] RED: add focused failing tests for trigger/review/stale-discard/correction boundary and redacted logs.
3. [x] GREEN: implement the smallest local mock-provider-first runtime behavior within allowed files.
4. [x] Record any exact binding persistence gap as `deferred_with_approval` if repository/schema changes are required.
5. [x] Run validation, update evidence, commit, merge, push, cleanup, then claim the next task only from a clean repo.

## Implementation Notes

- Added `reviewState` to `QuestionKnowledgeRecommendationDto` so the API returns the question `updatedAt` revision used for stale detection, plus an explicit `question_updated_at_mismatch` policy and `local_review_only` binding mode.
- Added admin UI controls to trigger `kn_recommendation`, review confidence, mark recommendations as accepted/discarded, and flag stale panels when a question is edited after recommendation generation.
- Local accepted recommendations update the current UI question DTO only. Durable question-to-knowledge_node binding remains `deferred_with_approval` because the current approved task boundary excludes repository/schema work and the existing mapper returns `knowledgeNodePublicIds: []`.
- Added RED/GREEN tests for API review metadata/redacted logs and UI trigger/review/stale/discard states.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-ai-knowledge-recommendation-review-loop`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- Do not read or output `.env.local`.
- Do not call real model providers, vector services, OCR, object storage, staging, or prod.
- Do not record tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR/resource text, raw chunks, embeddings, or private data.
- Do not change package files, lockfiles, schema, migrations, scripts, env files, or cloud/deploy configuration.
