# Content Admin Platform Batch B–F Standing Authorization

Date: 2026-07-13

Authorization ID: `current-user-approved-content-admin-platform-b-to-f-standing-serial-authorization-2026-07-13`

Program: `content-admin-platform-b-to-f-2026-07-13`

Status: `approved`

## Authorization Source

产品负责人明确要求放宽审批粒度：除部署需要单独审批外，其他任务内正常动作可以授权；每个任务开始前必须强制阅读相关文档和代码，按规范管线推进，完成两轮对抗式审查，然后允许提交、ff-only 合入、普通推送并清理，再领取下一个任务。随后明确要求启动并完成 Program Init，把该方案变成仓库强制状态。

## Covered Scope

- Program Init。
- 在 B0 前串行执行的 M1 Lean Module Run v3 与 M2 活动状态瘦身；两者只改治理机制和活动记录，不修改产品功能。
- Batch B、D、C、E、F 的全部已登记子任务。
- 仅在仓库触发条件为真且有独立计划时的 X1/X2。
- 任务范围内的源码、测试、治理文档与本地验证。
- 任务完成后的本地 commit、ff-only merge 到 `master`、普通 `git push origin master`、短分支和 worktree 清理。
- 任务计划明确需要且遵守保护边界的 localhost/browser/DB/Provider-disabled 验证；不得把 standing authorization 理解为自动开放敏感数据或高风险能力。

## Mandatory Preconditions

1. 从 clean、远端同步的 `master` 创建短生命周期分支/worktree。
2. 任务计划记录 required reading、目标 requirements、目标源码/测试、类似实现、allowed/blocked files 和风险防御。
3. 功能或缺陷任务遵循 TDD；验证任务必须先声明可观察失败/停止标准。
4. focused/full gates、敏感信息扫描、两轮对抗式审查、self-review、evidence/audit 完成。
5. Program Guard、适用的 Lean Module Run v3 / Module Run v2 门禁与 Git hooks 通过。
6. 当前任务完全关闭、远端同步和隔离资源清理后才推进下一任务。

## Actions Still Requiring Fresh Approval

- staging、production、cloud 或任何 deploy/release 动作。
- 任何会实际部署、创建/修改云资源、改变远端环境/secret 或生产数据的动作。

## Non-bypass Rules

本授权不能绕过：

- 需求/ADR 冲突停止条件；
- 依赖引入门禁；
- schema/migration/fixture/seed 与数据库写入的精确计划、备份/回滚和任务级边界；
- Provider 默认关闭、成本和敏感内容边界；
- 账号只在批准任务中内存使用、证据脱敏、禁止 raw DOM/凭证/手机号/token/cookie/session/DB URL/原始行/完整 AI 内容；
- authorization、edition、organization scope、手机号和 `redeem_code` 既有服务端规则；
- A01-A30 与 AI closed/superseded 结论；没有新鲜当前基线失败证据不得重开；
- force push、历史改写和未经计划的 PR/远端目标。

## Deployment Gate

```yaml
deployment:
  approved: false
  status: blocked_requires_fresh_user_approval
```

普通 push 不等于部署，也不构成 staging、production、release readiness 或 final Pass。

## Lean v3 Continuation

M1、M2 完成后必须从 B0 继续，且只有 M1、M2、B0–B5、D0–D4、C0–C6、E0–E6、F0–F5 全部关闭，累计验收完成，`master` 与 `origin/master` 同步，工作区 clean，短分支和 worktree 清理后，Program 才可关闭。部署不属于本授权。
