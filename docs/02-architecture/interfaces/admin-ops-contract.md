# Admin Ops Contract

## Status

Baseline for Phase 6 implementation planning.

## Purpose

This contract defines the Phase 6 `admin` operations boundary before implementation starts. It protects existing `user`, `student`, `organization`, `authorization`, `redeem_code`, content, student activity, AI/RAG, `audit_log`, and `ai_call_log` contracts while allowing later tasks to add admin shell, operations APIs, log views, model configuration management, and quality monitoring in small verified increments.

This document is normative for Phase 6 planning. It does not add runtime behavior, dependencies, schema, migration files, provider configuration, environment variables, deployment settings, source code, or tests.

## Sources

- `AGENTS.md`
- `docs/03-standards/glossary.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/interfaces/global-db-api-skeleton.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/04-agent-system/sop/security-review-gate.md`

## Non-Goals

- No dependency introduction.
- No `package.json`, `pnpm-lock.yaml`, or `package-lock.json` change.
- No `src/**` implementation in this task.
- No `drizzle/**` migration generation in this task.
- No `.env.example`, real secret, provider key, or deployment configuration change.
- No database migration or production data operation.
- No Browser/IAB or rendered UI verification in this documentation-only baseline.
- No change to existing Phase 2 through Phase 5 public contracts except by documenting how admin operations must consume them.

## Architectural Boundary

Tiku remains a TypeScript Next.js monolith as accepted in ADR-001 and ADR-002. Phase 6 implementation must follow the existing layering:

```text
route handlers / server actions -> service -> repository -> model
```

Admin REST routes live under `/api/v1/` and use kebab-case plural nouns. Route handlers and Server Actions are transport adapters only. Business behavior belongs in `src/server/services`, persistence belongs in `src/server/repositories`, contract definitions belong in `src/server/contracts`, and database row to API JSON conversion belongs in `src/server/mappers`.

Admin UI may use Server Actions for Web-only flows, but shared business rules and reusable mutations must still live in services so later clients and audit checks do not depend on UI code.

## Naming Rules

- Database identifiers use `snake_case`.
- API JSON fields use `camelCase`.
- REST paths use `/api/v1/` and kebab-case plural nouns.
- External URLs use public identifiers such as `publicId`; numeric auto-increment `id` values are internal only.
- Use `organization`, with `org` only where the glossary explicitly allows abbreviation.
- Use `authorization`, `personal_auth`, and `org_auth`; do not use forbidden alternatives.
- Use `redeem_code`, not unregistered short names.
- Use `model_config`, `model_provider`, and `prompt_template` for AI configuration concepts.
- Use `audit_log` for admin operation audit trail.
- Use `ai_call_log` for AI invocation telemetry and troubleshooting metadata.

## Common Admin API Contract

All Phase 6 APIs return the standard response envelope:

```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "pagination": null
}
```

Rules:

- Optional fields return `null`, not omitted keys or empty strings.
- Empty lists return `[]`.
- Time fields use ISO 8601.
- Pagination uses `page`, `pageSize`, `sortBy`, `sortOrder`, and response `total`.
- Resource nesting is limited to two levels.
- State-changing operations use verb subpaths.
- Every admin API requires authenticated `admin` context.
- `publicId` is only a lookup handle. It is never an authorization mechanism.
- Every lookup by public identifier must be combined with session, role, organization scope, and resource-specific permission checks.
- Route handlers and Server Actions must not return database rows directly.

## Admin Role Boundary

Phase 6 recognizes the existing `admin_role` values:

- `super_admin`: global administration, model configuration, admin account and role management, high-risk maintenance operations.
- `ops_admin`: operations administration for `user`, `organization`, `employee`, `authorization`, `redeem_code`, audit views, and operational reports.
- `content_admin`: content administration for `question`, `paper`, `resource`, `knowledge_base`, `knowledge_node`, and related quality workflows.

Rules:

