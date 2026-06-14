# Unified Standard And Advanced Use Case Audit Plan

## Purpose

This plan defines how to merge the standard edition MVP requirement surface and the advanced edition requirement surface into one user-case-driven audit system.

It is a planning contract only. It does not approve product code, API, service, UI, test, schema, migration, dependency, env/secret, provider, staging/prod/cloud/deploy, payment, external-service, PR, force-push, or Cost Calibration Gate work.

## Source Set

Standard edition sources:

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`

Standard edition audit sources:

- `docs/05-execution-logs/evidence/2026-05-25-phase-12-mvp-requirements-runtime-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-requirement-audit-catalog.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-requirement-traceability-matrix.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-total-requirement-audit-report.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-19-finding-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-19-dedup-severity-taxonomy.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-19-coverage-matrix-review.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-19-follow-up-queue-alignment.md`

Advanced edition sources:

- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-to-implementation-handoff.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-doc-source-of-truth-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/*.md`
- `docs/01-requirements/advanced-edition/stories/*.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-56-advanced-edition-coverage-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-current-state-checkpoint-and-implementation-audit.md`

## Organizing Principle

Use one canonical capability catalog, then bind every capability to user use cases and technical landing rows.

The standard edition defines the foundation. The advanced edition may add capability, scope, governance, privacy, quota, retention, or AI-task behavior, but it must not rewrite the standard edition semantics for formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, `mistake_book`, `authorization`, `redeem_code`, `audit_log`, or `ai_call_log`.

## Identifier Model

| Artifact      | Format                   | Example                | Rule                                            |
| ------------- | ------------------------ | ---------------------- | ----------------------------------------------- |
| Capability    | `CAP-{domain}-{nn}`      | `CAP-AUTH-01`          | One canonical capability definition.            |
| Use case      | `UC-{domain}-{nn}`       | `UC-STUDENT-03`        | One user goal with actor, flow, and acceptance. |
| Technical row | `UTM-{use_case_id}-{nn}` | `UTM-UC-STUDENT-03-01` | One implementation landing row.                 |
| Finding       | `UF-{use_case_id}-{nnn}` | `UF-UC-AI-02-001`      | One evidence-backed issue.                      |
| Conflict      | `CFX-{domain}-{nnn}`     | `CFX-AUTH-001`         | One standard/advanced semantic conflict.        |
| Blocked gate  | `BG-{domain}-{nnn}`      | `BG-AI-001`            | One governance-blocked item.                    |

Domains:

- `AUTH`: user, `session`, `authorization`, `personal_auth`, `org_auth`, `redeem_code`, `organization`, `employee`.
- `CONTENT`: `material`, `question`, `question_option`, `scoring_point`, `knowledge_node`, `tag`, `paper`, `paper_section`, `paper_asset`.
- `STUDENT`: `practice`, `mock_exam`, `answer_record`, `exam_report`, `mistake_book`.
- `AI`: `ai_scoring`, `ai_explanation`, `ai_hint`, `kn_recommendation`, personal AI generation, AI task lifecycle, quota.
- `RAG`: `resource`, `knowledge_base`, `chunk`, `embedding`, `citation`, `evidence_status`.
- `ORG`: organization portal, organization training, employee answer statistics, organization analytics.
- `OPS`: `audit_log`, `ai_call_log`, `model_provider`, `model_config`, `prompt_template`, retention and governance.

## Edition Status Model

Every capability and use case must carry exactly one primary edition status:

| Status                   | Meaning                                                                       |
| ------------------------ | ----------------------------------------------------------------------------- |
| `standard_required`      | Required for standard edition MVP closure.                                    |
| `advanced_extension`     | Adds behavior on top of standard edition without changing standard semantics. |
| `shared_foundation`      | Shared infrastructure or contract needed by both editions.                    |
| `blocked_by_governance`  | Product requirement exists, but execution requires explicit future approval.  |
| `future_non_goal`        | Explicitly outside the current release scope.                                 |
| `duplicate_or_inherited` | Covered by another canonical capability or inherited from another finding.    |

