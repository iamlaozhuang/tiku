# Phase 18 Audit RA-04 AI Scoring Explanation Hint And Model Evidence

**Task id:** `phase-18-audit-ra-04-ai-scoring-explanation-hint-model`

**Branch:** `codex/phase-18-audit-ra-04-ai-scoring-explanation-hint-model`

**Date:** 2026-05-27

## Summary

- Result: RA-04 audit complete; validation passed.
- Scope: local_verification with docs-only writes.
- Changed surfaces: project state, task queue, RA-04 task plan/evidence/report, requirement audit catalog, traceability matrix.
- Forbidden scope (`forbiddenScope`): env/dependency/schema/migration/staging/prod/cloud/deploy/real provider/source/tests/e2e/scripts remain untouched.
- Gates: passed for the declared audit-only validation commands.
- Residual gaps (`residualGaps`): eight RA-04 findings registered for Phase 20+ follow-up.

## Startup Recovery

- RA-03 was committed, merged into `master`, pushed to `origin/master`, and the local short-lived branch was deleted.
- `master` and `origin/master` were aligned at `4ffdd25` before creating this RA-04 branch.
- Phase 17 readiness caveats remain in force: local DB/dev server/Playwright are generally usable; real providers and external environments remain blocked.

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/evidence/2026-05-27-phase-17-local-e2e-prerequisite-readiness-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-requirement-audit-catalog.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-requirement-traceability-matrix.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/01-requirements/modules/04-ai-scoring.md`

## Command Results

Validation commands:

- `node .\node_modules\prettier\bin\prettier.cjs --write docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-05-27-phase-18-audit-ra-04-ai-scoring-explanation-hint-model.md docs\05-execution-logs\evidence\2026-05-27-phase-18-audit-ra-04-ai-scoring-explanation-hint-model.md docs\05-execution-logs\audits-reviews\2026-05-27-phase-18-audit-ra-04-ai-scoring-explanation-hint-model.md docs\05-execution-logs\audits-reviews\2026-05-27-requirement-audit-catalog.md docs\05-execution-logs\audits-reviews\2026-05-27-requirement-traceability-matrix.md` - pass after escalated run.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1` - pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master` - pass; inventory completed and listed the RA-04 audit/state files, with new files visible as untracked before staging.
- `git diff --check` - pass with no output.
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-05-27-phase-18-audit-ra-04-ai-scoring-explanation-hint-model.md docs\05-execution-logs\evidence\2026-05-27-phase-18-audit-ra-04-ai-scoring-explanation-hint-model.md docs\05-execution-logs\audits-reviews\2026-05-27-phase-18-audit-ra-04-ai-scoring-explanation-hint-model.md docs\05-execution-logs\audits-reviews\2026-05-27-requirement-audit-catalog.md docs\05-execution-logs\audits-reviews\2026-05-27-requirement-traceability-matrix.md` - pass after escalated run.

Static read-only audit commands executed:

- `rg --files src tests e2e | rg "(ai|scoring|explanation|hint|model|prompt|rag|knowledge|mock-exam|practice|mistake-book|exam-report)"`
- `rg -n "ai_scoring|ai_explanation|ai_hint|learning_suggestion|model_provider|model_config|prompt_template|evidence_status|citation|kn_recommendation|retryMockExamScoring|retryLearningSuggestion|generateLearningSuggestion|generateAi|modelConfig|promptTemplate" src tests e2e -g "*.ts" -g "*.tsx"`
- `rg -n "modelProvider|modelConfig|apiKey|secret|redact|audit|reorderFallback|super_admin|role" src/server/services/admin-ai-audit-log-ops-service.ts src/server/services/admin-ai-audit-log-runtime.ts src/server/services/admin-ai-audit-log-ops-route.ts tests/unit/admin-ai-audit-log-ops-baseline.test.ts tests/unit/phase-12-model-config-server-runtime.test.ts tests/unit/admin-model-config-management-ui.test.ts src/features/admin/model-config-management/AdminModelConfigManagement.tsx src/app/api/v1/model-configs -g "*.ts" -g "*.tsx"`
- `rg -n "promptTemplates|PromptTemplate|prompt_template|templateContent|bodyPreviewMasked|createPromptTemplate|updatePromptTemplate|disable|enable" src/server/services/admin-ai-audit-log-runtime.ts src/server/repositories/admin-ai-audit-log-runtime-repository.ts tests/unit/phase-12-model-config-server-runtime.test.ts src/app/api/v1/prompt-templates -g "*.ts"`
- `rg -n "recommendKnowledgeNodes|recommend-knowledge|kn_recommendation|pending_confirmation|stale|questionRevision|disabled|confidence|knowledgeNode" src/server/services/knowledge-recommendation-service.test.ts src/server/services/question-service.ts src/server/services/question-service.test.ts tests/unit/phase-11-ai-knowledge-recommendation-review-loop.test.ts tests/unit/admin-question-material-ui.test.ts src/app/api/v1/questions/[publicId]/recommend-knowledge-nodes/route.ts`

