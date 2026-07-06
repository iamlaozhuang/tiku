# 2026-07-06 AI Generation Recontract Requirements Materialization Evidence

## Scope

- Task id: `ai-generation-recontract-requirements-materialization-2026-07-06`
- Branch: `codex/ai-generation-recontract-requirements-materialization-2026-07-06`
- Mode: docs-only requirement materialization.
- Product source changed: false.
- Tests changed: false.
- Schema/migration/seed changed: false.
- Dependency/package/lockfile changed: false.
- DB connection or mutation executed: false.
- Provider call/configuration executed: false.
- Browser/dev server/e2e executed: false.
- Staging/prod/deploy executed: false.
- Cost Calibration executed or claimed: false.

## Redaction Boundary

Recorded only document paths, role labels, aggregate decision summaries, file-change classes, and command results.

Not recorded:

- credentials;
- sessions, cookies, or tokens;
- env values or connection strings;
- raw DB rows or internal numeric ids;
- PII or private fixture values;
- plaintext `redeem_code`;
- Provider payloads;
- raw prompts;
- raw AI output;
- full generated questions, papers, materials, resources, or chunks;
- screenshots, traces, or raw DOM.

## Read Gate

Read before materialization:

- `AGENTS.md`
- project state and task queue
- code taste commandments
- ADR-001 through ADR-007
- standard and advanced requirement indexes
- edition-aware authorization requirements
- advanced AI task, learner AI generation, organization training, and organization AI generation modules
- formal content separation story
- standard question/paper, student experience, and RAG modules
- AI generation 2026-06-23, 2026-07-02, and 2026-07-05 traceability baselines
- UI/UX baseline, role/auth/training/ops decision package, and current-thread reconciliation ledger
- latest 2026-07-06 AI runtime, personal standard fixture, organization/content loop, Provider, residual, and queue evidence

## Materialized Files

| File                                                                                                        | Purpose                                                           |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`     | New AI出题 / AI组卷 product contract overlay.                     |
| `docs/01-requirements/00-index.md`                                                                          | Adds the new overlay to the standard requirement reading entry.   |
| `docs/01-requirements/advanced-edition/00-index.md`                                                         | Adds the new overlay to the advanced AI generation reading entry. |
| `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`                | Adds later-contract refinement note.                              |
| `docs/05-execution-logs/task-plans/2026-07-06-ai-generation-recontract-requirements-materialization.md`     | Task plan.                                                        |
| `docs/05-execution-logs/evidence/2026-07-06-ai-generation-recontract-requirements-materialization.md`       | This evidence.                                                    |
| `docs/05-execution-logs/audits-reviews/2026-07-06-ai-generation-recontract-requirements-materialization.md` | Adversarial audit review.                                         |
| `docs/04-agent-system/state/project-state.yaml`                                                             | Current-task governance record.                                   |
| `docs/04-agent-system/state/task-queue.yaml`                                                                | Active queue terminal task record.                                |

## Decision Coverage

| Decision                                                                                               | Coverage                                                      |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| AI出题 means complete question draft generation                                                        | Recorded in new traceability overlay.                         |
| AI组卷 means plan plus local formal-question selection                                                 | Recorded in new traceability overlay and requirement indexes. |
| Platform formal source is `question.status = available`                                                | Recorded.                                                     |
| Enterprise question bank v1 is published, not taken-down same-organization training question snapshots | Recorded.                                                     |
| AI-generated drafts are excluded from AI组卷 sources by default                                        | Recorded.                                                     |
| Role matrix for four eligible roles                                                                    | Recorded.                                                     |
| Standard role denial remains                                                                           | Recorded.                                                     |
| AI出题 default 3 and max 10                                                                            | Recorded.                                                     |
| AI组卷 default 30 and max 80                                                                           | Recorded.                                                     |
| Source insufficiency allows explainable degradation, not AI-invented questions                         | Recorded.                                                     |
| Knowledge coverage is structured selection plus optional supplement                                    | Recorded.                                                     |
| Paper container required after AI组卷                                                                  | Recorded.                                                     |
| Learner/employee UI uses tabs, not submit-as-mode buttons                                              | Recorded.                                                     |
| Organization admin UI workbench included                                                               | Recorded.                                                     |
| Content admin AI组卷 creates a reviewable paper draft container                                        | Recorded.                                                     |
| User-visible UI must be all Chinese and non-technical                                                  | Recorded.                                                     |

## Three-Round Self-Check

### Round 1: Requirement Completeness

Status: pass.

Checklist:

- all user-confirmed decisions covered;
- all four eligible roles covered;
- all quantity, source, degradation, knowledge, container, and UI decisions covered;
- script-assisted keyword check found expected contract anchors for AI出题, AI组卷, role labels, quantities, source
  labels, degradation, knowledge coverage, paper container, organization admin UI, content admin UI, and follow-up
  packets.

### Round 2: Contradiction And Supersession

Status: pass.

Checklist:

- old Provider-generated `paper_draft` runtime evidence not claimed as new contract implementation;
- 2026-07-02 and 2026-07-05 baselines preserved;
- standard roles remain denied;
- release/staging/prod/Cost Calibration non-claims preserved;
- new overlay explicitly says old Provider-generated `paper_draft` evidence is historical baseline only.

### Round 3: Implementation Readiness And Redaction

Status: pass.

Checklist:

- follow-up tasks split;
- no source implementation performed;
- redaction boundary preserved;
- no sensitive values or full content recorded;
- `git status --short` before validation showed only allowed docs/state paths plus new task files.

## Validation Results

| Command                                                                                                                       | Result                                                        |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `npm.cmd exec -- prettier --write --ignore-unknown <scoped changed docs/state files>`                                         | pass                                                          |
| `npm.cmd exec -- prettier --check --ignore-unknown <scoped changed docs/state files>`                                         | pass                                                          |
| `git diff --check`                                                                                                            | pass                                                          |
| blocked-path diff guard for `.env*`, dependency, source, test, schema, migration, seed, e2e, build, runtime, and report paths | pass; no output                                               |
| `npm.cmd run typecheck`                                                                                                       | pass                                                          |
| `npm.cmd run lint`                                                                                                            | pass                                                          |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-recontract-requirements-materialization-2026-07-06`             | pass; 9 files scanned; Cost Calibration Gate remained blocked |

## Non-Claims

- No product implementation is claimed.
- No old runtime acceptance evidence is reused as proof for the new AI组卷 plan-and-select contract.
- No release readiness, final Pass, production usability, staging/prod readiness, Provider readiness, broad model quality,
  or Cost Calibration claim is made.
