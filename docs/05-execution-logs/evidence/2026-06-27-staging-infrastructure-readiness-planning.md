# Staging Infrastructure Readiness Planning Evidence

## Summary

- Task id: `staging-infrastructure-readiness-planning-2026-06-27`
- Branch: `codex/staging-infra-readiness-planning-20260627`
  result: pass
- Business decision: `planning_complete_infrastructure_not_ready_for_staging_execution`
- Scope: docs/state-only readiness planning.
- Cost Calibration Gate remains blocked.

This task does not change product behavior and does not execute any runtime, cloud, staging, DB, Provider, browser, or
deployment action.

## Acceptance Mapping Result

- Current three-layer acceptance Goal has already been stopped by the owner.
- Layer 1 remains recorded as pass/preserved in existing evidence.
- Layer 2 remains recorded as pass for the minimum local PostgreSQL test-owned `rejected` route/runtime smoke.
- Layer 3 Provider and minimum Cost evidence remain recorded as pass in existing evidence.
- Layer 3 staging/pre-release remains blocked because no concrete isolated staging target exists.
- Release readiness and final Pass remain blocked and are not claimed.

## Owner Infrastructure Status

The owner reported:

- cloud server: not purchased yet;
- domain: newly applied and ICP filing is in progress;
- concrete isolated staging URL or deploy target: not available.

Therefore the next useful work is infrastructure readiness preparation, not staging execution.

## Readiness Checklist

### 1. Cloud Server Or Equivalent Staging Host

Owner action before execution:

- choose the hosting path for `staging`: cloud server, managed container, or another non-prod deploy target;
- ensure it is not production and is not sharing production data or production secrets;
- confirm region, operating system/runtime support, HTTPS/TLS path, and access owner;
- decide whether PostgreSQL is local to the staging host, managed separately, or deferred for an app-only smoke.

Blocked until separate approval:

- purchasing resources;
- logging into a cloud dashboard;
- provisioning or modifying cloud resources;
- deploying application code.

### 2. Domain And ICP Filing

Current status:

- final domain is not yet usable for public production-like access because ICP filing is in progress.

Allowed planning options:

- wait until the filing completes, then use a staging subdomain or preview domain;
- use a temporary non-prod host or IP-based preview endpoint only if it does not expose secrets and is clearly labeled
  `staging`;
- keep `prod` domain and production route untouched.

Blocked until separate approval:

- DNS changes;
- TLS/certificate changes;
- production domain or production callback changes.

### 3. Environment Isolation

Required before any staging execution:

- `APP_ENV=staging` or equivalent environment label;
- staging-only app base URL;
- staging-only auth callback/base URL;
- staging-only `BETTER_AUTH_SECRET`;
- staging-only database or namespace;
- staging-only object storage bucket or strict `staging` prefix;
- staging-only Provider key/quota/feature flag or Provider disabled-by-default policy;
- staging-only audit/log retention policy.

Do not reuse:

- production database;
- production object storage writable prefix;
- production auth secret;
- production Provider quota/defaults;
- production user/customer data.

### 4. Database Boundary

Minimum readiness decision needed:

- whether the first staging smoke is app-only without DB mutation, or DB-backed with a staging-only PostgreSQL instance or
  namespace.

Required before DB-backed staging:

- reviewed migration source branch and migration files;
- backup/restore or disposable-staging rationale;
- rollback owner and rollback decision point;
- drift check plan;
- explicit rule that `drizzle-kit push` remains forbidden.

### 5. Object Storage Boundary

Required before object storage is used:

- staging bucket or strict prefix using `{environment}/{resource_type}/{profession}/{yyyymm}/{file_hash}.{extension}`;
- no writable production prefix reuse;
- redaction and retention policy for uploaded evidence or generated files.

### 6. Provider Key And AI Boundary

Required before staging Provider use:

- staging feature flag and quota policy;
- allowed Provider/model path;
- call cap, retry cap, token cap, spend cap;
- `ai_call_log` redaction and retention policy;
- stop condition for errors or quota uncertainty.

Current task does not approve Provider use. Existing local Provider/Cost evidence does not imply staging Provider
readiness.

### 7. Logs, Monitoring, Backup, Rollback, Incident Route

Required owner decisions:

- rollback owner: `laozhuang` unless delegated;
- monitoring owner: `laozhuang` unless delegated;
- incident route: owner notification path and stop authority;
- backup and restore approach for staging DB if DB-backed;
- log redaction rule: no secrets, tokens, DB URLs, raw Provider payloads, raw prompts/responses, raw generated AI content,
  full `paper`/`material` content, raw DB rows, cookies, localStorage, screenshots, or traces in evidence.

## Recommended Sequence

1. Owner completes cloud server or staging host choice.
2. Owner completes ICP filing or chooses a temporary non-prod staging access strategy.
3. Run a docs/state-only staging materialization approval package with the chosen non-secret target label and boundary.
4. Run exactly one staging-only smoke after the concrete target exists and fresh approval is granted.
5. Resume three-layer final evidence review only after staging smoke evidence exists.

## Copyable Approval Texts

### A. Staging Materialization Approval Package

