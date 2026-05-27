# Phase 19 Dedup Severity Taxonomy

**Date:** 2026-05-27

**Task id:** `phase-19-02-dedup-severity-taxonomy`

## Scope

This report reviews the 51 Phase 18 findings inventoried in `docs/05-execution-logs/audits-reviews/2026-05-27-phase-19-finding-inventory.md`.

Phase 19-02 performs classification only:

- identifies canonical findings and inherited/duplicate relationships;
- assigns taxonomy categories;
- assigns initial severity;
- does not fix business bugs;
- does not modify Phase 20+ implementation task structure.

## Severity Rubric

| Severity | Rule                                                                                                                                      |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| critical | Proven production-blocking security, privacy, irreversible data loss, or destructive behavior. None is assigned from Phase 18 evidence.   |
| high     | Core auth/security/session termination, data integrity, scoring, or authorization boundary risk that can materially break core workflows. |
| medium   | Core business requirement incomplete, but partially implemented or bounded by local/mock/runtime constraints.                             |
| low      | UI detail, evidence completeness, marker/configuration, or low-blast-radius operational refinement.                                       |

## Summary

| Metric                            | Count |
| --------------------------------- | ----- |
| Phase 18 findings reviewed        | 51    |
| Canonical finding ids             | 38    |
| Findings marked standalone        | 38    |
| Findings marked inherited/related | 13    |
| Findings revoked                  | 0     |

## Severity Distribution

| Severity | Findings |
| -------- | -------- |
| critical | 0        |
| high     | 8        |
| medium   | 34       |
| low      | 9        |
| Total    | 51       |

## Category Distribution

| Primary category | Findings |
| ---------------- | -------- |
| auth             | 9        |
| content          | 8        |
| student          | 9        |
| ai               | 8        |
| rag              | 6        |
| admin            | 11       |
| Total            | 51       |

Secondary category tags used: `api`, `browser`, `data`, `ops`, `security`, and `test`.

## Canonical Finding Catalog

