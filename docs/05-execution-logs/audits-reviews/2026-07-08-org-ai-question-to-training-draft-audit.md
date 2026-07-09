# 2026-07-08 Org AI Question To Training Draft Audit

## Requirement Mapping Result

- Mapped to `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`: organization AI出题 result remains organization-owned and Provider/formal content writes stay out of scope.
- Mapped to `docs/01-requirements/advanced-edition/modules/04-organization-training.md`: enterprise training draft and publish flows use organization-owned training snapshots, not formal platform question/paper writes.
- Mapped to `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`: this branch closes the AI出题-to-training-draft visibility step only.
- Mapped to `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`: AI组卷 materialization remains explicitly deferred to the next short branch.

## Scope Review

- Confirmed branch scope remains Stage 3 only: organization AI question result to enterprise training question draft.
- No AI paper assembly, paper draft materialization, Provider execution, DB/schema, migration, seed, fixture, package, or lockfile changes.
- Changed files are limited to admin AI result persistence/local contract, organization training detail read model/route/UI, focused tests, and execution evidence.

## Boundary Review

- Organization training draft details are only available when a structured safe snapshot exists.
- Drafts without snapshot keep `detailAvailability = unavailable` and `recommendedAction = continue_configuration`.
- Resolver is gated by organization workspace, organization owner, same organization public id, and source metadata `organization_ai_result/question`.
- Existing organization admin visible-scope check remains in the read model before data is returned.
- Published versions remain read-only; publish still writes only enterprise training version snapshots through existing service.

## Sensitive Data Review

- No raw Provider payload, raw prompt, raw AI output, raw DOM, session, cookie, token, env value, DB URL, raw DB row, internal numeric id, or full customer material is recorded in evidence.
- DTO exposes public ids already used by existing API contracts; no database numeric id was added to external responses.
- Tests use synthetic content only.

## Regression Review

- Standard/advanced authorization boundaries were not changed.
- Content admin formal review/adoption path was not changed.
- Personal AI and employee AI training routes were not changed.
- AI组卷 is intentionally untouched and remains Stage 4.

## Verification Summary

- RED tests observed before implementation.
- Targeted tests with adjacent admin AI generation UI: 6 files, 181 tests passed.
- `corepack pnpm@10.26.1 run typecheck`: passed.
- `corepack pnpm@10.26.1 run lint`: passed.
- `git diff --check`: passed.
- Module Run v2 hardening script did not apply because this temporary Stage 3 task id is not materialized in `task-queue.yaml`; this is recorded in evidence.
