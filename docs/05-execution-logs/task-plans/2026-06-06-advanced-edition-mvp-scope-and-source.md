# Advanced Edition MVP Scope And Source Task Plan

## Goal

Create the initial advanced edition MVP requirements document and record the confirmed source-of-truth relationship:

原设计记录作为决策源，新 MVP 文档作为验收源。

## Scope

- Create `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`.
- Record purpose, source of truth, MVP main loop, non-goals, traceability, and follow-up queue.
- Update phase-30 queue state after this task is complete.
- Keep work docs-only.

## Confirmed Decision

- User confirmed option B: the original design record remains the decision source, while the new MVP requirements document becomes the acceptance source and links back to existing decisions.
- Previously confirmed main loop: `高级版个人用户 AI 出题/组卷 + 企业管理员创建企业训练 + 员工作答统计 + 运营后台授权/额度管理`.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-follow-up-decisions.md`

## Allowed Files

- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-06-advanced-edition-mvp-scope-and-source.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-mvp-scope-and-source.md`

## Blocked Scope

- Product code.
- Database schema, migrations, SQL, drizzle files.
- API implementation, route handlers, services, repositories, UI components, worker implementation.
- Tests/e2e implementation, scripts, packages, lockfiles, dependencies.
- Environment files, secrets, provider calls, staging, production, cloud, deployment, external services, online payment, real customer/customer-like data.

## Validation Commands

```powershell
git diff --check
node .\node_modules\prettier\bin\prettier.cjs --check docs\superpowers\specs\2026-06-06-advanced-edition-mvp-requirements.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-mvp-scope-and-source.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-mvp-scope-and-source.md
Select-String -Path docs\superpowers\specs\2026-06-06-advanced-edition-mvp-requirements.md -Pattern 'Source Of Truth','MVP Main Loop','Non-Goals','Traceability To Existing Decisions','Follow-Up Decision Queue'
```