```text
我 fresh approve 一个 docs/state-only staging target materialization approval package：
staging-target-materialization-approval-package-after-infrastructure-ready-2026-06-27。

范围仅 project-state.yaml、task-queue.yaml、task plan/evidence/audit/acceptance 文档。
允许登记我提供的非敏感 staging target label、target type、target value 分类、域名/临时访问策略、dev/staging/prod 隔离、数据库/对象存储/环境变量/Provider key/日志/备份/回滚/监控/事故路径、no-prod-data boundary、redaction rules，并准备下一步 staging-only smoke 执行审批文本。
不批准购买云资源、登录云后台、读取或输出凭据、修改 .env*、部署、DB 连接或读写、Provider call、Cost Calibration、浏览器/e2e、prod/payment/OCR/export、PR、force push、release readiness 或 final Pass。
允许独立短分支、提交、ff-only merge master、master 门禁、push origin/master、删除短分支。
```

### B. Staging-Only Smoke Execution After Target Exists

```text
我 fresh approve 执行 Layer 3 staging-only pre-release smoke：
task id: layer-3-staging-pre-release-redacted-execution-after-target-materialization-2026-06-27
target type: staging_url
target value: <填写一个不含 secret 的真实 isolated staging URL 或已登记 deploy target>
target label: <填写一个非敏感标签>
只允许一次 staging-only smoke；不批准 prod、生产数据、DB 写入、Provider、Cost Calibration、payment、OCR/export、浏览器/e2e、secret 输出、release readiness 或 final Pass。证据只能记录 target label/type、host 类别、pass/fail/blocked、计数、cap status、redaction status、stop condition 和 forbidden-action checklist。
```

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-staging-infrastructure-readiness-planning.md`
- `docs/05-execution-logs/evidence/2026-06-27-staging-infrastructure-readiness-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-staging-infrastructure-readiness-planning.md`
- `docs/05-execution-logs/acceptance/2026-06-27-staging-infrastructure-readiness-planning.md`

## Validation

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-staging-infrastructure-readiness-planning.md docs/05-execution-logs/evidence/2026-06-27-staging-infrastructure-readiness-planning.md docs/05-execution-logs/audits-reviews/2026-06-27-staging-infrastructure-readiness-planning.md docs/05-execution-logs/acceptance/2026-06-27-staging-infrastructure-readiness-planning.md`
  - PASS. Scoped docs/state files were unchanged after formatting.
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-staging-infrastructure-readiness-planning.md docs/05-execution-logs/evidence/2026-06-27-staging-infrastructure-readiness-planning.md docs/05-execution-logs/audits-reviews/2026-06-27-staging-infrastructure-readiness-planning.md docs/05-execution-logs/acceptance/2026-06-27-staging-infrastructure-readiness-planning.md`
  - PASS. All matched files use Prettier code style.
- `git diff --check`
  - PASS. No whitespace errors.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
  - PASS as diagnostic. `nextActionDecision: no_pending_task`; `projectStatusRequiresHuman: true`;
    `archiveCandidateCount: 2`; `highRiskRepairBlockedCount: 0`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId staging-infrastructure-readiness-planning-2026-06-27`
  - PASS. Scope scan accepted exactly the six approved docs/state files.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId staging-infrastructure-readiness-planning-2026-06-27`
  - PASS after evidence validation repair. Initial run failed because validation results were still pending; this was
    repaired within the approved docs/state scope and rerun successfully.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId staging-infrastructure-readiness-planning-2026-06-27 -SkipRemoteAheadCheck`
  - PASS. Branch, `master`, and `origin/master` were aligned at entry baseline
    `93b6ca64095bfdb14db4fec63c0dc53bfcf60750`; state SHA ancestor check passed.

## Module Run V2 Strict Evidence

- Batch range: docs/state-only staging infrastructure readiness planning after the three-layer Goal was stopped.
- RED: staging execution remains impossible because no cloud server/staging host is available and the domain is still
  under ICP filing.
- GREEN: owner-facing readiness checklist and next approval text are recorded without executing any blocked action.
- Commit: `93b6ca64095bfdb14db4fec63c0dc53bfcf60750` entry baseline before this task.
- localFullLoopGate: L8 environment blocked remainder. This task is L0 docs-only governance.
- threadRolloverGate: no rollover required.
- automationHandoffPolicy: continue only after owner provides infrastructure/materialization inputs or opens a separate
  infrastructure planning task.
- nextModuleRunCandidate: `staging-target-materialization-approval-package-after-infrastructure-ready-2026-06-27` after
  owner infrastructure inputs exist.
- blocked remainder: cloud purchase/provisioning, cloud dashboard login, staging deployment/smoke, DB, Provider, Cost
  Calibration, browser/e2e, prod/payment/OCR/export, release readiness, and final Pass remain blocked.

## Forbidden-Action Checklist

- Cloud resource purchased/provisioned/modified: no.
- Cloud dashboard login executed: no.
- `.env*` read/write/output/copied/recorded: no.
- Secret/token/DB URL/Provider credential output: no.
- Source/test/e2e/schema/migration/seed/package/lockfile changed: no.
- Browser/dev-server/e2e executed: no.
- DB connection/read/write executed: no.
- Provider call/configuration executed: no.
- Cost Calibration executed: no.
- Staging/prod/deploy/payment/OCR/export/external-service executed: no.
- Release readiness/final Pass claimed: no.