- A user may have multiple admin roles when Phase 6 implementation supports it.
- Backend admin accounts are separate from student accounts.
- Admin account creation and role assignment are super-admin-only operations.
- Content teacher scope does not include profession or level isolation in the first phase unless a later task explicitly adds it.
- Dangerous operations require explicit confirmation in UI and explicit service-level permission checks.
- Account disable, password reset, authorization changes, employee imports, card generation, and model configuration changes must write `audit_log` entries.

## Admin Shell Interaction Contract

Admin UI tasks must provide:

- List default page size of 20 with supported `pageSize` values 50 and 100.
- Sortable table headers that map to approved `sortBy` fields.
- Filters that refresh list data after changes.
- Loading, empty, and error states for every data-fetching view.
- Success and failure Toast feedback for mutations.
- Confirmation dialogs for bulk actions and dangerous actions.
- Red danger styling for destructive or high-risk actions.
- Optimistic lock, database atomic operation, or equivalent concurrency defense for authorization creation or adjustment, employee bulk import, and redeem code generation.
- Conflict message equivalent to "Data was updated by another operation. Refresh and try again." in localized UI copy when the implementation layer adds copy.

This baseline does not implement UI. It requires later UI tasks to use design tokens and avoid hardcoded color, spacing, and theme logic.

## REST Surface Baseline

The following surfaces are approved planning targets. Later implementation tasks may split route folders differently, but paths must stay within `/api/v1/` and use public identifiers where route params are exposed.

### User And Account Operations

- `GET /api/v1/users`
- `GET /api/v1/users/{publicId}`
- `POST /api/v1/users/{publicId}/disable`
- `POST /api/v1/users/{publicId}/enable`
- `POST /api/v1/users/{publicId}/reset-password`

Rules:

- Lists may filter by phone, name, status, `userType`, organization binding, and authorization state.
- User detail may include basic profile, authorization summaries, and organization binding summaries.
- Phase 6 first release does not delete users.
- Responses must not expose password hashes, session internals, login tokens, or numeric ids.

### Organization And Employee Operations

- `GET /api/v1/organizations`
- `POST /api/v1/organizations`
- `GET /api/v1/organizations/{publicId}`
- `PATCH /api/v1/organizations/{publicId}`
- `POST /api/v1/organizations/{publicId}/disable`
- `POST /api/v1/organizations/{publicId}/enable`
- `GET /api/v1/organizations/{publicId}/employees`
- `POST /api/v1/organizations/{publicId}/employees`
- `POST /api/v1/organizations/{publicId}/employees/import`
- `POST /api/v1/organizations/{publicId}/employees/{employeePublicId}/unbind`

Rules:

- Organization tree APIs must enforce allowed `org_tier` values: `province`, `city`, `district`, and registered descendants when present.
- Disabling an organization must define whether child organizations are affected before execution.
- Employee import must be atomic per accepted import batch or return a conflict/validation summary.
- Organization reads must not allow cross-scope visibility by changing a parent or child `publicId`.

### Authorization Operations

- `GET /api/v1/authorizations`
- `POST /api/v1/authorizations`
- `GET /api/v1/authorizations/{publicId}`
- `POST /api/v1/authorizations/{publicId}/cancel`
- `GET /api/v1/authorizations/{publicId}/occupancies`

Rules:

- `authorization` includes `personal_auth` and `org_auth` views where appropriate.
- New organization authorization must validate overlap by `organization`, `auth_scope_type`, `profession`, `level`, and effective date range.
- Authorization state handling must consider active, expired, cancelled, disabled, and not-yet-started records.
- Cancellation is append-audited and must not silently delete historical records.
- Employee occupancy details must use public references externally and keep internal ids inside repositories and audit-safe internal records.

### Redeem Code Operations

- `GET /api/v1/redeem-codes`
- `POST /api/v1/redeem-codes/batches`
- `GET /api/v1/redeem-codes/{publicId}`

Rules:

