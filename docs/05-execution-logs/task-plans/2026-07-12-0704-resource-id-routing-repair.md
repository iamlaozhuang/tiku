# 0704 资源 publicId 路由兼容修复方案

## 任务信息

- taskId：`0704-resource-id-routing-repair-2026-07-11`
- 批次：B1C / A05
- 分支：`codex/0704-resource-id-routing-repair`
- 基线：`454277e9478a2a7c49f8650d61c9706979f3a7ec`
- 目标：把资源 `publicId` 作为不透明 URL 段处理，恢复历史下划线标识和特殊字符标识的完整操作流程。

## 已读取约束

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/traceability/2026-07-02-content-resource-management-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/05-execution-logs/task-plans/2026-07-11-0704-resource-knowledge-workspace.md`
- 对应 evidence 与 audit

## 根因与边界

- 资源页面用 kebab-only 正则决定查看、校对、发布、重建检索索引、停用和启用是否可执行，合法历史下划线标识被前端误判为异常。
- 6 个资源端点直接把 `publicId` 插入 URL，斜杠、查询、片段等字符可能改变路径结构。
- `publicId` 是服务端返回的不透明业务标识；前端只检查非空，不解释格式、不改写值，并用 `encodeURIComponent` 编码单一路径段。
- 服务端角色、状态、not-found、资源范围和写操作校验保持最终裁决；不修改 API、service、repository、schema 或数据。
- Provider、env/secret、直接数据库、依赖、staging/production/deploy 和 Cost Calibration 均禁止。

## TDD 步骤

1. 将旧“unsafe publicId”测试改为历史/特殊 publicId 全流程测试，先确认按钮禁用和请求未发出的 RED。
2. 建立单一资源路径构造函数，对 publicId 路径段执行 `encodeURIComponent`。
3. 将 kebab 正则替换为非空检查；查看、校对、发布、索引重建、停用、启用统一使用编码路径。
4. 回归 loading、empty、filtered-empty、error、forbidden、not-found 和既有资源状态操作。
5. 运行 focused tests、B0-B1B 累计回归、全量 unit、lint、typecheck、format check、diff check、build 与 Module Run v2。
6. 写脱敏 evidence/audit，单提交、`--ff-only` 合入本地 master 并清理；禁止 push。

## 验收标准

- 下划线等合法历史 publicId 可查看、校对、发布、重建检索索引、停用和启用。
- 斜杠、查询、片段和空格等字符只能作为编码后的单一路径段发送，不能形成路径、查询或片段注入。
- publicId 原值不被 trim、替换或转成 kebab；服务端接收解码后的原值。
- 空 publicId 不发起资源详情或写请求。
- 非内容角色、not-found、状态迁移、私有资源和审计边界不变。

## 允许文件

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-12-0704-resource-id-routing-repair.md`
- `docs/05-execution-logs/evidence/2026-07-12-0704-resource-id-routing-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-12-0704-resource-id-routing-repair-audit.md`
- `src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx`
- `tests/unit/admin-content-knowledge-ops-baseline.test.ts`
