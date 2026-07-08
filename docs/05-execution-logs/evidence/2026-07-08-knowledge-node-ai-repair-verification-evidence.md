# 2026-07-08 知识点 AI 链路修复验真 Evidence

## Context

- Branch: `codex/knowledge-node-ai-repair-plan-2026-07-08`
- Base: `origin/master` at `8acdf4127b8289df9ddfa1c10876a0d1d4aa6865`
- Scope: 文档化当前源码缺口与修复矩阵，不执行 Provider，不读取 env，不连接 DB，不写 DB。

## Workspace Checks

```text
git status --short --branch
## master...origin/master
```

```text
git rev-parse HEAD origin/master
8acdf4127b8289df9ddfa1c10876a0d1d4aa6865
8acdf4127b8289df9ddfa1c10876a0d1d4aa6865
```

## Source Verification

### G1 Resource Binding UI Gap

- `src/server/services/rag-resource-knowledge-runtime.ts` 会从表单读取 `knowledgeNodePublicIds` 并写入本地资源目录。
- `src/server/contracts/admin-content-knowledge-ops-contract.ts` 的 `AdminResourceOpsSummaryDto` 当前未暴露 `knowledgeNodePublicIds`。
- `src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx` 的上传表单只提交标题、专业、等级、资料类型、文件名和文件，未提交知识点 public id。

结论：服务侧已有字段能力，页面和 DTO 没有建立显式资源-知识点绑定入口。

### G2 Learner AI Picker Gap

- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx` 的知识点面板已存在。
- 页面传入的是空知识点选项，导致指定知识点模式只能进入空态/禁用态。

结论：学员端 AI 出题/组卷缺少真实知识点树选项来源。

### G3 Admin AI Picker Gap

- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx` 的后台 AI 知识点面板支持覆盖模式、包含下级、补充说明。
- 当前面板没有加载或渲染知识点树节点多选项。

结论：内容后台和企业高级版后台无法提交结构化知识点 public id。

### G4 AI Paper Scope Consumption Gap

- `src/server/services/owner-preview-qwen-visible-ai-runtime-control.ts` 只在 AI 出题时把 `knowledgeNodePublicIds` 传给本地 RAG grounding。
- `src/server/services/ai-paper-route-source-resolution-service.ts` 的平台正式题库查询固定 `knowledgeNodePublicId: null`。

结论：AI 组卷的知识点参数未在 RAG grounding 和正式题源查询阶段闭环消费。

## Requirement Mapping Result

| 需求来源                                                                                                | 映射结果                                                                                               |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `docs/01-requirements/modules/05-rag-knowledge.md`                                                      | 资源、知识点树、题目需要在专业/等级基础上形成可治理关系，G1 阻断资源到知识点树显式绑定。               |
| `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md` | AI 组卷知识覆盖必须结构化选择优先，G2/G3 阻断四类角色选择，G4 阻断服务消费。                           |
| `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`                            | 个人高级版与企业高级版员工 AI 训练可用但标准版拒绝，后续修复需保持该边界。                             |
| `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`                        | 企业高级版管理员 AI 输出仍在组织草稿域，后续修复只传知识点范围，不改组织权限语义。                     |
| `docs/01-requirements/modules/06-admin-ops.md`                                                          | 内容后台负责资源、知识点树、题目和内容 AI 草稿闭环，后续资源绑定和内容 AI 参数修复限定在内容后台边界。 |

## Redaction

- 未记录账号、密码、session、cookie、token、env、DB URL、DB 原始行、内部数字 id、Provider payload、raw prompt、raw AI output。
- 未记录完整题目、试卷、材料、资源或 chunk 内容。
- 本 evidence 仅记录文件路径、命令摘要和脱敏结论。

## Result

当前缺口真实存在，后续按四个短分支执行修复和回归收口。
