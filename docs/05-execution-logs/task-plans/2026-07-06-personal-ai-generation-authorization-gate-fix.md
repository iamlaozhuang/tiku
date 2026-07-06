# 2026-07-06 Personal AI Generation Authorization Gate Fix

## 任务边界

- 修复范围：个人 AI 出题 / AI 组卷接口的 `local_browser_experience` 分支必须使用服务端计算的有效授权上下文，禁止标准版学员或员工通过直接 POST 越权进入高级 AI 闭环。
- 不改依赖、不改 `package.json` / lockfile、不做数据库破坏性操作。
- 不记录凭证、session、cookie、token、DB 原始行、Provider payload、raw prompt、raw AI output、完整题目/试卷/材料。

## 已读取规范与恢复入口

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- AI 生成 SSOT / Phase 4 / closed-loop target alignment traceability 文档
- 2026-07-06 learner / organization / content admin closed-loop evidence

## 根因假设

- 当前前端通过 `/api/v1/authorizations` 只展示高级 AI 入口，但后端 `POST /api/v1/personal-ai-generation-requests` 的本地体验分支会构造服务端 owned advanced 请求上下文，未重新调用有效授权服务。
- 标准版员工或学员只要直接调用接口，就可能得到 accepted 的本地闭环响应。
- 修复点应在服务端路由层，复用有效授权服务，不能只修 UI。

## TDD 计划

1. 新增失败单测：无高级 AI 有效授权时，个人 AI 生成本地体验 POST 返回 403，不调用运行时桥接 / Provider / 持久化。
2. 新增或扩展单测：有高级 AI 有效授权时，使用服务端授权上下文归一化 owner / quota / edition，不信任客户端伪造字段。
3. 实现最小修复：在个人 AI 生成路由依赖中接入 `effectiveAuthorizationService`，按任务类型筛选 `canGenerateAiQuestion` / `canGenerateAiPaper`，匹配 `authorizationPublicId`，并拒绝 blocked / 非 advanced 上下文。
4. 在 app route 中按现有授权 repository/service 工厂注入服务端授权服务。

## 验证计划

- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts`
- 必要时运行相关授权服务 / app route 静态类型检查：`npm.cmd run typecheck`
- 使用 0704 DB 的 Provider-disabled 本地服务重新验证标准版员工直接 POST 被拒绝。

## 风险防御

- 不引入新状态字段或新依赖。
- 不改变 Provider payload、RAG、持久化 schema。
- 错误响应沿用标准 envelope 和 403 范围，前端已有 403 错误展示路径。
- evidence 只写聚合状态和脱敏错误码，不写原始请求/响应。