Secondary tags may be used for `provider`, `env_secret`, `schema_migration`, `dependency`, `staging_deploy`, `payment`, `external_service`, `e2e`, `cost_calibration`, `privacy`, `audit`, and `formal_content_separation`.

## Capability Catalog Shape

The next task must create `docs/01-requirements/traceability/capability-catalog.md` with these required columns:

| Column                  | Required content                                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| `capabilityId`          | Stable `CAP-*` id.                                                                                              |
| `name`                  | Short capability name using project terms.                                                                      |
| `domain`                | One of the domains above.                                                                                       |
| `editionStatus`         | One primary edition status.                                                                                     |
| `standardSource`        | Standard edition source rows or `null`.                                                                         |
| `advancedSource`        | Advanced edition source rows or `null`.                                                                         |
| `canonicalDefinition`   | One definition that both editions can reference.                                                                |
| `extensionRule`         | Advanced behavior, or `null`.                                                                                   |
| `nonGoalRule`           | Explicit non-goal, or `null`.                                                                                   |
| `blockedGate`           | Required approval gate, or `null`.                                                                              |
| `ownerEntity`           | Main data owner, for example `user`, `organization`, or `platform`.                                             |
| `formalContentBoundary` | Whether the capability may write formal `question`/`paper`/`practice`/`mock_exam`/`exam_report`/`mistake_book`. |
| `auditRequirement`      | `audit_log`, `ai_call_log`, both, or `null`.                                                                    |

## Use Case Catalog Shape

The use case catalog must be organized by user goal, not by code module. It should be created at `docs/01-requirements/use-cases/use-case-catalog.md`.

Each use case row must include:

- `useCaseId`
- `actor`
- `goal`
- `editionStatus`
- `capabilityIds`
- `preconditions`
- `mainFlow`
- `exceptionFlow`
- `permissionBoundary`
- `dataWrites`
- `auditRequirement`
- `aiCallLogRequirement`
- `standardAcceptance`
- `advancedAcceptance`
- `governanceBlocks`
- `testExpectation`
- `evidenceExpectation`

Initial use case groups:

| Group                                    | Required use case coverage                                                                                                                                                              |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User and authorization loop              | Registration, login, `session`, `redeem_code`, `personal_auth`, `org_auth`, `auth_upgrade`, effective `authorization`, account disable, organization disable, employee transfer/unbind. |
| Content production loop                  | `material`, `question`, `question_option`, `scoring_point`, `knowledge_node`, `tag`, `paper`, `paper_section`, publish, archive, copy, formal content separation.                       |
| Student learning loop                    | Authorized paper selection, `practice`, `mock_exam`, `answer_record`, `exam_report`, `mistake_book`, termination on invalid access.                                                     |
| AI learning loop                         | `ai_scoring`, `ai_explanation`, `ai_hint`, `kn_recommendation`, personal AI request, AI task lifecycle, generated result history, formal adoption gate.                                 |
| RAG knowledge loop                       | `resource`, Markdown conversion, `knowledge_base`, `chunk`, `embedding`, `citation`, `evidence_status`, permission filtering.                                                           |
| Organization training and analytics loop | Organization admin portal, organization training draft/publish/takedown, employee answer once per version, organization analytics, privacy summaries.                                   |
| Operations governance loop               | `audit_log`, `ai_call_log`, `model_config`, `prompt_template`, quota, retention, redaction, hard blocked gates.                                                                         |

## Technical Landing Matrix Shape

The technical matrix must be created at `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`.

Required columns:

| Column                 | Required content                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `useCaseId`            | Link to use case catalog.                                                                |
| `capabilityIds`        | One or more `CAP-*` ids.                                                                 |
| `editionStatus`        | Primary edition status.                                                                  |
| `uiSurface`            | Page/component path or `not_found`.                                                      |
| `apiSurface`           | REST route or Server Action path, or `not_found`.                                        |
| `serviceSurface`       | Service file or `not_found`.                                                             |
| `repositorySurface`    | Repository file or `not_found`.                                                          |
| `modelSchemaSurface`   | Contract/model/schema path, or `blocked_by_governance` when schema work is not approved. |
| `testSurface`          | Unit/integration/e2e path or `not_found`.                                                |
| `evidenceSurface`      | Evidence/audit record path.                                                              |
| `auditLogRequirement`  | Required `audit_log` behavior.                                                           |
| `aiCallLogRequirement` | Required `ai_call_log` behavior.                                                         |
| `status`               | `implemented`, `partial`, `missing`, or `blocked_by_governance`.                         |
| `findingIds`           | Linked findings or `null`.                                                               |

