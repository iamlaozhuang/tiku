# Phase 18 Audit RA-05 RAG And Knowledge

**Date:** 2026-05-27

**Task:** `phase-18-audit-ra-05-rag-knowledge`

## Scope

Audit RA-05-01 through RA-05-09 against `docs/01-requirements/stories/epic-05-rag-knowledge.md`, `docs/01-requirements/modules/05-rag-knowledge.md`, architecture contracts, static implementation, unit coverage, and local browser/e2e evidence.

This report records facts and findings only. No business bug fixes are made in this audit task.

## Phase 17 Prerequisite Context

- Local DB, dev server, and Playwright e2e are generally usable.
- Real provider, staging/prod/cloud/deploy, env/secret, dependency, and destructive data gates remain blocked.
- Vector/provider evidence uses local deterministic retrieval and mock resource fixtures only.
- Persistent `ops_admin` and `content_admin` login accounts are incomplete, so resource and knowledge browser evidence that depends on real role login remains partial unless synthetic fixture evidence is explicit.

## Item Results

| auditId  | requirementId | status      | findingId      | Code implementation conclusion                                                                                                                                                                                                                                                      | Browser/e2e conclusion                                                                                                                                                         |
| -------- | ------------- | ----------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RA-05-01 | US-05-01      | partial     | F-RA-05-01-001 | Local RAG retrieval filters by profession, requested level, and authorized resource public ids; returns Top 3 citations; sorts exact-level evidence before general-level evidence; and records a deterministic rerank fallback. Actual vector recall plus rerank service is absent. | Existing unit coverage proves filtering, Top 3, and fallback behavior. Real vector/provider/rerank browser proof is blocked.                                                   |
| RA-05-02 | US-05-02      | implemented | null           | Retrieval classifies `evidence_status` as sufficient/weak/none, filters authorization before returning citations, and citation DTOs omit raw chunk text and text hashes. AI scoring/explanation tests cover weak/none behavior without fabricated citations.                        | Existing local unit/UI evidence covers redacted citations and weak/none status. No fresh browser run was needed for this audit-only block.                                     |
| RA-05-03 | US-05-03      | partial     | F-RA-05-03-001 | Local resource upload handles Markdown-derived content and conversion failure status, with metadata and redacted evidence. DOCX/PPTX/PDF conversion support and explicit full 50MB validation evidence were not found.                                                              | Existing local resource lifecycle tests cover synthetic Markdown. Browser evidence for DOCX/PPTX/PDF conversion is missing and would be constrained by dependency/cloud gates. |
| RA-05-04 | US-05-04      | partial     | F-RA-05-04-001 | Markdown edit, save, publish, and unpublished-not-retrieved behavior exist in the resource runtime. Dedicated chapter hierarchy adjustment/review evidence is incomplete.                                                                                                           | Existing unit/e2e lifecycle evidence covers upload, Markdown review, publish, and rebuild. Chapter hierarchy browser evidence is incomplete.                                   |
| RA-05-05 | US-05-05      | partial     | F-RA-05-05-001 | Resource statuses and legal publish/rebuild/disable transitions exist, including `disabledFromStatus`. No enable/restore action and no full illegal transition matrix evidence were found.                                                                                          | Local lifecycle tests cover publish, rebuild, and disable. Enable/restore and illegal transition browser proof is missing.                                                     |
| RA-05-06 | US-05-06      | partial     | F-RA-05-06-001 | Manual rebuild chunks Markdown and sets `rag_ready` or `index_failed`. Local retrieval only uses `rag_ready` resources. Old-vector preservation, stale citation marker, and atomic switch semantics are not fully represented.                                                      | Existing tests cover manual rebuild and local retrieval after `rag_ready`. Real vector/cloud behavior remains blocked.                                                         |
| RA-05-07 | US-05-07      | implemented | null           | Chunking preserves Markdown heading paths, splits long text, merges short chunks, uses stable chunk ids/text hashes, and produces redacted evidence summaries. Chunking configuration is server-side and not exposed as an operator control.                                        | Unit coverage exists for heading metadata, overlap, short-block merge, skipped statuses, and redacted summaries.                                                               |
| RA-05-08 | US-05-08      | implemented | null           | Knowledge_node list/create/edit/move/sort/disable, max-depth guard, descendant-cycle guard, disable-only/no-delete policy, audit logs, and empty-tree non-blocking recommendation behavior exist.                                                                                   | Synthetic UI/runtime tests cover knowledge_node management and redacted audit evidence. Persistent content_admin login is still a Phase 17 caveat.                             |
| RA-05-09 | US-05-09      | partial     | F-RA-05-09-001 | Exam report generation stores a report snapshot and learning suggestion retry can be wired via runtime options. The snapshot does not compute knowledge_node weak-point accuracy/score-rate analysis or preserve historical knowledge_node analysis snapshots.                      | Existing report tests cover report snapshot creation and learning suggestion availability. Browser evidence for knowledge_node weak analysis is missing.                       |

## Findings

| findingId      | auditId  | Severity | Summary                                                                                                                      | Follow-up task                                        |
| -------------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| F-RA-05-01-001 | RA-05-01 | P2       | RAG retrieval is deterministic local fusion with a rerank fallback marker, not actual vector recall plus rerank.             | `phase-20-fix-ra-05-01-hybrid-rerank-retrieval`       |
| F-RA-05-03-001 | RA-05-03 | P2       | Resource conversion is only evidenced for local Markdown/failure handling; DOCX/PPTX/PDF and 50MB validation are incomplete. | `phase-20-fix-ra-05-03-resource-conversion-formats`   |
| F-RA-05-04-001 | RA-05-04 | P3       | Markdown chapter hierarchy adjustment/review evidence is incomplete.                                                         | `phase-20-fix-ra-05-04-markdown-chapter-review`       |
| F-RA-05-05-001 | RA-05-05 | P2       | Resource enable/restore and full illegal transition matrix evidence are missing.                                             | `phase-20-fix-ra-05-05-resource-enable-restore-state` |
| F-RA-05-06-001 | RA-05-06 | P2       | Vector rebuild lacks explicit old-vector preservation, stale citation marker, and atomic switch semantics.                   | `phase-20-fix-ra-05-06-vector-rebuild-stale-marker`   |
| F-RA-05-09-001 | RA-05-09 | P2       | Exam reports do not compute knowledge_node weak-point analysis or historical knowledge snapshots.                            | `phase-20-fix-ra-05-09-report-knowledge-analysis`     |

## Follow-Up Tasks

The follow-up task ids above were registered in `docs/04-agent-system/state/task-queue.yaml` as Phase 20+ implementation/fix candidates. They are not implemented in this audit branch.

## Evidence Pointer

Per-item evidence and command logs are recorded in `docs/05-execution-logs/evidence/2026-05-27-phase-18-audit-ra-05-rag-knowledge.md`.