## RA-04 Evidence Map

| auditId  | status  | findingId      | Evidence summary                                                                                                                                                                                                                                                          |
| -------- | ------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RA-04-01 | partial | F-RA-04-01-001 | Read `ai-scoring-service`, `mock-exam-service`, `student-flow-runtime`, and mock_exam tests. Scoring result shape, 0.5 rounding/clamp, unanswered zero, and scoring snapshot logs exist. Scoring runs inline during submit/retry rather than through an async FIFO queue. |
| RA-04-02 | partial | F-RA-04-02-001 | Failure status, `scoring_partial_failed`, retry only failed records, and retry limit primitives exist. No 60-second timeout/FIFO queue evidence was found, and retry counting is not clearly persisted per failed answer across service boundaries.                       |
| RA-04-03 | partial | F-RA-04-03-001 | UI status labels and record filters for `scoring`/`scoring_partial_failed` exist. A dedicated scoring-in-progress page with refresh semantics and no half-finished objective score display was not found.                                                                 |
| RA-04-04 | partial | F-RA-04-04-001 | `ai-explanation-hint-service` and mistake_book AI explanation route support citations, weak/none evidence, failures, and redacted logs. Practice wrong-answer auto and correct-answer manual triggers are not wired into the student practice flow.                       |
| RA-04-05 | partial | F-RA-04-05-001 | AI hint service sanitizes standard-answer leakage and records redacted logs. Student subjective practice currently uses local placeholder hint feedback and does not perform first/final AI scoring flow in practice.                                                     |
| RA-04-06 | partial | F-RA-04-06-001 | Knowledge recommendation service caps 1..5 recommendations, normalizes confidence, filters disabled/non-recommendable nodes, and route/UI tests cover stale status. Confirmed binding workflow remains incomplete because question knowledge/tag persistence is absent.   |
| RA-04-07 | partial | F-RA-04-07-001 | Admin model provider/config routes support masked secret metadata, super_admin mutation gate, audit logs, and fallback ordering. Runtime AI calls still resolve from the local model_config catalog rather than persisted admin-managed model_config records.             |
| RA-04-08 | partial | F-RA-04-08-001 | Static prompt templates and prompt version metadata exist, and AI call logs carry prompt key/version. Runtime/local template keys diverge from static definitions and admin prompt-template mutation routes exist despite first-phase server-config-only requirement.     |

## Findings

| findingId      | auditId  | Follow-up                                                           |
| -------------- | -------- | ------------------------------------------------------------------- |
| F-RA-04-01-001 | RA-04-01 | `phase-20-fix-ra-04-01-async-ai-scoring-queue`                      |
| F-RA-04-02-001 | RA-04-02 | `phase-20-fix-ra-04-02-ai-scoring-timeout-retry-persistence`        |
| F-RA-04-03-001 | RA-04-03 | `phase-20-fix-ra-04-03-scoring-progress-page`                       |
| F-RA-04-04-001 | RA-04-04 | `phase-20-fix-ra-04-04-practice-ai-explanation-triggers`            |
| F-RA-04-05-001 | RA-04-05 | `phase-20-fix-ra-04-05-subjective-practice-ai-hint-scoring`         |
| F-RA-04-06-001 | RA-04-06 | `phase-20-fix-ra-04-06-knowledge-recommendation-confirmed-bindings` |
| F-RA-04-07-001 | RA-04-07 | `phase-20-fix-ra-04-07-persisted-model-config-runtime-selection`    |
| F-RA-04-08-001 | RA-04-08 | `phase-20-fix-ra-04-08-prompt-template-source-of-truth-alignment`   |

## Follow-Up Queue Registrations

Registered in `docs/04-agent-system/state/task-queue.yaml` as Phase 20+ pending fix candidates. No implementation work was performed in this audit task.

## Browser And E2E Notes

- No fresh browser/e2e run was executed for RA-04. Evidence relies on existing unit/UI/e2e coverage and static implementation inspection.
- Real provider behavior is blocked; all AI conclusions use local mock/runtime evidence only.
- Persistent `content_admin` and `ops_admin` local login prerequisites remain incomplete, so content/admin browser evidence is lower confidence unless covered by synthetic fixtures.

## Redaction Notes

- `.env.local` and `.env.example` contents were not read or modified.
- Evidence must not include credentials, tokens, Authorization headers, database URLs, raw prompts, raw answers, raw model responses, raw provider payloads, generated plaintext `redeem_code` values, full papers, full textbooks, OCR full text, or customer/customer-like private data.
