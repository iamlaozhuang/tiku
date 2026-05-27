# Phase 18 Audit RA-05 RAG And Knowledge Evidence

**Task id:** `phase-18-audit-ra-05-rag-knowledge`

**Branch:** `codex/phase-18-audit-ra-05-rag-knowledge`

**Date:** 2026-05-27

## Summary

- Result: RA-05 audit complete; validation passed.
- Scope: local_verification with docs-only writes.
- Changed surfaces: project state, task queue, RA-05 task plan/evidence/report, requirement audit catalog, traceability matrix.
- Forbidden scope (`forbiddenScope`): env/dependency/schema/migration/staging/prod/cloud/deploy/real provider/source/tests/e2e/scripts remain untouched.
- Gates: passed for the declared audit-only validation commands.
- Residual gaps (`residualGaps`): six RA-05 findings registered for Phase 20+ follow-up.

## Startup Recovery

- RA-04 was committed, merged into `master`, pushed to `origin/master`, and the local short-lived branch was deleted.
- `master` and `origin/master` were aligned at `424e89b` before creating this RA-05 branch.
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
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`

## Command Results

Validation commands:

- `node .\node_modules\prettier\bin\prettier.cjs --write docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-05-27-phase-18-audit-ra-05-rag-knowledge.md docs\05-execution-logs\evidence\2026-05-27-phase-18-audit-ra-05-rag-knowledge.md docs\05-execution-logs\audits-reviews\2026-05-27-phase-18-audit-ra-05-rag-knowledge.md docs\05-execution-logs\audits-reviews\2026-05-27-requirement-audit-catalog.md docs\05-execution-logs\audits-reviews\2026-05-27-requirement-traceability-matrix.md` - pass after escalated run.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1` - pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master` - pass; inventory completed and listed the RA-05 audit/state files, with new files visible as untracked before staging.
- `git diff --check` - pass with no output.
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-05-27-phase-18-audit-ra-05-rag-knowledge.md docs\05-execution-logs\evidence\2026-05-27-phase-18-audit-ra-05-rag-knowledge.md docs\05-execution-logs\audits-reviews\2026-05-27-phase-18-audit-ra-05-rag-knowledge.md docs\05-execution-logs\audits-reviews\2026-05-27-requirement-audit-catalog.md docs\05-execution-logs\audits-reviews\2026-05-27-requirement-traceability-matrix.md` - pass after escalated run.

Static read-only audit commands executed:

- `rg -n "RA-05|phase-18-audit-ra-05|phase-20-fix-ra-05|currentTask|phase:" docs/05-execution-logs/audits-reviews/2026-05-27-requirement-audit-catalog.md docs/05-execution-logs/audits-reviews/2026-05-27-requirement-traceability-matrix.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml`
- `rg -n "parent|parentPublicId|parent_public_id|sortOrder|sort_order|level|move|rename|max|depth" src/server/services/rag-resource-knowledge-runtime.ts src/server/repositories/rag-resource-knowledge-runtime-repository.ts src/features/admin/knowledge-node-management tests/unit/admin-content-knowledge-ops-baseline.test.ts`
- `rg -n "createRagRetrievalResult|evidenceStatus|fusion_sort|rerank|authorizedResourcePublicIds|rag_ready|conversion_failed|disableLocalResource|rebuild|chunk" src/rag src/server/services/rag-resource-knowledge-runtime.ts src/server/services/rag-retrieval-service.ts tests/unit`
- `rg -n "knowledge|knowledgeNode|weak|learningSuggestion|exam_report|knowledge_node" src/server/services src/features/student tests/unit -g "*.ts" -g "*.tsx"`

## RA-05 Evidence Map

