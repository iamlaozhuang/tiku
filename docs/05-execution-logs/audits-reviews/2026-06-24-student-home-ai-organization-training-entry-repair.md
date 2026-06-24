# Audit Review: student-home-ai-organization-training-entry-repair-2026-06-24

## Status

- Current status: ready_for_closeout after local validation.
- Fresh closeout approval is recorded for fast-forward merge to `master`, push to `origin/master`, and deletion of the merged short branch.
- No standard/advanced MVP final Pass is claimed.

## SSOT Read List

- docs/01-requirements/00-index.md
- docs/01-requirements/modules/03-student-experience.md
- docs/01-requirements/advanced-edition/00-index.md
- docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md
- docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md
- docs/01-requirements/advanced-edition/modules/04-organization-training.md
- docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md
- docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md
- docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md
- docs/01-requirements/traceability/role-experience-fulfillment-matrix.md

## Requirement Mapping Result

- R5: `personal_advanced_student` now has a learner-home `AI训练` entry when existing authorization capability permits AI generation.
- R5: `personal_standard_student` remains without an enabled advanced AI entry when capability evidence is absent.
- R6: `org_advanced_employee` now has learner-home `AI训练` and `企业训练` entries when existing authorization capability permits both.
- R6: `org_standard_employee` remains without `AI训练` and `企业训练` entries when capability evidence is absent.

## Role Mapping Result

- Covered roles: `personal_standard_student`, `personal_advanced_student`, `org_standard_employee`, `org_advanced_employee`.
- Deferred roles: `org_standard_admin`, `org_advanced_admin`, `content_admin`, `ops_admin`.
- Backend workspace, content backend, enterprise backend, and ops backend repair packages remain separate follow-up candidates.

## Audit Findings

- No schema, migration, dependency, `.env*`, Provider, Cost Calibration, staging/prod, payment, external service, browser/e2e, or script changes were made.
- Authorization remains service-owned; learner home only uses existing `/api/v1/authorizations` capability flags for discoverability.
- Authorization-context fetch failure is handled fail-closed: advanced entries are hidden, and learner paper loading can continue.
- `AI组卷` is visible as a learner-facing action on the AI route but remains disabled in this package; no Provider execution or new paper generation route was added.
- Evidence is redacted to command names, pass/fail status, and test counts only; it does not include tokens, cookies, localStorage values, database rows, prompts, provider payloads, generated AI output, employee answers, or plaintext `redeem_code`.

## Validation Summary

- RED observed before implementation: expected missing learner-home links and AI page product labels.
- GREEN observed after implementation: 2 files / 20 tests passed.
- Additional RED/GREEN observed for authorization-context fetch failure: before the fix the learner home rendered the generic error state; after the fix `tests/unit/student-home-ui.test.ts` passed 13 tests.
- Full focused unit validation: 3 files / 24 tests passed.
- Lint and typecheck passed.
- Prettier initially warned only on newly created Markdown evidence/audit files; the files were mechanically formatted and the final check is rerun during closeout.
- Final Prettier check, `git diff --check`, and Module Run v2 pre-commit hardening passed.
