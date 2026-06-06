# Advanced Edition Authorization Context Implementation Plan Task

## Scope

本任务为 `phase-31-advanced-edition-auth-context-implementation-plan` 编制详细实现方案，覆盖高级版 `authorization` 上下文、能力开关、角色边界、owner / quota owner 归属、组织范围和脱敏要求。

本任务是 docs-only 方案编制，不写产品代码、数据库 schema、API、UI、worker、测试代码或迁移。

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-mvp-implementation-breakdown.md`
- `src/server/contracts/effective-authorization-contract.ts`
- `src/server/services/effective-authorization-service.ts`
- `src/server/repositories/effective-authorization-repository.ts`
- `src/server/mappers/effective-authorization-mapper.ts`
- `src/server/services/effective-authorization-route.ts`
- `src/server/services/student-authorization-redeem-runtime.ts`
- `src/server/services/student-paper-service.ts`

## Planned Work

1. 梳理现有有效授权列表能力和高级版授权上下文需求差距。
2. 输出详细实现方案，指定未来应创建或修改的契约、服务、repository、mapper、route handler 和测试文件。
3. 明确不触碰生产默认点数、真实 provider、env/secret、部署、支付和外部服务。
4. 更新队列状态与 handoff，使下一步指向 AI task domain 详细方案。
5. 写入 evidence 并运行文档验证。

## Non-Goals

- 不实现授权上下文服务。
- 不修改 `src/**`、`tests/**`、`e2e/**`、`src/db/schema/**` 或 `drizzle/**`。
- 不新增依赖，不修改 package 或 lockfile。
- 不推进 `Cost Calibration Gate`。
- 不确认生产额度点数、AI 行为消耗点数、并发阈值、超时阈值或高峰阈值。

## Validation

- `git diff --check`
- Prettier check for changed Markdown and YAML files.
- 文本检索确认详细方案包含 `authorization`、`personal_auth`、`org_auth`、`redeem_code`、`quotaOwnerType`、`ownerType` 和 blocked gate 边界。
