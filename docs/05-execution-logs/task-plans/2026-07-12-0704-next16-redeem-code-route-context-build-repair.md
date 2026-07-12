# 0704 Next 16 卡密详情路由上下文构建修复方案

## 任务信息

- taskId：`0704-next16-redeem-code-route-context-build-repair-2026-07-12`
- 批次：B1D / A31
- 分支：`codex/0704-next16-redeem-code-route-context-build-repair`
- 基线：`e2e21a8333a9c9f426eb7bc924548dfb2e15aed7`
- 目标：将卡密详情 handler 的路由上下文收敛到 Next 16 异步 `params` 合同，恢复生产类型生成。

## 已读取约束

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`，含 ADR-007
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- 最新 0704 卡密管理 plan、evidence 与 audit
- Next 16 App Router skill 与本地生成路由类型

## 根因与边界

- 动态路由只导出运行时 handler；实际参数类型来自 `admin-redeem-code-runtime.ts`。
- handler 当前接受 `Promise<{ publicId: string }> | { publicId: string }`，而 Next 16 生成的 RouteContext 只允许异步 `params`。
- 现有卡密详情测试和所有生产调用均传 Promise；删除同步兼容支路不改变运行时行为。
- 本批不修改卡密角色、明文可见性、审计、校验、响应、授权、数据库或 UI。
- Provider、env/secret、数据库、依赖、schema/migration/seed、staging/production/deploy 和 Cost Calibration 均禁止。

## TDD 步骤

1. 增加 type-level 合同测试，精确要求详情 handler 第二参数为异步 `params`；先用 `typecheck` 复现联合类型 RED。
2. 将 `RedeemCodeDetailRouteContext.params` 最小收窄为 Promise，保留现有 `await` 读取逻辑。
3. 运行 focused 卡密 runtime、卡密 UI/角色/审计受影响回归和 B1A-B1D 累计回归。
4. 运行全量 unit、lint、typecheck、format check、diff check、webpack build 与 Module Run v2。
5. 写脱敏 evidence/audit，单提交、`--ff-only` 合入本地 master 并清理；禁止 push。

## 验收标准

- type-level 测试确认详情 handler context 只有 `Promise<{ publicId: string }>`。
- Next 16 webpack 构建完成编译、类型生成和静态页面生成，不再出现 A31。
- 合法详情、invalid publicId、not-found、未登录、错误角色和 no-store 行为不变。
- `ops_admin` / `super_admin` 既有产品能力不回退，其他角色能力不扩大。
- 证据、日志和提交内容不包含明文卡密、卡密 hash、凭证、会话或内部 ID。

## 允许文件

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-12-0704-next16-redeem-code-route-context-build-repair.md`
- `docs/05-execution-logs/evidence/2026-07-12-0704-next16-redeem-code-route-context-build-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-12-0704-next16-redeem-code-route-context-build-repair-audit.md`
- `src/server/services/admin-redeem-code-runtime.ts`
- `tests/unit/phase-8-admin-redeem-code-runtime.test.ts`
