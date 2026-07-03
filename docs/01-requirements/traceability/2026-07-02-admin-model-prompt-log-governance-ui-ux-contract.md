# 2026-07-02 Admin Model Prompt Log Governance UI/UX Contract

## Status

This is package 5 of the serial UI/UX requirement contract closeout.

It is documentation-only. It does not approve product source changes, tests, schema, migration, database access,
Provider execution, env/secret access, browser/runtime validation, staging/prod deployment, payment, external-service
work, Cost Calibration, release readiness, final Pass, or production usability claims.

## Scope

This contract covers the first-release admin experience for:

- `model_provider` and `model_config` management;
- super-admin-only model connection test;
- read-only `prompt_template` registry and super-admin full-text view;
- global `audit_log` and `ai_call_log` list/detail governance;
- redacted summaries, denied raw viewers, no export/delete/archive, and workspace role boundaries.

It does not cover content AI formal adoption design, organization AI result handoff, content resource management, or
learner AI context selection except as explicit boundary references.

## Required Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- relevant current implementation files under `src/features/admin/model-config-management`,
  `src/app/(admin)/ops/ai-audit-logs`, `src/app/api/v1/model-*`, `src/app/api/v1/prompt-templates`,
  `src/app/api/v1/audit-logs`, `src/app/api/v1/ai-call-logs`, `src/server/services/admin-ai-audit-log-*`,
  `src/server/contracts/*log*`, and `src/ai/prompts/templates.ts`.

## Existing Requirement Decisions

The following points are already decided and are not reopened by this contract:

- `super_admin` manages `model_provider` and `model_config`.
- `ops_admin` may see model/config summaries, but cannot modify model configuration.
- API keys and provider secrets are never shown in plaintext; UI may show status and last four characters only.
- `model_config` must provide a `super_admin`-only connection test action.
- The connection test uses a minimal synthetic payload without user data, raw Prompt, private content, full question text,
  paper material, employee answer, or provider payload in evidence.
- Connection test writes redacted `audit_log` and `ai_call_log` metadata with action `model_config_health_check`.
- Connection test failure must not automatically disable the model or change routing.
- Prompt management is a read-only registry in the first release.
- `super_admin` may view full text for registered project `prompt_template` entries.
- `ops_admin` sees Prompt metadata only and cannot view Prompt full text.
- If a project Prompt exists but is not registered in the registry, later work must record a catalog gap instead of
  silently hiding it.
- Editable Prompt UI requires later security/design approval.
- `ai_call_log` detail may show redacted input/output summaries, status, duration, cost/quota metadata, object type,
  object id, model/provider metadata, and failure category.
- `ai_call_log` detail must not show raw Prompt, Provider payload, raw AI input/output, full `question`/`paper`/`material`
  content, or raw employee answers.
- Global `audit_log` and `ai_call_log` remain `super_admin` / `ops_admin` surfaces only.
- Content and organization workspaces may see only approved object-level redacted summaries, not global logs.
- First release has no log export, delete, archive, hard-delete executor, or raw sensitive-content viewer.

Primary decision anchors:

- `CT-REQ-025` - Prompt governance.
- `CT-REQ-026` - `model_config` management and connection test.
- `CT-REQ-027` - global audit and AI call logs.
- `CT-REQ-039` - Prompt full-text read-only registry.
- `CT-REQ-049` - AI call log detail redaction backfill.
- `UX-REQ-10` - AI interface and Prompt governance.
- `UX-REQ-11` - `ai_call_log` detail redaction.
- `D11`, `D18`, and `D24` in the role/auth/training/ops decision package.

## Role And Access Contract

