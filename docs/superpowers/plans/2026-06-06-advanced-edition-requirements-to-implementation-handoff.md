# Advanced Edition Requirements To Implementation Handoff

## Purpose

This handoff package closes the current requirements-stage hardening pass for the advanced edition MVP and prepares later code implementation queueing.

This document is not implementation approval. It does not approve product code, schema, migration, API, service, UI, dependency, script, env/secret, staging/prod/cloud/deploy, payment, external-service, provider-cost, or real provider work.

## Source Of Truth

Later implementation planning and code tasks should treat these documents as the source set:

| Layer                                  | Source                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------ |
| Original advanced edition decisions    | `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`         |
| MVP requirements and acceptance source | `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`             |
| Operations configuration contract      | `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`          |
| Implementation planning breakdown      | `docs/superpowers/plans/2026-06-06-advanced-edition-mvp-implementation-breakdown.md` |
| Detailed implementation plans          | The seven Phase 31 advanced edition implementation plans listed below.               |
| Queue source                           | `docs/04-agent-system/state/task-queue.yaml`                                         |

ADR constraints remain active:

- Next.js and TypeScript monolith.
- `route handlers / server actions -> service -> repository -> model`.
- REST responses use `{ code, message, data, pagination? }`.
- API JSON fields use `camelCase`.
- External URLs must use public identifiers, not numeric ids.
- `dev`, `staging`, and `prod` stay isolated; `staging` and `prod` work require later explicit approval.

## Completed Detailed Implementation Plans

| #   | Plan                                                                          | Status | Primary Handoff                                                                                                                                      |
| --- | ----------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `2026-06-06-advanced-edition-auth-context-implementation-plan.md`             | done   | Effective `authorization` context, role capability flags, `personal_auth` / `org_auth` separation.                                                   |
| 2   | `2026-06-06-advanced-edition-ai-task-domain-implementation-plan.md`           | done   | Provider-agnostic AI task lifecycle, status model, cancellation, retry, redacted `audit_log` / `ai_call_log`.                                        |
| 3   | `2026-06-06-advanced-edition-personal-ai-generation-implementation-plan.md`   | done   | Personal AI question and AI `paper` learning content outside formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and `mistake_book`. |
| 4   | `2026-06-06-advanced-edition-organization-training-implementation-plan.md`    | done   | Organization training draft, publish, takedown, copy-to-new-draft, employee answer once per version, summary privacy.                                |
| 5   | `2026-06-06-advanced-edition-organization-analytics-implementation-plan.md`   | done   | Organization admin summary formulas, employee privacy boundary, quota and formal learning summaries, no export.                                      |
| 6   | `2026-06-06-advanced-edition-ops-auth-quota-implementation-plan.md`           | done   | Operations `authorization`, `redeem_code`, quota package, quota ledger, purchase-style grant, bonus grant, `manual_adjustment`.                      |
| 7   | `2026-06-06-advanced-edition-retention-log-governance-implementation-plan.md` | done   | Retention, `expired_hidden`, recovery, hard-delete approval, controlled snapshot exception, `audit_log`, `ai_call_log`, evidence redaction.          |

## Traceability Final Review

| Requirement Area                                | Requirement Source                                      | Implementation Plan Coverage                                     | Result  |
| ----------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------- | ------- |
| Advanced capability and role boundary           | MVP Role And Data Boundary Matrix                       | Authorization context plan                                       | covered |
| Personal AI question generation                 | MVP main loop and AI generated content governance       | AI task domain + personal AI generation plans                    | covered |
| Personal AI `paper` generation                  | MVP main loop and AI `paper` scope                      | AI task domain + personal AI generation plans                    | covered |
| Organization training creation and lifecycle    | MVP organization training acceptance chain              | Organization training plan                                       | covered |
| Employee answer once per training version       | Supplemental acceptance assertions                      | Organization training plan                                       | covered |
| Organization admin statistics summaries         | MVP employee statistics and privacy rules               | Organization analytics plan                                      | covered |
| Operations `authorization` and quota management | MVP operations acceptance chain and ops config contract | Ops authorization/quota plan                                     | covered |
| `redeem_code` governance                        | MVP role matrix and operations acceptance chain         | Ops authorization/quota plan                                     | covered |
| Quota reservation/finalization boundary         | AI task and quota requirements                          | AI task domain + ops authorization/quota plans                   | covered |
| Retention and `expired_hidden`                  | Ops config contract retention decisions                 | Retention/log governance plan                                    | covered |
| `audit_log` and `ai_call_log` retention         | Ops config contract log decisions                       | Retention/log governance plan                                    | covered |
| Redaction and evidence safety                   | MVP evidence requirements and ops config contract       | All plans, primarily retention/log governance                    | covered |
| Existing formal content separation              | MVP boundary matrix                                     | Personal AI generation + organization training + analytics plans | covered |

No blocking traceability gap remains in the requirements-stage handoff set.

## Acceptance Scenario Matrix

