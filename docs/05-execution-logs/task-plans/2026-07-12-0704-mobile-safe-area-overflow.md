# 0704 移动端安全区与横向溢出修复方案

**日期：** 2026-07-12

**任务：** `0704-mobile-safe-area-overflow-2026-07-12`

**分支：** `codex/0704-mobile-safe-area-overflow`

**基线：** `1784bfc3229c8305595762cc3becd6acf97c3414`

## 目标与问题映射

- A28：学员端底部导航加入设备安全区，保持 56px 导航内容高度和稳定页面间距。
- A29：先测后修页面级横向溢出；共享后台表格 frame 明确限制为父容器宽度，宽表只在 frame 内横向滚动。
- 不扩大到页面视觉重构或逐页删除既有 `pb-20`；本批只修共享壳和共享 table containment。

## 已读取基线

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- B0 完整问题台账、分批修复方案、evidence 与 audit。
- B5A、B5B task plan、evidence 与 audit。
- Browser 与 frontend testing/debugging skill。

## 浏览器基线

- 当前 localhost 在 390x844 视口将 `/mock-exam` 重定向到 `/login`；登录页根节点 `scrollWidth == clientWidth == 390`，无页面级横向溢出。
- 按私有索引内存使用 `personal_standard_student` 登录，当前数据集返回账号或密码不正确，确认原 0704DB 未挂载。
- 因此不能对学员底栏做虚假 runtime 通过声明；修复后以组件合同、静态门禁和可访问的登录页 viewport 回归为证据，原 0704DB 角色运行保留到 B6/累计验收。
- 未输出或保存凭证、会话、cookie、token、数据库或完整内容；未抓 raw DOM。

## 第一性原理与边界

1. 设备安全区属于固定导航容器，不应由每个学员页面重复猜测；底栏内容高度保持稳定，额外安全区只加在底部。
2. Flex 子项默认 `min-width:auto` 可能让宽内容撑开页面；学员 main 和后台 table frame 必须显式允许收缩并限制到父宽度。
3. 宽表仍需要可用，不能用全局裁剪替代表格内部滚动；`AdminTableFrame` 保留 `overflow-x-auto`。
4. 不改页面业务流程、路由守卫、角色、授权、Provider、数据库、依赖、schema、migration、seed 或环境配置。

## RED 计划

1. 学员壳测试要求根容器 `min-h-dvh/max-w-full`、main `min-w-0/overflow-x-clip`、导航安全区 padding 和固定内容高度。
2. 后台布局 primitive 测试要求 table container 同时具备 `w-full/max-w-full/min-w-0/overflow-x-auto`。
3. 现有 AdminTableFrame 测试继续证明宽表 min-width 位于内部 frame，不转移到页面根。

## 最小 GREEN

- 为 StudentAppLayout 根、main 和 nav 增加共享 containment 与安全区 class，不逐页改业务组件。
- 为 `adminDataTableContainerClassName` 增加父宽度与 flex 收缩约束，保留内部横向滚动。
- 不新增依赖、全局 CSS 或 magic pixel；使用现有 Tailwind token/utility 和 CSS `env(safe-area-inset-bottom)`。

## 对抗式验收矩阵

| 边界          | 必须通过                                                                     |
| ------------- | ---------------------------------------------------------------------------- |
| 移动安全区    | 底栏内容高度稳定；安全区只增加底部 padding，不挤压 tab 文案。                |
| 学员主区域    | 可收缩且页面级横向内容被 containment；内部富文本滚动仍可用。                 |
| 后台宽表      | container 不超过父宽度；表格 min-width 仍在 AdminTableFrame 内滚动。         |
| 390px runtime | 可访问页面 `scrollWidth == clientWidth`；未登录/错误数据集不伪装成角色通过。 |
| 角色业务      | 路由守卫、筛选、分页、操作与授权不变。                                       |
| 敏感边界      | 无凭证、会话、token、数据库值、内部 ID、截图敏感内容或 raw DOM 证据。        |

## 验证门禁

1. focused RED/GREEN：StudentAppLayout、AdminList frame 与 admin layout primitive。
2. 全量 unit 固定单 worker。
3. lint、typecheck、全仓 format check、`git diff --check`、禁止路径审计。
4. Module Run v2 pre-commit hardening。
5. Browser 390px 登录页回归与 console health；学员角色保持明确阻断，不使用错误数据集截图冒充结果。
6. evidence/audit 后一个任务一个提交，按批准快进合入本地 `master`。

## 停止条件

- 需要猜测凭证、读取 env/secret、连接/修改数据库或绕过路由守卫。
- 宽表被全局裁剪而失去内部滚动，或安全区导致 tab 文案/焦点区域重叠。
- 需要依赖、schema、migration、seed、Provider 或部署变化。
- 敏感字段进入 UI、日志、截图或 evidence。
