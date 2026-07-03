# 2026-07-03 Source Landing 16 Package Acceptance Materials Pack

## Status

This materials pack prepares later acceptance execution. It does not run acceptance, start a dev server, run browser
validation, change source, connect to a database, call an AI Provider, deploy, or claim release readiness, final Pass, or
production usability.

## Execution Boundary For Later Acceptance

Later acceptance execution must receive a separate task plan and explicit approval for any runtime action. This pack only
collects safe inputs:

- role matrix: `2026-07-03-source-landing-16-package-role-acceptance-matrix.md`
- approval pack: `2026-07-03-source-landing-16-package-acceptance-approval-pack.md`
- source map: `docs/01-requirements/traceability/2026-07-03-source-landing-16-package-execution-map.md`
- source landing evidence: `docs/05-execution-logs/evidence/2026-07-03-*-source-landing.md`

Forbidden in this prep task and any evidence derived from it:

- credentials, tokens, sessions, cookies, Authorization headers, localStorage, env values, DB URLs, raw DB rows, internal
  numeric ids, PII, plaintext `redeem_code`, raw employee answers, raw Prompt/full Prompt text, Provider payloads, raw AI
  IO, full generated content, full question/paper/material/resource/chunk content, screenshots, traces, raw DOM, exports,
  release readiness claims, final Pass claims, or production usability claims.

## 16 Package Evidence Index

