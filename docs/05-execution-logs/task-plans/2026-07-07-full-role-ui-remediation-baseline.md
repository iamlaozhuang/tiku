# 2026-07-07 全角色 UI 整改基线计划

## 目标

补齐其余角色与 `super_admin` 的本地页面截图与分析，和已完成的三角色 12 页一起形成全角色 UI 整改基线。本轮只做验收与文档，不改业务代码。

## 读取入口

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- 高级版、授权、AI 生成与 UI/UX 相关需求及 traceability
- 已有三角色 12 页截图目录与脱敏结论

## 范围

- 复用仓库外截图目录：`D:\tiku-local-private\acceptance\screenshots\2026-07-07-three-role-page-review`
- 补齐角色：
  - `super_admin`
  - `content_admin`
  - `org_standard_admin`
  - `org_standard_employee`
  - `personal_advanced_student`
  - `personal_standard_student`
- 输出全角色整改基线、脱敏 evidence、对抗式 audit review。

## 红线

- 不输出、不提交账号、密码、手机号、邮箱、session、cookie、token、env 值、DB URL、内部 id、原始 DB 行、Provider payload、raw prompt、raw AI output、完整题目/试卷/材料。
- 不创建账号、不创建业务内容、不调用 Provider。
- 不修改 `.env.local`、package/lockfile、schema、migration、seed。
- 不做 destructive DB 操作。
- 不声明 release readiness、production usability、staging 或 Cost Calibration。
- 截图存放在仓库外，不提交截图。

## 方法

1. 使用 0704 本地服务与既有账号材料登录各角色。
2. 仅浏览页面与截图，不触发生成、发布、删除、兑换等写操作。
3. 对页面从菜单命名、信息结构、布局、文案、按钮状态、拒绝提示、闭环入口维度归纳问题。
4. 与已完成三角色 12 页结论合并，形成 P1/P2/P3 整改基线。
5. 运行文档与工作区验证，确认无代码改动、无敏感材料进入仓库。

## 风险防御

- 账号材料只在本地内存使用，文档只记录角色标签与页面现象。
- 对内容页只记录结构问题，不转录完整题目、材料、试卷内容。
- 发现疑似业务逻辑问题时先归类，不在本轮修复。
- 卡密列表明文展示为既定产品要求，本轮不列为整改项。
