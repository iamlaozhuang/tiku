# Full Chain Acceptance Dependency DAG

Task id: `full-chain-acceptance-planning-and-materials-prep-2026-07-04`

Status: dependency plan only.

## DAG

```mermaid
flowchart TD
  A["Preparation package materialized"] --> B["Fresh approval: isolated local DB target"]
  B --> C["Read-only DB target and runtime target inventory"]
  C --> D["DB bootstrap seed plan with exact selectors"]
  D --> E["Fresh approval: bootstrap seed only"]
  E --> F["Bootstrap seed: super_admin and required static config"]
  F --> F1["Scenario action: super_admin creates ops_admin and content_admin"]
  F1 --> G["Scenario action: content_admin uploads material and creates knowledge/question/paper baseline"]
  F1 --> H["Scenario action: ops_admin creates organization tree"]
  H --> I["Scenario action: ops_admin creates standard and advanced org_auth rows"]
  I --> J["Scenario action: ops_admin creates org admins and admin_organization binding"]
  I --> K["Scenario action: ops_admin imports >5 standard and >5 advanced employees"]
  F1 --> L["Scenario action: ops_admin prepares redeem_code and contact_config"]
  J --> M["Org admin preflight"]
  K --> N["Employee learning data creation"]
  L --> O["Scenario action: ordinary user registers, redeems standard card, and creates learning data"]
  O --> P["Personal advanced upgrade and AI learning"]
  N --> Q["Enterprise training data and analytics prerequisites"]
  P --> R["Full-chain experiential acceptance"]
  Q --> R
  M --> R
```

## Hard Dependency Rules

| Rule | Dependency                                                                       | Reason                                                                                                    |
| ---- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| D01  | Isolated DB target before any provisioning                                       | Current local DB must not become the full-chain baseline by accident.                                     |
| D02  | DB target alignment before app runtime validation                                | Runtime app DB and provisioning DB must be the same target.                                               |
| D03  | Bootstrap `super_admin` before `ops_admin` and `content_admin` scenario creation | Backend role creation and role ownership must be proven by the future scenario, not silently pre-created. |
| D04  | Content before AI generation and learning                                        | AI出题/AI组卷, practice, mock, and training need material/knowledge/question/paper context.               |
| D05  | Organization tree before org admin and employee binding                          | `admin_organization`, `employee`, and `org_auth_organization` need target organization nodes.             |
| D06  | `org_auth` before employee access validation                                     | Employee access is derived from active organization authorization scopes.                                 |
| D07  | Employee learning/training data before analytics                                 | Organization analytics is not meaningful before more than 5 employees generate activity.                  |
| D08  | Standard personal auth before upgrade card redemption                            | `edition_upgrade` requires matching active standard `personal_auth`.                                      |
| D09  | Provider/Cost approval before any real AI execution                              | AI generation and AI组卷 can create cost and sensitive payload risks.                                     |
| D10  | Redacted preflight before browser/e2e acceptance                                 | Missing bootstrap or private input prerequisites must stop before experiential validation.                |
| D11  | `contact_config` before ordinary user contact check                              | Scenario 6 proves contact visibility only if support/contact configuration is present.                    |

## Preparation Stages

| Stage | Name                          | Output                                                             | Execution status                |
| ----- | ----------------------------- | ------------------------------------------------------------------ | ------------------------------- |
| P0    | Docs-only preparation package | This task's acceptance docs, evidence, audit, state, queue         | Executed by this task           |
| P1    | Isolated DB approval          | Fresh approval text, proposed DB label, no connection yet          | Future task                     |
| P2    | Read-only target inventory    | Runtime DB target and schema/readiness labels                      | Future task                     |
| P3    | Bootstrap seed plan           | Exact selectors, bootstrap-only upsert scope, blocked operations   | Future task                     |
| P4    | Bootstrap seed execution      | `super_admin` and required static config only, redacted aggregates | Future task with fresh approval |
| P5    | Input-material preflight      | Private inputs ready and scenario-owned DB outputs absent/pending  | Future task                     |
| P6    | Experiential acceptance       | Browser/e2e plus selector-scoped read-only DB evidence             | Future task with fresh approval |

## Stop Rules

- Stop if runtime DB target differs from the approved isolated DB target.
- Stop if any private account source is missing or cannot be read by the approved future task.
- Stop if provisioning would pre-create scenario-owned outputs that the later experiential flow is supposed to prove.
- Stop if employee imports do not exceed 5 employees per standard/advanced organization.
- Stop if employee import templates contain `profession`, `level`, `subject`, `edition`, `orgAuthId`, `orgAuthScopePublicId`,
  or internal id columns.
- Stop if a commercial multi-scope enterprise package cannot be expanded into current-schema atomic `org_auth` rows.
- Stop if `contact_config` is absent or ambiguous before ordinary user contact validation.
- Stop if any standard role can access advanced-only AI or enterprise training capabilities.
- Stop if any evidence would expose private values or full content.

## Non-Claims

This DAG does not approve DB creation, provisioning, Provider use, browser/e2e execution, staging, production, Cost
Calibration, final Pass, or release readiness.
