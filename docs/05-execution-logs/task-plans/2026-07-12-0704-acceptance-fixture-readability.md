# 0704 验收 Fixture 可读性修复方案

**日期：** 2026-07-12

**任务：** `0704-acceptance-fixture-readability-2026-07-12`

**分支：** `codex/0704-acceptance-fixture-readability`

**基线：** `71f658fab24cc2c38776c43d9cae187a60890140`

## 目标与问题映射

- A24：将本地开发种子中的企业训练组织快照名称改为可读中文，不修改生产组织列表或训练展示逻辑。
- A25：将两个受控验收数据准备流程创建的材料标题与正文改为可扫读中文，同时保留稳定、唯一且可复用的运行标签。
- 本任务只修改 fixture 定义源文件；既有 0704DB 数据不会被自动改写，刷新既有数据库仍需单独批准。

## 已读取基线

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- 2026-07-11 五项内容后台 task plan、evidence 与 audit。
- B0 完整问题台账、分批修复方案、evidence 与 audit。

## 第一性原理与边界

1. 验收 fixture 是用于验证产品扫读与流程的受控数据，不应让英文占位文本被误判为生产 UI 文案问题。
2. 可读标题与稳定选择器承担不同职责：标题使用中文业务语言，复用与定位继续依赖受控运行标签，不能把内部标识暴露到 UI 作为产品语义。
3. 本任务不执行 fixture、不连接或写入数据库、不修改生产 UI、API、权限、schema、migration、seed runner、依赖或环境配置。
4. Provider 保持关闭；禁止 staging、production、deploy、Cost Calibration、凭证或 env/secret 读取。

## RED 计划

1. 在 `dev-seed.test.ts` 增加企业训练组织快照必须等于中文组织名称的断言，记录现有英文快照的预期失败。
2. 增加源合同测试，断言两个验收材料创建入口使用中文可读标题与正文，同时仍包含各自稳定运行标签；记录现有英文文本的预期失败。

## 最小 GREEN

- 只替换企业训练快照和两处验收材料 fixture 的可见字符串。
- 不改查询、复用、创建、权限或数据持久化逻辑。
- 不执行 e2e 数据准备和任何数据库写入。
- 若 Module Run v2 因同一已修改测试文件中的既有敏感赋值形态硬阻断，只允许在该文件内做等价的计算属性、分段本地测试值和会话语义命名修正；不得增加白名单、跳过扫描或改变登录行为。

## 对抗式验收矩阵

| 边界         | 必须通过                                                               |
| ------------ | ---------------------------------------------------------------------- |
| 组织 fixture | 企业训练快照名称与组织 fixture 中文名称一致；组织标识和范围合同不变。  |
| 材料 fixture | 两个入口的标题与正文中文可扫读；稳定运行标签仍存在，复用查询仍可定位。 |
| 生产边界     | 无生产 UI、API、权限、数据库 schema、migration 或依赖变化。            |
| 运行边界     | 不执行 fixture、e2e、数据库连接/写入、Provider 或环境读取。            |
| 证据边界     | 只记录文件、类别和测试计数，不记录凭证、会话、数据库行或完整敏感内容。 |

## 验证门禁

1. focused RED/GREEN：`dev-seed.test.ts` 与新增 fixture 源合同测试。
2. `npm.cmd run lint`、`npm.cmd run typecheck`、`npm.cmd run format:check`、`git diff --check`。
3. Module Run v2 pre-commit hardening。
4. 写入脱敏 evidence 与 adversarial audit 后，一个任务一个提交并按批准快进合入本地 `master`。

## 停止条件

- 需要运行 fixture、连接/修改数据库或读取 env/secret 才能继续。
- 需要修改生产 UI、权限、API、schema、migration、依赖或 lockfile。
- 受控运行标签被移除，导致 fixture 无法稳定复用或清理。
- 出现 Provider 请求、敏感输出或无法解释的既有测试失败。
