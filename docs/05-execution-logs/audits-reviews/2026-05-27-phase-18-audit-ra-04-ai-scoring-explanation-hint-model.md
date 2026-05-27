# Phase 18 Audit RA-04 AI Scoring Explanation Hint And Model

**Date:** 2026-05-27

**Task:** `phase-18-audit-ra-04-ai-scoring-explanation-hint-model`

## Scope

Audit RA-04-01 through RA-04-08 against `docs/01-requirements/stories/epic-04-ai-scoring.md`, `docs/01-requirements/modules/04-ai-scoring.md`, architecture contracts, static implementation, unit coverage, and local browser/e2e evidence.

This report records facts and findings only. No business bug fixes are made in this audit task.

## Phase 17 Prerequisite Context

- Local DB, dev server, and Playwright e2e are generally usable.
- Real provider, staging/prod/cloud/deploy, env/secret, dependency, and destructive data gates remain blocked.
- AI evidence uses local/mock provider behavior only and excludes raw prompts, raw answers, raw model output, raw provider payloads, and secrets.

## Item Results

| auditId  | requirementId | status  | findingId      | Code implementation conclusion                                                                                                                                                                                                                                                                                                                                                           | Browser/e2e conclusion                                                                                                                                                           |
| -------- | ------------- | ------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RA-04-01 | US-04-01      | partial | F-RA-04-01-001 | AI scoring service stores scoring point results, total score, comments, improvement suggestions, citations, model snapshot, prompt version, and redacted call-log drafts. It rounds to 0.5 and clamps to max score, reuses successful results, and gives unanswered subjective answers 0 without invoking AI. It runs inline during mock_exam submit/retry instead of async FIFO.        | Unit coverage exists for deterministic scoring, 0.5 score, snapshots, and unanswered zero. Browser proof of async scoring queue and UI "AI automatic scoring" marker is missing. |
| RA-04-02 | US-04-02      | partial | F-RA-04-02-001 | Scoring failure maps to `scoring_partial_failed`, retry only failed subjective records, and retry-limit primitives exist in `ai-scoring-service`. No 60-second timeout/FIFO queue evidence was found, and retry count persistence across failed answer records is incomplete or not explicit in repository-level state.                                                                  | Unit coverage exists for failure and retry. Browser/status evidence for timeout, three-retry exhaustion, and queued processing is missing.                                       |
| RA-04-03 | US-04-03      | partial | F-RA-04-03-001 | Student report UI recognizes `scoring` and `scoring_partial_failed` statuses and record filters. A dedicated scoring-in-progress page or route with refresh button semantics, no objective half-score display before completion, and explicit "wait a few minutes" guidance was not found.                                                                                               | UI fixture coverage exists for status labels. Full scoring-progress browser flow is missing.                                                                                     |
| RA-04-04 | US-04-04      | partial | F-RA-04-04-001 | AI explanation service supports RAG citations, weak/none evidence messaging, failure status, and redacted AI call logs. Mistake_book AI explanation route uses the service. The practice flow still returns `ai_explanation_status: null` and does not wire wrong-answer auto explanation or correct-answer manual explanation triggers.                                                 | Mistake_book explanation UI/service tests exist. Practice-based auto/manual explanation browser evidence is missing because the trigger is absent.                               |
| RA-04-05 | US-04-05      | partial | F-RA-04-05-001 | AI hint service can generate hints, sanitize direct standard-answer leakage, attach sufficient citations, and record redacted logs. Student subjective practice currently uses local placeholder hint feedback and a retry limit, but does not perform first-attempt AI scoring, final second-attempt scoring, or report-final-result selection.                                         | Unit coverage exists for placeholder hint/retry. Full AI scoring plus hint plus final result browser proof is missing.                                                           |
| RA-04-06 | US-04-06      | partial | F-RA-04-06-001 | Knowledge recommendation service returns 1..5 active/recommendable candidate knowledge_node suggestions with high/medium/low confidence, pending confirmation status, stale-check route evidence, and redacted call logs. Confirmed binding remains incomplete because persistent question knowledge_node/tag binding is missing from RA-02.                                             | UI tests cover recommendation review, stale state, accept/discard states with mocked payloads. Runtime confirmed binding evidence is incomplete.                                 |
| RA-04-07 | US-04-07      | partial | F-RA-04-07-001 | Admin model provider/config routes support masked API key metadata, super_admin-only mutations, enable/disable, fallback ordering, and audit logs. Runtime AI calls still select from `createLocalModelConfigRuntimeCatalog` rather than persisted admin-managed `model_config` records, so admin changes do not clearly drive live AI runtime selection.                                | Unit/UI/e2e inventory covers redacted model config surfaces. Real provider behavior is blocked; persisted runtime selection evidence is missing.                                 |
| RA-04-08 | US-04-08      | partial | F-RA-04-08-001 | Static prompt templates exist for scoring, explanation, hint, knowledge recommendation, and learning suggestion, and AI call logs record prompt key/version. Runtime local template keys use `dev_*` names that diverge from static definitions, and admin prompt-template mutation routes exist even though first-phase requirement says server-config files only and no admin edit UI. | Static/unit evidence exists. Source-of-truth alignment and "no admin edit" policy are partial.                                                                                   |

## Findings

| findingId      | auditId  | Severity | Summary                                                                                                                          | Follow-up task                                                      |
| -------------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| F-RA-04-01-001 | RA-04-01 | P1       | Mock_exam AI subjective scoring is inline, not an asynchronous FIFO queue workflow.                                              | `phase-20-fix-ra-04-01-async-ai-scoring-queue`                      |
| F-RA-04-02-001 | RA-04-02 | P2       | AI scoring timeout and retry persistence evidence is incomplete.                                                                 | `phase-20-fix-ra-04-02-ai-scoring-timeout-retry-persistence`        |
| F-RA-04-03-001 | RA-04-03 | P2       | Dedicated scoring-in-progress page and refresh semantics are incomplete.                                                         | `phase-20-fix-ra-04-03-scoring-progress-page`                       |
| F-RA-04-04-001 | RA-04-04 | P2       | Practice AI explanation auto/manual triggers are not wired.                                                                      | `phase-20-fix-ra-04-04-practice-ai-explanation-triggers`            |
| F-RA-04-05-001 | RA-04-05 | P2       | Subjective practice uses placeholder hint feedback and lacks first/final AI scoring flow.                                        | `phase-20-fix-ra-04-05-subjective-practice-ai-hint-scoring`         |
| F-RA-04-06-001 | RA-04-06 | P2       | Knowledge recommendation confirmation cannot complete durable question bindings while question knowledge/tag binding is missing. | `phase-20-fix-ra-04-06-knowledge-recommendation-confirmed-bindings` |
| F-RA-04-07-001 | RA-04-07 | P2       | Admin-managed model_config records are not clearly used for live AI runtime selection.                                           | `phase-20-fix-ra-04-07-persisted-model-config-runtime-selection`    |
| F-RA-04-08-001 | RA-04-08 | P3       | Prompt template source of truth is split between static definitions, local `dev_*` runtime keys, and admin mutation routes.      | `phase-20-fix-ra-04-08-prompt-template-source-of-truth-alignment`   |

## Follow-Up Tasks

The follow-up task ids above were registered in `docs/04-agent-system/state/task-queue.yaml` as Phase 20+ implementation/fix candidates. They are not implemented in this audit branch.

## Evidence Pointer

Per-item evidence and command logs are recorded in `docs/05-execution-logs/evidence/2026-05-27-phase-18-audit-ra-04-ai-scoring-explanation-hint-model.md`.