| Actor                | Required result                                                                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `super_admin`        | Can manage `model_provider`/`model_config`, run connection tests, view registered Prompt full text, and read global redacted `audit_log`/`ai_call_log`.        |
| `ops_admin`          | Can read global redacted `audit_log`, `ai_call_log`, model/config summaries, Prompt metadata, and cost summaries; cannot edit config or view Prompt full text. |
| `content_admin`      | Cannot access global model config, global Prompt registry, or global logs; may see approved object-level redacted summaries on content-owned surfaces only.    |
| `org_standard_admin` | Cannot access global model config, Prompt governance, global logs, or enterprise AI quota consumption summaries.                                               |
| `org_advanced_admin` | Cannot access global model config, Prompt governance, global logs, raw Provider/Prompt data, or enterprise AI quota consumption summaries.                     |
| Learner or employee  | Cannot access admin model config, Prompt registry, global logs, or cost governance surfaces.                                                                   |

UI visibility is not the authorization boundary. Services must enforce role, workspace, source object scope, and
redaction rules.

## Information Architecture Contract

The first-release admin surface should be split into four understandable sections:

1. Model providers and model configs.
2. Prompt registry.
3. AI call logs and cost summary.
4. Audit logs.

For `super_admin`, the first two sections are management-oriented, except Prompt is still read-only. For `ops_admin`,
all four sections are read-only summaries. The UI should disable or hide write controls when the current role cannot
perform them, while services remain the final boundary.

Lists should use backend-style pagination with page-size options `20`, `50`, and `100`, and should preserve filters,
sort, page, and page size in URL query where practical.

## Model Provider And Config Contract

Required first-release model provider fields:

- provider display name;
- provider key;
- base URL or endpoint summary when configured;
- secret status;
- API key last four characters only;
- enabled/disabled status;
- updated time;
- latest operation metadata.

Required first-release model config fields:

- model display name;
- provider;
- model name and alias;
- AI function type;
- primary/fallback role;
- fallback priority;
- timeout and retry limits;
- config version;
- enabled/disabled status;
- runtime selection status;
- Prompt template key/version alignment;
- latest connection test status and time after the health-check task is implemented.

Super-admin write actions:

- create/update provider metadata;
- rotate or replace API key by entering a new full value, never by reading the old full value;
- create/update model config;
- enable/disable provider/config with confirmation when it can affect runtime behavior;
- reorder fallback;
- run connection test.

Ops read-only state:

- view provider/config summaries;
- view secret status and last four characters only;
- view runtime selection and latest connection test summary;
- no create/update/enable/disable/reorder/test buttons.

## Connection Test Contract

The connection test is a health check, not a user-content AI task.

Required behavior:

- available only to `super_admin`;
- action label: "测试连接" or equivalent;
- disabled when provider secret or model config is incomplete;
- sends only a minimal synthetic request;
- must not include user data, raw Prompt, private content, full question text, paper material, employee answer, or
  generated business content;
- records redacted `audit_log` metadata;
- records redacted `ai_call_log` metadata with action/function marker `model_config_health_check`;
- displays success, failure, timeout, provider unavailable, missing secret, and permission-denied states;
- failure does not disable the model, change fallback order, or block existing tasks automatically.

Visible result fields:

- status;
- tested at;
- tested by;
- duration;
- failure category when failed;
- redaction status;
- no request/response body.

## Prompt Registry Contract

Prompt registry is read-only in the first release.

Required first-release fields:

- prompt template key;
- AI function type;
- version;
- title/description;
- active status;
- required variables;
- template hash/digest;
- last registered or updated time;
- registration source;
- catalog gap status when a project prompt is not registered.

`super_admin` detail behavior:

- may open a detail view/drawer and view full registered Prompt text;
- full text view must be clearly labeled as a privileged admin view;
- no edit, save, enable, disable, delete, export, or copy-to-log action is approved by this contract;
- full text must not be written to `audit_log`, `ai_call_log`, evidence, screenshots, exports, or non-super-admin views.

`ops_admin` detail behavior:

- metadata only;
- no full text;
- no edit controls.

If the implementation keeps service-side Prompt files such as `src/ai/prompts/templates.ts`, the registry must either
list all entries from that catalog or expose a visible catalog-gap state. Hidden missing prompts are not acceptable.

## AI Call Log Contract

`ai_call_log` is a read-only operations/governance surface.

List requirements:

