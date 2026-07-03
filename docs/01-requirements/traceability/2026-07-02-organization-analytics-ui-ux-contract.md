# 2026-07-02 Organization Analytics UI/UX Contract

## Status

This is package 3 of the serial UI/UX requirement contract closeout.

It is documentation-only. It does not approve product source changes, tests, schema, migration, database access,
Provider execution, env/secret access, browser/runtime validation, staging/prod deployment, payment, external-service
work, Cost Calibration, release readiness, final Pass, or production usability claims.

## Scope

This contract covers the first-release organization analytics experience for eligible `org_advanced_admin` users:

- organization overview;
- training detail;
- employee summary;
- formal `practice` / `mock_exam` aggregate signal separation;
- knowledge weak-point summaries;
- privacy, redaction, export, and no-enterprise-AI-quota-summary boundaries.

It does not cover product implementation. Follow-up source tasks must use this contract only after a separate task plan
materializes allowed files, blocked files, validation commands, and redacted evidence rules.

## Required Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- relevant current implementation files under `src/features/admin/organization-analytics`,
  `src/server/contracts/organization-analytics-contract.ts`, `src/server/services/organization-analytics-service.ts`,
  `src/server/services/organization-analytics-route.ts`,
  `src/server/repositories/organization-analytics-repository.ts`, and
  `src/server/validators/organization-analytics.ts`.

## Existing Requirement Decisions

The following points are already decided and are not reopened by this contract:

- `org_advanced_admin` may view organization analytics when scoped by valid advanced `org_auth`.
- `org_standard_admin` must receive a denied, unavailable, or upgrade-guided state for advanced analytics.
- First-release analytics levels are organization overview, training detail, and employee summary.
- Default date range is 30 days.
- Filters support 7 days, 30 days, 90 days, and custom range.
- Small samples below 5 people show a warning.
- Knowledge weak-point summaries may be shown for organizations and employees when derived from training results.
- Formal `practice` / `mock_exam` weak-point signals may also be shown as separate aggregate analysis when the
  organization authorization context permits it.
- Enterprise-training analytics and formal learning aggregate signals must be separate labeled sections.
- Formal learning signals must not be mixed into enterprise-training completion, score, deadline, or version metrics.
- Weak-point summaries must not expose raw answer text.
- Employee subjective answer text, raw AI generated content, raw Prompt, Provider payload, unrelated personal activity,
  and cross-organization data are not visible to organization admins.
- Enterprise AI quota consumption summary is not shown to organization admins in the first release.
- No export is available in the first release.
- Organization analytics does not write formal `exam_report` or formal `mistake_book`.

Primary decision anchors:

- `CT-REQ-020` - organization analytics levels, date range, weak points, small sample, no export, no quota summary.
- `CT-REQ-038` - enterprise-training analytics and formal learning signals must be separated.
- `CT-REQ-047` - formal `practice` / `mock_exam` aggregate backfill and weak-point separation.
- `CT-REQ-058` - active catalog cleanup forbids reintroducing organization-admin enterprise AI quota summaries.
- `UX-REQ-07` - first-release analytics metrics and filters.
- `UX-REQ-19` - formal learning separation and privacy-preserving weak-point summaries.

## Role And Access Contract

| Actor                | Required result                                                                                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `org_advanced_admin` | Can enter organization analytics for own visible organization scope when advanced `org_auth` context is valid.                                                          |
| `org_standard_admin` | Sees standard-unavailable guidance; cannot use enterprise training analytics, formal learning aggregates, or weak-point analytics.                                      |
| `super_admin`        | May use organization analytics only with an explicit valid organization context and the same redaction boundaries.                                                      |
| `ops_admin`          | Does not own organization analytics as an organization workspace surface. Operations may see separate redacted logs or support summaries only when explicitly approved. |
| `content_admin`      | Does not own organization analytics. Content workspace must not expose organization analytics as content management.                                                    |
| Employee or learner  | Cannot access organization admin analytics surfaces.                                                                                                                    |

UI visibility is not the authorization boundary. Services must enforce `effectiveEdition`, `org_auth`, organization
scope, role, expiry, revocation, and capability checks.

## Information Architecture Contract

Organization analytics should be a focused work surface, not a generic BI page.

Top-level layout:

