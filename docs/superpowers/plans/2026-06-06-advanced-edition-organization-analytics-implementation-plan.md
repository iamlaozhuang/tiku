# Advanced Edition Organization Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide organization admins with online organization statistics summaries for organization training, employee formal learning summaries, employee AI learning quota summaries, and quota consumption summaries without exposing employee sensitive details.

**Architecture:** Keep the existing Next.js monolith layering: route handlers / server actions -> service -> repository -> model. Organization analytics must consume the reviewed advanced authorization context and organization training lifecycle boundaries, aggregate by organization hierarchy snapshots, and keep all detail-sensitive content out of admin DTOs.

**Tech Stack:** TypeScript, existing API response contract, existing organization and employee session runtime, reviewed organization training planning, reviewed authorization context planning, Vitest unit tests, no new dependency.

---

## Current Code Facts

- Existing employee and organization session context: `src/server/auth/local-session-runtime.ts`.
- Existing effective authorization repository and service: `src/server/repositories/effective-authorization-repository.ts` and `src/server/services/effective-authorization-service.ts`.
- Existing formal `practice`, formal `mock_exam`, formal `answer_record`, formal `exam_report`, and formal `mistake_book` service paths exist in the student learning domain.
- Existing organization training implementation plan defines publish scope snapshots, answer-time organization snapshots, official submission rules, takedown visibility, and summary-only admin visibility.
- Existing `audit_log` and `ai_call_log` runtime provide redacted summary patterns, but organization analytics must not expose raw task, prompt, provider payload, or employee answer bodies.

The current code has organization, employee, authorization, formal learning, and log boundaries, but does not yet provide an isolated organization analytics summary domain for advanced edition organization admins.

## Dependency Contract

This plan depends on the reviewed upstream plans:

- Advanced authorization context:
  - Organization analytics requires `effectiveEdition = advanced`.
  - Organization analytics binds `authorizationSource = org_auth`.
  - Organization admin summary access requires `canViewOrganizationTrainingSummary = true`.
  - Visible organization scope comes from the admin's bound `organization` and descendant organization context.
- Organization training lifecycle:
  - Organization training analytics uses `organization_training_version`, `organization_training_answer_record`, publish scope snapshots, and answer-time organization snapshots.
  - Organization training completion and score metrics use official submissions only.
  - Takedown does not remove historical summaries.
- Operations authorization and quota planning:
  - Quota summary formulas in this plan define read-model needs only.
  - Quota ledger mutability, adjustment reasons, package grants, and operations governance remain owned by the operations authorization and quota plan.

This plan owns summary formulas, privacy redaction, and admin-visible aggregate DTOs. It does not own quota ledger writes, provider execution, cost point defaults, production defaults, export generation, or employee answer detail access.

## Future File Structure

Future implementation should keep organization analytics as a read-model boundary.

- Create: `src/server/contracts/organization-analytics-contract.ts`
  - DTOs for dashboard summary, training summary, employee summary, quota summary, ranking summary, filters, and pagination.
- Create: `src/server/models/organization-analytics.ts`
  - Internal metric names, formula helpers, visibility constants, and safe ranking row types.
- Create: `src/server/repositories/organization-analytics-repository.ts`
  - Read-only repository boundary for organization scope snapshots, training official submissions, employee formal learning summaries, AI learning quota summaries, and quota consumption summaries.
- Create: `src/server/services/organization-analytics-service.ts`
  - Service orchestration for permission checks, visible organization resolution, metric calculation, redaction, and list/detail summary reads.
- Create: `src/server/mappers/organization-analytics-mapper.ts`
  - Map internal aggregates to camelCase DTOs without numeric ids, raw prompt, raw provider payload, secret, token, plaintext `redeem_code`, employee original subjective answers, item-level correctness, full question bodies, standard answers, or `analysis`.
- Create: `src/server/validators/organization-analytics.ts`
  - Normalize date range, organization scope filter, training filter, employee filter, ranking filter, pagination, and sort inputs.
- Create only if REST surface is in scope: `src/server/services/organization-analytics-route.ts`.
- Create only if REST surface is in scope: `src/app/api/v1/organization-analytics/**/route.ts`.
- Create only if Web surface is in scope: `src/app/(admin)/organization-analytics/**`.
- Test: `src/server/services/organization-analytics-service.test.ts`.
- Test: `src/server/mappers/organization-analytics-mapper.test.ts`.
- Test: `src/server/validators/organization-analytics.test.ts`.
- Test: `tests/unit/phase-31-advanced-edition-organization-analytics-implementation.test.ts`.