- filters for function type, user, organization, profession, level, call status, and time range where data exists;
- keyword search over safe identifiers and summaries only;
- sort by started/completed time;
- pagination `20` / `50` / `100`;
- visible fields: function type, status, provider, model alias, profession, level, token counts, duration, started time,
  completed time, evidence status, and redacted summary markers.

Detail requirements:

- status and failure category;
- duration;
- provider/model metadata;
- Prompt version/key, not raw Prompt text;
- redacted input summary;
- redacted output summary;
- object type and public object reference when approved;
- RAG retrieval summary and `evidence_status`;
- cost/quota metadata for global operations views;
- no raw viewer and no reveal button.

Forbidden:

- raw Prompt;
- Provider request or response body;
- raw AI input/output;
- full `question`, `paper`, `material`, resource, or chunk content;
- raw employee answers;
- credentials, env values, cookies, sessions, Authorization headers, or database rows;
- export/delete/archive actions in first release.

## Audit Log Contract

`audit_log` is read-only in the first release.

List/detail requirements:

- filters for action type, actor, target resource type, result status, time range, and keyword;
- pagination `20` / `50` / `100`;
- visible fields: actor, actor role, action type, target type, target public reference, result status, redacted metadata,
  request IP when allowed, and created time;
- details should explain what changed in business language rather than exposing raw payloads.

Forbidden:

- raw request body;
- secrets;
- tokens;
- Provider payloads;
- raw Prompt;
- plaintext `redeem_code`;
- raw employee answers;
- full content payloads;
- export/delete/archive/hard-delete.

## Cost Summary Contract

Global operations cost summaries are allowed for `super_admin` and `ops_admin` only.

Allowed display:

- day/month aggregation;
- function type;
- provider/model;
- call count;
- success/failed count;
- total token count;
- estimated cost.

Forbidden display:

- organization-admin enterprise AI quota consumption summary;
- user-facing AI balance or token billing;
- production quota pricing defaults;
- Cost Calibration claim.

## States Contract

Required states:

- loading;
- empty;
- error;
- permission denied;
- read-only because current role is `ops_admin`;
- model config incomplete;
- secret missing;
- connection test running;
- connection test succeeded;
- connection test failed;
- connection test timeout;
- Prompt registry empty;
- Prompt full text unavailable to non-super-admin;
- catalog gap for unregistered Prompt;
- logs unavailable;
- filters return no result;
- export/delete/archive unavailable.

State copy should use business wording and avoid showing internal policy keys as the primary user-facing language.

## Current Source Alignment

Static source inspection found partial implementation, not runtime acceptance.

Aligned or directionally aligned:

- `AdminModelConfigManagement` provides model provider, model config, and Prompt template tabs.
- UI displays masked API key/secret status and uses model config status labels.
- Runtime services include `canManageModelConfig` with `super_admin` as the write role.
- Runtime services include `canReadAiAuditLog` for `super_admin` and `ops_admin`.
- `AdminAiAuditLogOpsBaseline` loads model providers, model configs, prompt templates, audit logs, AI call logs, and cost
  summaries from protected APIs when runtime mode is enabled.
- `admin-ai-audit-log-ops-contract.ts` has pagination options `20`, `50`, and `100`.
- `ai-call-log/log-governance-contract.ts` and `audit-log/log-governance-contract.ts` model summary-only DTOs and blocked
  raw viewer/export capabilities.
- `src/ai/prompts/templates.ts` currently registers five project Prompt definitions with template content and required
  variables.
- `ai_call_log` and `audit_log` contracts include raw fields only on internal record types while DTOs expose redacted
  summaries.

Gaps or conflicts with the confirmed contract:

- No `model_config_health_check` route, UI action, or service was found.
- Prompt UI still exposes "模板表单", "保存模板", and enable/disable style controls, while first release requires a
  read-only registry.
- Prompt routes include create/update/enable/disable handlers, even though current implementation returns mutation
  unavailable. The UI should not present these as normal first-release actions.
