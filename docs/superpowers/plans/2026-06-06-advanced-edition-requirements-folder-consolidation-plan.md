# Advanced Edition Requirements Folder Consolidation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans if this plan is later approved for execution. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Define a safe docs-only plan for collecting advanced edition requirements under `docs/01-requirements` without moving or invalidating existing source documents.

**Architecture:** Treat `docs/01-requirements` as the stable requirements reading surface and keep `docs/superpowers/specs` plus `docs/superpowers/plans` as the advanced edition decision and handoff source-of-truth. Future consolidation must add derived index/module/story documents that link back to their authoritative sources instead of relocating source files.

**Tech Stack:** Markdown documentation, existing agent state files, Prettier formatting, and local validation commands only.

---

## Current State

Standard edition requirements are already organized under:

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

Advanced edition source documents currently live under:

- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-to-implementation-handoff.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-doc-source-of-truth-index.md`

Advanced edition implementation planning is already split across seven Phase 31 plan documents:

- `docs/superpowers/plans/2026-06-06-advanced-edition-auth-context-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-ai-task-domain-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-personal-ai-generation-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-analytics-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-ops-auth-quota-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-retention-log-governance-implementation-plan.md`

## Consolidation Principle

Do not move existing files in the first consolidation pass.

The safe model is:

```text
docs/01-requirements/
  00-index.md                         existing standard edition index
  modules/                            existing standard edition modules
  stories/                            existing standard edition stories
  advanced-edition/                   future derived reading surface
    00-index.md                       future advanced edition reading index
    modules/                          future derived module requirement summaries
    stories/                          future derived user story summaries
```

The future `advanced-edition` documents should be derived summaries and traceability maps. They must link back to the authoritative advanced edition specs and handoff documents.

## Source-Of-Truth Rule

Future consolidation must preserve these authority levels:

| Layer                                        | Authority                                                                                      |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Standard edition requirements                | `docs/01-requirements/00-index.md`, `modules/`, and `stories/`                                 |
| Advanced edition original decisions          | `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`                   |
| Advanced edition MVP acceptance source       | `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`                       |
| Advanced edition ops contract                | `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`                    |
| Advanced edition implementation handoff      | `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-to-implementation-handoff.md` |
| Advanced edition requirement reading surface | future `docs/01-requirements/advanced-edition/**` derived docs                                 |

Future derived docs must not override source documents. If a conflict is found, record it as a follow-up decision instead of silently rewriting requirements.

## Proposed Future Module Map

Future advanced edition modules should use project terminology and remain aligned with the Phase 31 plan split:

| Future Module File                                                             | Primary Source                                                                           |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`    | advanced edition MVP requirements, ops config contract, auth context implementation plan |
| `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`           | advanced edition MVP requirements, AI task domain implementation plan                    |
| `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`   | advanced edition MVP requirements, personal AI generation implementation plan            |
| `docs/01-requirements/advanced-edition/modules/04-organization-training.md`    | advanced edition MVP requirements, organization training implementation plan             |
| `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`   | advanced edition MVP requirements, organization analytics implementation plan            |
| `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`  | ops config contract, ops authorization/quota implementation plan                         |
| `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md` | ops config contract, retention/log governance implementation plan                        |

## Proposed Future Story Map

Future advanced edition stories should describe user-visible acceptance flows, not implementation tasks:

| Future Story File                                                                             | Role / Capability                                                                                                               |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`             | personal user uses AI question and AI `paper` generation                                                                        |
| `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`              | organization admin creates organization training                                                                                |
| `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`         | employee answers organization training and statistics are visible as summaries                                                  |
| `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md` | platform operations governs `authorization`, `redeem_code`, and quota                                                           |
| `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`          | AI generated content stays separate from formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and `mistake_book` |
| `docs/01-requirements/advanced-edition/stories/epic-06-retention-log-governance.md`           | `audit_log`, `ai_call_log`, retention, and redaction behavior are governed                                                      |

## Blocked Work

This plan does not approve:

- moving or deleting existing requirement documents;
- changing standard edition `modules/` or `stories/` content;
- code-stage queue seeding;
- product code, schema, migration, API, service, UI, tests, e2e, scripts, dependency, package, lockfile, env/secret, provider, staging/prod/cloud/deploy, payment, or external-service work;
- Cost Calibration Gate execution.

Cost Calibration Gate remains blocked pending fresh explicit approval.

## Future Execution Tasks

### Task 1: Create Advanced Edition Requirement Reading Surface

**Files:**

- Create: `docs/01-requirements/advanced-edition/00-index.md`
- Create: `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- Create: `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- Create: `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- Create: `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- Create: `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- Create: `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- Create: `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- Create: `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- Create: `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- Create: `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- Create: `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- Create: `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- Create: `docs/01-requirements/advanced-edition/stories/epic-06-retention-log-governance.md`
- Modify: `docs/01-requirements/00-index.md`

- [ ] **Step 1: Create derived advanced edition index**

  Document the advanced edition reading order, source-of-truth rules, and links to derived modules and stories.

- [ ] **Step 2: Create derived module summaries**

  For each module, summarize scope, non-goals, terminology, source links, and acceptance boundaries.

- [ ] **Step 3: Create derived story summaries**

  For each story, summarize actor, goal, acceptance scenario, formal content separation rule, evidence requirement, and source links.

- [ ] **Step 4: Link advanced edition entry from the root requirements index**

  Add a small section to `docs/01-requirements/00-index.md` that points to `docs/01-requirements/advanced-edition/00-index.md`.

- [ ] **Step 5: Validate**

  Run:

  ```powershell
  git diff --check
  node .\node_modules\prettier\bin\prettier.cjs --check docs\01-requirements\00-index.md docs\01-requirements\advanced-edition\00-index.md docs\01-requirements\advanced-edition\modules\*.md docs\01-requirements\advanced-edition\stories\*.md
  Select-String -Path docs\01-requirements\advanced-edition\**\*.md -Pattern 'authorization','paper','mock_exam','redeem_code','audit_log','ai_call_log','Cost Calibration Gate remains blocked'
  ```

  Expected: all commands exit 0.

### Task 2: Review Advanced Edition Requirement Reading Surface

**Files:**

- Create: `docs/05-execution-logs/audits-reviews/YYYY-MM-DD-advanced-edition-requirements-folder-consolidation-review.md`
- Create: `docs/05-execution-logs/evidence/YYYY-MM-DD-advanced-edition-requirements-folder-consolidation-review.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [ ] **Step 1: Review source preservation**

  Confirm no original standard edition or advanced edition source document was moved or deleted.

- [ ] **Step 2: Review terminology**

  Confirm derived docs use `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, and `ai_call_log`.

- [ ] **Step 3: Review blocked work**

  Confirm derived docs do not approve Cost Calibration Gate execution, provider work, env/secret work, staging/prod/cloud/deploy work, payment, external-service work, or code-stage queue seeding.

- [ ] **Step 4: Record review evidence**

  Record changed files, validation command outputs, and residual risk.

## Recommendation

Proceed with Task 1 only after explicit approval. This current plan intentionally stops before creating `docs/01-requirements/advanced-edition/**`.
