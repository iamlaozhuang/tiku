# B6 AI 组卷结构贯通企业训练实施方案

- taskId: `user-led-b6-ai-paper-organization-training-handoff-2026-07-12`
- branch: `codex/user-led-b6-ai-paper-training`
- baseline: `88b02f7eaff1aaf1a4c1143e0a7295c57a823596`
- approval: `current_user_approved_execute_full_remediation_plan_2026_07_12`

## 已读取

- `AGENTS.md`、project-state、task-queue、代码品味十诫、ADR-001 至 ADR-007。
- 标准版/高级版索引、edition-aware authorization、企业训练与组织 AI modules/stories、AI requirements SSOT、phase4、最新 AI baseline evidence/audit、2026-07-05 closed-loop、2026-07-06 recontract、B5 closeout。
- AI 组卷结果持久化、企业训练草稿/发布 DTO、validator/service/repository/UI 及相关测试；既有企业高级版管理员失败截图和员工 AI 页面截图。

## 问题登记

| roleLabel        | route label        | 状态类别                   | 问题类别     | 严重程度 | 实际表现                                                                     | 期望表现                                                                              | 复现步骤                                                                 | 建议方案                                                                                     | 疑似同根因                                 |
| ---------------- | ------------------ | -------------------------- | ------------ | -------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 企业高级版管理员 | AI组卷 -> 企业训练 | 已生成结果转训练草稿并发布 | 组卷结构贯通 | P1       | AI 结果含大题结构，但发布表单扁平化题目，已发布训练 JSONB 丢失大题与题内顺序 | AI 结构和顺序随训练版本持久化；实际选题仍由本地确定性选择器完成，不发生第二次 AI 调用 | 生成至少两个大题的 AI 组卷结果，创建企业训练草稿并发布，再读取已发布详情 | 在既有 `question_snapshot` JSONB 中保存大题 key/title/order 与题内 order，并在读模型重建大题 | 发布 DTO 与 snapshot copier 只承载平铺题目 |

## 第一性原理与实现

1. AI 只输出可评审的组卷结构，本地选择器只从当前角色可用的正式题源中确定性选题；企业训练发布不再次调用 Provider。
2. RED：覆盖 UI 结构映射、validator 全量约束、service JSONB 复制、repository 已发布详情重建及旧平铺兼容。
3. GREEN：为发布题目增加可空的大题元数据。人工/旧平铺输入四字段全空；结构化输入四字段必须全有。
4. 校验 publicId 唯一、全局题序连续、大题序连续、同一大题 key/title/type/order 一致、题内序连续且题目只出现一次。
5. 已发布详情只在 snapshot 元数据完整合法时重建 `paperSections`；旧平铺 snapshot 保持原读法，不伪造大题。
6. 同步补齐既有 `question_snapshot` JSONB 的 TypeScript 值类型；不改变数据库 DDL，不生成或执行 migration。
7. 已发布版本继续不可变，不写平台正式试卷。

## 边界与风险防御

- 仅修改任务队列列明的 organization-training JSONB 类型、model/validator/service/repository/UI、定向测试与治理记录。
- 禁止依赖和 lockfile、schema/migration/fixture/seed、`.env*`、Provider、数据库运行时、浏览器自动化、staging/prod/deploy、PR、force push。
- 对抗式检查：重复题、部分元数据、乱序/断序、同 key 冲突、旧快照、跨企业、下架题、重复发布、Provider 误调用、敏感信息与内部 ID 泄露。

## 验证与关闭

- TDD RED/GREEN、定向 Vitest、全量 unit、lint、typecheck、format:check、webpack build、`git diff --check`。
- 两轮对抗式审查，记录 evidence/audit 与品味自检。
- Module Run v2 pre-commit/module-closeout/pre-push；单批提交、ff-only 合入 master、master 复验、普通 push、0/0 比对与短分支/worktree 清理。