| auditId  | status      | findingId      | Evidence summary                                                                                                                                                                                                                                                |
| -------- | ----------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RA-05-01 | partial     | F-RA-05-01-001 | `createRagRetrievalResult` filters by profession/level/authorization, returns Top 3 by deterministic score and level rank, and records `fallbackReason: "rerank_unavailable_fusion_sort"`. No actual vector recall plus rerank service evidence was found.      |
| RA-05-02 | implemented | null           | Retrieval and AI-facing citation DTOs filter unauthorized resources before returning citations, classify `sufficient`/`weak`/`none`, and tests assert weak/none evidence does not fabricate citations or expose raw chunk text in evidence summaries.           |
| RA-05-03 | partial     | F-RA-05-03-001 | Local Markdown upload/conversion failure handling exists, including `conversion_failed` for unparsed local content. DOCX/PPTX/PDF conversion and full 50MB validation evidence were not found; converters would remain under dependency/cloud gates if missing. |
| RA-05-04 | partial     | F-RA-05-04-001 | Markdown review, update, publish, and unpublished-not-retrieved behavior exist through local resource runtime. Dedicated chapter hierarchy adjustment/review evidence is incomplete.                                                                            |
| RA-05-05 | partial     | F-RA-05-05-001 | Resource states and publish/rebuild/disable transitions exist, including remembered `disabledFromStatus`. No enable/restore action or full illegal transition matrix evidence was found.                                                                        |
| RA-05-06 | partial     | F-RA-05-06-001 | Manual vector rebuild sets `rag_ready` or `index_failed` and local retrieval only uses `rag_ready`. Old-vector preservation, stale citation markers, and atomic switch semantics are not fully represented in the local implementation.                         |
| RA-05-07 | implemented | null           | Chunking keeps heading paths, splits long text, merges short chunks, produces stable chunk ids/text hashes, and summarizes evidence without raw text. Unit coverage exists in `src/rag/chunking.test.ts`.                                                       |
| RA-05-08 | implemented | null           | Knowledge_node list/create/edit/move/sort/disable, max-depth guard, no hard-delete routes, audit logs, and empty-tree non-blocking recommendation behavior are covered by runtime/UI/unit tests.                                                                |
| RA-05-09 | partial     | F-RA-05-09-001 | Exam report snapshot generation exists and learning suggestion retry exists behind options, but report snapshots do not compute knowledge_node weak-point accuracy/score-rate analysis or historical knowledge snapshots.                                       |

## Findings

| findingId      | auditId  | Follow-up                                             |
| -------------- | -------- | ----------------------------------------------------- |
| F-RA-05-01-001 | RA-05-01 | `phase-20-fix-ra-05-01-hybrid-rerank-retrieval`       |
| F-RA-05-03-001 | RA-05-03 | `phase-20-fix-ra-05-03-resource-conversion-formats`   |
| F-RA-05-04-001 | RA-05-04 | `phase-20-fix-ra-05-04-markdown-chapter-review`       |
| F-RA-05-05-001 | RA-05-05 | `phase-20-fix-ra-05-05-resource-enable-restore-state` |
| F-RA-05-06-001 | RA-05-06 | `phase-20-fix-ra-05-06-vector-rebuild-stale-marker`   |
| F-RA-05-09-001 | RA-05-09 | `phase-20-fix-ra-05-09-report-knowledge-analysis`     |

## Follow-Up Queue Registrations

Registered in `docs/04-agent-system/state/task-queue.yaml` as Phase 20+ pending fix candidates. No implementation work was performed in this audit task.

## Browser And E2E Notes

- No fresh browser/e2e run was executed for RA-05. Evidence relies on existing unit/UI/e2e coverage and static implementation inspection.
- Real provider/vector cloud behavior is blocked; retrieval conclusions use local deterministic scoring and mock resource/chunk fixtures only.
- Persistent `content_admin` and `ops_admin` local login prerequisites remain incomplete, so content/admin browser evidence is lower confidence unless covered by synthetic fixtures.

## Redaction Notes

- `.env.local` and `.env.example` contents were not read or modified.
- Evidence must not include credentials, tokens, Authorization headers, database URLs, raw prompts, raw answers, raw model responses, raw provider payloads, generated plaintext `redeem_code` values, full papers, full textbooks, OCR full text, or customer/customer-like private data.
