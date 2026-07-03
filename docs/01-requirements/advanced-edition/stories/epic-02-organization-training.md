# Epic 02 Organization Training

## Actor

`org_advanced_admin` with valid advanced `org_auth`.

## Goal

Create organization training for employees inside the authorized organization scope.

## Acceptance Scenario

1. `org_advanced_admin` enters the organization training management surface.
2. The system checks organization scope and effective `authorization`.
3. The admin creates organization training content.
4. Employees in scope can answer the assigned training.
5. Training content remains separate from formal `paper` and formal `mock_exam` flows.
6. `org_advanced_admin` can discover and manage organization training inside the organization workspace.
7. `org_standard_admin` cannot manage organization training by menu visibility or direct URL entry.
8. `org_advanced_employee` can discover assigned `企业训练` after login.
9. `org_standard_employee` cannot discover or answer `企业训练`.
10. `org_advanced_admin` creates training through a four-step wizard: source, configuration, publish settings,
    preview/publish.
11. Source options are platform paper snapshot, organization AI result, and organization-private manual grouping/manual questions.
12. `mock_exam` is not offered as a training source.
13. Publish scope supports current organization node only or current plus descendant nodes.
14. Drafts can be discarded; published versions are immutable and can only be changed by copying to a new draft.
15. Takedown blocks unstarted and in-progress answers while preserving submitted read-only summaries.
16. One employee can submit once per published version.
17. `answerDeadlineAt` is optional; when absent, answerability lasts until takedown.

## Data Boundary

- Organization training must not publish formal `paper`.
- Training answers must not become formal `practice` or `mock_exam` `answer_record` without a later approved formal flow.
- Training must not create formal `mock_exam`, formal `exam_report`, or formal `mistake_book`.
- Governed admin operations should be traceable through `audit_log` where required.
- Training list/detail/write actions must stay within the scoped `organization` and must not expose global operations data.
- Platform paper import copies stem, options, `standard_answer`, and `analysis` into an organization snapshot and never writes back to the source paper.
- Organization AI output copied into training follows `evidence_status` gating: `none` blocks publish, `weak` requires explicit confirmation.

## Source Links

- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`

Cost Calibration Gate remains blocked pending fresh explicit approval.
