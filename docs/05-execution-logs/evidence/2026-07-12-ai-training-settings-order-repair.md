# AI 训练生成设置顺序修复证据

**任务：** `user-led-ai-training-settings-order-repair-2026-07-12`

**分支：** `codex/ai-training-settings-order`

**基线：** `499a90e8744040af1af03d70651b65e80e110a54`

## 范围

- 修复个人高级版和企业高级版员工复用的 `/ai-generation` 页面。
- Provider-closed/error 下，生成设置固定紧随 AI出题/AI组卷模式标签，历史记录随后展示。
- Provider-closed 下生成设置继续默认收起；展开后参数可查看、提交按钮禁用，并显示用户可理解的原因。
- 不修改 availability API、Provider 开关、授权、额度、数据库、schema、迁移、依赖或生产配置。

## RED / GREEN

- RED：把既有 B4 测试反转为“生成设置先于历史”，初次 focused 运行 1 个预期失败，失败点为旧 DOM 顺序。
- GREEN：移除 closed/error 的历史前置分支，统一为“模式标签 → 生成设置 → 历史”；focused 1 文件 / 15 用例通过。
- HARDEN：测试展开设置后显示“当前无法生成”原因，企业组卷生成按钮保持禁用，关闭状态仍为零生成 POST。

## 自动化验证

| 验证             | 结果                               |
| ---------------- | ---------------------------------- |
| focused Vitest   | pass，1 文件 / 15 用例             |
| full Vitest      | pass，360/360 文件、1983/1983 用例 |
| lint             | pass                               |
| typecheck        | pass                               |
| format:check     | pass                               |
| webpack build    | pass，90/90 静态页面               |
| git diff --check | pass                               |

## 浏览器验证

- 企业高级版员工桌面：模式标签结束于约 `955px`，生成设置位于约 `975-1021px`，历史从约 `1041px` 开始；设置默认收起且首屏可见。
- 企业高级版员工设置展开：全部既有参数仍可见；关闭原因存在；生成按钮禁用。
- 企业高级版员工 390px：模式标签、生成设置、历史顺序正确；生成设置默认收起；文档宽度不超过视口。
- 个人高级版桌面：显示“个人 AI 训练”，仅 1 个个人授权上下文；生成设置位于约 `631-677px`，历史从约 `697px` 开始；页面 containment 通过。
- 浏览器 console error-like 记录：0。
- 截图仅保存在仓库外 `D:/tiku-local-private/acceptance/ai-generation-settings-order-2026-07-12`，未进入 Git。

## 对抗式检查

- 角色复用：个人高级版和企业高级版员工均使用同一组件，实际浏览器分别验证，标题与授权上下文未串用。
- Provider 边界：关闭状态只允许查看设置和历史，不允许提交；未执行 Provider 调用。
- 版本边界：未改动 `effectiveEdition`、路由保护或标准版 fail-closed 条件。
- 数据边界：未改 API、owner、organization、quota、request body、历史查询或正式域写入。
- 无障碍：保留原生 `details/summary`；禁用按钮通过 `aria-describedby` 关联不可生成原因。
- 响应式：桌面入口首屏可发现；移动端仍默认收起且紧跟模式标签；无横向溢出。
- 敏感信息：凭证仅在内存中用于 localhost 角色切换，未写入聊天、截图、仓库文档或证据。

## 非声明

- 本结论只覆盖当前 localhost 代码和 Provider-closed 验收状态。
- 不代表 staging、production、Provider-enabled、release readiness、生产可用性或 Cost Calibration。