Do not modify in this task group unless a later implementation task explicitly permits it:

- `src/db/schema/**`
- `drizzle/**`
- package or lock files
- env/secret files
- real provider runtime files
- export file generation or download paths
- formal `question`, `paper`, `practice`, `mock_exam`, `answer_record`, `exam_report`, or `mistake_book` write paths

## Metric Formula Contract

### Scope Rules

- All organization analytics queries require an organization admin context.
- The admin can view only the bound `organization` and visible descendant organizations.
- Organization training metrics aggregate by answer-time organization snapshot, not by the employee's current organization alone.
- Published training visibility uses publish scope snapshot from the organization training lifecycle.
- Takedown training remains included in historical summaries unless a filter explicitly excludes `taken_down`.
- Date ranges filter by event time:
  - Organization training completion uses `submittedAt`.
  - Formal learning summaries use formal learning event time.
  - AI learning quota summaries use quota ledger or task finalized time.

### Organization Training Metrics

For each visible organization training version:

| Metric                    | Formula                                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| `eligibleEmployeeCount`   | Count of current visible employees whose current organization intersects the publish scope snapshot. |
| `submittedEmployeeCount`  | Count of distinct employees with one official `organization_training_answer_record` for the version. |
| `unfinishedEmployeeCount` | `eligibleEmployeeCount - submittedEmployeeCount`, never below `0`.                                   |
| `completionRate`          | `submittedEmployeeCount / eligibleEmployeeCount`, or `0` when eligible count is `0`.                 |
| `averageScore`            | Average submitted score among official submissions only, or `null` when there are no submissions.    |
| `maxScore`                | Maximum submitted score among official submissions only, or `null` when there are no submissions.    |
| `minScore`                | Minimum submitted score among official submissions only, or `null` when there are no submissions.    |
| `submittedTrend`          | Count of official submissions grouped by day in the selected date range.                             |

Draft answer saves must not count as completed. Takedown must not erase submitted counts or score summaries. A fixed publish-time employee roster snapshot is not confirmed for first release; if the product later needs frozen assignment denominators, that must become a separate product decision before implementation.

### Employee Training Summary Metrics

For each visible employee:

| Metric                      | Formula                                                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `visibleTrainingCount`      | Count of training versions visible to the employee through publish scope snapshot and answer-time/current organization scope rules. |
| `submittedTrainingCount`    | Count of official submissions by the employee for visible training versions.                                                        |
| `unfinishedTrainingCount`   | `visibleTrainingCount - submittedTrainingCount`, never below `0`.                                                                   |
| `trainingCompletionRate`    | `submittedTrainingCount / visibleTrainingCount`, or `0` when visible count is `0`.                                                  |
| `trainingAverageScore`      | Average submitted score across the employee's official organization training submissions, or `null` when there are no submissions.  |
| `latestTrainingSubmittedAt` | Latest official organization training submission time, or `null`.                                                                   |

Employee summaries must not include question text, standard answer, employee answer, `analysis`, item-level correctness, or subjective original answer.

### Ranking Metrics

First-release rankings are summary-only and must be clearly marked as organization training rankings.

| Ranking                          | Formula                                                                                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `employeeTrainingRanking`        | Sort visible employees by `trainingAverageScore` descending, then `trainingCompletionRate` descending, then `latestTrainingSubmittedAt` ascending with `null` last. |
| `subOrganizationTrainingRanking` | Sort visible child organizations by aggregate `averageScore` descending, then `completionRate` descending, then `submittedEmployeeCount` descending.                |

These rankings must not be mixed with formal `mock_exam` ranking, formal `exam_report`, or formal `mistake_book` analytics.

### Formal Learning Summary Metrics

Organization admin may view only formal learning summaries:

- `formalPracticeCount`: count of formal `practice` records in scope.
- `formalMockExamCount`: count of formal `mock_exam` records in scope.
- `formalExamReportCount`: count of formal `exam_report` records in scope.
- `formalMistakeBookSummary`: count-level or aggregate mistake summary only.

Formal learning summaries must not expose question-level, answer-level, `analysis`-level, or mistake-level detail.

