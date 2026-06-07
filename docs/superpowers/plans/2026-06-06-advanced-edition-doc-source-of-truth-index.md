# Advanced Edition Document Source Of Truth Index

## Purpose

This document is the governance index for the advanced edition MVP before code-stage queue seeding. It identifies the documents that later agents must read, the order in which they should read them, and the blocked work that must not be inferred from the requirements handoff.

This index is docs-only. It does not approve product code, schema, migration, API, service, UI, dependency, script, env/secret, provider, staging/prod/cloud/deploy, payment, external-service, or Cost Calibration Gate execution.

## Source Of Truth

| Layer                               | Document                                                                                       | Role                                                                                                                                         |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Agent discipline                    | `AGENTS.md`                                                                                    | Naming, queue discipline, evidence, branch, approval, and blocked work rules.                                                                |
| Technical taste                     | `docs/03-standards/code-taste-ten-commandments.md`                                             | Required quality baseline before any code or delivery claim.                                                                                 |
| Architecture                        | `docs/02-architecture/adr/`                                                                    | Accepted architecture decisions, including runtime layering and environment isolation.                                                       |
| Original advanced edition decisions | `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`                   | Original decision source for edition model, AI generation, organization training, quota, retention, and logs.                                |
| MVP acceptance source               | `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`                       | Main loop, role boundaries, acceptance scenarios, traceability, and non-goals.                                                               |
| Operations configuration contract   | `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`                    | Configuration keys, scopes, default-value governance, retention, `audit_log`, `ai_call_log`, and Cost Calibration Gate boundary.             |
| Requirements handoff                | `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-to-implementation-handoff.md` | Handoff package, traceability final review, acceptance matrix, blocked work register, and code-stage decomposition model.                    |
| Reading surface maintenance         | `docs/04-agent-system/sop/advanced-edition-requirements-reading-surface-maintenance.md`        | Rules for keeping source documents and `docs/01-requirements/advanced-edition/**` synchronized without moving standard edition requirements. |
| Queue registry                      | `docs/04-agent-system/state/task-queue.yaml`                                                   | Authoritative task state and dependencies.                                                                                                   |
| Project state                       | `docs/04-agent-system/state/project-state.yaml`                                                | Cross-session recovery state and next recommended action.                                                                                    |

## Read Order

1. Read `AGENTS.md`, `code-taste-ten-commandments.md`, and all ADRs before editing.
2. Read the MVP requirements and ops config contract to recover product and governance boundaries.
3. Read the requirements-to-implementation handoff for traceability, blocked work, and future code-stage decomposition constraints.
4. Read `project-state.yaml` and `task-queue.yaml` to select only the next pending task whose dependencies are complete.
5. Read the previous task's evidence before starting any new task in the same batch.

## Advanced Edition MVP Boundary

The MVP main loop remains:

- advanced personal AI question and AI `paper` generation;
- organization admin creates organization training;
- employee answer statistics;
- operations governance for `authorization`, `redeem_code`, quota, `audit_log`, and `ai_call_log`.

Formal content separation remains active:

- AI generated learning content must not automatically write to formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`.
- Organization training answer statistics must not be mixed into formal `exam_report` or formal `mistake_book`.
- Adoption into formal `question` or `paper` draft flows requires explicit review and formal content governance.

## Blocked Work

The following remain blocked:

- Cost Calibration Gate execution.
- Provider cost measurement, model selection measurement, sample task measurement, or real provider calls.
- Production quota package default point values.
- Behavior cost point values.
- Production concurrency, timeout, retry, idempotency, and peak threshold defaults.
- env/secret creation, reading, or modification.
- staging/prod/cloud/deploy work.
- payment and external-service integration.
- physical hard-delete executor.
- raw sensitive content viewer.
- employee statistics export or organization aggregate export.
- code-stage queue seeding.

Cost Calibration Gate remains blocked pending fresh explicit approval.

## Terminology Guardrail

Future tasks must use project terms:

- `authorization`, `personal_auth`, `org_auth`, `auth_upgrade`
- `redeem_code`
- `question`, `paper`, `paper_section`
- `practice`, `mock_exam`, `answer_record`, `exam_report`, `mistake_book`
- `organization`, `employee`
- `audit_log`, `ai_call_log`
- `model_provider`, `model_config`, `prompt_template`
- `evidence_status`, `citation`

Avoid `license`, `exam_paper`, and unregistered abbreviations.

## Queue Use

Code-stage queue seeding remains paused. The current Phase 32 batch is a docs-only governance hardening batch. Each productive task must be followed by its paired review task. Only after review passes and evidence is complete may the short branch be committed, merged to `master`, pushed to `origin/master`, and cleaned up.
