# 2026-07-08 Knowledge Node AI Final Regression

## Task Metadata

- Task ID: `knowledge-node-ai-final-regression-2026-07-08`
- Branch: `codex/knowledge-node-ai-final-regression-2026-07-08`
- Scope: 全角色一致性收口，复核知识点树、资源绑定、题目绑定、AI 出题/AI 组卷知识点参数和角色/edition/组织上下文边界。
- Non-scope: 新功能扩围、UI redesign、Provider、DB/schema/migration/seed/fixture、env、package/lockfile、账号或凭证。

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-question-engine-and-paper-composition.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-repair-verification-and-implementation-plan.md`
- `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-control-matrix.md`
- 前置分支 evidence/audit：resource binding、AI knowledge node picker、AI paper knowledge consumption。

## Implementation Plan

1. 新增最终角色矩阵单测：
   - 覆盖 `personal_standard_student`、`personal_advanced_student`、`org_standard_employee`、`org_advanced_employee`、`org_standard_admin`、`org_advanced_admin`、`content_admin`、`ops_admin`、`super_admin`。
   - 复核 selected knowledge scope 结构化参数、后台 workspace 边界、标准/高级版拒绝、super_admin 缺组织上下文拒绝。
2. 跑聚焦回归：
   - 学员 AI UI、后台 AI UI、知识点 options route、AI paper source/plan wiring、资源/知识点管理、workspace guard、effective authorization、personal/admin route contracts。
3. 跑全量 `vitest run`、lint、typecheck、diff 和 Module Run v2 gates。
4. 写脱敏 evidence/audit，提交、合入、推送、清理。

## Risk Controls

- 不执行 Provider，不读写 DB，不运行浏览器，不读取 env/secret，不改 package/lockfile。
- 不输出凭证、session、cookie、token、env 值、DB 原始行、内部数字 id、Provider payload、raw prompt、raw AI output、完整题目/材料。
- 不改变登录、角色、授权、edition、组织上下文语义。

## Self-Review Checklist

- 检查所有前置分支 closure evidence 已存在且状态为 pass。
- 检查新增测试只验证当前合同，不引入新产品行为。
- 检查全量验证和对抗式 audit 后再提交。