### Employee AI Learning And Quota Summary Metrics

Employee AI learning content remains personal content even when enterprise quota is used. Organization admin may view only summaries:

- `employeeAiTaskCount`: count of employee AI learning tasks consuming organization quota in the selected scope.
- `employeeAiSucceededTaskCount`: count of succeeded employee AI learning tasks.
- `employeeAiFailedTaskCount`: count of failed employee AI learning tasks by redacted failure category.
- `employeeAiQuotaConsumedPoint`: sum of finalized organization quota points consumed by employee AI learning tasks.
- `organizationTrainingGenerationConsumedPoint`: sum of finalized organization quota points consumed by organization training generation tasks.
- `quotaRemainingPoint`: latest available organization quota point summary from the quota read model, when available.

The admin must not see single AI task list, single AI task detail, user input summary, generated content summary, prompt text, raw AI input/output, provider payload, or model secret material.

## DTO Contract

### Dashboard Summary DTO

The organization admin dashboard summary DTO should include:

| Field                        | Requirement                              |
| ---------------------------- | ---------------------------------------- |
| `organizationPublicId`       | Visible organization public id.          |
| `scopeOrganizationPublicIds` | Visible organization scope public ids.   |
| `dateRange`                  | Normalized date range.                   |
| `trainingSummary`            | Aggregate organization training metrics. |
| `employeeSummary`            | Employee count and completion summary.   |
| `quotaSummary`               | Quota consumption summary.               |
| `formalLearningSummary`      | Formal learning summary only.            |
| `updatedAt`                  | ISO 8601 calculation time.               |

### Employee Summary DTO

The employee summary DTO may include:

- `employeePublicId`
- `employeeDisplayName`
- `organizationPublicId`
- `organizationName`
- `answerOrganizationSnapshot`
- `submittedTrainingCount`
- `unfinishedTrainingCount`
- `trainingCompletionRate`
- `trainingAverageScore`
- `latestTrainingSubmittedAt`
- `formalPracticeCount`
- `formalMockExamCount`
- `employeeAiQuotaConsumedPoint`

It must not include question text, standard answer, employee answer, `analysis`, mistake detail, prompt text, provider payload, raw model output, plaintext `redeem_code`, secret, token, or numeric ids.

## Service Rules

- Require authenticated organization admin context.
- Resolve advanced authorization context and visible organization scope through service layer.
- Return not-found or empty summaries for out-of-scope organizations without leaking existence.
- Use answer-time organization snapshots for organization training aggregation.
- Use official organization training submissions only for completion and score metrics.
- Use summary-only formal learning aggregates.
- Use summary-only employee AI task and quota aggregates.
- Do not expose export route or export command in first release.
- Do not write analytics results into formal `exam_report`, formal `mistake_book`, formal `mock_exam`, or organization training answer records.
- Do not mutate quota ledger, `authorization`, `redeem_code`, `audit_log`, or `ai_call_log` from ordinary summary reads.

## Implementation Order

### Task 1: Contract, Model, And Formula Tests

**Files:**

- Create: `src/server/contracts/organization-analytics-contract.ts`
- Create: `src/server/models/organization-analytics.ts`
- Test: `src/server/models/organization-analytics.test.ts`

- [ ] Define dashboard, training summary, employee summary, ranking, quota summary, and filter DTOs.
- [ ] Add formula tests for eligible, submitted, unfinished, completion rate, average score, min score, max score, and submitted trend.
- [ ] Add formula tests for zero eligible employees and zero submissions.
- [ ] Add ranking tie-breaker tests.
- [ ] Verify DTOs use camelCase fields and optional values use `null`.

### Task 2: Repository Read Model

**Files:**

- Create: `src/server/repositories/organization-analytics-repository.ts`
- Test: `src/server/repositories/organization-analytics-repository.test.ts`

- [ ] Define read-only methods for visible organization snapshots, training submissions, employee summaries, formal learning summaries, and quota summaries.
- [ ] Use public ids and summary rows only in repository contracts.
- [ ] Add tests proving repository contracts do not return employee answers, question bodies, standard answers, `analysis`, prompt text, provider payload, plaintext `redeem_code`, secret, token, or numeric ids.

### Task 3: Analytics Service

**Files:**

- Create: `src/server/services/organization-analytics-service.ts`
- Test: `src/server/services/organization-analytics-service.test.ts`