- Prompt DTO/UI expose only `bodyDigest` and `bodyPreviewMasked`; `super_admin` full-text Prompt view is not represented.
- The registry is not visibly tied to all service-side Prompt definitions in `src/ai/prompts/templates.ts`, so unregistered
  Prompt catalog gaps may be hidden.
- Ops and super-admin UI states are not clearly separated; write controls can appear in the shared page even if service
  authorization would reject them.
- AI call log list displays prompt summary, but no explicit detail contract/UI was found for redacted input/output,
  failure category, object type, and raw-view denial.
- Audit log list/detail does not yet show the full first-release filter/detail UX from requirements.
- Runtime query is currently fixed to `page=1&pageSize=20&sortBy=updatedAt&sortOrder=desc`; visible filter, sort, and
  URL-query controls are not represented in the inspected UI.
- Technical labels such as metadata-only and redacted are visible in several places; later UI work should translate these
  into clearer business labels while preserving audit proof.

## Follow-Up Source Gap Register

| Id                       | Follow-up source task direction                                                                                                                          |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ADMIN-AI-GOV-UX-GAP-01` | Add `super_admin`-only `model_config_health_check` UI, route, service, audit metadata, and redacted `ai_call_log` metadata.                              |
| `ADMIN-AI-GOV-UX-GAP-02` | Make Prompt first-release UI read-only: remove or hide create/update/enable/disable/save controls unless a later approved editable Prompt task exists.   |
| `ADMIN-AI-GOV-UX-GAP-03` | Add `super_admin` Prompt full-text detail view for registered project prompts, with no log/evidence/screenshot/export leakage.                           |
| `ADMIN-AI-GOV-UX-GAP-04` | Add Prompt registry completeness checks against the project Prompt catalog and show catalog gaps instead of silently hiding unregistered prompts.        |
| `ADMIN-AI-GOV-UX-GAP-05` | Split role-aware UI states: `super_admin` management actions versus `ops_admin` read-only summaries.                                                     |
| `ADMIN-AI-GOV-UX-GAP-06` | Add AI call log detail view with redacted input/output summaries, failure category, object references, and explicit raw-view denial.                     |
| `ADMIN-AI-GOV-UX-GAP-07` | Add audit log detail view with business-readable redacted metadata and no raw request/secret/payload content.                                            |
| `ADMIN-AI-GOV-UX-GAP-08` | Add visible filters, sorting, pagination controls, and URL-query preservation for logs, model summaries, Prompt registry, and cost summaries.            |
| `ADMIN-AI-GOV-UX-GAP-09` | Keep global logs/config/Prompt out of content, organization, learner, and employee workspaces except approved object-level redacted summaries.           |
| `ADMIN-AI-GOV-UX-GAP-10` | Replace technical policy-key copy with business-readable labels while preserving redaction and governance proof.                                         |
| `ADMIN-AI-GOV-UX-GAP-11` | Keep log export, delete, archive, hard-delete, raw Prompt viewer, Provider payload viewer, raw AI IO viewer, and raw employee answer viewer unavailable. |
| `ADMIN-AI-GOV-UX-GAP-12` | Keep global cost summary limited to `super_admin` and `ops_admin`; do not expose organization-admin enterprise AI quota consumption summary.             |

## Decision Items

No new product decision is required from this package. The current decisions are sufficient:

- Prompt registry is read-only in first release.
- `super_admin` can view full registered Prompt text.
- `ops_admin` sees Prompt metadata only.
- `model_config_health_check` is required, but its implementation remains a follow-up source task.
- AI call log details are redacted summaries only.

If a later source task proposes editable Prompt UI, raw Prompt/Provider/raw AI viewers, log export/delete/archive,
organization-admin quota-consumption summaries, or automatic model disabling after a failed connection test, it must stop
and request a new product decision.

## Non-Claims

- No source implementation is complete by this contract.
- No runtime acceptance is claimed.
- No Provider, database, schema, migration, dependency, staging/prod, payment, Cost Calibration, release readiness,
  final Pass, or production usability is claimed.