- Lists may filter by `redeem_code_status`, profession, level, created time, and redemption state.
- Generated codes may be visible in clear text to authorized operations admins in the first release because distribution requires copying.
- Clear-text display must be role-gated, audited, and never written to client logs by implementation code.
- First release does not export or void redeem codes unless a later approved task changes scope.

### Content And Knowledge Operations

Phase 6 consumes and extends the existing content and RAG contracts:

- `GET /api/v1/questions`
- `GET /api/v1/papers`
- `GET /api/v1/resources`
- `GET /api/v1/knowledge-nodes`
- State-changing content routes already defined by Phase 3 and Phase 5 contracts.

Rules:

- Content admins can create, edit, disable, copy, publish, archive, and maintain content only through service-level permissions.
- Resource and knowledge base operations must respect RAG-ready, indexing, conversion failed, disabled, and published states.
- Manual vector rebuilds are high-risk operational actions and must write `audit_log` entries.
- Content APIs must not expose `object_key`, provider secrets, raw embeddings, or internal numeric ids.

### Model Configuration Operations

- `GET /api/v1/model-providers`
- `POST /api/v1/model-providers`
- `GET /api/v1/model-providers/{publicId}`
- `PATCH /api/v1/model-providers/{publicId}`
- `POST /api/v1/model-providers/{publicId}/enable`
- `POST /api/v1/model-providers/{publicId}/disable`
- `GET /api/v1/model-configs`
- `POST /api/v1/model-configs`
- `GET /api/v1/model-configs/{publicId}`
- `PATCH /api/v1/model-configs/{publicId}`
- `POST /api/v1/model-configs/{publicId}/enable`
- `POST /api/v1/model-configs/{publicId}/disable`
- `POST /api/v1/model-configs/reorder-fallback`
- `GET /api/v1/prompt-templates`
- `POST /api/v1/prompt-templates`
- `GET /api/v1/prompt-templates/{publicId}`
- `PATCH /api/v1/prompt-templates/{publicId}`
- `POST /api/v1/prompt-templates/{publicId}/enable`
- `POST /api/v1/prompt-templates/{publicId}/disable`

Rules:

- `super_admin` is required for every create, update, enable, disable, rotate, and fallback-order mutation.
- `super_admin` may read all model configuration metadata. Other admin roles may read only redaction-safe summaries when a later task explicitly needs them for operations views.
- `model_provider` credentials remain server-side only.
- Secret input is accepted only in short-lived request payload fields for create or explicit rotation/update. It must never be returned, written to evidence, logged, or exposed in UI state.
- API key display must be redacted, for example only a masked status and last four characters when the storage policy allows that metadata.
- Provider DTOs expose `publicId`, `providerKey`, `displayName`, `status`, `isEnabled`, `secretStatus`, `maskedSecret`, `lastRotatedAt`, `createdAt`, and `updatedAt`. They do not expose raw credential values, environment variable values, provider payloads, or numeric ids.
- `secretStatus` values are redaction-safe strings such as `not_configured`, `configured`, `rotation_required`, and `disabled`.
- `maskedSecret` is either `null` or a display-only mask such as `****1234`; it is not a reversible credential and is never used for provider calls.
- Each AI function mapping must be explicit: `ai_scoring`, `ai_explanation`, `ai_hint`, `kn_recommendation`, and `learning_suggestion`.
- `model_config` DTOs expose `publicId`, `providerPublicId`, `providerDisplayName`, `modelName`, `modelAlias`, `functionType`, `status`, `isEnabled`, `fallbackPriority`, `timeoutMs`, `retryLimit`, `configVersion`, `snapshotPolicy`, `createdAt`, and `updatedAt`.
- Fallback policy must be explicit per function type and recorded in redaction-safe audit metadata. Reordering fallback is a state-changing action and must write `audit_log`.
- `ai_scoring` fallback remains disabled unless a specific `model_config` version enables an explicit ordered fallback policy. Explanation, hint, recommendation, and learning suggestion may use fallback only when the enabled configs and ordered priorities are recorded.
- Later AI calls must snapshot redaction-safe `model_config` metadata when work starts. Snapshots must not include secret values or provider-specific raw request/response shapes.
- `prompt_template` admin DTOs expose `publicId`, `templateKey`, `version`, `functionType`, `status`, `isEnabled`, `title`, `description`, `bodyDigest`, `bodyPreviewMasked`, `createdAt`, and `updatedAt`.
- `bodyPreviewMasked` must not contain raw prompt content. Full prompt body editing, if introduced later, requires a separate approved retention and evidence-redaction policy.
- Prompt template version changes do not rewrite historical `ai_call_log`, exam reports, scoring results, or snapshots.
- All model-provider, model-config, and prompt-template APIs return the standard `{ code, message, data, pagination? }` envelope.
- API JSON fields use camelCase and route params use `publicId`; numeric auto-increment ids remain internal.
- Audit metadata may include public references, action type, status before/after, fallback priorities, config version, and masked secret status. It must not include secret values, raw prompt body, raw answer, raw model response, raw provider payload, Authorization headers, tokens, or database URLs.

