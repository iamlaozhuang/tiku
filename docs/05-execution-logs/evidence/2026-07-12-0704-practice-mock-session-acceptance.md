# 0704 练习与模拟考试会话验收证据

**日期：** 2026-07-12

**任务：** `0704-practice-mock-session-acceptance-2026-07-12`

**分支：** `codex/0704-practice-mock-session-acceptance`

**基线：** `d99fb89e74849b5b858f1f1a69d5b9e27f930202`

## 环境门禁

- localhost 服务健康，使用显式进程级 0704DB override；`.env.local` 未修改。
- 标准版学员、高级版学员、超级管理员和运营管理员均使用私有目录中的已验证账号登录成功。
- AI 生成可用性为 `closed`；验收前后 AI 调用日志总数差值为 0。
- 凭证、cookie、session、token、DB URL、env 值、业务对象标识、题干、答案和报告快照均只在进程内使用，未写入聊天、仓库或证据。

## 产品 API 闭环

| roleLabel                 | route label          | 状态类别  | 结论                                                                                 |
| ------------------------- | -------------------- | --------- | ------------------------------------------------------------------------------------ |
| personal_standard_student | 学习范围与已发布试卷 | success   | 动态选择当前授权范围内可练习、可模拟考试且含客观题的正式试卷；未使用历史硬编码标识。 |
| personal_advanced_student | 学习范围与已发布试卷 | success   | 高级版保留普通学习能力；未借此扩大 AI 或其他高级能力。                               |
| personal_standard_student | 练习创建/恢复        | success   | 正常产品 API 创建或恢复会话。                                                        |
| personal_standard_student | 练习答案保存与重读   | success   | 保存合法客观题答案后重新读取，答案记录仍存在。                                       |
| personal_standard_student | 模拟考试创建/恢复    | success   | 获得可写会话并通过正常产品 API 保存答案。                                            |
| personal_standard_student | 模拟考试提交         | completed | 提交完成，未进入 Provider 评分状态。                                                 |
| personal_standard_student | 报告生成、详情与列表 | success   | 报告可生成、详情可读且列表可回查。                                                   |

## 对抗式隔离

| 攻击主体                  | 目标                                 | 结果                                     |
| ------------------------- | ------------------------------------ | ---------------------------------------- |
| personal_advanced_student | 第一学员练习详情与答案写入           | denied；未泄漏会话或答案内容。           |
| personal_advanced_student | 第一学员模拟考试详情、答案写入与提交 | denied；未改变第一学员考试状态。         |
| personal_advanced_student | 第一学员报告详情                     | denied；浏览器不显示得分或题目结果。     |
| super_admin               | 第一学员练习、模拟考试与报告         | denied；管理员身份不被当作学员授权。     |
| unauthenticated           | 练习读取、模拟考试提交与报告读取     | denied；业务码为 session-required 类别。 |

## 浏览器验收

- 标准版学员首页进入练习后显示“继续上次进度”和“重新开始”，证明真实会话可恢复；无错误状态。
- 高级版学员从首页进入模拟考试后可见答题卡，页面无加载失败、不可进入或空白状态。
- 标准版学员考试记录显示已完成状态；报告详情显示得分摘要和题目结果，不显示 raw Prompt、raw output 或 Provider payload 标记。
- 高级版学员直达第一学员报告时得到拒绝/不存在状态，且不显示得分摘要或题目结果。
- 当前验收时间窗内控制台新增 error/warning 均为 0；浏览器捕获到的 1 条错误来自约 11 小时前的既有页面会话，不属于本轮路由或操作。
- 未截图、未保存 trace、未保留 DOM 或浏览器测试产物；临时浏览器凭证值已清空。

## 写入与禁止项

- 执行的业务写入仅限本地 0704DB 的 practice、mock_exam、answer_record 和 exam_report 正常产品合同。
- 未直接连接或写数据库，未改 fixture、schema、migration、seed、正式题目/试卷/材料/资源/知识点或 AI 结果。
- 未调用重试学习建议、AI 评分重试、AI 生成或任何 Provider-enabled 行为。
- 未修改依赖、package/lockfile、env 文件或私有凭证文件；未执行 staging、production、deploy、push、PR 或 Cost Calibration。

## 结论

A23 的练习、模拟考试、答案保存、提交、报告和角色隔离闭环通过。结果仅证明当前 localhost 0704DB 验收环境，不代表 staging、production 或 release readiness。