- [ ] Add permission tests for advanced organization admin access.
- [ ] Add blocked tests for standard edition, missing `org_auth`, missing capability, and out-of-scope organization.
- [ ] Add service tests for training-level summaries.
- [ ] Add service tests for employee-level summaries.
- [ ] Add service tests for quota summaries.
- [ ] Add service tests proving takedown training remains in historical summaries.
- [ ] Add tests proving draft answer saves do not count as completed.

### Task 4: Privacy Mapping

**Files:**

- Create: `src/server/mappers/organization-analytics-mapper.ts`
- Test: `src/server/mappers/organization-analytics-mapper.test.ts`

- [ ] Map aggregate rows to admin DTOs.
- [ ] Verify redaction for employee answer detail, question text, standard answer, `analysis`, mistake detail, prompt text, provider payload, raw model output, plaintext `redeem_code`, secret, token, and numeric ids.
- [ ] Verify formal learning summaries are separate from organization training rankings.
- [ ] Verify employee AI learning summaries do not expose single task detail or generated content body.

### Task 5: Optional Route And Web Surfaces

**Files:**

- Create only if API surface is in scope: `src/server/services/organization-analytics-route.ts`
- Create only if API surface is in scope: `src/app/api/v1/organization-analytics/**/route.ts`
- Create only if Web surface is in scope: `src/app/(admin)/organization-analytics/**`
- Test: route-level tests if routes are added.
- Test: Web surface tests if pages are added.

- [ ] Add thin route handlers after service tests pass.
- [ ] Keep responses in `{ code, message, data, pagination? }`.
- [ ] Use public ids in route paths and query filters.
- [ ] Keep resource nesting within the two-level API boundary.
- [ ] Add dashboard, training list summary, employee list summary, ranking summary, quota summary, Loading, Empty, Error, and Permission Blocked states when Web pages are included.
- [ ] Verify no employee statistics export UI, export route, export command, export file creation, export download, or export file governance is introduced.

## Required Acceptance Tests

- Organization admin sees only bound organization and descendant organization summaries.
- Organization admin sees completion count, completion rate, unfinished count, average score, and submitted trend for organization training.
- Organization admin sees employee-level record summaries without answer detail.
- Organization admin sees organization training ranking clearly separated from formal `mock_exam` ranking.
- Organization admin sees quota consumption summaries without single AI task details.
- Takedown training remains in historical summaries.
- Draft answer saves do not count as completed training.
- Formal `practice`, `mock_exam`, `exam_report`, and `mistake_book` remain summary-only.
- Organization admin cannot read employee question text, standard answer, employee answer, objective per-question correctness, subjective original answer, mistake detail, prompt text, provider payload, raw model output, plaintext `redeem_code`, secret, token, or numeric ids.
- Employee statistic export, organization aggregate export, generated export file, export download, export route, and export command are absent in first release.

## Blocked Work

- Employee statistic export remains blocked.
- Organization aggregate export remains blocked.
- Diagnostic detail beyond approved summaries remains blocked.
- Single AI task detail, prompt, provider payload, and generated content body visibility remain blocked.
- Real provider calls remain blocked.
- Provider cost measurement and point calibration remain blocked.
- Production quota point defaults and behavior cost point defaults remain unconfirmed.
- Database schema and migration work require a separate implementation task if needed.
- env/secret, staging/prod/cloud/deploy, payment, and external-service actions remain blocked.

## Handoff To Downstream Plans

- Operations authorization and quota planning should own quota ledger writes, manual adjustment, package grant, purchase-style grant, and operations-visible quota governance.
- Retention/log governance should ensure analytics reads respect `expired_hidden`, `audit_log`, and `ai_call_log` redaction and retention rules.
- Future code implementation tasks must split schema/migration, service, route, and Web work according to the project gate policy instead of treating this planning document as implementation approval.

## Self-Review

- 统计摘要 coverage: covers dashboard, training, employee, ranking, quota, formal learning, and AI learning summary formulas.
- 员工统计 privacy: blocks employee answer detail, item-level correctness, question text, standard answer, `analysis`, prompt, provider payload, and export.
- Privacy Boundary: keeps organization admin visibility to summaries only.
- Blocked work coverage: keeps Cost Calibration Gate, provider, cost, production defaults, env/secret, staging/prod/cloud/deploy, payment, external-service, export, schema, and dependency work out of scope.