### Audit Log Operations

- `GET /api/v1/audit-logs`
- `GET /api/v1/audit-logs/{publicId}`

Rules:

- `audit_log` is append-only and read-only from admin UI.
- Audit records must not be modified or deleted through Phase 6 UI.
- First release does not export audit logs.
- First release has no log retention limit.
- Audit log details may include actor public reference, role, action type, target resource type, target public reference, request time, result status, and redaction-safe metadata.
- Audit log details must not include password hashes, session tokens, API keys, bearer tokens, raw card batches unless explicitly approved, provider secrets, or unredacted request bodies.

### AI Call Log Operations

- `GET /api/v1/ai-call-logs`
- `GET /api/v1/ai-call-logs/{publicId}`
- `GET /api/v1/ai-call-logs/summary`

Rules:

- `ai_call_log` is read-only from admin UI.
- Lists may filter by AI function type, user public reference, organization public reference, profession, level, call status, and time range.
- Detail views may show input and output summaries only when they are redaction-safe.
- Cost summaries may aggregate by day, month, AI function type, provider display name, and model alias.
- Raw prompts, raw user answers, raw model outputs, raw citations, raw retrieved chunks, provider headers, provider payloads, and provider errors remain hidden unless a later task defines a safe retention policy and passes security review.

## DTO Baseline

Implementation tasks should define DTOs in `src/server/contracts`. Names below are contractual planning names.

- `AdminUserSummaryDto`
- `AdminUserDetailDto`
- `OrganizationTreeNodeDto`
- `EmployeeSummaryDto`
- `AuthorizationSummaryDto`
- `AuthorizationDetailDto`
- `RedeemCodeSummaryDto`
- `RedeemCodeDetailDto`
- `ModelConfigSummaryDto`
- `ModelConfigDetailDto`
- `ModelProviderSummaryDto`
- `ModelProviderDetailDto`
- `PromptTemplateSummaryDto`
- `PromptTemplateDetailDto`
- `AuditLogSummaryDto`
- `AuditLogDetailDto`
- `AiCallLogSummaryDto`
- `AiCallLogDetailDto`
- `AiCallLogCostSummaryDto`

Required DTO rules:

- Every externally visible entity uses `publicId`.
- Nullable values are represented as `null`.
- Lists use `[]`.
- Time values use ISO 8601.
- JSON keys use camelCase.
- DTOs do not expose numeric `id`, password hashes, session internals, object storage keys, API keys, provider secrets, raw prompts, raw model outputs, or raw provider payloads.

## Error Contract

Recommended error code ranges for Phase 6:

- `4036xx`: admin permission denied, role denied, organization scope denied, or high-risk operation denied.
- `4046xx`: admin-visible resource not found by public identifier.
- `4096xx`: concurrent update conflict, overlapping authorization, duplicate import row, stale model configuration version, or invalid lifecycle transition.
- `4226xx`: validation failure, unsupported filter or sort field, invalid operation payload, or unsafe log detail request.

