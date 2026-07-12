# 0704 资源与知识点工作区执行计划

## 目标

在不改变资源发布、检索索引、知识点创建/编辑/移动/停用业务语义的前提下，将内容后台资源页收敛为可分页的资料生命周期工作区，将知识点页收敛为显式选择的树形维护工作区。

## 已读取基线

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/05-rag-knowledge.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-rag-knowledge.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- 最新内容后台 UI/UX closure、任务 3 evidence/audit
- 既有资源管理、知识点树私有截图，只读查看且不复制到仓库
- 资源/知识点页面、API、服务、仓储、合同与现有测试

## 实施边界

### 资源管理

1. 使用既有共享列表工具栏、表格、分页与状态组件。
2. 改为服务端关键词、专业、等级、状态、类型、排序与分页；URL 保留查询状态。
3. “上传资料”改为页面主操作，按需展开，不长期占据首屏。
4. 每条资料提供只读“查看资料”；详情仅展示可读元数据、正文预览、章节目录、处理进度、发布时间、检索状态与安全时间线。
5. “校对内容”“发布资料”“重建检索索引”保持职责分离，现有写操作端点和请求体不变。

### 知识点树

1. 采用左侧树、右侧节点详情；未选中节点时禁止编辑、移动、停用。
2. 搜索命中节点时恢复并展开祖先路径；树按分支表达层级，不做破坏结构的全局分页。
3. 父级选择采用树选择器；界面文案使用“显示顺序”，不要求输入父级业务标识。
4. 节点详情展示名称、完整路径、适用等级、状态、绑定题目数及关联资源摘要；不显示内部自增 ID。
5. 创建、编辑、移动、停用仍调用现有端点和服务端校验。

## TDD 与验证

1. 先补 UI/API 查询合同和交互测试，记录预期红灯。
2. 最小实现并运行 targeted tests。
3. 对抗式审查角色权限、敏感字段、资源状态、检索状态、显式选择、知识点路径和写操作合同。
4. 运行 lint、typecheck、format check、`git diff --check`、Module Run v2 pre-commit/pre-push。
5. 写脱敏 evidence/audit，一个任务一个提交；合入 `master` 后复跑、推送并清理短分支。

## 风险防御

- Provider 保持关闭，不执行 Provider-enabled 行为。
- 不访问 env/secret，不连接或修改数据库，不执行 staging/prod/deploy/Cost Calibration。
- 不新增依赖，不修改 package/lockfile、schema、migration 或 seed。
- 不展示或记录原始 chunk、embedding、对象存储路径、内部 ID、完整受保护内容或凭证。
- 禁止通过前端隐藏替代服务端权限；发布、索引、移动和停用仍由服务端最终裁决。

## 验收标准

- 资源超过 100 条仍能通过服务端分页访问，筛选与总数一致。
- 资料查看、校对、发布、索引重建职责清晰，状态完整。
- 知识点页不再默认选择第一项，必须显式选择后才能写操作。
- 搜索命中子节点时可看到完整祖先路径，父级通过树选择器选择。
- 资源/知识点关系、题目绑定、检索状态和既有写操作语义保持不变。
