# close-employee-transfer-unbind-management

## 任务边界

- 目标：关闭后台员工解绑管理体验，并登记跨组织 transfer 的阻断边界，避免 UI 暗示已存在未批准的转移 runtime。
- 允许：后台员工列表/解绑 UI、低风险 transfer approval_required 提示、focused unit 测试、任务状态/证据/审计文档。
- 禁止：新增 transfer route、服务/仓储数据库写入、schema/migration、`org_auth` 授权模型 runtime 改动、依赖变更、dev server、浏览器/e2e、env/Provider、部署、PR、force push。

## 已读取规范

- `AGENTS.md` 命名与执行纪律。
- `docs/03-standards/code-taste-ten-commandments.md`。
- `docs/02-architecture/adr/` 下 ADR-001 至 ADR-007。
- `docs/04-agent-system/state/project-state.yaml` 与 `docs/04-agent-system/state/task-queue.yaml`。

## 实现思路

1. 在员工列表中补充解绑影响预览，明确解绑只提交 employee publicId 并减少原组织员工数。
2. 解绑成功后展示脱敏结果反馈，只展示状态、影响组织和聚合说明，不展示内部 id。
3. 增加 transfer approval_required 面板，说明跨组织转移需要后续 route/service/repository/DB 批准，当前任务不实现 runtime。
4. focused unit 覆盖解绑请求、列表更新、组织员工数更新、结果反馈和 transfer 阻断说明。

## 风险防御

- 不新增或修改后端 runtime、repository、schema、migration 或数据库连接。
- 不记录 publicId 清单、内部 id、密钥、数据库 URL、Authorization header、原始数据行或明文卡密到 evidence。
- 不触碰 package/lockfile、`src/app/api/**`、`src/server/repositories/**`、`src/db/schema/**` 或 `drizzle/**`。
