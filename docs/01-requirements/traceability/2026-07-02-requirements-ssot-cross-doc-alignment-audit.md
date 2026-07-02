# 2026-07-02 Requirements SSOT Cross-Doc Alignment Audit

## Status

This is a docs-only requirement SSOT cross-document alignment audit.

It does not inspect source implementation, run browser or Provider validation, connect to a database, change schema,
introduce dependencies, deploy, execute Cost Calibration, or claim release readiness, final Pass, or production
usability.

## Coverage Method

The audit used directory coverage counts plus targeted reads of the current standard root, advanced root,
edition-aware authorization requirement, ADR-007, AI generation baseline, role-separated alignment, role experience
matrix, capability catalog, use-case catalog, and unified traceability matrices.

No raw credentials, env values, database rows, Provider payloads, prompts, AI raw output, full question/paper/material
content, or source chunks were recorded.

## File Coverage Manifest Summary

| Path or rule                                                                                         | Count | Label                         | Current use                                                                 |
| ---------------------------------------------------------------------------------------------------- | ----: | ----------------------------- | --------------------------------------------------------------------------- |
| `docs/01-requirements/00-index.md`                                                                   |     1 | current_ssot_root             | Standard/shared MVP entry and requirement reading protocol.                 |
| `docs/01-requirements/modules/*.md`                                                                  |     6 | current_standard_module       | Stable standard MVP module semantics.                                       |
| `docs/01-requirements/stories/*.md`                                                                  |     6 | current_standard_story        | Standard acceptance granularity.                                            |
| `docs/01-requirements/advanced-edition/00-index.md`                                                  |     1 | current_advanced_entry        | Advanced edition derived reading entry.                                     |
| `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`                  |     1 | current_advanced_auth_source  | `edition`, `effectiveEdition`, `personal_auth`, `org_auth`, `auth_upgrade`. |
| `docs/01-requirements/advanced-edition/modules/*.md`                                                 |     8 | current_advanced_module       | Advanced capability module semantics.                                       |
| `docs/01-requirements/advanced-edition/stories/*.md`                                                 |     7 | current_advanced_story        | Advanced user story and acceptance granularity.                             |
| `docs/01-requirements/advanced-edition/2026-06-21-enterprise-training-path-closure-plan.md`          |     1 | advanced_traceability_context | Enterprise training closure context only.                                   |
| `docs/01-requirements/use-cases/use-case-catalog.md`                                                 |     1 | current_use_case_catalog      | Use-case mapping; not runtime pass.                                         |
| `docs/01-requirements/traceability/*.md`                                                             |   150 | traceability_mixed            | Decisions, matrices, historical context, and gate boundaries.               |
| `docs/superpowers/specs/*advanced-edition*.md`                                                       |     3 | source_spec                   | Advanced source specs.                                                      |
| `docs/superpowers/plans/*advanced-edition*.md`                                                       |    11 | source_plan_handoff           | Advanced source index, handoff, and implementation planning references.     |
| `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`                                    |     1 | governance_only               | Requirement reading and conflict handling process.                          |
| `docs/04-agent-system/sop/advanced-edition-*.md`                                                     |     4 | advanced_governance_only      | Advanced evidence, boundary, maintenance, and Cost Calibration gates.       |
| `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`                    |     1 | architecture_source           | Edition-aware authorization architecture SSOT.                              |
| `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`      |     1 | evidence_only_current         | Current AI generation baseline evidence.                                    |
| `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`                  |     1 | evidence_only_current         | AI generation goal completion evidence.                                     |
| `docs/05-execution-logs/evidence/2026-07-02-ai-generation-deterministic-acceptance-matrix-rollup.md` |     1 | evidence_only_current         | Deterministic AI generation rollup evidence.                                |

## Authority Order

1. `AGENTS.md` and `docs/04-agent-system/sop/requirement-ssot-reading-governance.md` define execution and reading
   discipline. They are not business requirement SSOT by themselves.
