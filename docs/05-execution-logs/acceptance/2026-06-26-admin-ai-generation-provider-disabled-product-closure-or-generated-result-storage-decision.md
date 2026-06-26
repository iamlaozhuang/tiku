# Acceptance Decision: Admin AI Generation Provider Disabled Product Closure Or Generated Result Storage

Task id: `admin-ai-generation-provider-disabled-product-closure-or-generated-result-storage-decision-2026-06-26`

Decision status: `accepted_for_next_metadata_only_closure_task`

## Decision Summary

Do not jump from local DB route smoke directly to real Provider smoke.

The next product closure step for backend admin AI generation is:

- implement a Provider-disabled, metadata-only pending/status/history loop;
- reuse existing `ai_generation_task` and `admin_ai_generation_task_metadata` records;
- keep generated result storage out of scope until a separate approval package decides result source, storage, redaction,
  retention, and adoption boundaries.

## Provider-Disabled Product Closure Rule

While Provider execution remains blocked, content admin and organization admin AI generation should present:

- a successful request acceptance state when the route creates or reuses a task;
- a visible pending/status summary after submission;
- a recent task history surface in the same backend workflow;
- clear Provider-disabled and formal-write-blocked states;
- empty or unavailable result content state, not fabricated generated output.

The UI and API may use public identifiers internally, but public identifier lists should not be the default visible
operator experience.

## Result Storage Decision

Generated result storage is deferred.

Reason:

- No real generated content exists while Provider is disabled.
- Storing placeholder result records would confuse task status with generated content.
- Real generated result storage may require a separate result domain, redaction and retention policy, review/adoption
  workflow, schema/storage decision, and security review.

Provider-disabled tasks should keep:

- `resultPublicId: null`;
- `contentVisibility: summary_only`;
- `evidenceStatus: none`;
- `citationCount: 0`;
- `runtimeStatus: local_contract_only`;
- `runtimeBridgeStatus: provider_call_blocked`;
- `questionWriteStatus: blocked_without_follow_up_task`;
- `paperWriteStatus: blocked_without_follow_up_task`.

## API Direction For Next Source Task

The next source task may add metadata-only read models and routes, for example:

- `GET /api/v1/content-ai-generation-requests`
- `GET /api/v1/organization-ai-generation-requests`

The routes must return standard `{ code, message, data }` responses and redacted DTO fields only. They must derive
actor, role, and organization scope from the current session, not from client-supplied owner ids.

No generated-result route is approved in this decision package.

## UI Direction For Next Source Task

The backend page should close the Provider-disabled loop by showing:

- submit action state;
- latest accepted task summary;
- recent task history;
- loading, empty, error, denied, and standard-unavailable states;
- Provider blocked, Cost Calibration blocked, and formal write blocked indicators;
- no raw prompt, raw generated output, raw provider payload, API key, token, cookie, Authorization header, or DB URL.

Content admin history is scoped to the content review workspace. Organization admin history is scoped to the current
organization. Organization standard admin remains unavailable or denied.

## Recommended Next Task

`admin-ai-generation-provider-disabled-task-history-and-status-ui-tdd-2026-06-26`

Expected scope:

- source and focused tests for metadata-only admin AI task history/status closure;
- no DB migration, no live DB route smoke, no Provider, no generated-result storage, and no formal content write;
- fake repository tests first, with optional existing adapter read-model tests only if no live DB connection is needed.

## Later Deferred Approval Package

If generated result storage is still desired after product closure, open:

`admin-ai-generation-generated-result-storage-approval-package-2026-06-26`

That package must decide:

- shared versus workspace-specific result storage;
- whether schema/migration is required;
- raw generated content storage policy;
- redacted preview and digest fields;
- content admin review/adoption workflow boundary;
- organization-owned draft lifecycle boundary;
- retention and audit rules;
- Provider output redaction and evidence policy.

## Non-Decision Statement

This decision does not approve Provider calls, Provider configuration, env/secret reads, Cost Calibration, DB migration,
DB connection, generated result storage, formal `question` or `paper` writes, browser/e2e, staging/prod, deployment,
payment, external service, release readiness, or final Pass.

Cost Calibration Gate remains blocked.
