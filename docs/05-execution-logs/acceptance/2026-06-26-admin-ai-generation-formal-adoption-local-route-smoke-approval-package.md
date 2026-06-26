# Admin AI generation formal adoption local route smoke approval package

Package id: `ADMIN_AI_GENERATION_FORMAL_ADOPTION_LOCAL_ROUTE_SMOKE_2026_06_26`

Decision: `APPROVED_FOR_NEXT_TASK_ONLY`

Approved next task: `admin-ai-generation-formal-adoption-local-route-smoke-execution-2026-06-26`

## Approval Source

- Current user advance approval for the admin AI formal adoption goal execution.
- Consumed by this docs/state approval package only.

## Approved Next-Task Scope

- Use local dev only.
- Use the content formal adoption route-handler path:
  `/api/v1/content-ai-generation-results/{publicId}/formal-adoptions`.
- Execute at most two route-handler POST calls:
  - one content AI question generated result adoption, if an eligible local source exists;
  - one content AI paper generated result adoption, if an eligible local source exists.
- Perform at most two sanitized eligible-source lookup queries if needed to locate existing content generated results.
- Use only redacted route/result metadata in evidence.

## Required Request Boundary

Each route smoke request must use:

- `targetType`: `question` or `paper`;
- `reviewDecision`: `approved`;
- `reviewerConfirmed`: `true`;
- content admin or super admin session injected through the route runtime test harness or approved local route harness.

## Required Evidence Fields

Evidence may record:

- route/workflow label;
- attempted call count;
- target type;
- response code/message status;
- persistence status;
- formal target write status;
- redaction status;
- sanitized failure category if any.

Evidence must not record:

- full local DB rows;
- generated result body;
- prompts;
- model output;
- Provider payload;
- API key, token, cookie, Authorization header, DB URL, password, or secret;
- formal `question` or `paper` content.

## Hard Limits

- Maximum route POST calls: 2.
- Maximum sanitized eligible-source lookup queries: 2.
- Maximum migration executions: 0.
- Maximum seed or fixture creation actions: 0.
- Maximum formal `question`/`paper` draft writes: 0.
- Maximum Provider calls: 0.

## Failure Branches

- If no eligible local content generated result exists, stop with `blocked_no_eligible_content_generated_result`.
- If DB connection is unavailable, stop with `blocked_local_db_unavailable`.
- If route returns non-zero status, stop with `blocked_route_smoke_failed`.
- If formal target write status is anything other than `blocked_without_follow_up_task`, stop and do not continue.
- If organization-scoped adoption is required, stop for a separate approval package.

## Non-Approval

This package does not approve source/test changes, schema/migration edits, migration execution, data seed, formal
`question`/`paper` draft write, Provider work, env/secret work in this task, dependency changes, staging/prod, deploy,
payment, external service, Cost Calibration, release readiness, final Pass, PR, or force push.
