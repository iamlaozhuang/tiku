# Phase 20 Fix RA-03-07 Exam Report Analytics Learning Suggestion Plan

**Task id:** `phase-20-fix-ra-03-07-exam-report-analytics-learning-suggestion`

**Branch:** `codex/phase-20-fix-ra-03-07-exam-report-analytics-learning-suggestion`

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-03-student-experience.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-21-implementation-plan-breakdown.md`
- `docs/05-execution-logs/evidence/2026-05-27-phase-21-implementation-plan-breakdown.md`
- `docs/05-execution-logs/evidence/2026-05-27-phase-22-status-normalization.md`

## Finding

`F-RA-03-07-001`: generated `exam_report` snapshots do not include runtime question type, `paper_section`, and `knowledge_node` analytics for the report UI, and `retry-learning-suggestion` returns success without persisting `learningSuggestionSnapshot`.

## Implementation Plan

1. Extend report snapshot generation in `exam-report-service` using existing paper and answer snapshots only:
   - add `questionResults` for the current UI parser;
   - add question type, `paper_section`, and `knowledge_node` analytics summary fields;
   - preserve existing `questionDetails` for the API contract.
2. Add a repository boundary for updating `learning_suggestion_snapshot` without changing schema or migrations.
3. Persist a redaction-safe learning suggestion snapshot after local/mock `learning_suggestion` retry succeeds.
4. Update student report UI parsing to display the generated `knowledge_node` analytics field when present.
5. Add focused unit coverage for generated analytics and persisted retry snapshots, then run the task validation commands and local CI gates.

## Risk Controls

- Real provider remains blocked; use only existing local/mock runtime.
- No `.env.local`, `.env.example`, package manifest, lockfile, schema, migration, cloud, deploy, or destructive data change.
- Snapshot content must not include session tokens, provider secrets, raw provider payloads, raw prompts, raw model responses, or internal numeric ids.
- If implementation requires schema, dependency, env, external service, auth permission, deploy, or destructive data work, stop and record blocked evidence.
