# Advanced Edition Requirements Reading Surface Maintenance

## Purpose

This SOP defines how to keep the advanced edition requirement source documents and the derived reading surface under `docs/01-requirements/advanced-edition/**` synchronized.

It is docs-only. It does not approve product code, schema, migration, API, service, UI, tests, e2e, scripts, dependency, package, lockfile, env/secret, provider, staging/prod/cloud/deploy, payment, external-service, Cost Calibration Gate execution, or code-stage queue seeding.

## Document Roles

Authoritative source documents:

- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-to-implementation-handoff.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-doc-source-of-truth-index.md`

Derived reading surface:

- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/*.md`
- `docs/01-requirements/advanced-edition/stories/*.md`

Standard edition requirements remain in their existing locations:

- `docs/01-requirements/modules/*.md`
- `docs/01-requirements/stories/*.md`

Do not move or rename standard edition requirement files as part of advanced edition maintenance unless a separate approved task explicitly scopes that change.

## Conflict Rule

If the derived reading surface conflicts with the authoritative source documents, the source documents remain authoritative until a follow-up governance task resolves the conflict.

The reading surface may summarize and route readers, but it must not introduce new product commitments, acceptance scenarios, default values, provider behavior, env/secret requirements, staging/prod/cloud/deploy requirements, payment behavior, external-service behavior, or Cost Calibration Gate decisions.

## Maintenance Triggers

Run this SOP when a task changes or reviews any of the following:

- advanced edition MVP main loop;
- role or data boundary matrix;
- `authorization`, `personal_auth`, `org_auth`, `redeem_code`, quota, `audit_log`, or `ai_call_log` governance;
- AI question generation or AI `paper` generation requirements;
- organization training lifecycle or employee answer statistics;
- formal content separation involving `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`;
- retention, `expired_hidden`, hard-delete approval, controlled snapshot exception, or evidence redaction;
- Cost Calibration Gate blocked status;
- source-of-truth document inventory.

## Update Workflow

For every maintenance task:

1. Read `AGENTS.md`, `code-taste-ten-commandments.md`, ADRs, `project-state.yaml`, and `task-queue.yaml`.
2. Identify whether the task changes an authoritative source, a derived reading surface file, or both.
3. If an authoritative source changes, update the derived reading surface in the same task when the change affects module summaries, story summaries, cross-cutting boundaries, or source inventory.
4. If the derived reading surface cannot be updated safely in the same task, record a follow-up docs-only queue item before closing the task.
5. Preserve source document links in `docs/01-requirements/advanced-edition/00-index.md`.
6. Preserve the root requirements index link to `docs/01-requirements/advanced-edition/00-index.md`.
7. Record evidence that no standard edition source file was moved or deleted.
8. Record evidence that Cost Calibration Gate remains blocked when the task touches AI, quota, provider, or operations governance.

## Required Checks

Maintenance evidence should include:

- `git diff --check`;
- Prettier check for changed Markdown and YAML files;
- expected advanced edition file count under `docs/01-requirements/advanced-edition/**`;
- `Test-Path` checks for authoritative source documents;
- `Select-String` checks for required terms: `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, `ai_call_log`;
- forbidden term check for `license` and `exam_paper` in the derived advanced edition reading surface;
- blocked gate wording check for `Cost Calibration Gate remains blocked`;
- changed file inventory proving the task did not touch product code or blocked files.

## Drift Review

A drift review is required when any of these signals appears:

- source documents mention a module or story that is missing from the reading surface;
- the reading surface references a source document that no longer exists;
- a source document changes acceptance criteria but the reading surface remains unchanged;
- the reading surface contains a term outside the project glossary;
- `project-state.yaml` points to a stale branch, SHA, plan, or evidence path after merge/push;
- a task proposes code-stage queue seeding without explicit approval.

## Non-Goals

This SOP does not approve implementation work, code-stage queue seeding, provider calls, env/secret work, staging/prod/cloud/deploy work, payment work, external-service integration, Cost Calibration Gate execution, or moving standard edition requirements.
