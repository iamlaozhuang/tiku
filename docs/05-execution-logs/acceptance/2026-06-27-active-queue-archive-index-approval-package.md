# Active Queue Archive Index Approval Package Acceptance

Task id: `active-queue-archive-index-approval-package-2026-06-27`

Decision: `ARCHIVE_INDEX_APPROVAL_PACKAGE_PREPARED_EXECUTION_BLOCKED`

moduleRunVersion: 2

Cost Calibration Gate remains blocked.

## Scope

This docs/state-only acceptance prepares a future active queue archive/index execution package after the Layer 2 local
PostgreSQL route smoke approval package.

This package does not move active queue entries, write `docs/04-agent-system/state/archive/**`, update
`docs/04-agent-system/state/task-history-index.yaml`, execute runtime work, or change product behavior.

## Current Three-Layer Status

| Layer                             | Status after this package                                                                            | Evidence basis                                                                                 | Remaining gate                                                                                           |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Layer 1 role/entry/permission     | Complete for local no-regression guard only                                                          | Existing Layer 1 evidence and no runtime/source changes in this package                        | Future role, route, auth, UI, or browser changes must preserve this boundary                             |
| Layer 2 business function loop    | Stronger partial local route evidence exists; true local PostgreSQL-backed route smoke still blocked | Command-contract TDD, injected route smoke, route-smoke rollup, PostgreSQL smoke approval pack | Fresh approval for local PostgreSQL-backed smoke execution and one capped mutation/readback              |
| Layer 3 Provider/cost/pre-release | Blocked                                                                                              | High-risk consolidation, ADR-006, and Cost Calibration blocked SOP                             | Fresh approval per Provider, Cost Calibration, staging/prod, deploy, payment, OCR, export, external gate |
| Queue/high-risk package cleanup   | Approval package prepared; archive/index movement still blocked until fresh approval                 | Queue slimming diagnostic and archive governance SOP                                           | Fresh approval for exact archive/index candidate movement and post-move evidence                         |

## Observed Queue Diagnostic

Current diagnostic before this package:

- active queue task count: 63
- non-terminal active queue count: 28
- terminal active queue count: 35
- terminal recovery window: 8
- reported archive candidate count: 26
- high-risk repair blocked count: 0

Expected diagnostic after this package:

- active queue task count: 64
- non-terminal active queue count: 28
- terminal active queue count: 36
- projected future archive candidate count: 27, because the previous current task becomes archival-eligible and this
  package becomes the current recovery pointer.

The future archive execution task must rerun the diagnostic before moving any entry.

## Future Archive/Index Candidate Set

The future archive/index apply task may target only these observed terminal candidates unless the user gives a wider
fresh approval:

1. `content-admin-review-adoption-command-contract-approval-package-2026-06-27`
2. `content-admin-review-adoption-command-contract-tdd-2026-06-27`
3. `layer-2-business-closure-evidence-rollup-refresh-after-command-contract-2026-06-27`
4. `content-admin-review-adoption-local-route-smoke-approval-package-2026-06-27`
5. `content-admin-review-adoption-local-route-smoke-execution-2026-06-27`
6. `layer-2-business-closure-evidence-rollup-refresh-after-local-route-smoke-2026-06-27`
7. `content-admin-review-adoption-local-postgres-route-smoke-approval-package-2026-06-27`
8. `layer-2-business-closure-evidence-rollup-2026-06-27`
9. `high-risk-approval-package-consolidation-retirement-2026-06-27`
10. `three-layer-acceptance-minimal-closure-high-risk-approval-matrix-2026-06-27`
11. `active-queue-terminal-archive-cleanup-2026-06-27`
12. `ap-01-qwen-one-request-post-console-remediation-retry-approval`
13. `ap-01-qwen-one-request-redacted-error-code-diagnostic-run`
14. `ap-01-qwen-openai-compatible-one-request-isolation-smoke`
15. `ap-01-qwen-provider-smoke-execution-base-url-ready`
16. `ap-01-provider-smoke-execution-qwen-env-local-ready`
17. `ap-01-provider-smoke-execution`
18. `ap-02-ops-auth-quota-cost-calibration-approval-package`
19. `ap-03-provider-staging-execution-approval-package`
20. `ap-04-standard-ai-generation-scope-change-approval-package`
21. `ap-05-standard-org-self-service-scope-change-approval-package`
22. `ap-06-online-payment-approval-package`
23. `ap-07-ocr-auto-import-approval-package`
24. `ap-08-org-data-export-approval-package`
25. `ap-09-runtime-capability-list-approval-package`
26. `ap-10-current-checkpoint-audit-repair-approval-package`
27. `ap-11-source-governance-change-approval-package`

