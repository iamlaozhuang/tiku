# Admin AI generation formal draft paper eligible source setup or route smoke approval package

Task id:
`admin-ai-generation-formal-draft-paper-eligible-source-setup-or-route-smoke-approval-package-2026-06-26`

## Decision

Status: `APPROVED_NEXT_EXECUTION_WITH_ROUTE_BASED_PAPER_SOURCE_SETUP`.

The next execution task is approved to use the existing content admin AI generation local route as the only setup path
for a content paper eligible generated result, then run the content paper formal adoption route smoke.

Approved next execution task:
`admin-ai-generation-content-paper-generated-result-local-route-setup-and-formal-draft-route-smoke-2026-06-26`.

## Approved Route Boundaries For Next Task

- Content paper generated result setup:
  - Route: `/api/v1/content-ai-generation-requests`
  - Method: `POST`
  - Request boundary: `generationKind: "paper"` only.
  - Maximum calls: 1 content paper setup POST.
  - Provider: disabled/default local contract only; no Provider credential read or model call.
  - Result source: existing route-created/reused `admin_ai_generation_result` only.
- Content paper formal draft adoption:
  - Route: `/api/v1/content-ai-generation-results/{publicId}/formal-adoptions`
  - Method: `POST`
  - Maximum calls: 1 content paper adoption POST.
  - Reviewed draft payload: minimal reviewed paper draft shape required by the existing formal draft adapter.
  - Allowed formal write: draft `paper` only.

## Explicitly Blocked

- Direct DB seed, fixture creation, insert/update/delete outside the approved routes, cleanup deletes, or data repair.
- Schema/migration/Drizzle metadata changes or execution.
- Source/test changes.
- Provider/model call, Provider credential read, raw prompt/output capture, or Cost Calibration.
- Organization-scoped adoption.
- Formal publish, paper section/question composition, or student-visible content.
- Staging/prod, payment, external service, deployment/release readiness, PR, force push, and final Pass.

## Evidence Redaction

The next task may record only:

- workflow/route names;
- call counts;
- response code/status;
- latency;
- public identifier state (`present`/`missing`) without raw ids;
- Provider execution flag;
- migration/seed/publish flags;
- failure category.

The next task must not record:

- raw generated result;
- raw reviewed draft;
- raw route request body;
- raw DB row;
- internal numeric id;
- DB URL;
- cookie, token, Authorization header, API key, or secret;
- raw prompt/output;
- Provider payload;
- full formal paper content.

## Failure Branches

- If content paper setup route fails, stop with redacted route diagnostic; do not direct-write DB.
- If setup succeeds but no eligible result can be resolved, stop with redacted source diagnostic.
- If formal adoption route fails, stop with the smallest redacted failure category and recommend focused source TDD.
- If any step requires Provider, schema/migration, seed, source changes, cleanup, publish, or staging/prod work, stop for
  separate approval.
