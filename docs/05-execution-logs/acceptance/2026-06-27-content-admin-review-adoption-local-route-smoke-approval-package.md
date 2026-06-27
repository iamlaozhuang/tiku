# Content Admin Review Adoption Local Route Smoke Approval Package Acceptance

Task id: `content-admin-review-adoption-local-route-smoke-approval-package-2026-06-27`

Decision: `LOCAL_ROUTE_SMOKE_APPROVAL_PACKAGE_PREPARED_EXECUTION_BLOCKED`

moduleRunVersion: 2

Cost Calibration Gate remains blocked.

## Scope

This docs/state-only acceptance prepares the future Layer 2 capped local route/service smoke for the content-admin
generated-result review adoption loop.

No runtime action is approved or executed by this package. Browser, dev-server, e2e, DB connection/read/write, real
mutation, credential reads, Provider calls, Cost Calibration, formal publish, student-visible runtime,
staging/prod/deploy/payment/external service, OCR/export, archive/index movement, PR, force push, release readiness,
and final Pass remain blocked.

## Current Layer Status

| Layer                             | Status after this package                                                                   | Evidence basis                                           | Remaining gate                                                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Layer 1 role/entry/permission     | Complete for local no-regression guard only                                                 | Existing local role/entry/permission evidence            | Future source/UI/auth changes must preserve the boundary                                                                      |
| Layer 2 business function loop    | Ready for a future capped local route/service smoke approval request; runtime still blocked | Command-contract TDD plus Layer 2 rollup refresh         | Fresh execution approval for local DB read/write, one controlled mutation, test data, rollback/archive, and redacted evidence |
| Layer 3 Provider/cost/pre-release | Blocked                                                                                     | High-risk consolidation and Cost Calibration blocked SOP | Fresh approval per Provider, Cost Calibration, staging/prod, deploy, payment, OCR, export, and external-service gate          |

## Future Execution Task

Proposed task id: `content-admin-review-adoption-local-route-smoke-execution-2026-06-27`

Purpose: execute one capped local route/service smoke for the source-defined content-admin generated-result review
decision path. The future execution task must first confirm the exact route/service surface from source under its own
approved scope before running anything.

The future execution task is not approved by this package.

## Test Data Boundary

The future execution task may use exactly one of these sources, only after fresh approval:

- one existing local dev generated-result review target that is already safe, test-owned, and not production/staging
  data;
- one separately approved synthetic/local fixture or setup path created for this smoke;
- one previously approved local setup artifact if the execution task can prove it is test-owned without exposing raw
  content.

The future execution task must stop before DB connection if no suitable local target is available.

Evidence must not record raw generated output, full `paper`, full `material`, DB rows, prompt text, Provider payloads,
credentials, tokens, Authorization headers, cookies, localStorage values, public identifier inventories, screenshots,
traces, page dumps, private answer text, or plaintext `redeem_code`.

## Single Mutation Cap

The future execution task may run at most:

- one generated-result target;
- one content-admin reviewer context;
- one review decision, either `approved` or `rejected`;
- one route/service command invocation that performs the decision;
- one bounded readback of redacted metadata needed to prove the decision path.

The cap does not permit batch adoption, retry/adoption loops, Provider retry, AI generation, formal publish,
student-visible exposure, multiple decisions, repeated mutation attempts, or mutation of unrelated records.

If the first mutation attempt is ambiguous, partially succeeds, or needs a second mutation to make the result acceptable,
the future execution task must stop and record the blocked state instead of retrying.

## DB Read/Write Boundary

Fresh execution approval must explicitly allow local DB access. If approved, the future task remains limited to local dev
targets only and may not use staging, production, cloud, payment, external-service, or Provider resources.

Allowed future reads:

- one target generated-result review metadata lookup;
- one role/permission or reviewer-attribution metadata lookup if the route/service requires it;
- one post-command redacted metadata readback for review status, formal-target write status, audit/action summary, and
  traceability status.

Allowed future writes:

- one review-decision mutation for the target generated result;
- only the metadata that the approved route/service normally writes for review decision, redacted traceability, audit
  action, and formal-draft linkage if the selected `approved` path requires it.

Blocked future DB actions:

- schema, migration, drizzle push, seed, destructive reset/drop/truncate/delete, ad hoc SQL repair, production/staging
  access, raw row dumps, data export, broad table scans, bulk mutation, and any non-local target.

## Rollback And Archive Strategy

