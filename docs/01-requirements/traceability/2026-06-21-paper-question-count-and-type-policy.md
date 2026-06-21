# Paper Question Count And Type Policy

**Date:** 2026-06-21
**Decision status:** product policy recorded; enforcement implementation and runtime verification are deferred to approved follow-up tasks.
**Related findings:** `RF-0621-04`, `RF-0621-05`, `RX-06`

## Decision

This task closes the discovered `paper` question-count and legacy question-type-alias questions as a product policy. Follow-up approval on 2026-06-21 selected option A, confirming this policy as the future implementation direction. It does not change validators, services, schema, migrations, UI, tests, or runtime behavior.

The product policy is:

1. A draft `paper` may contain zero questions while content_admin is composing it.
2. A published `paper` must contain at least 1 and at most 100 `paper_question` rows.
3. The 100-question limit applies to the whole `paper`, across all `paper_section` and `question_group` rows.
4. Historical or externally supplied papers above 100 questions require an explicit product exception package and performance acceptance before import or publication.
5. Formal `question` and `paper_question.question_snapshot` data must use only canonical `question_type` values.
6. Legacy aliases are compatibility inputs only: `multiple_choice` maps to `multi_choice`, and `subjective` maps to `short_answer`.
7. API responses, formal persisted content, new imports, authoring UI, and audit output must not emit legacy aliases after enforcement work is approved.
8. The confirmed option A does not approve raising or lowering the 100-question limit, importing over-limit `paper` data, removing legacy alias compatibility, or implementing enforcement code without a separately approved follow-up task.

## Canonical Question Types

The canonical `question_type` values remain:

- `single_choice`
- `multi_choice`
- `true_false`
- `fill_blank`
- `short_answer`
- `case_analysis`
- `calculation`

No new `question_type` value is introduced by this policy.

## Question Count Rules

| state                 | allowed count | rule                                                                                    |
| --------------------- | ------------- | --------------------------------------------------------------------------------------- |
| `draft`               | 0 to 100      | Empty draft is allowed for composition; exceeding 100 is invalid.                       |
| `published`           | 1 to 100      | Publish should be blocked outside this range.                                           |
| `archived`            | existing data | Archived records retain historical shape but cannot publish again.                      |
| exception import      | product gate  | Requires explicit exception, performance evidence, and audit record.                    |
| student practice/mock | 1 to 100      | Runtime should reject starting a practice or mock_exam from an invalid published paper. |

## Performance Acceptance Policy

The future implementation must validate the 100-question policy before claiming runtime closure:

1. Service-level validation must prove create/update/publish rejects 101 questions and accepts 100 questions.
2. Student `practice` and `mock_exam` start flows must be covered with a 100-question paper fixture.
3. Mobile-first UI should render one active question at a time for student answering surfaces, with summary/list navigation designed for scanning rather than full long-form rendering.
4. Admin paper composition should show count feedback before publish and avoid full-page layout shifts when a paper approaches 100 questions.
5. Runtime proof that requires dev server, browser, Playwright/e2e, database seed, or full fresh-data verification remains deferred until separately approved.

## Legacy Alias Policy

| alias             | canonical value | current compatibility decision                                                                   |
| ----------------- | --------------- | ------------------------------------------------------------------------------------------------ |
| `multiple_choice` | `multi_choice`  | Keep read/input compatibility only in student practice/mock_exam legacy paths until deprecation. |
| `subjective`      | `short_answer`  | Keep read/input compatibility only in student practice/mock_exam legacy paths until deprecation. |

Compatibility boundaries:

1. New content authoring must not create aliases.
2. New API responses must return canonical values.
3. Persistence cleanup must prove whether any alias exists in stored snapshots before removing compatibility.
4. Compatibility removal must not happen before two consecutive validation runs show zero alias snapshots and all student runtime services reject alias creation paths.
5. The earliest allowed removal target is after 2026-08-31, and only after product owner approval for the exact removal task.

## Follow-Up Implementation Packages

1. Validator/service package for `paper` draft, publish, copy, and question add/update flows.
2. Student runtime guard package for `practice` and `mock_exam` start flows.
3. Admin UI count-feedback package for `paper` composition.
4. Alias inventory package for stored snapshots and API output scans.
5. Alias deprecation package with migration or compatibility-removal plan.
6. Runtime verification package for 100-question service and UI acceptance after browser/dev-server/database gates are approved.

## Blocked Without Fresh Approval

- Source, test, e2e, schema, migration, seed, database, script, package, lockfile, dependency, `.env`, Provider, browser/dev-server runtime, deploy, PR, force-push, payment, external-service, or Cost Calibration Gate work.
- Any exception allowing more than 100 questions in a published `paper`.
- Any immediate removal of legacy alias compatibility.
