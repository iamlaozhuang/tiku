# B4 AI 训练信息架构与 Provider-closed 体验修复审计

**日期：** 2026-07-12

**任务：** `user-led-b4-ai-training-information-architecture-2026-07-12`

## 对抗式复核

| 检查项            | 结论                                                                               |
| ----------------- | ---------------------------------------------------------------------------------- |
| 上下文保真        | pass；企业授权上下文显示企业员工标题，个人授权标题保持不变。                       |
| 授权隔离          | pass；只改变可见选择和文案，不改变 owner、quota 或 API 请求合同。                  |
| Provider 红线     | pass；关闭/异常状态提交仍禁用，新增用例明确证明切换操作零生成 POST。               |
| 历史可用性        | pass；请求历史、结果历史和详情在关闭状态前置可见。                                 |
| 状态竞态          | pass；loading 与 available 均保持历史在同一 DOM 顺序，避免异步重排卸载。           |
| 本地化            | pass；专业与时间不再直接透传内部枚举或 ISO 字符串。                                |
| 无障碍            | pass；授权使用原生 radio、任务类型使用 tab、生成设置使用原生 details/summary。     |
| 直接 URL/版本边界 | pass；既有标准版 fail-closed 回归用例通过。                                        |
| 敏感信息          | pass；无凭证、token、session、DB URL、Provider payload 或内部 publicId 新增展示。  |
| 范围控制          | pass；仅修改 allowedFiles，未触碰 server、schema、migration、fixture、env 或依赖。 |
| 回归门禁          | pass；360 文件、1972 用例、lint、typecheck、format 和 webpack build 通过。         |
| 主分支复验        | pass；ff-only 合入后 focused 54 用例、lint、typecheck 和 diff check 通过。         |
| 远端门禁          | pass；pre-push 通过，普通推送后 master/origin/master 比较为 0/0。                  |

## 反证与残余风险

- 企业员工标题依据有效企业授权上下文，而非新增 session 接口字段；避免扩大接口范围，但要求授权列表合同继续准确反映企业上下文。
- 时间固定按 `Asia/Shanghai` 展示，符合当前中国业务语境；未来若支持多时区，应独立定义产品级时区策略。
- 本批不操作浏览器或生成新截图；视觉判断基于用户既有截图、页面结构和自动化 DOM/交互回归，累计 B9 仍需覆盖 390px containment。
- B0-B2 数据库迁移缺口与本批独立，未以客户端降级绕过。

## 品味合规自检 Checklist

- [x] 从用户任务不变量出发：Provider 关闭只应阻止生成，不应阻止查看和切换。
- [x] 未用隐藏提示或技术术语替代明确的用户状态。
- [x] 使用现有设计 token、原生交互语义和既有页面结构，未引入魔法颜色或新依赖。
- [x] API envelope、JSON、数据库、owner、quota 和正式域合同未改变。
- [x] 未扩大角色、版本、企业或 Provider 权限边界。
- [x] 测试、类型和格式首次失败均如实记录并修复，未跳过门禁。
- [x] A14、A15、数据库、Provider、staging、production 和 deploy 红线未触碰。

## 审计结论

APPROVE：B4 适合按既定授权执行单批提交、ff-only 合入、主分支复验、普通 push 与短分支清理。
