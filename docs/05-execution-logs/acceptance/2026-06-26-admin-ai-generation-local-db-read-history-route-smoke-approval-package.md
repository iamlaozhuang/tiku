# Approval Package: Admin AI Generation Local DB Read History Route Smoke

Task id: `admin-ai-generation-local-db-read-history-route-smoke-approval-package-2026-06-26`

Decision status:
`APPROVE_NEXT_LOCAL_DB_READ_ONLY_HISTORY_GET_ROUTE_SMOKE_MAX_2_REQUESTS_AFTER_THIS_PACKAGE_CLOSEOUT`

## Decision

Approve a follow-up local-only read route smoke for the backend admin AI generation history endpoints.

The approved follow-up task may execute at most two GET route smoke requests:

| workspace      | method | path                                          | maximum count |
| -------------- | ------ | --------------------------------------------- | ------------- |
| `content`      | `GET`  | `/api/v1/content-ai-generation-requests`      | 1             |
| `organization` | `GET`  | `/api/v1/organization-ai-generation-requests` | 1             |

The approval is limited to proving that the already implemented metadata-only history route can read redacted task
history from the local dev DB through the existing route/service/repository boundary.

## Preconditions For The Follow-Up Smoke

- The follow-up task must use a new short branch and create task plan, evidence, and audit review.
- The local dev DB must already have the reviewed `admin_ai_generation_task_metadata` migration applied.
- The follow-up task must not run migration, seed, direct SQL, write commands, `drizzle-kit push`, or destructive DB
  operations.
- Authentication/session handling must use only the already approved local route-smoke mechanism or a redacted local
  session approach defined in the follow-up task plan.
- Codex must not read or record `.env*`, cookies, tokens, Authorization headers, database URLs, private account files,
  or raw session/localStorage contents.
- If no valid local content/admin or organization/admin session can be supplied without violating redaction rules, the
  follow-up task must stop as blocked.

## Allowed Future Execution Boundary

Approved only for the follow-up execution task:

- Local dev target only.
- GET collection history route only.
- Maximum total route requests: `2`.
- Content route: one content history read.
- Organization route: one organization history read.
- Route/service/repository path only; no direct DB row dumps.
- Response must be summarized into redacted metadata evidence only.
- Empty history is acceptable if the route returns a standard success envelope and redacted history shape.

## Evidence Allowed In Follow-Up

The follow-up evidence may record only:

- task id, branch, local target type, and method/path pair;
- per-route request count;
- HTTP status;
- API envelope code and safe message class;
- route/workspace;
- item count;
- whether `latestTask` is present;
- latest/recent task metadata categories only: `generationKind`, task status, runtime status, runtime bridge status,
  content visibility, evidence status, citation count, redaction status, and formal write blocked flags;
- provider-disabled flags: provider call executed, provider configuration read, env secret accessed, and Cost
  Calibration executed;
- command pass/fail status and high-level failure category;
- whether the response confirmed local-contract summary metadata.

## Evidence Forbidden In Follow-Up

The follow-up evidence must not record:

- raw response body;
- raw DB rows;
- raw prompt;
- raw generated output;
- raw Provider payload;
- API key, token, cookie, Authorization header, session secret, database URL, password, private account file content, or
  localStorage/sessionStorage content;
- public identifier lists;
- internal numeric ids;
- full `paper`, `question`, `material`, answer, or unpublished generated content;
- screenshots, traces, HTML reports, browser debug output, or e2e artifacts.

## Pass Criteria For The Follow-Up Smoke

The follow-up smoke may pass only if:

- no more than two GET route smoke requests are executed;
- both allowed workspace routes are attempted at most once;
- no POST, PATCH, DELETE, direct DB query, migration, seed, or account mutation is executed;
- the response uses the standard `{ code, message, data }` API envelope;
- authorized local history reads return a safe success envelope, or empty history with redacted shape;
- Provider remains disabled and no Provider configuration, env secret, or Cost Calibration execution occurs;
- formal `question` and `paper` write status remains blocked;
- evidence remains redacted under this package.

## Failure Branches

The follow-up task must stop at the smallest diagnostic if any of these occur:

- `missing_local_session_or_admin_authorization`: record that the smoke is blocked by local session availability; do not
  read credentials or expand to account mutation.
- `local_db_table_or_migration_missing`: record that local DB read smoke is blocked; do not run migration in the same
  task.
- `route_500_or_contract_error`: record method/path/status/error category only; recommend focused route diagnostic.
- `redaction_boundary_risk`: stop before recording raw payloads or sensitive fields.
- `unexpected_write_or_provider_requirement`: stop and recommend a separate approval package.

## Explicit Non-Approvals

This package does not approve:

- executing the GET smoke inside this approval-package task;
- generated result storage or generated content persistence;
- Provider/model calls, Provider configuration, env/secret reads, or Cost Calibration;
- formal `question` or `paper` write/adoption;
- migration execution, schema changes, direct SQL, seed, database write, or account mutation;
- source, test, package, lockfile, script, or env changes;
- browser/dev-server/e2e runtime;
- staging/prod/cloud/deploy, payment, external-service work, PR, force push, release readiness, or final Pass.

## Next Sequence

1. Run the follow-up local DB read history route smoke only if this approval package closes cleanly.
2. If that follow-up smoke passes, open `admin-ai-generation-generated-result-storage-approval-package-2026-06-26`.
3. Return to real Provider/Cost smoke only after product closure and generated result storage boundaries are separately
   clear.

Cost Calibration Gate remains blocked.
