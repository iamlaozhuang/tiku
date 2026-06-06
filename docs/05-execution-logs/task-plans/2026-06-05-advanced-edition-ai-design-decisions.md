# Advanced Edition AI Design Decisions Task Plan

## Goal

整理本轮关于标准版/高级版、AI 出题、AI 组卷、企业学习运营后台、企业/个人授权与额度治理的讨论决策，形成可供后续 Agent 读取和继续设计的决策记录。

本任务只做文档沉淀与自检，不修改业务代码、数据库 schema、迁移、依赖、环境变量、脚本、测试或部署配置。

## Approval And Scope

- 用户批准：同意整理本轮继续推进讨论，并要求首轮整理汇总后，再从头执行两轮完整自检。
- 任务类型：docs-only design record。
- 分支：`codex/advanced-edition-ai-design-decisions`。
- 允许新增：
  - `docs/05-execution-logs/task-plans/2026-06-05-advanced-edition-ai-design-decisions.md`
  - `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
  - `docs/05-execution-logs/evidence/2026-06-05-advanced-edition-ai-design-decisions.md`
- 禁止修改：
  - `.env.local`
  - `.env.example`
  - `package.json`
  - `pnpm-lock.yaml`
  - `package-lock.json`
  - `src/**`
  - `tests/**`
  - `e2e/**`
  - `src/db/schema/**`
  - `drizzle/**`
  - `scripts/**`

## Standards Read

- `AGENTS.md` project instructions from conversation context.
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

备注：当前 PowerShell 默认读取部分 UTF-8 中文文档时出现乱码显示，但已按项目既有规范和 ADR 结构执行。

## Work Plan

- [ ] 创建任务方案。
- [ ] 撰写高级版与 AI 生成模块设计决策记录。
- [ ] 第一轮从头自检：按主题逐条核对是否遗漏、矛盾、越界、命名不一致。
- [ ] 第二轮从头自检：按实现风险逐条核对授权、数据归属、额度、审计、保留期、企业后台、组织层级、异步任务、错误边界。
- [ ] 修正文档中发现的问题。
- [ ] 运行文档级验证命令并写入 evidence。

## Validation Commands

```powershell
git status --short --branch
git diff --check
node .\node_modules\prettier\bin\prettier.cjs --check docs\05-execution-logs\task-plans\2026-06-05-advanced-edition-ai-design-decisions.md docs\superpowers\specs\2026-06-05-advanced-edition-ai-generation-design.md docs\05-execution-logs\evidence\2026-06-05-advanced-edition-ai-design-decisions.md
Select-String -Path docs\superpowers\specs\2026-06-05-advanced-edition-ai-generation-design.md -Pattern 'edition','auth_upgrade','ai_generation_task','org_training','effectiveEdition','quotaOwner','two-pass self-review'
```

## Risk Controls

- 只记录已讨论并确认的结论；未确认事项放入后续决策队列。
- 不把设计文档视为实现批准；后续任何 schema/API/服务/UI 改动仍需独立任务方案、验证和必要审批。
- 不新增依赖、不接入 AI provider、不调用外部服务、不操作数据库。
- 不记录密钥、账号密码、真实客户数据、原始 prompt、模型原始输出或敏感授权信息。
