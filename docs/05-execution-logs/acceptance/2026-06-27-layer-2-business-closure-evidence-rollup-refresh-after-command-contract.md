# Layer 2 Business Closure Evidence Rollup Refresh After Command Contract Acceptance

Task id: `layer-2-business-closure-evidence-rollup-refresh-after-command-contract-2026-06-27`

Decision: `LAYER_2_COMMAND_CONTRACT_ROLLUP_REFRESHED_BUSINESS_RUNTIME_STILL_BLOCKED`

moduleRunVersion: 2

Cost Calibration Gate remains blocked.

## Scope

This acceptance refresh updates the Layer 2 evidence rollup after
`content-admin-review-adoption-command-contract-tdd-2026-06-27` closed the source/test command contract for content-admin
review `approved` and `rejected` decisions.

This task is docs/state-only. It does not run browser, dev-server, e2e, DB, Provider, Cost Calibration, real adoption or
retry mutation, formal publish, student-visible runtime, staging/prod/deploy/payment, external service, OCR/export,
archive/index movement, PR, force push, release readiness, or final Pass.

## Refreshed Three-Layer Status

| Layer                                  | Refreshed status                                                                                        | Evidence basis                                                                                         | Remaining gate                                                                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Layer 1 role/entry/permission          | Complete for local role/entry/permission no-regression boundary                                         | Existing local eight-row role evidence and acceptance ledgers                                          | Future source/UI/auth changes must preserve this boundary; no new browser runtime is claimed here                                               |
| Layer 2 business function loop         | Stronger partial: content-admin adopt/reject source/test command contract is closed; runtime not closed | `2026-06-27-content-admin-review-adoption-command-contract-tdd` acceptance, evidence, and audit review | Fresh approval required for local route/runtime smoke, DB read/write, real mutation, UI enablement, browser/e2e, publish, or student visibility |
| Layer 3 real Provider/cost/pre-release | Blocked                                                                                                 | High-risk package consolidation ledger plus Cost Calibration blocked SOP                               | Fresh approval required for each Provider, Cost Calibration, staging/prod, deploy, payment, OCR, export, and external-service gate              |

## Layer 2 Delta After Command Contract

| Closure row                                                  | Previous status                       | Refreshed status                         | What changed                                                                                                            | Still blocked                                                                                    |
| ------------------------------------------------------------ | ------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Content-admin generated-result review entry and traceability | Partial                               | Partial                                  | No change. Existing source contracts, UI local validation, and credentialed browser smoke remain historical evidence.   | Fresh runtime/browser/DB evidence for the actual loop                                            |
| Explicit adopt/reject command contract                       | Gap                                   | Covered for source/test command contract | `approved` and `rejected` decisions now have focused source/test coverage and redacted audit/traceability expectations. | Browser/dev-server/e2e, DB runtime, real formal draft creation, real rejection/adoption mutation |
| Batch selection and retry preview                            | Partial                               | Partial                                  | No change. Preview/request-state contracts remain separate from real retry execution.                                   | Provider retry, DB mutation, runtime retry cap, rollback                                         |
| Diff and adoption history read models                        | Covered for read-only local model     | Covered for read-only local model        | No change. Read models remain adjacent evidence.                                                                        | DB-backed route/runtime read smoke if required                                                   |
| Batch/retry/diff/history UI composition                      | Partial                               | Partial                                  | No change. Unit/component local validation remains useful but not runtime closure.                                      | Browser/dev-server/e2e and mutation controls                                                     |
| Formal draft/publish boundary                                | Adjacent only                         | Adjacent only                            | No change. Existing local formal publish evidence must not be merged into generated-result adoption closure.            | Fresh publish or student-visible approval if the owner wants this included in Layer 2            |
| Learner private AI generation                                | Covered for private-use boundary only | Covered for private-use boundary only    | No change. It does not close content-admin adoption.                                                                    | Student-visible formal content and Provider gates                                                |
| Organization analytics/export                                | Partial                               | Partial                                  | No change. Export/browser route smoke remain separate.                                                                  | Export generation/download, browser runtime, privacy and external-service approvals              |

## Minimal Layer 2 Closure Path After Refresh

The smallest next chain is no longer source/test command-contract TDD. It is now:

```text
content_admin generated result review -> approved/rejected command contract exists ->
capped local route/runtime smoke with redacted traceability -> optional UI/browser observation ->
formal publish and student-visible runtime remain blocked unless separately approved
```

Recommended next tasks:

| Order | Proposed task                                                                 | Purpose                                                                                                             | Can run without new high-risk execution approval? | Fresh approval required before execution                                                                              |
| ----- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| L2-1  | `content-admin-review-adoption-local-route-smoke-approval-package-2026-06-27` | Docs-only package defining capped local route/runtime smoke, test data, mutation cap, rollback, and redaction rules | Yes, if approved as docs/state-only               | Execution still blocked after package                                                                                 |
| L2-2  | `content-admin-review-adoption-local-route-smoke-execution-2026-06-27`        | Execute one capped local route/service smoke for one review decision                                                | No                                                | DB read/write, local controlled mutation, test data source, rollback/archive strategy, and redacted evidence approval |
| L2-3  | `content-admin-review-adoption-ui-enablement-source-test-2026-06-27`          | Enable or finalize UI affordance only after command and route boundaries are accepted                               | No                                                | Source/test approval. Browser remains separate                                                                        |
| L2-4  | `content-admin-review-adoption-credentialed-browser-smoke-2026-06-27`         | Observe the review loop locally through the approved UI path                                                        | No                                                | Browser/dev-server/e2e, credential handling, DB mutation/readback boundary, and redacted evidence approval            |
| L2-5  | `formal-publish-student-visible-boundary-decision-2026-06-27`                 | Decide whether Layer 2 minimal closure excludes publish/student-visible runtime or requires a separate local proof  | Yes as docs-only package if approved              | Any publish or student-visible runtime execution remains blocked                                                      |

