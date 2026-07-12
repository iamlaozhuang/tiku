# B6 AI 组卷结构贯通企业训练证据

**日期：** 2026-07-12

**任务：** `user-led-b6-ai-paper-organization-training-handoff-2026-07-12`

**分支：** `codex/user-led-b6-ai-paper-training`

**基线：** `88b02f7eaff1aaf1a4c1143e0a7295c57a823596`

## Batch range

- B6：将企业高级版管理员 AI 组卷结果的大题结构贯通企业训练草稿、发布请求、不可变 JSONB 快照和已发布详情。
- 不包含 B0-B2 企业训练数据库诊断/迁移、Provider-enabled、平台正式试卷写入、依赖、数据库 DDL、fixture、staging、production 或 deploy。

## RED / GREEN

- RED: 4 个目标测试文件共 99 个用例中出现 4 个预期失败，分别证明 UI 发布请求、validator、service snapshot copier 和 repository published detail 均会丢失 `paper_section` 结构。
- GREEN: 同一 4 文件 99/99 用例通过；结构字段按大题和题内顺序进入发布请求、校验、持久化复制和详情重建。
- HARDEN: 增加部分元数据、重复 publicId、断序大题、重复题内序、同 key 冲突和畸形历史快照反例；畸形历史快照仍可读取平铺题目，但不伪造 `paperSections`。

## 实现证据

- AI 组卷既有 `paperSections` 成为企业训练发布表单的结构来源；全局题序按大题和题内顺序重新编号。
- 发布题目可选携带 `paperSectionKey`、`paperSectionTitle`、`paperSectionSortOrder`、`questionSortOrder`；平铺人工草稿继续不携带这些字段。
- validator 强制结构字段全有或全无，并校验题目唯一、全局题序、大题序、同大题标题/题型/顺序和题内序一致。
- service 只复制完整结构元数据到已发布的不可变 `question_snapshot`；不触发第二次 AI 调用。
- repository 仅在 snapshot 元数据完整合法时重建大题；旧平铺或畸形快照保持平铺兼容。
- `src/db/schema/organization-training.ts` 仅补齐既有 JSONB 值的 TypeScript 可选字段，不改变表、列、约束或索引，不生成或执行迁移。
- 未修改 AI Provider 路由、平台正式试卷、角色/企业授权边界、依赖、lockfile、`.env*`、fixture 或 seed。

## 验证

- focused Vitest：4 文件 / 99 用例通过。
- 全量 Vitest：360/360 文件、1980/1980 用例通过，278.11s。
- `corepack pnpm@10.26.1 run lint`：pass；JSONB 类型补齐后复跑仍 pass。
- `corepack pnpm@10.26.1 run typecheck`：pass；JSONB 类型补齐后复跑仍 pass。
- `corepack pnpm@10.26.1 run format:check`：pass。
- `corepack pnpm@10.26.1 exec next build --webpack`：pass，90/90 静态页面生成。
- `git diff --check`：pass。

## 两轮对抗式复核

- 第一轮：核对完整/部分元数据、题目唯一、大题与题内连续顺序、同大题题型一致、旧平铺兼容、畸形历史 fail-closed；发现并补齐 JSONB TypeScript 值类型缺口。
- 第二轮：类型补齐后复核 allowedFiles、数据库 DDL、Provider、跨企业、已发布不可变、平台正式试卷、敏感信息和现有 UI 合同；未发现新增风险。

## Module Run v2 锚点

- result: pass
- Commit: `96a80cf1b`
- localFullLoopGate: pass
- Test-ModuleRunV2PreCommitHardening: pass_15_files_scope_sensitive_terminology
- Test-ModuleRunV2ModuleCloseoutReadiness: pass
- Test-ModuleRunV2PrePushReadiness: pending
- threadRolloverGate: not_required；本批可在当前任务内完成串行 closeout。
- Provider execution: blocked_not_executed
- database connection: blocked_not_executed
- database mutation: blocked_not_executed
- schema migration: blocked_not_created_not_executed
- Cost Calibration Gate remains blocked
- nextModuleRunCandidate: `user-led-b7-learner-comprehensive-experience-2026-07-12`

## 结论

B6 产品实现与本地质量门禁通过，待真实提交、ff-only 合入、master 复验和远端收口。结论仅覆盖 localhost 代码，不代表 staging、production 或 release readiness。