1. Scope header: organization node, inherited child scope indicator, date range, data freshness, and redaction badge.
2. Date filter bar: segmented 7 days / 30 days / 90 days plus custom range picker; default is 30 days.
3. Enterprise training analytics section.
4. Formal learning aggregate section.
5. Knowledge weak-point section.
6. Employee summary section.
7. Privacy and unavailable-state panel.

Training detail is reached from the enterprise training analytics section or a training list row. Employee summary is
reached from the employee section and remains summary-only.

## Enterprise Training Analytics Contract

This section is the primary analytics domain. It may show:

- eligible employee count;
- started count when source data supports it;
- submitted count;
- unfinished count;
- completion rate;
- average score, min score, max score;
- average time or duration summary when source data supports it;
- submitted trend over the selected date range;
- training title/version/deadline/status filters when the detail view is available;
- current node versus current plus descendant scope label.

It must not include formal `practice` / `mock_exam` counts inside completion, score, deadline, version, or training
lifecycle metrics.

## Formal Learning Aggregate Contract

Formal `practice` and `mock_exam` signals are useful, but they must be clearly separate from enterprise training.

Allowed display:

- a separately labeled section named as formal learning aggregate signals;
- aggregate counts from the employee's selected organization authorization context only;
- aggregate weak-point signals only when privacy-preserving;
- explicit copy explaining that these signals are not enterprise training completion or score.

Forbidden display:

- mixing formal counts into training completion cards;
- using formal `exam_report` or `mistake_book` records as organization training records;
- exposing individual formal answers, formal report details, or mistake-book contents to organization admins;
- writing or modifying formal `exam_report` or formal `mistake_book` from organization analytics.

## Knowledge Weak-Point Contract

Knowledge weak-point summaries are first-release analytics output, but they must be aggregate and privacy-preserving.

Organization overview may show:

- top weak `knowledge_node` labels by training result;
- affected employee count band or percentage, not raw answer rows;
- confidence or sample-size status;
- separate formal-learning weak-point aggregate when organization auth context permits it.

Employee summary may show:

- per-employee weak-point tags or summary counts;
- training-derived weak areas;
- latest submitted time and completion status;
- no raw answer text, no subjective answer content, and no raw AI scoring payload.

Small samples below 5 people must show a visible warning before weak-point interpretation. If a filter produces fewer
than 5 people, the UI should either aggregate to a broader scope/date range or label the result as low confidence.

## Employee Summary Contract

The employee summary section should support large organizations without becoming an unbounded card list.

Required first-release behavior:

- backend-style pagination with page-size options `20`, `50`, and `100` when listing employees;
- URL query preservation for page, page size, date range, organization scope, and training filter where practical;
- rows show employee display name, organization node, visible training count, submitted count, unfinished count,
  completion rate, average score, latest submitted time, and weak-point summary when available;
- no raw answer text;
- no full training answer payload;
- no export.

## Privacy And Redaction Contract

Organization analytics must show privacy as an operational boundary, not only as hidden implementation detail.

Required blocked surfaces:

- raw employee answer;
- subjective answer text;
- raw AI generated content;
- raw Prompt;
- Provider payload;
- unrelated personal learning activity;
- global logs;
- cross-organization analytics;
- export and downloaded files;
- enterprise AI quota consumption summary.

The UI can show a compact redaction boundary panel for operators and organization admins, but it must use business
wording where possible and avoid exposing internal implementation identifiers as the primary user-facing language.

## States Contract

Required states:

- loading;
- empty data for selected range;
- standard unavailable;
- permission denied;
- invalid or expired organization authorization;
- date range validation error;
- small sample warning;
- stale or partial data warning when source data is incomplete;
- analytics temporarily unavailable;
- no export first-release disabled state.

The empty state should help the admin understand whether no employees, no assigned training, no submitted answers, or
too narrow a date range caused the empty result.

## Current Source Alignment

Static source inspection found partial implementation, not runtime acceptance.

Aligned or directionally aligned:

- `AdminOrganizationAnalyticsPage` exists under the organization workspace.
- Organization portal links to `统计摘要`.
- Client-side access uses `resolveOrganizationWorkspacePageAccess` for `/organization/organization-analytics`.
- Runtime route context requires `advanced`, `org_auth`, service-computed organization capability, and
  `org_advanced_admin` or `super_admin`.