## Queue Quantity Estimate

Latest pre-refresh diagnostic while this branch was clean:

- `activeQueueNonTerminalCount`: 28
- `archiveCandidateCount`: 21
- `highRiskRepairBlockedCount`: 0

Estimated remaining work:

| Goal slice                                              | Estimated tasks | Notes                                                                                                                             |
| ------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Minimal Layer 2 runtime business closure                | 4-6 tasks       | Docs-only local route-smoke package, capped DB/runtime execution, source/test UI enablement, browser smoke, publish decision      |
| Minimal three-layer closure with selected Layer 3 gates | 8-13 tasks      | Layer 2 runtime closure plus one Provider/cost/staging-prep path; exact count depends on whether Provider and staging execute     |
| Clear related high-risk package noise without execution | 2-4 tasks       | AP-01 through AP-11 placeholders are already consolidated; remaining work is status refresh, blocked-gate ledger, or archive task |
| Execute or close every high-risk gate conservatively    | 8-14 tasks      | One task per selected Provider/cost/staging/payment/OCR/export/deploy gate, each requiring fresh approval                         |

These are estimates, not execution authorization.

## Copyable Next Approval Text

### A. Docs-Only Local Route Smoke Approval Package

```text
我 fresh approve 一个 docs/state-only Layer 2 local route smoke 审批包任务：
content-admin-review-adoption-local-route-smoke-approval-package-2026-06-27。
范围仅 project-state.yaml、task-queue.yaml、task plan/evidence/audit/acceptance 文档。允许定义 content-admin review
adopt/reject local route/runtime smoke 的 test data、单次 mutation cap、DB read/write 边界、rollback/archive 策略、
redaction 规则和后续执行审批文本。
不批准浏览器/dev-server/e2e、DB 连接或读写、真实 mutation、凭据读取、Provider、Cost Calibration、formal publish、
student-visible runtime、staging/prod/deploy/payment/external service、OCR/export、archive/index movement、PR、force push、
release readiness 或 final Pass。
```

### B. Layer 2 Capped Local Runtime Execution

```text
我 fresh approve 一个 Layer 2 capped local route/runtime smoke 执行任务：
content-admin-review-adoption-local-route-smoke-execution-2026-06-27。
允许在本地 dev 范围内，对一个 content_admin review generated result 执行一次 adopt 或 reject route/service smoke，
使用已批准的测试数据来源、单次 mutation cap、DB read/write、rollback/archive 策略和 redacted evidence。禁止记录 DB rows、
credentials、tokens、Authorization headers、raw prompts、raw generated output、Provider payload、full paper/material content
或 plaintext redeem_code。
不批准 Provider call/configuration、Cost Calibration、formal publish、student-visible runtime、staging/prod/deploy/payment/
external service、OCR/export、PR、force push、release readiness 或 final Pass。浏览器/dev-server/e2e 仍需单独审批。
```

### C. Layer 2 Credentialed Browser Smoke

```text
我 fresh approve 一个 Layer 2 credentialed local browser smoke 任务：
content-admin-review-adoption-credentialed-browser-smoke-2026-06-27。
仅允许对已通过 source/test 和 capped local route/runtime smoke 的 content_admin review adopt/reject loop 做本地
localhost/127.0.0.1 浏览器观察，证据只记录命令、角色标签、pass/fail、测试计数和脱敏结论。凭据输入、cookie、
localStorage、页面文本 dump、截图、trace、DB rows、Provider payload、raw prompt/output、full paper/material content 均不得
进入 evidence 或 Git。
不批准 Provider、Cost Calibration、formal publish、student-visible runtime、staging/prod/deploy/payment/external service、
OCR/export、PR、force push、release readiness 或 final Pass。
```

### D. Layer 3 Provider/Cost/Staging Refresh

```text
我 fresh approve 一个 docs/state-only Layer 3 Provider/cost/staging blocked-gate refresh 任务。
范围仅 project-state.yaml、task-queue.yaml、task plan/evidence/audit/acceptance 文档。允许基于现有 high-risk consolidation
ledger 和最新 Layer 2 状态刷新 Provider smoke、Cost Calibration、staging/prod、payment、OCR、export 的审批矩阵和复制文本。
不批准读取 .env 或凭据、不批准 Provider call/configuration、不批准 Cost Calibration 执行、不批准 DB、浏览器/e2e、deploy、
payment/external service、OCR/export 执行、PR、force push、release readiness 或 final Pass。
```

## Explicit Non-Claims

- No source/test/product code changed.
- No browser/dev-server/e2e was run.
- No DB connection, DB read/write, migration, seed, rollback, destructive operation, or real mutation was run.
- No credential, token, `.env*`, Authorization header, Provider payload, raw prompt, or raw generated output was read.
- No Provider call/configuration or Cost Calibration was executed.
- No formal publish, student-visible runtime, staging/prod/deploy/payment/external service, OCR/export, PR, force push,
  release readiness, production readiness, or final Pass is claimed.