Every error response shape:

```json
{
  "code": 403601,
  "message": "Admin permission denied.",
  "data": null
}
```

## Threat Model Baseline

### Assets

- Admin accounts, roles, sessions, and failed login state.
- `user`, `student`, `employee`, and organization membership data.
- `organization` hierarchy and org tier boundaries.
- `authorization`, `personal_auth`, `org_auth`, and effective access state.
- `redeem_code` values and redemption history.
- Content and knowledge operations over questions, papers, resources, and knowledge nodes.
- `model_provider`, `model_config`, prompt template mapping, and provider credentials.
- `audit_log` and `ai_call_log` records.
- Student answer, exam report, RAG citation, and AI usage summaries surfaced through admin views.

### Trust Boundaries

- Admin browser to REST route handler or Server Action.
- Route handler or Server Action to service.
- Service to repository and database.
- Admin operation service to audit sink.
- AI configuration service to provider credential storage.
- AI call log and audit log read models to admin UI.
- Content/RAG operation service to object storage metadata and vector-ready resources.

### Abuse Cases

- A disabled or non-admin user accesses admin routes.
- An admin changes a `publicId` in the URL to read another organization, employee, authorization, redeem code, audit log, or AI call log outside their permitted scope.
- An `ops_admin` performs content authoring or model configuration actions reserved for `content_admin` or `super_admin`.
- A `content_admin` performs user, organization, authorization, redeem code, or model configuration changes outside role scope.
- An overlapping `org_auth` is created by racing two requests.
- A redeem code batch is generated twice or partially committed after an import-style conflict.
- A clear-text redeem code is exposed to a role that should only see metadata.
- `audit_log` becomes editable or deletable through admin UI.
- `audit_log` stores raw passwords, session tokens, API keys, provider secrets, or unsafe request bodies.
- `ai_call_log` exposes raw prompts, user answers, model outputs, citations, chunks, provider payloads, or provider errors.
- Model config edits leak provider credentials or change in-flight AI behavior without snapshotting.
- A report or cost summary reveals user activity outside permitted organization scope.
- External URLs expose numeric internal ids.

### Required Mitigations

- Require authenticated admin session for every admin API.
- Check admin role and operation permission in service code, not only in UI.
- Combine public identifier lookup with role, organization scope, ownership, and resource state checks.
- Use public identifiers externally and keep numeric ids internal.
- Validate authorization overlap and high-risk concurrency with atomic database operations or optimistic locking in implementation tasks.
- Make `audit_log` and `ai_call_log` read-only from admin UI.
- Redact secrets, session internals, passwords, provider payloads, raw prompts, raw answers, raw chunks, and raw model outputs before API response or logs.
- Snapshot redaction-safe `model_config` metadata for AI work that depends on model configuration.
- Require explicit security review for later schema, service, route, UI, logging, model configuration, authorization, and redeem code tasks.

## Implementation Sequencing

1. `phase-6-admin-shell-common-interaction-baseline`
   - Implement desktop-first admin shell and common interaction patterns.
2. `phase-6-user-org-auth-ops-baseline`
   - Implement user, organization, employee, authorization, redeem code, and admin role operations.
3. `phase-6-content-and-knowledge-ops-baseline`
   - Implement content, resource, knowledge base, and knowledge node operations.
4. `phase-6-ai-and-audit-log-ops-baseline`
   - Implement model config, audit log, AI call log, and operational summary views.
5. `phase-6-admin-ops-readiness-evidence`
   - Close Phase 6 evidence after implementation tasks pass gates.

## Approval Decision

Approved for Phase 6 implementation planning if the paired security review verdict is `APPROVE` or non-blocking `COMMENT`.

This approval does not approve:

- Dependency installation.
- Migration generation.
- Production database changes.
- Real secret handling.
- Deployment.
- Force push.
