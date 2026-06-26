# Formal paper draft composition adoption approval package

Task id: `formal-paper-draft-composition-adoption-approval-package-2026-06-26`

## Decision status

Execution approval status: `APPROVED_FOR_SEPARATE_TDD_AND_LATER_CAPPED_LOCAL_ROUTE_SMOKE`.

Approval source: `current_user_fresh_five_step_serial_goal_approval_2026_06_26`.

This package approves only the next scoped local implementation and later capped local route smoke for content admin
generated `paper` result composition into an editable formal `paper` draft. It does not approve formal publish,
student-visible content, Provider/Cost execution, staging/prod, payment, external service, deployment, release readiness,
or final Pass.

## Composition decision

Approved for later tasks:

- A reviewed content admin generated `paper` result may be adopted into a formal `paper` draft that includes
  `paper_section` and `paper_question` composition.
- Composition must remain draft-only. The result must stay editable and unpublished.
- Composition must use existing formal writer/service boundaries rather than direct table writes wherever practical.
- Evidence may report only redacted counts and public-id presence states.

Not approved:

- Direct publish of the composed `paper`.
- Student-visible content exposure.
- Organization-scoped generated content adoption.
- Direct DB seed, fixture, cleanup delete, or raw DB mutation outside the approved route/service path.

## Question source strategy

Approved strategy: `mixed_existing_or_companion_question_draft_via_adapter`.

The implementation should prefer existing formal `question` draft references when a reviewed generated paper item already
names an eligible `question` public id.

When the reviewed generated paper contains embedded reviewed question draft payloads instead of existing question
references, the adapter may create companion formal `question` drafts through the existing formal question writer and then
attach those created question drafts to the formal `paper` draft through the existing paper composition writer/service.

This approval is intentionally limited:

- No raw generated question or paper body may be written to evidence.
- Companion question creation is allowed only inside the governed content admin formal adoption flow.
- The route smoke must cap companion question draft creation to at most 3 items.
- The route smoke must prove at least 1 `paper_section` and at least 1 `paper_question` when it executes.

## Contract decision

Approved for the next TDD task:

- Extend `admin-ai-generation-formal-draft-adapter` contract to accept a composed paper payload with draft metadata,
  `paper_section` entries, and `paper_question` entries.
- Extend the paper writer port with composition capability, expected to reuse existing `createPaper` and
  `addQuestionToDraftPaper` service behavior.
- Add focused adapter/service tests for:
  - existing question reference composition;
  - companion question draft creation before `paper_question` attachment;
  - writer failure rollback/blocked result behavior at the adapter contract level;
  - redacted response shape and no full content return.

Repository contract extension is not required by default because existing `paper-draft-service` and
`paper-draft-repository` already expose `paper_section` / `paper_question` composition through
`addQuestionToDraftPaper`. If source TDD discovers an atomicity or contract gap that cannot be closed through existing
ports, it must stop and open a separate repository-contract approval package before live DB execution.

## Local DB and route smoke decision

No local DB work is approved for this package or the next TDD task.

If the TDD task passes, a later route-integration local smoke task is approved with these limits:

- Local DB route smoke target: local dev only.
- Provider/model call: 0.
- Provider credential read: blocked.
- Content paper setup route POST: max 1, Provider disabled.
- Formal adoption route POST: max 1.
- Sanitized eligible-source lookups: max 2.
- Companion question draft creations through the route/service path: max 3.
- `paper_section` rows created/updated through the route/service path: max 3.
- `paper_question` rows created through the route/service path: max 3.
- Evidence: redacted command status, counts, public-id presence states, and blocked-gate flags only.

Schema/migration is not approved because the current schema already has `paper_section` and `paper_question`. If a future
task finds schema drift, it must stop for a separate migration approval package.

## Still blocked

- Provider/model call or Provider configuration.
- Provider credential/env/secret access.
- Cost Calibration Gate or cost readiness.
- Formal publish or student-visible content.
- Staging/prod/cloud/deploy/release readiness.
- Payment or external service.
- Dependency or lockfile change.
- Schema/migration/drizzle changes.
- Direct DB seed, fixture, destructive operation, cleanup delete, or raw DB mutation.
- PR, force push, or final acceptance Pass.