- API routes exist for dashboard summary and employee statistics.
- DTOs and services expose enterprise training aggregate metrics and redacted boundary metadata.
- Export is represented as blocked or requiring separate approval.
- Raw employee answers, raw AI generated content, Prompt/Provider payload, and cross-organization analytics are blocked
  in the redacted boundary DTO.

Gaps or conflicts with the confirmed contract:

- The current UI uses raw start/end timestamp text inputs instead of 7/30/90/custom date controls with default 30 days.
- The current default date range is hard-coded to a historical 15-day window, not a dynamic 30-day default.
- `formalLearningSummary` appears in the same "汇总信号" panel as other summary rows instead of a clearly separated
  formal learning aggregate section.
- `quotaSummary` is still present in DTOs, service construction, repository interfaces, route responses, and UI rows,
  while the confirmed requirement says organization admins do not see enterprise AI quota consumption summary.
- Knowledge weak-point summaries are not represented in the inspected DTOs or UI.
- Small-sample warning is not represented in the inspected UI.
- Training detail view is not represented as a separate analytics level in the inspected UI.
- Employee statistics are rendered as an unbounded card list without pagination or query-state controls.
- Employee weak-point summaries are not represented in the inspected DTOs or UI.
- A `/content/organization-analytics` page mounts the same organization analytics component and should be removed,
  redirected, or otherwise prevented from becoming a content workspace surface.
- Current UI wording includes technical labels such as `organization_analytics_boundary` and policy keys as primary
  visible copy; later UI work should translate these into clearer business-language labels.

## Follow-Up Source Gap Register

| Id                        | Follow-up source task direction                                                                                                               |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `ORG-ANALYTICS-UX-GAP-01` | Replace timestamp text fields with 7/30/90/custom date controls and dynamic 30-day default.                                                   |
| `ORG-ANALYTICS-UX-GAP-02` | Split enterprise-training analytics and formal learning aggregate signals into separate labeled sections.                                     |
| `ORG-ANALYTICS-UX-GAP-03` | Remove or hide organization-admin `quotaSummary` and ensure APIs do not return enterprise AI quota summaries to organization admins.          |
| `ORG-ANALYTICS-UX-GAP-04` | Add organization and employee knowledge weak-point DTOs, services, and UI summaries with privacy-preserving aggregation.                      |
| `ORG-ANALYTICS-UX-GAP-05` | Add small-sample warning and low-confidence state for fewer than 5 people.                                                                    |
| `ORG-ANALYTICS-UX-GAP-06` | Add training detail analytics level with training/version/deadline status separation.                                                         |
| `ORG-ANALYTICS-UX-GAP-07` | Add employee summary pagination with page-size options `20`, `50`, and `100`.                                                                 |
| `ORG-ANALYTICS-UX-GAP-08` | Preserve filters, date range, page, and page size in URL query where practical.                                                               |
| `ORG-ANALYTICS-UX-GAP-09` | Remove, redirect, or deny `/content/organization-analytics` as a content workspace route.                                                     |
| `ORG-ANALYTICS-UX-GAP-10` | Replace technical policy-key copy with business-readable privacy labels while preserving redaction proof.                                     |
| `ORG-ANALYTICS-UX-GAP-11` | Keep export disabled and block any export file generation until separately approved.                                                          |
| `ORG-ANALYTICS-UX-GAP-12` | Preserve direct-route denial and standard-unavailable states for `org_standard_admin`, employees, learners, `ops_admin`, and `content_admin`. |

## Decision Items

No new product decision is required from this package. The apparent conflicts are implementation gaps against decisions
already recorded in the requirement tree:

- enterprise AI quota consumption summary must not be shown to organization admins;
- formal learning aggregate signals must be separated from enterprise-training metrics;
- weak-point summaries and small-sample warnings are required first-release design items;
- content workspace must not own organization analytics.

If a later source task proposes keeping organization-admin quota summary, keeping `/content/organization-analytics`, or
mixing formal learning into training metrics, it must stop and request a new product decision because that would
supersede current requirements.

## Non-Claims

- No source implementation is complete by this contract.
- No runtime acceptance is claimed.
- No export is approved.
- No Provider, database, schema, migration, dependency, staging/prod, payment, Cost Calibration, release readiness,
  final Pass, or production usability is claimed.
