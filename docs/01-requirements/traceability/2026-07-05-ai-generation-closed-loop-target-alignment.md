# 2026-07-05 AI Generation Closed Loop Target Alignment

## Status

- Type: requirement traceability alignment
- Trigger: current user goal requiring all eligible-role AI出题 / AI组卷 flows to reach an effective business closed loop
- Scope: role-specific closed-loop target definition before implementation

This document does not claim implementation completion, release readiness, Provider readiness, staging/prod readiness, Cost Calibration, or final Pass.

## User Closed-Loop Definition

For this goal, "闭环" means generated AI content can enter a stable, complete, governed business path that supports the relevant role's review, publish, practice, and statistics needs.

This definition does not mean AI generation may automatically bypass governance or directly write formal platform records.

## Conflict Resolution

Existing advanced-edition requirements remain valid where they forbid automatic formal writes:

- learner AI generation must not automatically create formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`;
- organization AI generation must not automatically enter the platform formal question bank or paper library;
- organization training statistics must not be mixed into formal `exam_report` or formal `mistake_book`.

The new closed-loop target is therefore implemented through explicit post-generation actions:

- review/adopt into a draft;
- edit/confirm;
- publish through the relevant domain;
- answer/practice through that domain;
- record statistics in that domain.

## Role Mapping

| Role                                                                       | AI function                      | Closed-loop target                                                                                                                                                                                          | Formal write boundary                                                                                               |
| -------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `content_admin`                                                            | `AI出题`, `AI组卷`               | Generated result is reviewable, can be adopted into formal content draft, then use existing formal publish/practice/statistics paths after content approval.                                                | No direct publish; formal draft adoption is explicit and governed.                                                  |
| `org_advanced_admin`                                                       | `AI出题`, `AI组卷`               | Generated result is reviewable, can be copied into organization training draft, edited, published to employees, answered, and counted in organization training analytics.                                   | No platform formal `question` or `paper` write; organization training domain owns publish/statistics.               |
| `personal_advanced_student`                                                | `AI训练` with `AI出题`, `AI组卷` | Generated result becomes a persisted private AI training attempt that can be answered, resumed, reviewed, and counted in personal AI training statistics.                                                   | No platform formal publish/review; no automatic formal question/paper/practice/mock/exam_report/mistake_book write. |
| `org_advanced_employee`                                                    | `AI训练` with `AI出题`, `AI组卷` | Generated result becomes a persisted employee AI training attempt in organization authorization context, answerable and resumable by the employee, with allowed personal and redacted aggregate statistics. | No platform formal publish/review; no raw employee generated content exposed to organization admin.                 |
| `org_standard_admin`, `org_standard_employee`, `personal_standard_student` | Advanced AI generation           | Hidden, unavailable, upgrade-guided, or denied.                                                                                                                                                             | No advanced AI generation write path.                                                                               |

## Implementation Order

1. Restore full unit health.
2. Persist learner AI training attempts and statistics for personal advanced and organization advanced employee roles.
3. Persist organization AI result copy into editable organization training draft with publish gating.
4. Ensure organization training publish, employee answer, and organization analytics cover AI-sourced drafts.
5. Ensure content-admin AI generated current and historical results can enter formal draft review/adoption without direct publish.
6. Run role, permission, unit, browser, Provider, and DB-backed validation as each task scope permits.

## Non-Claims

- No automatic formal content publishing.
- No release readiness or final Pass.
- No Provider execution approval.
- No schema, migration, seed, dependency, env/secret, staging/prod, deploy, payment, or Cost Calibration approval.
- No permission to record credentials, env values, raw DB rows, Provider payloads, prompts, raw AI I/O, full generated content, full question, full paper, or full material text in evidence.