The future execution task must name its cleanup strategy before mutation. Acceptable strategies are:

- use a test-owned generated result where the post-smoke state is allowed to remain as a local test artifact;
- use an existing app-level archive/disable/reversal path that is explicitly approved in the future execution task;
- use a disposable local fixture setup whose cleanup is already approved and redacted.

The future task must stop before DB write if:

- the target cannot be proven test-owned;
- cleanup requires destructive DB action not separately approved;
- cleanup requires archive/index movement not separately approved;
- cleanup would expose raw generated content or private data;
- the rollback/archive path is not source-defined or not approval-scoped.

## Redaction Rules

Future evidence may record only:

- command name or route/service label, not full payload;
- local target label (`localhost` or `127.0.0.1`) without secrets;
- role label `content_admin`;
- decision kind `approved` or `rejected`;
- pass/fail/blocked result;
- test count or command count;
- masked public-id hash or last-four style marker if needed;
- redacted before/after metadata categories, not values.

Future evidence must not record credentials, `.env*`, tokens, cookies, localStorage, Authorization headers, DB URLs, DB
rows, SQL output, raw prompts, raw Provider payloads, raw generated output, screenshots, traces, page text dumps, full
`paper`, full `material`, private answer text, plaintext `redeem_code`, or public identifier inventories.

## Stop Conditions For Future Execution

The future execution task must stop before runtime if it encounters:

- no fresh execution approval;
- unclear route/service surface;
- need to read `.env*`, credentials, tokens, cookies, or localStorage;
- need for Provider call/configuration, Cost Calibration, staging/prod/deploy/payment/external service, OCR/export;
- need for schema, migration, seed, destructive DB operation, broad data export, or raw row dump;
- need for browser/dev-server/e2e without separate approval;
- need for formal publish or student-visible runtime;
- need for multiple mutations, batch operation, retry/adoption loop, or unbounded rollback;
- inability to keep evidence redacted.

## Copyable Future Execution Approval Text

```text
我 fresh approve 一个 Layer 2 capped local route/runtime smoke 执行任务：
content-admin-review-adoption-local-route-smoke-execution-2026-06-27。
允许在本地 dev 范围内，对一个 content_admin generated-result review target 执行一次 route/service smoke，
决策只能二选一：approved 或 rejected。允许读取一个本地测试目标的脱敏元数据，执行一次受控 review decision mutation，
并读取一次脱敏结果元数据；允许使用本审批包定义的 test data、single mutation cap、DB read/write 边界、
rollback/archive 策略和 redaction 规则。若无法证明测试数据 test-owned、无法确认 rollback/archive 边界、
需要第二次 mutation、需要读取凭据/.env、需要 Provider、或证据无法脱敏，必须停止。

不批准浏览器/dev-server/e2e、Provider call/configuration、Cost Calibration、schema/migration/seed/destructive DB、
formal publish、student-visible runtime、staging/prod/deploy/payment/external service、OCR/export、PR、force push、
release readiness 或 final Pass。
```

## Adjacent Approval Still Required

Credentialed browser observation remains separate:

```text
我 fresh approve 一个 Layer 2 credentialed local browser smoke 任务：
content-admin-review-adoption-credentialed-browser-smoke-2026-06-27。
仅允许在 source/test command contract 和 capped local route/runtime smoke 均已通过后，对 content_admin review
adoption/rejection loop 做 localhost/127.0.0.1 浏览器观察。证据只记录命令、角色标签、pass/fail、测试计数和脱敏结论。
凭据、cookie、localStorage、Authorization header、DB rows、Provider payload、raw prompt/output、full paper/material
content、截图和 trace 不得进入 evidence 或 Git。

不批准 Provider、Cost Calibration、formal publish、student-visible runtime、staging/prod/deploy/payment/external service、
OCR/export、PR、force push、release readiness 或 final Pass。
```

## Explicit Non-Claims

- No source/test/product code changed.
- No browser/dev-server/e2e was run.
- No DB connection, DB read/write, seed, migration, rollback, destructive operation, or real mutation was run.
- No credential, token, `.env*`, cookie, localStorage, or Authorization header was read.
- No Provider call/configuration or Cost Calibration was run.
- No formal publish or student-visible runtime was run.
- No staging/prod/deploy/payment/external service/OCR/export/archive/index movement was run.
- No PR or force push was run.
- No release readiness, production readiness, final Pass, or Layer 2 runtime closure is claimed.
