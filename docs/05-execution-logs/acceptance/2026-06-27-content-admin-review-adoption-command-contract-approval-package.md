# Content Admin Review Adoption Command Contract Approval Package Acceptance

Task id: `content-admin-review-adoption-command-contract-approval-package-2026-06-27`

Decision: `APPROVAL_PACKAGE_READY_SOURCE_TEST_IMPLEMENTATION_BLOCKED_PENDING_FRESH_APPROVAL`

moduleRunVersion: 2

threadRolloverGate: continue_current_thread_for_docs_state_approval_package

automationHandoffPolicy: next source/test task is blocked until fresh approval

Cost Calibration Gate remains blocked.

## Scope Decision

This package prepares the smallest next Layer 2 closure task:
`content-admin-review-adoption-command-contract-tdd-2026-06-27`.

It does not implement source/test changes and does not execute browser, DB, Provider, Cost Calibration, mutation, formal
publish, student-visible runtime, staging/prod, payment, OCR/export, external-service, PR, force push, release readiness,
or final Pass.

## Current Source Facts

Read-only inspection found:

- `src/server/models/admin-ai-generation-formal-adoption.ts` currently permits only `approved` review decisions.
- `src/server/contracts/admin-ai-generation-formal-adoption-contract.ts` currently models `rejectAction` as
  `not_executed`.
- `src/server/repositories/admin-ai-generation-formal-adoption-repository.ts` rejects any review decision that is not
  `approved`.
- `src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts` covers approved question and paper adoption,
  missing admin session, and organization-admin denial, but not a content-admin reject command.
- `src/server/models/personal-ai-generation-formal-adoption.ts` has an approve/reject review-decision shape that can be
  used as a comparison pattern for the content-admin source contract.

## Proposed Next Task

`content-admin-review-adoption-command-contract-tdd-2026-06-27`

Allowed source/test scope after fresh approval:

- `src/server/models/admin-ai-generation-formal-adoption.ts`
- `src/server/validators/admin-ai-generation-formal-adoption.ts`
- `src/server/contracts/admin-ai-generation-formal-adoption-contract.ts`
- `src/server/repositories/admin-ai-generation-formal-adoption-repository.ts`
- `src/server/repositories/admin-ai-generation-formal-adoption-repository.test.ts`
- `src/server/repositories/admin-ai-generation-formal-adoption-db-adapter.ts`
- `src/server/repositories/admin-ai-generation-formal-adoption-db-adapter.test.ts`
- `src/server/services/admin-ai-generation-formal-adoption-service.ts`
- `src/server/services/admin-ai-generation-formal-adoption-service.test.ts`
- `src/server/services/admin-ai-generation-formal-adoption-runtime.ts`
- `src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts`
- docs/state/evidence/audit/acceptance files for that next task.

Expected minimum behavior after fresh approval:

- Add a content-admin `rejected` review-decision contract.
- Preserve approved adoption behavior for `question` and `paper`.
- Ensure reject command is redacted, traceable, and does not call the formal draft adapter.
- Ensure reject command does not publish, does not create student-visible content, and does not expose internal ids or
  unredacted generated/provider material.
- Keep organization-scoped adoption blocked for a separate task.

## Proposed Validation For Next Task

- TDD RED/GREEN for repository and route/runtime reject behavior.
- `npm.cmd run test:unit -- src/server/repositories/admin-ai-generation-formal-adoption-repository.test.ts src/server/repositories/admin-ai-generation-formal-adoption-db-adapter.test.ts src/server/services/admin-ai-generation-formal-adoption-service.test.ts src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- Module Run v2 pre-commit, closeout, and pre-push gates.

## Copyable Fresh Approval Text

```text
我 fresh approve 执行 source/test-only Layer 2 最小业务闭环任务：
content-admin-review-adoption-command-contract-tdd-2026-06-27。

范围仅限：
- src/server/models/admin-ai-generation-formal-adoption.ts
- src/server/validators/admin-ai-generation-formal-adoption.ts
- src/server/contracts/admin-ai-generation-formal-adoption-contract.ts
- src/server/repositories/admin-ai-generation-formal-adoption-repository.ts
- src/server/repositories/admin-ai-generation-formal-adoption-repository.test.ts
- src/server/repositories/admin-ai-generation-formal-adoption-db-adapter.ts
- src/server/repositories/admin-ai-generation-formal-adoption-db-adapter.test.ts
- src/server/services/admin-ai-generation-formal-adoption-service.ts
- src/server/services/admin-ai-generation-formal-adoption-service.test.ts
- src/server/services/admin-ai-generation-formal-adoption-runtime.ts
- src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts
- 对应 task plan/evidence/audit/acceptance、project-state.yaml、task-queue.yaml。

允许用 TDD 增加 content-admin review adopt/reject command contract，包含 rejected 决策、红acted traceability、
失败场景、focused unit tests、lint/typecheck 和机制门禁。完成后按独立短分支执行 local commit、ff-only merge to
master、master 门禁、push origin/master 并删除已合入短分支。

不批准浏览器/dev-server/e2e、DB 连接或真实读写、schema/migration/seed/rollback、凭据读取、Provider call、
Provider configuration、Cost Calibration、真实运行时 adoption/retry mutation、formal publish、student-visible
runtime、staging/prod/deploy/payment/external service、OCR/export 执行、active queue archive/index movement、PR、
force push、release readiness 或 final Pass。
```

## Non-Claims

- This package does not close Layer 2.
- This package does not implement the reject command.
- This package does not prove route/browser runtime behavior.
- This package does not approve DB connection or real mutation execution.
- This package does not claim Provider, Cost Calibration, staging/prod, release readiness, or final Pass.
