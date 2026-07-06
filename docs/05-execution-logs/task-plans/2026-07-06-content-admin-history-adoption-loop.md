# 2026-07-06 Content Admin History Adoption Loop

## 任务

补齐内容后台 `AI出题` / `AI组卷` 历史生成结果进入正式草稿评审/采用的闭环：历史结果只能携带服务端生成的、可复核的正式草稿 payload，不允许直接发布，不允许暴露 Provider payload、raw prompt 或 raw output。

## 已读取规范

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## 实现思路

1. 先加失败测试，锁定两个行为：内容后台历史结果带有持久化 reviewed draft 时可提交采用；没有该快照时仍不能伪造采用 payload。
2. 将当前前端构造正式草稿 payload 的逻辑抽为可复用纯函数，供前端当前结果和服务端持久化路径共同使用。
3. 在内容后台生成结果持久化时，把结构化预览转换为正式草稿快照写入既有 `content_redacted_snapshot`，避免新增 schema/migration。
4. 历史列表只对内容后台结果返回 `reviewedDraft` 快照；组织后台保持 `null`，仍走组织训练草稿路径。
5. 前端历史卡片优先使用持久化 `reviewedDraft`，当前结果仍可使用本次 runtime structured preview。

## 风险防御

- 不改数据库 schema、不新增依赖、不触发 Provider、不连接 DB。
- 不把历史摘要伪造成可采用草稿：没有 `reviewedDraft` 快照时按钮保持禁用。
- 不暴露 raw prompt/raw output/provider payload；证据只记录文件、命令和聚合结果。
- 正式发布仍由既有正式草稿发布链路单独完成，AI 采用动作只创建/复用正式草稿。

## 验证计划

- Red-first focused tests.
- Focused unit tests for UI, route, repository.
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- Prettier check for touched files.
- `git diff --check`
- Full `npm.cmd run test:unit`
- Module Run v2 precommit and prepush readiness.
