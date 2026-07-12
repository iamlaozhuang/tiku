# User-led B7 Learner Comprehensive Experience Evidence

## 范围

- 基线：`83a65f28ef78472ca4697eb82db4fcf82d7cf5eb`
- 分支：`codex/user-led-b7-learner-ux`
- 仅修改学员首页、卡密兑换、模拟考试/报告 UI、定向测试与治理记录。
- 未操作浏览器或创建截图；设计判断基于用户本线程提供并已保存的现有截图、稳定需求、现有设计系统与代码。
- 未连接或修改数据库，未执行 migration，未调用 Provider，未修改 `.env*`、依赖、lockfile、服务端授权边界、fixture/seed、staging/prod/deploy。

## TDD 证据

1. 首轮 RED：4 个文件 78 个用例中 8 个预期失败，分别命中首页重复入口/解释噪声、员工兑换边界、可见 publicId、英文弱网提示、总分/用时语义。
2. 报告详情用时 RED：1 个预期失败，证明详情缺少需求要求的用时指标。
3. 弱网诚实文案 RED：1 个预期失败，证明旧文案与“本地暂存 + 手动重试”当前行为不一致。
4. GREEN：最终定向 6 个文件、98 个用例通过。

## 实现结果

- 首页保留兑换、考试记录及有资格角色的 AI/企业训练补充入口；移除与固定底部导航重复的个人中心、错题本入口。
- 首页说明改为直接的学习步骤；试卷卡片显示“总分”语义。
- 员工兑换页在提交区明确：卡密只新增或升级个人授权，不改变企业授权、企业版本或企业额度；账号帮助后置。
- 模拟考试、评分中和报告标题区不再可见展示 publicId；路由和既有 `data-public-id` 定位契约保持不变。
- 弱网恢复提示中文化，并准确说明本地暂存与联网后按提示重试。
- 报告详情显示总分和精确用时；记录列表使用“总分”，按小时/分/秒展示，不再四舍五入丢秒。
- 标准版 AI 与企业训练直接 URL 继续 fail-closed；未触发 Provider 或越权数据访问。

## 验证结果

| 门禁                      | 结果                              |
| ------------------------- | --------------------------------- |
| 定向学员与版本边界        | `6 files / 98 tests` 通过         |
| 全量 unit                 | `360 files / 1982 tests` 通过     |
| lint                      | 通过，0 error                     |
| typecheck                 | 通过                              |
| format:check              | 通过                              |
| webpack build             | 通过，`90/90` 静态页面生成        |
| git diff --check          | 通过                              |
| blocked path diff         | 无输出                            |
| Provider                  | 未调用                            |
| 数据库连接/写入/migration | 未执行                            |
| 浏览器/截图               | 未执行                            |
| Module Run v2 pre-commit  | 通过，11 个文件范围与敏感信息扫描 |
| 本地提交/合入/推送        | 待 closeout                       |

## 敏感信息

- 证据仅记录状态、数量、命令类别与公开 commit SHA。
- 未输出账号、凭证、session、cookie、token、DB URL、环境变量值、卡密明文、题目内容或 Provider payload。

## 结论

当前结果达到真实提交门禁，不扩展为 staging、production 或 release readiness。
