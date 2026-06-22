# close-employee-import-management

## 任务边界

- 目标：关闭后台员工导入管理体验缺口，补充导入前预览、导入后结果反馈和拒绝原因摘要。
- 允许：后台组织/授权页面中的员工导入 UI 状态、focused unit 测试、任务状态/证据/审计文档。
- 禁止：真实文件上传存储、数据库写入验证、schema/migration、route/repository 改动、依赖变更、dev server、浏览器/e2e、env/Provider、部署、PR、force push。

## 已读取规范

- `AGENTS.md` 命名与执行纪律。
- `docs/03-standards/code-taste-ten-commandments.md`。
- `docs/02-architecture/adr/` 下 ADR-001 至 ADR-007。
- `docs/04-agent-system/state/project-state.yaml` 与 `docs/04-agent-system/state/task-queue.yaml`。

## 实现思路

1. 基于现有 textarea 导入方式提供本地预览，识别 legacy publicId 绑定和 CSV/TSV 员工账号导入。
2. 导入按钮在输入为空或无有效数据行时禁用，避免无意义请求。
3. 导入完成后展示成功数、拒绝数和拒绝原因标签，只展示行号与原因，不展示原始 publicId 清单或敏感字段。
4. focused unit 覆盖预览、请求 payload、拒绝原因反馈和内部 id 不泄露。

## 风险防御

- 不新增文件上传、对象存储、数据库连接或后端持久化逻辑。
- 不记录 publicId 清单、内部 id、密钥、数据库 URL、Authorization header、原始导入内容或明文卡密到 evidence。
- 不触碰 `src/app/api/**`、repository、schema、migration、package/lockfile 或 Provider/env。
