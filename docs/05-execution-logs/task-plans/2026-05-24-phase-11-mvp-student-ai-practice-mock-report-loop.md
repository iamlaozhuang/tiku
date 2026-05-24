# Task Plan: phase-11-mvp-student-ai-practice-mock-report-loop

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for runtime changes and superpowers:verification-before-completion before commit/merge/push. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the local student AI practice/mock/report loop with mock-provider-first runtime evidence for `ai_scoring`, `ai_explanation`, `ai_hint`, `learning_suggestion`, `citation`, `evidence_status`, retry behavior, and redacted `ai_call_log` coverage without invoking a real provider.

**Architecture:** Preserve ADR-002 route-handler -> service -> repository/model layering and existing student REST boundaries. Reuse current AI/mock-provider, practice, mock_exam, exam_report, mistake_book, citation, and ai_call_log services where they exist. Route handlers remain thin adapters; UI must consume standard `{ code, message, data }` contracts.

**Tech Stack:** Next.js App Router route handlers, React student UI, TypeScript service layer, existing mock AI provider services, Vitest + Testing Library, Playwright E2E where applicable.

---

## Task Claim

- Task id: `phase-11-mvp-student-ai-practice-mock-report-loop`
- Branch: `codex/phase-11-mvp-student-ai-practice-mock-report-loop`
- Phase: `phase-11-staging-release-planning`
- Human approval: user approved continuing the 16 MVP gap tasks with commit, merge, push, and safe branch cleanup. This task remains local mock-provider-first; real provider, secret/env, dependency, schema, migration, script, cloud, deployment, staging/prod work is not approved.

## Boundary

This task may modify student practice/mock_exam/exam_report/mistake_book API, service, contract, student UI, tests, task plan/evidence, and queue state only.

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

If completing this AI loop requires schema, migration, script, dependency, real provider, storage, or major permission-model work, stop and record an approval-gated follow-up.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/04-agent-system/sop/mvp-queue-runner.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-mvp-functional-completeness-gap-audit.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-mvp-content-to-student-runtime-propagation.md`

## AC-to-Runtime Matrix

| Acceptance criterion                                                                                  | Runtime surface                                                    | Current state   | Implementation evidence                                                                            | Downstream effect                                               | Remaining gap | Decision                         |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | --------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------- | -------------------------------- |
| MVP-GAP-004: student AI loop works as a user-visible runtime, not only service tests                  | practice/mock_exam/report/mistake_book UI and REST routes          | partial_runtime | Add RED tests proving current unavailable/partial AI actions are not runtime closed                | Student can see AI outputs and retry states in actual flows     | P0 pending    | implement                        |
| US-03-02 AC-2/3 and US-04 objective explanation: objective practice wrong/correct answer explanations | `/api/v1/practices`, practice UI, mistake_book AI explanation      | partial_runtime | Targeted unit/e2e tests with citation/evidence_status where local mock RAG supports it             | Objective feedback includes safe AI explanation and citations   | P0 pending    | implement                        |
| US-03-03 AC-2/3 and US-04 subjective hint/scoring: one retry then final scoring                       | `/api/v1/practices`, `/api/v1/mock-exams`, student answer services | partial_runtime | RED/GREEN tests for subjective ai_hint, retry limit, final ai_scoring, unanswered no-call behavior | Subjective practice and mock scoring become visible and bounded | P0 pending    | implement within existing model  |
| US-03-07 AC-3: report learning_suggestion and retry                                                   | `/api/v1/exam-reports`, report UI, learning_suggestion service     | partial_runtime | Unit/API/UI tests for generated, failed, and retry states                                          | Reports include AI learning_suggestion without blocking scores  | P0 pending    | implement or defer with evidence |
| ai_call_log and evidence hygiene                                                                      | `/api/v1/ai-call-logs`, services, evidence                         | partial_runtime | Tests and evidence prove redacted log metadata, no raw provider payload/prompt/answer/model output | System ops can audit AI activity without sensitive raw payloads | P1 pending    | implement or defer with evidence |

## TDD Plan

1. [ ] Inspect current AI services/UI surfaces for practice, mock_exam, exam_report, mistake_book, citation, and ai_call_log behavior.
2. [ ] RED: add focused failing tests for the highest-risk missing user-visible AI loop.
3. [ ] GREEN: wire the smallest existing mock-provider-first runtime path needed to satisfy the RED tests.
4. [ ] Extend tests for retry/no-call/redaction/citation/failure states where local runtime supports them without blocked changes.
5. [ ] Run queue validation commands, update evidence, closeout checklist, commit, merge, push, cleanup, then claim the next queued task only from a clean repo.

## Allowed Files

- `src/app/api/v1/practices/**`
- `src/app/api/v1/mock-exams/**`
- `src/app/api/v1/exam-reports/**`
- `src/app/api/v1/mistake-books/**`
- `src/features/student/**`
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

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-student-ai-practice-mock-report-loop`
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- Treat mock-provider service tests as insufficient unless user-visible practice/mock/report/mistake_book behavior is proven or residual gaps are explicitly graded.
- Do not call real model providers or read provider/env secrets.
- Do not record raw prompts, raw answers, raw model responses, provider payloads, Authorization headers, tokens, or full question/material content.
- Preserve existing authorization, archive, termination, loading, empty, unauthorized, and error states.
- Keep RAG/citation evidence bounded to metadata and safe snippets only; do not record full source content.