| canonicalFindingId | Title                                                   | Primary category | Severity | Source findings                                                | Relationship decision                               |
| ------------------ | ------------------------------------------------------- | ---------------- | -------- | -------------------------------------------------------------- | --------------------------------------------------- |
| CF-19-001          | Employee account creation workflow incomplete           | auth             | medium   | F-RA-01-03-001                                                 | keep                                                |
| CF-19-002          | Employee batch import missing                           | auth             | medium   | F-RA-01-04-001, F-RA-06-03-001                                 | merge inherited admin employee-management symptom   |
| CF-19-003          | Password reset operator handoff incomplete              | auth             | medium   | F-RA-01-05-001                                                 | keep                                                |
| CF-19-004          | Active student flow termination incomplete              | auth             | high     | F-RA-01-06-001, F-RA-01-10-001, F-RA-02-09-001                 | merge same termination root across disable/archive  |
| CF-19-005          | Admin-managed contact_config runtime missing            | auth             | low      | F-RA-01-09-001                                                 | keep                                                |
| CF-19-006          | Org_auth quota atomicity unproven                       | auth             | high     | F-RA-01-11-001                                                 | keep                                                |
| CF-19-007          | Employee transfer and unbind workflow missing           | auth             | medium   | F-RA-01-12-001                                                 | keep; related admin symptom remains under CF-19-002 |
| CF-19-008          | Authorization expiry reminder missing                   | auth             | low      | F-RA-01-14-001                                                 | keep                                                |
| CF-19-009          | Question knowledge/tag binding incomplete               | content          | medium   | F-RA-02-01-001, F-RA-04-06-001, F-RA-06-08-001, F-RA-06-10-001 | merge inherited AI/admin binding symptoms           |
| CF-19-010          | Disabled question composition guard missing             | content          | high     | F-RA-02-02-001                                                 | keep                                                |
| CF-19-011          | Question knowledge/tag filters missing                  | content          | medium   | F-RA-02-03-001                                                 | keep                                                |
| CF-19-012          | Fill_blank per-blank scoring model incomplete           | content          | medium   | F-RA-02-05-001, F-RA-02-08-001                                 | merge publish validation inherited from model gap   |
| CF-19-013          | Material reference list lacks API-backed evidence       | content          | low      | F-RA-02-06-001                                                 | keep                                                |
| CF-19-014          | Paper copy disabled-source marker missing               | content          | low      | F-RA-02-10-001                                                 | keep                                                |
| CF-19-015          | Student scope persistence and no-auth redirect partial  | student          | medium   | F-RA-03-01-001                                                 | keep                                                |
| CF-19-016          | Practice AI explanation triggers missing                | student          | medium   | F-RA-03-02-001, F-RA-04-04-001                                 | merge student and AI trigger finding                |
| CF-19-017          | Subjective practice final AI scoring/hint flow partial  | student          | medium   | F-RA-03-03-001, F-RA-04-05-001                                 | merge student and AI flow finding                   |
| CF-19-018          | Practice resume continue/restart choice missing         | student          | low      | F-RA-03-04-001                                                 | keep                                                |
| CF-19-019          | Mock exam offline and retry UX missing                  | student          | medium   | F-RA-03-05-001, F-RA-03-06-001                                 | merge same offline/retry user experience root       |
| CF-19-020          | Exam report analytics and knowledge analysis incomplete | student          | medium   | F-RA-03-07-001, F-RA-05-09-001                                 | merge report and knowledge-analysis root            |
| CF-19-021          | Mock exam record list semantics incomplete              | student          | medium   | F-RA-03-08-001                                                 | keep                                                |
| CF-19-022          | Mistake_book completion evidence partial                | student          | low      | F-RA-03-09-001                                                 | keep                                                |
| CF-19-023          | Async AI scoring queue missing                          | ai               | high     | F-RA-04-01-001                                                 | keep                                                |
| CF-19-024          | AI scoring timeout and retry persistence incomplete     | ai               | medium   | F-RA-04-02-001                                                 | keep                                                |
| CF-19-025          | Scoring progress page semantics incomplete              | ai               | low      | F-RA-04-03-001                                                 | keep                                                |
| CF-19-026          | Persisted model_config runtime selection incomplete     | ai               | medium   | F-RA-04-07-001, F-RA-06-07-001                                 | merge inherited admin model_config symptom          |
| CF-19-027          | Prompt template source of truth split                   | ai               | medium   | F-RA-04-08-001                                                 | keep                                                |
| CF-19-028          | Hybrid RAG vector recall and rerank incomplete          | rag              | medium   | F-RA-05-01-001                                                 | keep                                                |
| CF-19-029          | Resource conversion format coverage incomplete          | rag              | medium   | F-RA-05-03-001                                                 | keep                                                |
| CF-19-030          | Markdown chapter hierarchy review evidence incomplete   | rag              | low      | F-RA-05-04-001                                                 | keep                                                |
| CF-19-031          | Resource enable/restore state incomplete                | rag              | medium   | F-RA-05-05-001, F-RA-06-06-001                                 | merge inherited admin resource symptom              |
| CF-19-032          | Vector rebuild stale marker and atomic switch partial   | rag              | high     | F-RA-05-06-001                                                 | keep                                                |
| CF-19-033          | Admin common UX and concurrency coverage incomplete     | admin            | medium   | F-RA-06-01-001                                                 | keep                                                |
| CF-19-034          | User-management role/detail alignment incomplete        | admin            | medium   | F-RA-06-02-001                                                 | keep                                                |
| CF-19-035          | Org_auth detail and route alignment incomplete          | admin            | medium   | F-RA-06-04-001                                                 | keep                                                |
| CF-19-036          | Redeem_code detail view evidence incomplete             | admin            | low      | F-RA-06-05-001                                                 | keep                                                |
| CF-19-037          | Paper admin inherited lifecycle evidence incomplete     | admin            | medium   | F-RA-06-09-001                                                 | inherited from CF-19-004 and content lifecycle      |
| CF-19-038          | Admin account security policy misaligned                | admin            | high     | F-RA-06-13-001                                                 | keep                                                |

## Finding-Level Classification

