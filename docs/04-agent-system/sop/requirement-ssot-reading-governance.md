# Requirement SSOT Reading Governance SOP

## Status

Active for task planning, requirement alignment, implementation, mechanism hardening, and acceptance evidence review.

This SOP defines how an agent reads requirement SSOT before changing docs, mechanism scripts, tests, or product code. It
does not approve product implementation, schema or migration work, dependency changes, Provider work, env/secret access,
staging/prod/cloud/deploy work, payment, external-service work, or Cost Calibration Gate execution.

## Purpose

Prevent tasks from using chat memory, stale execution logs, or partial acceptance notes as requirements.

Every non-read-only task must make the requirement source explicit before implementation. The task plan must show:

- which requirement SSOT files were read;
- which traceability decisions are active;
- how the task maps to requirements, roles, modules, or acceptance rows;
- which execution logs were read only as evidence or historical context;
- whether any conflict requires a docs-only requirement alignment task first.

## Reading Order

Use this order unless the task queue explicitly narrows the task to a smaller read-only diagnostic:

1. `docs/01-requirements/00-index.md`.
2. Relevant standard requirement modules under `docs/01-requirements/modules/`.
3. For advanced edition, edition, quota, AI generation, organization training, or authorization work:
   `docs/01-requirements/advanced-edition/00-index.md`.
4. For `authorization`, `personal_auth`, `org_auth`, `redeem_code`, `effectiveEdition`, `edition`, or `auth_upgrade`
   work: `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md` and ADR-007.
5. Latest relevant traceability decisions and matrices under `docs/01-requirements/traceability/`.
6. Relevant user stories under `docs/01-requirements/stories/` and
   `docs/01-requirements/advanced-edition/stories/`.
7. Relevant use-case matrices under `docs/01-requirements/use-cases/`, when the flow has a use-case matrix.
8. Execution logs under `docs/05-execution-logs/` only after the requirement SSOT read list is established.

For role-separated MVP repair or acceptance tasks, the minimum traceability read list is:

- the latest `docs/01-requirements/traceability/*role-separated-mvp-requirement-alignment.md`;
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.

## Task Plan Required Sections

For `implementation`, `docs_requirement_alignment`, `docs_only`, and `mechanism_hardening` tasks, the task plan must
include these sections:

- `## SSOT Read List`;
- `## Requirement Decision Map`;
- `## Requirement Mapping`;
- `## Evidence-Only Sources`;
- `## Conflict Check`.

For `acceptance_runtime_walkthrough` tasks, the task plan must include `## SSOT Read List`; the evidence or audit review
may use `Role Mapping Result` or `Acceptance Mapping Result` instead of `Requirement Mapping Result`.

`read_only`, terminal diagnostic, and tasks with no changed files may skip hard requirement mapping, but they should still
state which durable source was inspected when they report findings.

## Evidence-Only Boundary

Files under `docs/05-execution-logs/` are valid evidence and historical sources. They are not by themselves requirement
SSOT.

Execution logs can be used to:

- recover task history;
- understand validation outputs;
- identify observed runtime gaps;
- locate the owner decision that triggered a later requirement alignment task.

Execution logs must not be used to:

- bypass `docs/01-requirements/`;
- define new implementation scope without a requirement document or traceability decision;
- claim final acceptance Pass;
- supersede modules, advanced modules, traceability matrices, or ADRs.

If an execution log contains a new requirement, that requirement must first land in `docs/01-requirements/` or a
traceability decision document before implementation begins.

## Conflict Handling

When sources conflict:

1. Prefer the newest applicable traceability decision when it explicitly updates a module or matrix.
2. Prefer module and advanced module documents for stable behavior definitions when no newer traceability decision
   overrides them.
3. Prefer ADRs for architecture boundaries and source-of-truth ownership.
4. Do not resolve unclear product behavior inside an implementation task.
5. If the latest traceability and module documents cannot decide the conflict, create a docs-only requirement alignment
   task and stop implementation.

## Gate Mapping

Pre-commit hardening should fail tasks when:

- `## SSOT Read List` is missing for task kinds that require it;
- the task plan omits `docs/01-requirements/00-index.md`;
- the task plan references only `docs/05-execution-logs/` and no `docs/01-requirements/` source;
- advanced edition scope omits `docs/01-requirements/advanced-edition/00-index.md`;
- authorization or edition scope omits
  `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`;
- role-separated scope omits an explicit queue `requirementAlignmentPath` or the latest role-separated traceability
  alignment plus `role-experience-fulfillment-matrix.md`;
- evidence and audit files omit `Requirement Mapping Result`, `Role Mapping Result`, or `Acceptance Mapping Result` when
  the task kind requires mapping evidence.

## Forbidden Claims

Do not claim:

- runtime behavior from docs-only alignment;
- requirement coverage from execution logs alone;
- advanced edition, `authorization`, `redeem_code`, `org_auth`, or `personal_auth` behavior without mapped SSOT;
- role-separated MVP final Pass while role runtime evidence remains blocked or failed;
- staging, production, Provider, payment, dependency, schema, migration, or Cost Calibration readiness from this SOP.