2. `docs/01-requirements/00-index.md` is the standard/shared root.
3. Relevant standard modules and stories define stable standard MVP behavior when no newer traceability decision
   overrides them.
4. `docs/01-requirements/advanced-edition/00-index.md`, relevant advanced modules/stories, edition-aware authorization
   requirements, and ADR-007 are required for advanced, edition, authorization, quota, organization, and role-separated
   work.
5. The latest applicable traceability decision overrides older rows for its declared scope. For AI出题 / AI组卷, the
   current entry is `2026-07-02-ai-generation-requirements-ssot-alignment.md`.
6. Catalogs and matrices provide coverage, use-case, and technical landing maps. They do not prove runtime pass.
7. Execution logs are evidence and history only. They do not supersede requirement documents unless their decision is
   promoted into `docs/01-requirements/` or traceability.

## Current Domain Map

| Domain item                      | Primary requirement source                                                                                     | Current reading                                                                                 |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `standard_user_auth`             | `STD-REQ-01`, standard story 01                                                                                | Standard account, session, `redeem_code`, `personal_auth`, `org_auth` baseline.                 |
| `question_paper`                 | `STD-REQ-02`, paper count/type policy                                                                          | Formal `question`/`paper` remain system of record; AI output must not direct-write formal data. |
| `student_experience`             | `STD-REQ-03`                                                                                                   | Practice, `mock_exam`, `exam_report`, and `mistake_book` remain standard learning surfaces.     |
| `ai_scoring`                     | `STD-REQ-04`                                                                                                   | AI scoring/explanation/hint are standard AI/RAG abilities; Provider execution remains gated.    |
| `rag_knowledge`                  | `STD-REQ-05`                                                                                                   | RAG and knowledge base semantics remain standard; OCR stays product non-goal.                   |
| `admin_ops`                      | `STD-REQ-06`, role-separated alignment                                                                         | `ops_admin`, `content_admin`, and organization workspaces must remain role-separated.           |
| `advanced_authorization`         | Advanced edition index, edition-aware authorization requirements, ADR-007                                      | `effectiveEdition` is service-computed; UI visibility is not an authorization boundary.         |
| `personal_ai_generation`         | `ADV-MOD-03`, advanced AI generation scope clarification, current AI generation SSOT alignment                 | Advanced personal learners use discoverable `AI训练` with AI出题 and AI组卷.                    |
| `organization_employee_ai`       | `ADV-MOD-03`, edition-aware authorization requirements, current AI generation SSOT alignment                   | Advanced organization employees use learner AI under organization authorization context.        |
| `organization_ai_generation`     | `ADV-MOD-08`, role-separated alignment, current AI generation SSOT alignment                                   | Advanced organization admins use organization-owned AI出题 and AI组卷.                          |
| `organization_training`          | `ADV-MOD-04`, role-separated alignment                                                                         | Advanced organization training is separate from formal platform `question` and `paper`.         |
| `organization_analytics`         | `ADV-MOD-05`                                                                                                   | Organization summaries are advanced scope; export/raw-sensitive viewers remain gated.           |
| `ops_quota`                      | `ADV-MOD-06`, advanced ops config contract                                                                     | Quota governance exists as requirement; production quota values remain Cost Calibration gated.  |
| `retention_log_governance`       | `ADV-MOD-07`, advanced ops config contract                                                                     | Logs and retention must remain redacted and controlled.                                         |
| `role_separation`                | `2026-06-24-role-separated-mvp-requirement-alignment.md`, `role-experience-fulfillment-matrix.md`              | Requirement routing is current; runtime Pass is not claimed by docs-only alignment.             |
| `content_ai_draft_review`        | `STD-REQ-06`, `ADV-STORY-05`, advanced AI generation scope clarification, current AI generation SSOT alignment | Content backend AI出题/AI组卷 are draft/review entries, not direct formal writes.               |
| `ai_generation_current_baseline` | `2026-07-02-ai-generation-requirements-ssot-alignment.md` plus current baseline evidence                       | Old residuals must be compared against the 2026-07-02 baseline before being reopened.           |