| No. | Package id                                                       | Requirement anchors                                                                                    | Source/test anchors                                                                                          | Evidence status                                                                                                            |
| --- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| 01  | `content-resource-management-source-landing-2026-07-03`          | `UX-REQ-14`, `CT-REQ-031`, `CT-REQ-045`, `CT-REQ-057`, `CT-REQ-059`, `CT-REQ-060`                      | `AdminResourceKnowledgeManagement.tsx`, `rag-resource-knowledge-runtime.ts`, resource/navigation unit tests  | `landed`; ops resource write removed/denied; content resource path prepared                                                |
| 02  | `ops-authorization-source-landing-2026-07-03`                    | `UX-REQ-02`, `UX-REQ-03`, `UX-REQ-05`, `G01`, `CT-REQ-004` to `CT-REQ-015`, `CT-REQ-022`, `CT-REQ-052` | `AdminOrgAuthRedeemPage.tsx`, `admin-redeem-code-runtime.ts`, admin user/org auth tests                      | `landed` for ops card type/list/detail/import UI; redemption semantics remain separate when learner redemption is in scope |
| 03  | `organization-training-source-landing-2026-07-03`                | `UX-REQ-06`, `UX-REQ-18`, `G05`, `CT-REQ-016` to `CT-REQ-019`, `CT-REQ-024`                            | `AdminOrganizationTrainingPage.tsx`, `StudentOrganizationTrainingPage.tsx`, training service/validator tests | `landed`; full storage/API snapshot expansion remains separate                                                             |
| 04  | `organization-analytics-source-landing-2026-07-03`               | `UX-REQ-07`, `UX-REQ-19`, `G06`, `G16`, `CT-REQ-020`, `CT-REQ-038`, `CT-REQ-047`                       | `AdminOrganizationAnalyticsPage.tsx`, analytics contracts/routes/services/tests                              | `landed`; DB analytics/export remain separate                                                                              |
| 05  | `organization-ai-post-actions-source-landing-2026-07-03`         | `UX-REQ-09`, `G07`, `CT-REQ-024`, `CT-REQ-048`, `CT-REQ-053`                                           | `AdminAiGenerationEntryPage.tsx`, organization training route/service/validator tests                        | `partial`; bounded draft action landed, full generated-field persistence remains separate                                  |
| 06  | `admin-model-prompt-log-governance-source-landing-2026-07-03`    | `UX-REQ-10`, `UX-REQ-11`, `G08`, `G15`, `CT-REQ-025` to `CT-REQ-027`, `CT-REQ-039`, `CT-REQ-049`       | `AdminModelConfigManagement.tsx`, `AdminAiAuditLogOpsBaseline.tsx`, model/prompt/log tests                   | `landed` for source contract; real Provider connection execution remains separate                                          |
| 07  | `system-admin-user-management-source-landing-2026-07-03`         | `UX-REQ-08`, `CT-REQ-032`, `CT-REQ-046`, `D10`, `D18`                                                  | `AdminUserOrgAuthOpsBaseline.tsx`, admin user/org auth service/route tests                                   | `landed`; real DB-backed account mutations remain separate                                                                 |
| 08  | `organization-workspace-role-boundary-source-landing-2026-07-03` | `UX-REQ-04`, `G10`, `CT-REQ-010`, `CT-REQ-012`, `CT-REQ-021`, `CT-REQ-050`, `CT-REQ-054`, `CT-REQ-055` | org workspace access helper, portal/layout/AI page tests                                                     | `landed`; runtime browser and DB-backed proof remain separate                                                              |
| 09  | `organization-tree-ops-workbench-source-landing-2026-07-03`      | `UX-REQ-20`, `UX-REQ-21`, `CT-REQ-006`, `CT-REQ-041`, `CT-REQ-042`                                     | `AdminOrgAuthRedeemPage.tsx`, admin ops baseline tests                                                       | `landed`; tree move/cascade DB behavior remains separate                                                                   |
| 10  | `org-auth-overlap-closure-source-landing-2026-07-03`             | `UX-REQ-01`, `UX-REQ-02`, `G09`, `CT-REQ-004`, `CT-REQ-008`                                            | `AdminOrgAuthRedeemPage.tsx`, admin ops baseline tests                                                       | `landed` for preview/guidance; actual closure mutations and `org_auth_scope` schema/API remain separate                    |
| 11  | `employee-import-password-source-landing-2026-07-03`             | `UX-REQ-05`, `G03`, `CT-REQ-011`, `CT-REQ-051`, `D05`                                                  | employee account contract/service/validator, admin ops UI tests                                              | `landed`; actual password values never enter evidence                                                                      |
| 12  | `employee-transfer-session-source-landing-2026-07-03`            | `G04`, `CT-REQ-013`, `CT-REQ-014`, `CT-REQ-043`, `D05`                                                 | admin ops UI tests                                                                                           | `partial`; transfer/session review landed, mutation transaction remains separate                                           |
| 13  | `learner-core-experience-source-landing-2026-07-03`              | `UX-REQ-15`, `UX-REQ-16`, `G12`, `CT-REQ-033` to `CT-REQ-035`, `D13`, `D14`                            | registration route/service, learner profile/practice/mock/mistake UI tests                                   | `landed`; browser/session acceptance remains separate                                                                      |
| 14  | `learner-ai-context-source-landing-2026-07-03`                   | `UX-REQ-12`, `G13`, `CT-REQ-033`, `D13`, ADR-007                                                       | `StudentPersonalAiGenerationPage.tsx`, learner AI request/result tests                                       | `landed`; browser and Provider execution remain separate                                                                   |
| 15  | `employee-training-answer-result-source-landing-2026-07-03`      | `UX-REQ-17`, `G14`, `CT-REQ-036`, `D15`                                                                | organization training contract/page/route/service/mapper tests                                               | `partial`; learner-grade UI landed, persisted per-question storage remains separate                                        |
| 16  | `content-ai-draft-adoption-source-landing-2026-07-03`            | `UX-REQ-09`, `UX-REQ-13`, `CT-REQ-023`, `CT-REQ-040`, `D11`                                            | content AI entry, formal adoption model/validator/repository tests                                           | `landed`; visual editor mapping from persisted structured content remains separate                                         |

## Role Data Preparation Checklist

Use synthetic or approved local acceptance fixtures only. Do not put any secret or real user data in evidence.

