# Full Chain Acceptance Materials Pack Spec

Task id: `full-chain-acceptance-planning-and-materials-prep-2026-07-04`

Status: materials specification only.

## Storage Layout

Future full-chain materials should stay outside the repository under:

`D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated/full-chain-acceptance-2026-07-04/`

Suggested subdirectories:

| Directory               | Purpose                                                        | Repo evidence allowed                          |
| ----------------------- | -------------------------------------------------------------- | ---------------------------------------------- |
| `accounts/`             | Private account input source and credential handling notes     | Role labels and selector presence only         |
| `organization-tree/`    | Multi-level organization tree input                            | Node counts by tier                            |
| `employee-import/`      | Standard and advanced employee CSVs with more than 5 rows each | Row counts and forbidden-column check          |
| `redeem-code/`          | Standard, advanced, and upgrade card selector pack             | Type/status counts only                        |
| `content/`              | Chosen material and paper source selection list                | Profession/level/subject counts only           |
| `questions/full-chain/` | Full question-type synthetic imports                           | Question-type counts only                      |
| `ai-generation/`        | AI supported-type matrix and redacted expected outcome labels  | Task labels and structured count statuses only |
| `learning-workloads/`   | Per-role practice/mock/training execution workload plan        | Aggregate row counts and status only           |
| `analytics/`            | Expected aggregate analytics shape and small-sample checks     | Aggregate metric labels only                   |
| `redaction/`            | Local redaction checklist                                      | Redaction pass/fail status                     |

## Required Materials

| Material set              | Must include                                                                                                                             | Depends on                                  | Later usage                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| Content source selection  | At least one usable material set for each selected profession/level/subject path.                                                        | Existing local-private package              | Upload, parse/review, publish, knowledge-node build.        |
| Knowledge-node candidates | Candidate nodes mapped to selected material labels.                                                                                      | Content source selection                    | AI context and learner weak-point summaries.                |
| Question import set       | All current question types: `single_choice`, `multi_choice`, `true_false`, `fill_blank`, `short_answer`, `case_analysis`, `calculation`. | Content source selection                    | Question bank, paper, practice, mock, training.             |
| Paper set                 | Theory and skill papers with section mapping and answer/analysis support.                                                                | Question import set                         | Paper library, mock/practice, organization training source. |
| AI generation matrix      | Content, learner, organization AI supported scope labels and unsupported-role expectations.                                              | Knowledge-node candidates, question types   | Provider-approved AI generation and AI组卷 acceptance.      |
| Organization tree         | Province/city/district/station or equivalent multi-level tree with standard and advanced branches.                                       | DB target                                   | Org auth, admin binding, employee import.                   |
| Employee imports          | Standard branch >5 employees and advanced branch >5 employees.                                                                           | Organization tree and org auth              | Employee learning and analytics.                            |
| Card pack                 | One standard activation, one advanced activation, one upgrade path per required `profession + level`.                                    | `ops_admin` and authorization package input | Personal standard and advanced learner chains.              |
| Learning workload plan    | Practice, mock, mistake-book, AI explanation, AI generation, enterprise training submissions.                                            | Content, auth, employees                    | Analytics and owner-facing experiential validation.         |

## Minimum Question Type Matrix

| Question type   | Required surface                                    | Notes                                                                          |
| --------------- | --------------------------------------------------- | ------------------------------------------------------------------------------ |
| `single_choice` | practice, mock, paper, training                     | Objective; can feed mistake book.                                              |
| `multi_choice`  | practice, mock, paper, training                     | Objective; include all-correct or partial-credit expectation only as metadata. |
| `true_false`    | practice, mock, paper, training                     | Objective; required because current minimal CSV lacks it.                      |
| `fill_blank`    | practice, mock, paper                               | Required because current minimal CSV lacks it.                                 |
| `short_answer`  | practice, mock, training, AI scoring where approved | Raw answers must not appear in evidence.                                       |
| `case_analysis` | skill paper and training                            | Can use redacted status counts only.                                           |
| `calculation`   | skill paper and report                              | Required because current minimal CSV lacks it.                                 |

## Account And Card Data Redaction

## Baseline Seed And Scenario Input Rule

Full-chain acceptance should distinguish three data classes:

- Bootstrap seed: isolated DB label, reviewed empty-DB migrations, bootstrap `super_admin`, and required static config
  such as `contact_config`.
- Scenario input: private account inputs, organization tree files, employee CSVs, material files, and card request labels
  that are used by the later flow without exposing values in repo evidence.
- Scenario output: accounts other than bootstrap `super_admin`, organization rows, authorization rows, cards, personal
  users, content, papers, learning records, training records, audit records, and analytics aggregates created by the
  later experiential flow.

Pre-creating scenario outputs would make the run a fixture verification, not a true full-chain creation proof. Any future
task that chooses this shortcut must get fresh approval and record exactly which proof is narrowed.

Private account and card files must remain outside the repository. Repo docs may use these selector labels only:

- `fc_super_admin`
- `fc_ops_admin`
- `fc_content_admin`
- `fc_org_standard_admin`
- `fc_org_advanced_admin`
- `fc_personal_no_auth_student`
- `fc_personal_standard_student`
- `fc_personal_advanced_student`
- `fc_org_standard_employee_batch`
- `fc_org_advanced_employee_batch`
- `fc_redeem_code_standard_activation`
- `fc_redeem_code_advanced_activation`
- `fc_redeem_code_edition_upgrade`

## Completeness Checklist

- More than 5 employees for both standard and advanced organizations.
- No employee import authorization fields.
- Multi-level organization tree.
- Standard and advanced enterprise packages represented as expanded current-schema `org_auth` rows.
- Personal standard activation, direct advanced activation, and upgrade card paths.
- Content creation before AI and learning.
- Learning data before analytics.
- `contact_config` readiness before no-auth ordinary user contact validation.
- Scenario outputs are not pre-created unless separately approved with proof-narrowing notes.
- Provider/Cost approval before real AI execution.
- Redacted evidence policy reviewed before execution.

## Non-Claims

This specification does not create the local-private files and does not validate the materials at runtime.