## Conflict Register

| Conflict id   | Conflict                                                                                          | Resolution                                                                                                                 | Decision status          |
| ------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `CFX-DOC-001` | Standard base MVP excludes AI generation, while advanced/content AI generation is in later scope. | Preserve standard-only non-goal; use later unified standard/advanced traceability for approved AI generation scope.        | resolved_by_source_order |
| `CFX-DOC-002` | Older content-admin blocked wording conflicts with current content AI entries.                    | Treat older blocked rows as historical or superseded by 2026-06-23 clarification and 2026-07-02 AI baseline.               | resolved_by_source_order |
| `CFX-DOC-003` | Catalog/use-case `blocked_until_gate_approved` wording can be misread as current AI blocker.      | Catalog rows remain provenance/gate context; the current AI baseline is the first read for AI出题 / AI组卷 residuals.      | resolved_by_source_order |
| `CFX-DOC-004` | Role matrix release-blocked rows coexist with current AI generation completion evidence.          | AI generation goal completion is current for that bounded scope; role-separated release/runtime Pass is still not claimed. | resolved_by_scope        |
| `CFX-DOC-005` | OCR is a product non-goal, while local OCR/resource preprocessing evidence exists.                | Product OCR remains a non-goal; local preprocessing/import evidence does not approve an app OCR feature.                   | resolved_by_scope        |
| `CFX-DOC-006` | Older dependency/Provider baseline wording can imply stale AI SDK readiness.                      | ADR-006 and current dependency governance remain the dependency baseline; Provider execution still needs task scope.       | resolved_by_adr_order    |
| `CFX-DOC-007` | Historical full-acceptance or release-readiness wording can be overread.                          | Current baseline explicitly does not claim release readiness, final Pass, production usability, or Cost Calibration.       | resolved_by_scope        |

Decision required: none for this documentation SSOT alignment audit.

## Omission Risk Review

| Check                                                                                   | Result | Notes                                                                                        |
| --------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| Standard requirement root, modules, and stories covered by manifest.                    | pass   | Counts recorded; targeted reads used current root and relevant module/story surfaces.        |
| Advanced index, modules, stories, source specs, and plans covered by manifest.          | pass   | Counts recorded; advanced source hierarchy preserved.                                        |
| Edition-aware authorization and ADR-007 included.                                       | pass   | Required for `edition`, `effectiveEdition`, `personal_auth`, `org_auth`, and `auth_upgrade`. |
| Role-separated alignment and role experience matrix included.                           | pass   | Requirement routing and runtime-gate non-claim both recorded.                                |
| Current AI generation baseline included before older quick acceptance/MML residuals.    | pass   | 2026-07-02 AI SSOT and evidence are current first-read sources for AI出题 / AI组卷.          |
| Capability and use-case catalogs treated as traceability, not runtime pass.             | pass   | Catalog stale blocker risk is resolved by authority order.                                   |
| Execution logs treated as evidence-only.                                                | pass   | Evidence supports baseline; it does not define new requirements by itself.                   |
| Source, test, runtime, DB, Provider, dependency, schema, and deployment paths left out. | pass   | This audit is docs-only and does not create implementation approval.                         |
| Redaction boundary preserved.                                                           | pass   | Only counts, statuses, source ids, and summarized decision categories are recorded.          |

## Normalization Recommendation

No mandatory Stage 2 documentation rewrite is required before a code/implementation alignment audit. The current
source order is sufficient if future tasks cite this audit or the latest relevant traceability document first.

Optional cleanup may be useful later if agents continue to misread historical `release_blocked`, `gap`, or
`blocked_until_gate_approved` rows as current blockers after the 2026-07-02 baseline.

## Next Recommended Work

Recommended next task: `requirements-code-implementation-alignment-audit-2026-07-02`.

That task should be read-only unless explicitly approved otherwise, and should map code surfaces to the domain map above
without claiming release readiness, final Pass, production usability, Cost Calibration, or runtime pass.