| Chain                                        | Must Validate In Code Stage                                                                                                                                             | Primary Plan             |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Advanced personal AI question generation     | Valid advanced `personal_auth`, quota precheck, AI task creation, generated result owner visibility, no formal `question` write.                                        | Personal AI generation   |
| Advanced personal AI `paper` generation      | Generated learning `paper` remains outside formal `paper` and formal `mock_exam`; owner-only access and redacted task summary.                                          | Personal AI generation   |
| Organization admin creates training          | Valid advanced `org_auth`, organization scope, draft lifecycle, publish immutability, copy-to-new-draft, no formal content write.                                       | Organization training    |
| Employee answers training                    | Employee visibility by organization scope, draft save before submit, one official submit per version, takedown historical summary only.                                 | Organization training    |
| Organization admin views summaries           | Training completion, score summaries, employee summaries, quota summaries, formal learning summaries, no item-level or answer-level detail.                             | Organization analytics   |
| Operations manages `authorization` and quota | Purchase-style grant, bonus grant, `manual_adjustment`, append-only ledger, `redeem_code` redaction, `audit_log`.                                                       | Ops authorization/quota  |
| Retention and logs                           | 90-day AI learning retention, 90-day organization training draft retention, long-term published training, 30-day recovery, 1095-day `audit_log`, 180-day `ai_call_log`. | Retention/log governance |

Horizontal failure scenarios to keep in every relevant implementation task:

- Missing, expired, or wrong-scope `authorization`.
- Standard edition attempting advanced capability.
- Quota insufficient.
- Missing production configuration causing `production_enablement_blocked` or `configuration_required`.
- Organization scope mismatch.
- Duplicate training submission.
- Takedown or `expired_hidden` ordinary access blocked.
- Redaction failure in DTO, `audit_log`, `ai_call_log`, evidence, or operations summary.

## Implementation-Stage Subtask Decomposition Model

The seven detailed plans should not become seven large code commits. They should be converted into small code-stage queue tasks. A practical first estimate:

| Plan                     | Estimated Code Subtasks | Expected Split                                                                                                                           |
| ------------------------ | ----------------------: | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Authorization context    |                       4 | contract/model, resolver service, repository/adapters, tests/evidence                                                                    |
| AI task domain           |                       6 | contract/model, validators, repository boundary, service lifecycle, logging boundary, tests/evidence                                     |
| Personal AI generation   |                       6 | content contract/model, validators, service, mapper, optional route/Web, tests/evidence                                                  |
| Organization training    |                       8 | contract/model, validators, draft service, publish/version/takedown, employee answer, mapper/privacy, optional route/Web, tests/evidence |
| Organization analytics   |                       6 | formula model, read repository, service, mapper/privacy, optional route/Web, tests/evidence                                              |
| Ops authorization/quota  |                       7 | contract/model, validators, ledger repository, operations service, mapper/redaction, optional route/Web, tests/evidence                  |
| Retention/log governance |                       6 | contract/model, visibility service, recovery/hard-delete approval guard, log redaction/retention, optional route/Web, tests/evidence     |

Initial total estimate: 43 code-stage subtasks.

Additional queue items may be required if implementation reveals separate approval needs:

- schema/migration tasks;
- data backfill or cleanup tasks;
- dependency approval tasks;
- security/redaction review tasks;
- e2e acceptance tasks;
- Cost Calibration Gate after future explicit approval.

## Recommended Code-Stage Queueing Order

1. Queue schema/migration discovery and approval package only if the first implementation task proves schema work is required.
2. Start with authorization context because every advanced capability consumes it.
3. Implement AI task domain before personal AI generation and organization training generation.
4. Implement personal AI generation before organization training only where shared content validation is reused.
5. Implement organization training before organization analytics because analytics depends on training answer and scope snapshots.
6. Implement ops authorization/quota before final quota-enabled AI task execution.
7. Implement retention/log governance before acceptance closure because every main flow needs visibility and redaction evidence.

## Blocked Work Register

The following remain blocked and must not be introduced as side effects of code-stage queueing:

- Cost Calibration Gate execution.
- Provider cost measurement.
- Real provider calls.
- Production quota package default point values.
- Behavior cost point values.
- Production concurrency, timeout, retry, idempotency, and peak threshold defaults.
- env/secret creation, reading, or modification.
- staging/prod/cloud/deploy work.
- payment and external-service integration.
- Physical hard-delete executor.
- Raw sensitive content viewer.
- Employee statistics export.
- Organization aggregate export.
- Writing AI or organization training content directly into formal `practice`, `mock_exam`, `exam_report`, or `mistake_book`.

## Terminology And Naming Review

Confirmed required terms for implementation queueing:

- `authorization`, `personal_auth`, `org_auth`, `auth_upgrade`
- `redeem_code`
- `question`, `paper`, `paper_section`
- `practice`, `mock_exam`, `answer_record`, `exam_report`, `mistake_book`
- `organization`, `employee`
- `audit_log`, `ai_call_log`
- `model_provider`, `model_config`, `prompt_template`
- `evidence_status`, `citation`

Implementation tasks must avoid non-project names and keep API JSON fields in `camelCase`, internal config keys in `snake_case`, and API paths under `/api/v1/`.

## Readiness Conclusion

The requirements-stage handoff is ready for code-stage queue seeding after the user approves moving from requirements work into implementation queueing.

No remaining requirements-stage blocker was found for the seven advanced edition detailed plans. Cost Calibration Gate remains separate and blocked pending future explicit approval.
