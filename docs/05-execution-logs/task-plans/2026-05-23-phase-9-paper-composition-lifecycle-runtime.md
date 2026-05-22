# Phase 9 Paper Composition Lifecycle Runtime Plan

## 任务与范围

- Task id: `phase-9-paper-composition-lifecycle-runtime`
- Branch: `codex/phase-9-paper-composition-lifecycle-runtime`
- Base: `master`
- Queue status at claim: `pending`
- Allowed scope: `papers`, `paper-assets`, server contracts/mappers/models/repositories/services/validators, unit tests, task state, evidence, security review.
- Blocked scope: `package.json`, lockfiles, `.env.example`, `drizzle/**`.

## 已读取规范

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/02-architecture/interfaces/phase-8-product-surface-contract.md`
- `docs/02-architecture/interfaces/phase-9-mvp-acceptance-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-content-question-material-runtime.md`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-content-question-material-runtime-security-review.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/*.md`
- `docs/01-requirements/stories/*.md`

## 当前缺口

- `src/app/api/v1/papers/**` 的写入、详情、组卷、发布、下架、删除、复制路由仍使用 `createUnavailablePaperDraftService()`。
- `src/app/api/v1/paper-assets/**` 仍使用 `createUnavailablePaperAssetService()`。
- `paper-draft-service` 和 `paper-asset-service` 已有 DTO、校验与服务级规则，但 `paper-draft-repository.ts`、`paper-asset-repository.ts` 只有接口，没有 Postgres runtime 实现。
- `GET /api/v1/papers` 当前通过 admin read runtime 可用；本任务需要保持兼容，同时补齐同一 route group 的受保护写入 runtime。

## 实现策略

- 新增受保护 runtime wrapper：读取本地 session runtime，仅允许 `super_admin` / `content_admin` 管理 paper 与 paper_asset；`ops_admin` 仅按已有边界拒绝写入。
- 新增 Postgres repository：
  - `paper`: list/create/detail/update/delete/publish/archive/copy。
  - `paper_question`: 从母题生成不可变快照，使用 public id 组卷，不向 DTO 暴露 numeric id。
  - `paper_section` / `question_group`: 按输入的 `sortOrder` 与 public id 关联维护。
  - `paper_scoring_point`: 复制母题评分点，允许试卷内调整。
  - `paper_asset`: 只保存元数据，不上传文件、不生成下载 URL、不连接对象存储。
- 复用已有 `paper-draft-service` 的发布强校验：题目分值、总分、大题非空、主观题评分点合计。
- 发布时锁定源 `question` 与 `material`，下架时只改变 paper 状态，不删除历史快照。
- 对高风险 mutation 写入 redaction-safe `audit_log`：paper create/update/question add/question update/question remove/publish/archive/delete/copy，以及 paper_asset create/delete。
- 不新增依赖，不修改 schema/migration。

## TDD 步骤

1. 写 `tests/unit/phase-9-paper-composition-lifecycle-runtime.test.ts`，覆盖：
   - 未认证访问 papers/paper-assets 返回 `401001`。
   - `ops_admin` 写入 paper 被拒绝并写 redacted audit failure。
   - `content_admin` 可创建/组卷/发布/下架/复制 paper，响应不含 numeric `id`、`objectKey`、session token。
   - `paper_asset` 元数据写入/读取/删除走 public id，且审计日志不泄露 object key、token、secret。
2. 运行 focused test，确认 RED。
3. 实现 runtime wrapper 与 Postgres repositories。
4. 运行 focused test，确认 GREEN。
5. 运行既有 paper service/route/mapper 相关测试防回归。

## 风险防御

- API contract: 所有响应保持 `{ code, message, data, pagination? }`，JSON 字段 camelCase。
- Public id: URL 与 DTO 仅使用 `publicId`；numeric `id` 只留在 repository 内部。
- Auth/session: 不绕过 session runtime；无有效 admin session 不返回内容或 mutation 成功。
- Authorization: 仅 `super_admin` 与 `content_admin` 可管理内容组卷；`ops_admin` mutation 拒绝。
- Audit log: metadata 只写固定 redacted summary，不记录请求体、token、object key、密码、secret。
- Dependency gate: 不引入依赖，不修改 package/lockfile。
- Object storage: 本任务只落 paper_asset 元数据 runtime，不做真实上传、下载、签名 URL 或外部存储连接。

## 必跑验证

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-paper-composition-lifecycle-runtime`
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## 安全审查

- Required: yes.
- Artifact: `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-paper-composition-lifecycle-runtime-security-review.md`
- Gate: verdict must be `APPROVE` before merge/push closeout.
