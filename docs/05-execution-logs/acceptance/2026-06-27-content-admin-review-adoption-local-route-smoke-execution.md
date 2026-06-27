# Content Admin Review Adoption Local Route Smoke Execution Acceptance

Task id: `content-admin-review-adoption-local-route-smoke-execution-2026-06-27`

Decision: `LOCAL_ROUTE_RUNTIME_REJECTED_SMOKE_PASSED_DEFAULT_DB_PATH_BLOCKED`

moduleRunVersion: 2

Cost Calibration Gate remains blocked.

## Scope

This task executes one capped local route/runtime smoke for the content-admin generated-result review adoption loop.

The smoke uses the source-defined route handler surface without browser, dev-server, e2e, Provider, Cost Calibration,
schema/migration/seed/destructive DB, formal publish, student-visible runtime, staging/prod/deploy/payment external
service, OCR/export, PR, force push, release readiness, or final Pass.

## Execution Summary

| Item                       | Result                                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| Route surface              | `POST /api/v1/content-ai-generation-results/{publicId}/formal-adoptions`                     |
| Runtime path               | route handler -> service -> injected local test repository                                   |
| Role label                 | `content_admin`                                                                              |
| Decision used              | `rejected`                                                                                   |
| Invocation cap             | one focused route handler invocation through existing focused runtime test                   |
| Test target                | existing synthetic test-owned generated-result public id from the focused runtime route test |
| Formal draft adapter       | asserted not called                                                                          |
| Formal publish             | not executed                                                                                 |
| Student-visible runtime    | not executed                                                                                 |
| Default PostgreSQL runtime | not consumed because it reads `.env.local` for `DATABASE_URL`                                |

## Accepted Behavior

The focused runtime route smoke passed:

- the route accepted a `content_admin` actor for one generated-result target;
- the route executed a `rejected` review decision;
- the response preserved the standard `{ code, message, data }` envelope;
- the returned review status was `rejected`;
- rejected traceability recorded an executed reject action and non-executed adopt action;
- formal target write status remained `blocked_without_follow_up_task`;
- formal question and paper ids remained `null`;
- formal draft creation was not called;
- raw generated content and the synthetic Authorization token were not returned;
- no internal numeric `id` was exposed.

## Layer Status

| Layer                             | Status after this task                                                                          | Residual gate                                                                                                                           |
| --------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Layer 1 role/entry/permission     | No-regression guard retained                                                                    | No new browser or role-matrix claim                                                                                                     |
| Layer 2 business function loop    | Route handler runtime smoke passed for one rejected decision using an injected local repository | Real local PostgreSQL/default runtime path, credentialed browser observation, and broader approved/rejected DB readback remain separate |
| Layer 3 Provider/cost/pre-release | Blocked                                                                                         | Provider, Cost Calibration, staging/prod, deploy, payment, OCR/export, and external-service gates remain blocked                        |

## DB Boundary Result

The task did not execute the default PostgreSQL runtime path. Source inspection shows
`src/server/repositories/runtime-database.ts` loads `.env.local` to obtain `DATABASE_URL` when the default repository is
used. The previous approval package requires stopping if `.env*` or credential reads are needed.

Therefore this task consumes the route runtime and injected repository boundary only. It does not claim local DB
read/write closure.

## Explicit Non-Claims

- No source/test/product code changed.
- No browser/dev-server/e2e was run.
- No `.env*`, credential, token, cookie, localStorage value, Authorization header, or DB URL was read or recorded.
- No default PostgreSQL connection, DB row read/write, seed, migration, rollback, destructive operation, broad scan, or
  row dump was run.
- No Provider call/configuration or Cost Calibration was run.
- No formal publish or student-visible runtime was run.
- No staging/prod/deploy/payment external service/OCR/export/archive/index movement was run.
- No PR or force push was run.
- No release readiness, production readiness, final Pass, or full Layer 2 DB/runtime closure is claimed.

## Next Recommended Task

`layer-2-business-closure-evidence-rollup-refresh-after-local-route-smoke-2026-06-27` should refresh Layer 2 status and
decide whether the owner wants a separate real local PostgreSQL smoke with explicit `.env*`/credential handling approval
or whether the next step should be credentialed browser observation after the route runtime smoke.