| Role                        | Required fixture shape                                                                                        | Negative fixture                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `personal_standard_student` | Personal learner, valid standard authorization, published standard learning content, report/mistake summaries | Same actor direct-opens learner AI route and receives denied/unavailable/upgrade guidance   |
| `personal_advanced_student` | Personal learner, effective advanced personal context, personal quota owner, AI task history                  | Same actor attempts formal write or non-personal backend access and is denied               |
| `org_standard_employee`     | Employee bound to organization node with standard `org_auth` coverage                                         | Direct enterprise training / organization AI route denied or unavailable                    |
| `org_advanced_employee`     | Employee bound to organization node with advanced `org_auth`, assigned `企业训练`, AI context metadata        | Deadline/takedown/transfer/invalid authorization blocks unsubmitted continuation            |
| `org_standard_admin`        | Organization admin account bound to standard org, scoped roster/status fixtures                               | Advanced organization routes and employee mutation actions unavailable                      |
| `org_advanced_admin`        | Organization admin with advanced org capability, training/analytics/organization AI fixtures                  | Global ops/content/model/raw-log/raw-answer access denied                                   |
| `content_admin`             | Content admin, resource fixtures, content AI review fixtures for sufficient/weak/none evidence                | Ops authorization, plaintext card, organization training/analytics routes denied            |
| `ops_admin`                 | Ops admin, organization tree, employee import, card generation/list/detail, org auth overlap, redacted logs   | Content resource write, content AI adoption, model config mutation, Prompt full text denied |

`super_admin` overlay fixtures should cover backend role management, model config connection-test surface, prompt full-text
product UI, organization node move copy, and eligible plaintext card UI. It must also test that redaction and service
authorization are not bypassed.

## Suggested Later Acceptance Sequence

This is a sequence for a future approved acceptance task, not for this prep task:

1. Verify acceptance environment boundaries and approved fixture set.
2. Run learner roles first: `personal_standard_student`, `personal_advanced_student`, `org_standard_employee`,
   `org_advanced_employee`.
3. Run organization admin roles: `org_standard_admin`, then `org_advanced_admin`.
4. Run backend roles: `content_admin`, `ops_admin`.
5. Run `super_admin` overlay checks only for privileged coverage items.
6. Record positive and negative result summaries with no raw secrets, raw DOM, screenshots, raw content, or PII.
7. Keep runtime acceptance conclusions separate from release readiness, final Pass, Cost Calibration, Provider readiness,
   staging/prod, and production usability.

## Evidence Capture Template

Later runtime acceptance evidence should use this summary-only format:

| Field                  | Allowed value                                               |
| ---------------------- | ----------------------------------------------------------- |
| Role                   | One of the 8 primary roles, or `super_admin_overlay`        |
| Flow                   | Short route/workflow label                                  |
| Requirement IDs        | `UX-REQ-*`, `CT-REQ-*`, `D*`, `G*`, ADR row, or AI SSOT row |
| Expected               | Allowed/denied/blocked summary                              |
| Observed               | Pass/fail/block summary without raw data                    |
| Source anchors         | File path and package evidence path                         |
| Sensitive data check   | `redacted` / `not_recorded`                                 |
| Runtime claim boundary | `acceptance_observation_only_no_release_readiness`          |

## Known Follow-Up Items Before Full End-To-End Pass Claims

- Full `redeem_code_type` redemption semantics and ambiguous `edition_upgrade` target selection if not covered by a
  later task.
- `org_auth_scope` schema/API and real overlap closure mutations.
- Real employee transfer mutation and repository transaction.
- Database-backed analytics/read models and export decisions.
- Organization AI generated-field persistence and source-context schema/contract.
- Persisted employee training question snapshots and per-question employee answer storage.
- Content AI formal editor mapping from persisted structured generated content.
- Browser/runtime role walkthrough and any DB/Provider/staging gate, each requiring separate approval.

These items do not block this preparation package because this package only materializes execution materials.