## Conflict Prevention Rules

1. Advanced edition can extend standard edition only through `advanced_extension`; it must not change standard edition acceptance rules.
2. Formal content writes remain owned by existing formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and `mistake_book` flows.
3. AI generated learning content and organization training records must stay outside formal content unless an explicit review/adoption path exists.
4. Enterprise summary visibility is not personal content ownership. Organization admins may see summaries only where allowed by organization scope and privacy rules.
5. `authorization` context must be service-owned. UI menu hiding is not a security boundary.
6. API JSON fields must remain `camelCase`; database and internal config keys must remain `snake_case`.
7. External URLs and evidence must use public identifiers, not numeric ids.
8. Evidence must never record prompt, raw AI input/output, provider payload, secret, token, database URL, cleartext `redeem_code`, employee subjective answer text, or customer/customer-like private content.
9. Cost Calibration Gate, provider, env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema/migration, destructive DB, and e2e remain blocked unless a later task explicitly approves them.
10. A finding must attach to at least one `useCaseId`, one `capabilityId`, and one technical landing row.

## Consistency Checks

Later consistency audit tasks must run these checks before any implementation queue seeding:

- capability without use case;
- use case without capability;
- use case without any technical landing row;
- technical surface without use case ownership;
- finding without use case or capability;
- standard and advanced sources defining conflicting semantics for the same entity;
- advanced extension writing formal content without adoption gate;
- governance-blocked item marked as implementable;
- test expectation missing for an implemented or partial use case;
- evidence expectation missing for an audited use case.

## Serial Task Plan

The unified audit should proceed in this order:

1. `unified-standard-advanced-input-freeze-and-source-index`: freeze the standard and advanced source set, including Phase 12/18/19 and post-batch-180 checkpoint records.
2. `unified-standard-advanced-capability-catalog`: create the canonical capability catalog and edition status model.
3. `unified-standard-advanced-edition-delta-matrix`: map standard foundation, advanced extensions, non-goals, and blocked gates.
4. `unified-standard-advanced-use-case-catalog`: create the user-goal use case catalog.
5. `unified-standard-advanced-technical-landing-matrix`: map use cases to UI/API/service/repository/schema/test/evidence surfaces.
6. `unified-standard-advanced-consistency-audit`: run orphan, conflict, formal-content, privacy, blocked-gate, and evidence-surface checks.
7. `unified-standard-advanced-domain-audit-auth-content`: audit user/auth and content-production loops.
8. `unified-standard-advanced-domain-audit-student-org`: audit student learning, organization training, and organization analytics loops.
9. `unified-standard-advanced-domain-audit-ai-rag-ops`: audit AI, RAG, operations governance, logs, retention, and redaction loops.
10. `unified-standard-advanced-finding-taxonomy-and-queue-seeding`: deduplicate findings, assign severity, define canonical findings, and propose implementation queue entries.

Each task must be docs-first, branch-scoped, evidence-backed, and stop if it needs any blocked capability outside its declared allowedFiles and commands.

## Validation Model

Planning and audit tasks should use docs-only validation unless a later task explicitly approves runtime or e2e validation.

Minimum validation:

- `git diff --check`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- Module Run v2 precommit and closeout readiness where the task is registered in `task-queue.yaml`

Code-stage tasks, when later approved, must add scoped lint/typecheck/unit/e2e/build commands according to their risk and allowed files.

## Handoff

The next recommended task is `unified-standard-advanced-input-freeze-and-source-index`. It should not audit code yet. Its only job is to freeze the exact source set, create a source index, and record which standard and advanced sources are authoritative for later catalog construction.
