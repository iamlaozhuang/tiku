# Advanced Edition Organization Training Requirements

## Purpose

Define how eligible advanced organization admins create organization training and how employees answer it.

## Source Documents

- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`

## Scope

- `org_advanced_admin` creates organization training inside valid advanced `org_auth` and organization scope.
- Employees answer organization training assigned to their organization context.
- Organization training content remains separate from formal `paper` and formal `mock_exam` flows.
- Organization training operations produce governed summaries and may write `audit_log` where required.
- `org_standard_employee` must not see `企业训练`.
- `org_advanced_employee` must see assigned `企业训练` when valid advanced `org_auth` covers the employee's `organization`.
- `org_standard_admin` can view scoped employee roster/status and organization authorization/status only; platform
  operations owns employee import and mutation in the first release. `org_standard_admin` cannot manage organization
  training.
- `org_advanced_admin` can manage organization training inside its scoped `organization`.
- Organization admin surfaces are first-class organization workspaces, not system operations workspaces with an organization filter bolted on.

## Acceptance Boundaries

- `org_advanced_admin` can manage training for its organization scope.
- Employees can answer assigned training.
- Standard organization employees and standard organization admins cannot access training through menu visibility or manual URL entry.
- Advanced organization training entry must be discoverable for eligible admins and employees; URL-only access fails acceptance.
- Organization scope filters and service checks must enforce `organization` boundaries for all training list/detail/write actions.
- Employee answers are not copied into formal `answer_record` for formal `practice` or `mock_exam` unless a later approved formal flow exists.
- Organization training does not publish formal `paper`.

## Confirmed First-Release Design

- UI label is `企业训练`; code and API names may continue to use `organization_training`.
- Creation uses a four-step wizard:
  1. choose source;
  2. configure training;
  3. set publish scope and answer settings;
  4. preview and publish.
- First-release sources:
  - platform paper library copy snapshot;
  - organization AI result;
  - organization-private manual grouping/manual questions.
- `mock_exam` is not a source entry for organization training.
- Publish scope supports current organization node only or current plus descendant nodes.
- Platform paper import lets `org_advanced_admin` view the full copied stem, options, `standard_answer`, and `analysis`.
  Edits apply only to the copied snapshot and never write back to the platform paper.
- Organization AI output can be copied into a training draft. Generated stem, options, `standard_answer`, and `analysis`
  are editable in that draft.
- `evidence_status = none` blocks publish. `evidence_status = weak` allows publish only after explicit confirmation.
- Copying organization AI output into training does not consume additional AI quota.
- Manual grouping first release supports `single_choice`, `multi_choice`, `true_false`, and `short_answer`.
- No complex standalone organization question bank is introduced in the first release.
- `short_answer` uses AI scoring by default. Manual grading is out of first-release scope.
- Drafts can be discarded.
- Published versions are immutable; changes require copying to a new draft and publishing a new version.
- Takedown stops unstarted and in-progress answers while preserving submitted employee summaries as read-only.
- One employee can submit once per published version.
- `answerDeadlineAt` is optional. If it is `null`, employees can answer until takedown.
- Reminders and badges are in-app only.
- Organization training does not create formal `mock_exam`, formal `exam_report`, or formal `mistake_book` records.

## Non-Goals

- No one-click adoption of organization training into formal `question` or `paper`.
- No employee subjective answer text export.
- No staging/prod/cloud/deploy work.

Cost Calibration Gate remains blocked pending fresh explicit approval.
