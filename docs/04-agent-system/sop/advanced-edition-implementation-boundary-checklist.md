# Advanced Edition Implementation Boundary Checklist

## Purpose

This SOP defines the governance checklist that must be reviewed before any future advanced edition implementation task is accepted. It is a docs-only boundary document and does not seed code-stage tasks.

## Entry Conditions

Future implementation work may only be considered after all of these are true:

- requirements source-of-truth documents are current;
- `project-state.yaml` and `task-queue.yaml` identify the active task and dependency chain;
- the task has a task plan and evidence path;
- the task declares `allowedFiles` and `blockedFiles`;
- the task confirms whether Cost Calibration Gate is relevant and, if relevant, remains blocked unless fresh explicit approval is recorded;
- the task declares whether provider, env/secret, staging/prod/cloud/deploy, payment, or external-service work is out of scope.

## Terminology Boundary

Implementation tasks must use project terms consistently:

- user access and entitlement concepts use `authorization`, `personal_auth`, `org_auth`, and `redeem_code`;
- content concepts use `question`, `paper`, `paper_section`, `question_group`, `question_option`, and `paper_asset`;
- answering flows use `practice`, `mock_exam`, `answer_record`, `exam_report`, and `mistake_book`;
- organization flows use `organization`, `org_tier`, and `employee`;
- governance logs use `audit_log` and `ai_call_log`;
- AI and RAG concepts use `model_provider`, `model_config`, `prompt_template`, `knowledge_base`, `chunk`, `citation`, and `evidence_status`.

Do not introduce alternate English identifiers for registered project terms.

## Scope Boundary

Before implementation begins, the task plan must explicitly state:

- whether it changes product code, schema, migration, API, service, UI, tests, e2e, scripts, dependency, package, lockfile, env/secret, provider, staging/prod/cloud/deploy, payment, or external-service files;
- whether any high-risk category requires human approval;
- whether dependency introduction is required and, if so, the approval evidence path;
- whether database migration or authorization model work is included and, if so, the approval evidence path;
- whether data retention, `audit_log`, or `ai_call_log` evidence requires redaction review.

If any required approval is missing, the task must remain pending or blocked.

## Formal Content Separation

Use formal content separation before implementation:

- requirements describe user-visible intent and acceptance criteria;
- plans describe implementation approach and verification commands;
- SOPs describe reusable mechanism rules;
- evidence records command outputs, changed files, approval boundary, and redaction status;
- audits-reviews record independent findings and residual risk;
- task queue entries record execution state, dependencies, allowed files, blocked files, and validation commands.

Do not mix speculative implementation details into requirements, and do not treat evidence as a replacement for verification.

## Evidence Boundary

Implementation evidence must follow `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`.

Evidence may record public identifiers, counts, timestamps, status values, validation summaries, and redacted `audit_log` or `ai_call_log` summaries. Evidence must not record prompt, provider payload, secret, token, cleartext `redeem_code`, employee subjective answer text, or raw AI generated content that should not be visible to organization admin or ordinary operations views.

## Blocked Gate Boundary

Cost Calibration Gate remains blocked until a fresh explicit approval records the allowed action. The blocked gate includes provider cost measurement, real provider calls, env/secret setup, staging/prod/cloud/deploy actions, payment actions, and external-service integration.

## Pre-Implementation Review Checklist

Before any future implementation task is started, confirm:

- project terminology is compliant;
- `allowedFiles` and `blockedFiles` are concrete;
- approval requirements are explicit;
- Cost Calibration Gate status is explicit;
- evidence redaction requirements are explicit;
- verification commands are concrete and local;
- docs-only tasks do not change product behavior;
- code-stage queue seeding has explicit approval before it occurs.

## Non-Goals

This SOP does not approve implementation work, code-stage queue seeding, provider calls, env/secret work, staging/prod/cloud/deploy work, payment work, external-service integration, or Cost Calibration Gate execution.
