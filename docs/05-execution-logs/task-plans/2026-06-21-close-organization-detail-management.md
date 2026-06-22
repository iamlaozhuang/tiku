# close-organization-detail-management

## 任务边界

- 目标：关闭后台企业组织 detail 管理体验缺口，让运营人员能从组织列表查看组织摘要、父子关系、关联授权和员工统计，并能直接进入既有编辑/启停操作。
- 允许：`AdminOrgAuthRedeemPage.tsx` 内的低风险 UI 状态与展示调整、两个 focused unit 测试、任务状态/证据/审计文档。
- 禁止：新增 route、repository、schema/migration、数据库连接、`org_auth` 授权模型运行时代码、依赖变更、dev server、浏览器/e2e、env/Provider。

## 已读取规范

- `AGENTS.md` 命名与执行纪律。
- `docs/03-standards/code-taste-ten-commandments.md`。
- `docs/02-architecture/adr/` 下 ADR-001 至 ADR-007。
- `docs/04-agent-system/state/project-state.yaml` 与 `docs/04-agent-system/state/task-queue.yaml`。

## 实现思路

1. 在现有后台组织管理页面补充组织详情选择状态和详情面板，不新增网络接口。
2. 详情数据只由现有列表、`orgAuths` 和 `employees` 聚合得到，所有外显标识继续使用 `publicId`。
3. 详情面板展示组织层级、父级/子级数量、员工数、关联授权摘要、状态和管理动作。
4. focused unit 覆盖详情入口、无内部 id 泄露、详情关闭，以及已存在组织增改停用测试回归。

## 风险防御

- 不调用任何 Provider，不读取或修改 `.env*`。
- 不输出 publicId 清单、内部 id、密钥、数据库 URL、原始数据行或明文卡密到 evidence。
- 不触碰 `src/app/api/**`、repository、schema、migration 或 `org_auth` 授权模型运行时。