| findingId      | canonicalFindingId | primaryCategory | secondaryTags          | severity | disposition | Rationale                                                                                                                    |
| -------------- | ------------------ | --------------- | ---------------------- | -------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| F-RA-01-03-001 | CF-19-001          | auth            | admin,ops,api          | medium   | keep        | Employee creation is a core auth/admin workflow but Phase 18 shows partial runtime.                                          |
| F-RA-01-04-001 | CF-19-002          | auth            | admin,ops,data         | medium   | keep        | Batch import is missing, but it is an admin operational workflow rather than immediate security failure.                     |
| F-RA-01-05-001 | CF-19-003          | auth            | admin,ops,security     | medium   | keep        | Password reset flow is sensitive, but the finding is about operator handoff evidence rather than proven credential exposure. |
| F-RA-01-06-001 | CF-19-004          | auth            | student,security,data  | high     | keep        | Disabled user sessions and active exams may remain usable, affecting authorization enforcement.                              |
| F-RA-01-09-001 | CF-19-005          | auth            | admin,ops              | low      | keep        | Purchase guidance is static and bounded to configuration/admin manageability.                                                |
| F-RA-01-10-001 | CF-19-004          | auth            | student,admin,security | high     | merge       | Organization disable termination is the same active-flow termination root as CF-19-004.                                      |
| F-RA-01-11-001 | CF-19-006          | auth            | data,security,ops      | high     | keep        | Quota concurrency can over-allocate authorization seats and affects data integrity.                                          |
| F-RA-01-12-001 | CF-19-007          | auth            | admin,ops,data         | medium   | keep        | Transfer/unbind and historical visibility are missing business workflows with quota implications.                            |
| F-RA-01-14-001 | CF-19-008          | auth            | student,browser        | low      | keep        | Reminder behavior is missing but does not block existing authorization enforcement.                                          |
| F-RA-02-01-001 | CF-19-009          | content         | rag,ai,data            | medium   | keep        | Knowledge/tag binding is a core content data gap and root for later inherited findings.                                      |
| F-RA-02-02-001 | CF-19-010          | content         | api,data               | high     | keep        | Disabled questions can enter drafts, affecting published content integrity.                                                  |
| F-RA-02-03-001 | CF-19-011          | content         | api,browser            | medium   | keep        | Runtime filters are missing but do not corrupt persisted content.                                                            |
| F-RA-02-05-001 | CF-19-012          | content         | data,test              | medium   | keep        | Per-blank scoring model is incomplete and impacts scoring/report correctness.                                                |
| F-RA-02-06-001 | CF-19-013          | content         | api,browser            | low      | keep        | Reference-list evidence is incomplete with limited core workflow impact.                                                     |
| F-RA-02-08-001 | CF-19-012          | content         | data,test              | medium   | merge       | Publish validation gap inherits from missing per-blank score model.                                                          |
| F-RA-02-09-001 | CF-19-004          | content         | student,security,data  | high     | merge       | Paper archive termination is the same active-flow termination root as CF-19-004.                                             |
| F-RA-02-10-001 | CF-19-014          | content         | browser                | low      | keep        | Disabled-source marker is a user-visible detail on copied drafts.                                                            |
| F-RA-03-01-001 | CF-19-015          | student         | auth,browser           | medium   | keep        | Scope persistence and no-auth redirect affect student entry behavior.                                                        |
| F-RA-03-02-001 | CF-19-016          | student         | ai,browser             | medium   | keep        | Objective explanation triggers are required learning behavior but not a security/data-integrity issue.                       |
| F-RA-03-03-001 | CF-19-017          | student         | ai                     | medium   | keep        | Subjective practice final scoring path affects skill practice completion.                                                    |
| F-RA-03-04-001 | CF-19-018          | student         | browser                | low      | keep        | Resume choice is UX completeness around an existing lifecycle.                                                               |
| F-RA-03-05-001 | CF-19-019          | student         | browser,test           | medium   | keep        | Offline recovery is important for mock_exam continuity but bounded to resilience.                                            |
| F-RA-03-06-001 | CF-19-019          | student         | browser,test           | medium   | merge       | Answer-save retry UX shares the same offline/retry root as CF-19-019.                                                        |
| F-RA-03-07-001 | CF-19-020          | student         | rag,ai,data            | medium   | keep        | Report analytics and learning suggestion snapshots affect student feedback quality.                                          |
| F-RA-03-08-001 | CF-19-021          | student         | data,browser           | medium   | keep        | Record list semantics may hide terminated attempts and misorder history.                                                     |
| F-RA-03-09-001 | CF-19-022          | student         | browser,test           | low      | keep        | Mistake_book core exists; remaining gap is favorite/pagination evidence.                                                     |
| F-RA-04-01-001 | CF-19-023          | ai              | student,data           | high     | keep        | Inline subjective scoring does not satisfy async FIFO scoring workflow.                                                      |
| F-RA-04-02-001 | CF-19-024          | ai              | data,test              | medium   | keep        | Timeout/retry persistence is incomplete but failure handling basics exist.                                                   |
| F-RA-04-03-001 | CF-19-025          | ai              | browser                | low      | keep        | Dedicated progress page semantics are UI/status completeness.                                                                |
| F-RA-04-04-001 | CF-19-016          | ai              | student,browser        | medium   | merge       | Same practice AI explanation trigger root as CF-19-016.                                                                      |
| F-RA-04-05-001 | CF-19-017          | ai              | student                | medium   | merge       | Same subjective practice AI hint/scoring root as CF-19-017.                                                                  |
| F-RA-04-06-001 | CF-19-009          | ai              | content,rag,data       | medium   | merge       | Durable recommendation binding inherits from missing question knowledge/tag binding.                                         |
| F-RA-04-07-001 | CF-19-026          | ai              | admin,ops              | medium   | keep        | Persisted model_config exists but runtime selection remains local/static.                                                    |
| F-RA-04-08-001 | CF-19-027          | ai              | ops,data               | medium   | keep        | Split prompt template source of truth can create operational inconsistency.                                                  |
| F-RA-05-01-001 | CF-19-028          | rag             | ai,data                | medium   | keep        | Hybrid retrieval lacks actual vector recall/rerank, bounded by provider/vector gates.                                        |
| F-RA-05-03-001 | CF-19-029          | rag             | ops,data,test          | medium   | keep        | Conversion formats and 50MB validation are incomplete.                                                                       |
| F-RA-05-04-001 | CF-19-030          | rag             | browser,ops            | low      | keep        | Chapter review evidence is partial around existing Markdown edit/publish.                                                    |
| F-RA-05-05-001 | CF-19-031          | rag             | admin,ops,data         | medium   | keep        | Resource enable/restore state matrix is incomplete.                                                                          |
| F-RA-05-06-001 | CF-19-032          | rag             | data,api               | high     | keep        | Vector rebuild lacks stale marker and atomic switch semantics, risking stale citations.                                      |
| F-RA-05-09-001 | CF-19-020          | rag             | student,data           | medium   | merge       | Same report knowledge-analysis root as CF-19-020.                                                                            |
| F-RA-06-01-001 | CF-19-033          | admin           | ops,browser,test       | medium   | keep        | Cross-page admin UX and concurrency proof remains incomplete.                                                                |
| F-RA-06-02-001 | CF-19-034          | admin           | auth,ops,browser       | medium   | keep        | User-management role/detail behavior is an admin surface gap.                                                                |
| F-RA-06-03-001 | CF-19-002          | admin           | auth,ops,browser       | medium   | merge       | Contains inherited employee import/unbind issues; keep as inherited for coverage review.                                     |
| F-RA-06-04-001 | CF-19-035          | admin           | auth,api,browser       | medium   | keep        | Org_auth detail/route alignment is distinct from quota atomicity.                                                            |
| F-RA-06-05-001 | CF-19-036          | admin           | browser,ops            | low      | keep        | Dedicated redeem_code detail is a bounded admin evidence gap.                                                                |
| F-RA-06-06-001 | CF-19-031          | admin           | rag,ops,browser        | medium   | merge       | Admin resource enable evidence inherits from resource state gap.                                                             |
| F-RA-06-07-001 | CF-19-026          | admin           | ai,ops                 | medium   | merge       | Admin model_config runtime alignment inherits from CF-19-026.                                                                |
| F-RA-06-08-001 | CF-19-009          | admin           | content,ai,data        | medium   | merge       | Question admin binding gap inherits from CF-19-009.                                                                          |
| F-RA-06-09-001 | CF-19-037          | admin           | content,student        | medium   | keep        | Paper admin aggregates lifecycle evidence and remains visible as an admin canonical wrapper.                                 |
| F-RA-06-10-001 | CF-19-009          | admin           | content,ai,data        | medium   | merge       | Knowledge UI recommendation correction inherits from durable binding gap.                                                    |
| F-RA-06-13-001 | CF-19-038          | admin           | security,auth          | high     | keep        | Admin lock policy differs from requirement and admin account UI remains incomplete.                                          |

## Findings To Carry Forward

- Keep all 51 Phase 18 findings as valid review inputs; none are revoked in Phase 19-02.
- Treat merged rows as inherited/duplicate symptoms for planning, not as deleted evidence.
- Phase 19-03 must check whether matrix `status`, `findingId`, `implementation coverage`, `test coverage`, and `browser coverage` align with this canonical mapping.
- Phase 19-04 must decide whether Phase 20+ queue entries should stay separate for implementability even when their findings map to one canonical finding.