## Archive/Index Execution Boundary

Future archive/index execution may only:

- create an independent short branch;
- move exact approved terminal task blocks from active queue to
  `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`;
- add matching lookup entries to `docs/04-agent-system/state/task-history-index.yaml`;
- retain the recovery window and any active dependencies;
- update project state, evidence, audit review, and acceptance documents;
- run scoped formatting and mechanism gates;
- commit, ff-only merge, push, and clean up only if the task carries explicit closeout approval.

Future archive/index execution must not:

- change task semantics;
- edit product source, tests, e2e, schema, migration, seed, dependency, package, lockfile, or `.env*`;
- run browser, dev server, e2e, DB, Provider, Cost Calibration, staging/prod, deploy, payment, OCR, export, or external
  service work;
- create PRs, force push, claim release readiness, or claim final Pass.

## Copyable Future Archive/Index Approval Text

```text
我 fresh approve 一个 docs/state-only active queue archive/index 执行任务：
active-queue-archive-index-apply-after-layer-2-postgres-package-2026-06-27。
允许在独立短分支中，仅把 active queue 中以下 terminal task blocks 移动到
docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml，并在
docs/04-agent-system/state/task-history-index.yaml 增加对应索引：content-admin-review-adoption-command-contract-approval-package-2026-06-27,
content-admin-review-adoption-command-contract-tdd-2026-06-27,
layer-2-business-closure-evidence-rollup-refresh-after-command-contract-2026-06-27,
content-admin-review-adoption-local-route-smoke-approval-package-2026-06-27,
content-admin-review-adoption-local-route-smoke-execution-2026-06-27,
layer-2-business-closure-evidence-rollup-refresh-after-local-route-smoke-2026-06-27,
content-admin-review-adoption-local-postgres-route-smoke-approval-package-2026-06-27,
layer-2-business-closure-evidence-rollup-2026-06-27,
high-risk-approval-package-consolidation-retirement-2026-06-27,
three-layer-acceptance-minimal-closure-high-risk-approval-matrix-2026-06-27,
active-queue-terminal-archive-cleanup-2026-06-27,
ap-01-qwen-one-request-post-console-remediation-retry-approval,
ap-01-qwen-one-request-redacted-error-code-diagnostic-run,
ap-01-qwen-openai-compatible-one-request-isolation-smoke,
ap-01-qwen-provider-smoke-execution-base-url-ready,
ap-01-provider-smoke-execution-qwen-env-local-ready,
ap-01-provider-smoke-execution,
ap-02-ops-auth-quota-cost-calibration-approval-package,
ap-03-provider-staging-execution-approval-package,
ap-04-standard-ai-generation-scope-change-approval-package,
ap-05-standard-org-self-service-scope-change-approval-package,
ap-06-online-payment-approval-package,
ap-07-ocr-auto-import-approval-package,
ap-08-org-data-export-approval-package,
ap-09-runtime-capability-list-approval-package,
ap-10-current-checkpoint-audit-repair-approval-package,
ap-11-source-governance-change-approval-package。
范围仅限 project-state.yaml、task-queue.yaml、docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml、
docs/04-agent-system/state/task-history-index.yaml、task plan/evidence/audit/acceptance 文档。
允许运行 scoped Prettier、git diff --check、queue slimming diagnostic、project status、precommit/module closeout/prepush
机制门禁；完成后允许本地 commit、ff-only merge 到 master、在 master 运行必要门禁、push origin/master，并删除已合入短分支。
不批准源码/测试/e2e/schema/migration/seed/dependency/package/lockfile/.env*、浏览器/dev-server/e2e、DB、Provider、
Cost Calibration、真实 mutation、formal publish、student-visible runtime、staging/prod/deploy/payment/external service、
OCR/export、PR、force push、release readiness 或 final Pass。
```

## Explicit Non-Claims

- No archive/index movement was executed.
- No runtime, DB, browser, Provider, Cost Calibration, staging/prod, payment, OCR, export, external-service, PR, force
  push, release readiness, or final Pass action was executed.
- Layer 2 is not fully closed.
- Layer 3 remains blocked.
