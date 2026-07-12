# B6 AI 组卷结构贯通企业训练审计

**日期：** 2026-07-12

**任务：** `user-led-b6-ai-paper-organization-training-handoff-2026-07-12`

## 对抗式复核

| 检查项         | 结论                                                                                 |
| -------------- | ------------------------------------------------------------------------------------ |
| 结构贯通       | pass；AI 结果大题、题型、大题序和题内序进入发布请求、JSONB 快照及已发布详情。        |
| 本地选题       | pass；企业训练发布只消费已解析的正式题目，不发起第二次 Provider 调用。               |
| 输入完整性     | pass；结构字段全有或全无，部分字段、重复题、断序和同大题冲突均拒绝。                 |
| 历史兼容       | pass；旧平铺快照继续读取；畸形结构不生成误导性大题，但题目仍可读。                   |
| 不可变性       | pass；结构只随新发布版本写入既有快照，不改写历史版本。                               |
| 数据库边界     | pass；仅补 JSONB TypeScript 值类型，无 DDL、migration、连接或 DB 写入。              |
| 正式资源边界   | pass；不创建或修改平台正式试卷，不放宽正式题源资格。                                 |
| 角色与企业隔离 | pass；未修改授权、effectiveEdition、组织可见范围或直接 URL 防线。                    |
| Provider 红线  | pass；Provider 保持关闭，未修改 Provider 路由或执行调用。                            |
| 敏感信息       | pass；无凭证、token、session、cookie、DB URL、Provider payload 或内部 ID 进入记录。  |
| 范围控制       | pass；变更均在物化后的 allowedFiles 内，无依赖、lockfile、fixture、seed 或环境文件。 |
| 回归门禁       | pass；360 文件、1980 用例、lint、typecheck、format 和 webpack build 通过。           |

## 反证与残余风险

- 已发布详情的 `targetQuestionCount` 与 `selectedQuestionCount` 均由实际快照题数重建；发布版本表达实际可作答结构，不保留生成阶段因题源不足而未满足的目标缺口。
- 本批未操作浏览器或截图；UI 结构贯通由真实组件交互测试覆盖，最终角色矩阵与窄屏累计验收留在 B9。
- B0-B2 的数据库迁移安全机制仍是独立高风险边界，不因本批 JSONB 类型声明而自动获批或执行。

## 品味合规自检 Checklist

- [x] 从不变量出发：AI 只生成计划，本地选择正式题，发布只持久化可作答结构。
- [x] 复用既有 DTO、发布表单、JSONB 快照和详情读模型，没有新增表、接口或依赖。
- [x] 结构字段命名遵守 `paper_section` 术语和 API camelCase 规范。
- [x] 旧平铺数据兼容，畸形结构 fail-closed，不隐式猜测或批量回填。
- [x] 无纯黑、新颜色、魔法间距或视觉系统改动；现有后台设计保持不变。
- [x] API envelope、空值语义、publicId 和已发布不可变约束未破坏。
- [x] 未扩大角色、企业、授权、A14、A15、Provider、数据库或环境边界。
- [x] RED/GREEN、全量门禁和两轮对抗式复核证据已记录。

## 审计结论

APPROVE：B6 适合按既定授权执行单批提交、ff-only 合入、master 复验、普通 push 与短分支清理。
