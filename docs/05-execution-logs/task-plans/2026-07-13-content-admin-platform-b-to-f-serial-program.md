# Content Admin Platform Batch B–F Serial Program

Date: 2026-07-13

Program: `content-admin-platform-b-to-f-2026-07-13`

Status: `in_progress`

Requirement SSOT: `docs/01-requirements/traceability/2026-07-13-content-admin-p0-platform-interaction-contract.md`

## Purpose

Batch A 已关闭并同步远端。本 Program 将 PIC-01 至 PIC-13 从稳定合同依次落实为共享原语、列表一致性、题目/材料独立编辑工作区、页面族推广和全角色验收，同时保证 A01-A30、AI、手机号、`redeem_code`、edition、authorization 与企业训练边界不回退。

## Serial Authorization

授权凭证：`docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-b-to-f-standing-authorization.md`。

- 覆盖 Program Init、Batch B–F 和满足触发条件后的 X1/X2。
- 每个子任务完成 required reading、精确计划、验证、两轮对抗式审查和 evidence/audit 后，允许自动 commit、ff-only merge `master`、普通 push `origin/master` 和清理短分支/worktree。
- 部署是唯一固定 fresh approval 点；任何 staging/production/deploy 动作均阻断。
- standing authorization 不替代依赖、数据库、Provider、账号、浏览器、截图、schema/fixture、敏感数据、备份/回滚等任务级能力约束；任务若需要这些能力，必须先在任务计划中显式物化相应安全边界。

## State Machine

合法状态仅为：`pending -> claimed -> in_progress -> ready_for_closeout -> closed`。

- 同一时刻最多一个任务处于 `in_progress` 或 `ready_for_closeout`。
- 前置任务未 `closed`，或其 task commit、master ff-only merge、`origin/master` 同步、worktree/短分支清理任一未完成，不得领取后继任务。
- 任务顺序变化必须增加 amendment、原因和影响；不得静默改写 `orderedTaskIds`。
- X1/X2 默认不在主序列中；只有 trigger 为真且有独立任务计划时才能插入。
- 当前任务出现独立问题时登记候选，不得污染当前提交；同根因且同范围问题可在当前任务中修复并补测试。

## Ordered Tasks

| Order | Task ID                                                                  | Content                                                          | Acceptance                                              |
| ----- | ------------------------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------- |
| 00    | `content-admin-platform-program-init-2026-07-13`                         | Program 状态、授权、Guard、任务链和 PIC 台账                     | Guard 正例与八类负例通过；仓库可恢复；部署阻断          |
| B0    | `content-admin-platform-b0-contract-code-mapping-2026-07-13`             | PIC-01~13 到现有 route/component/hook/service/test 的只读映射    | 每个 PIC 有消费者、缺口、证据、候选 owner；不提前造抽象 |
| B1    | `content-admin-platform-b1-async-state-primitives-2026-07-13`            | initial/refreshing/empty/error/forbidden/conflict 等共享状态原语 | 至少两个真实后台消费者；状态可访问；无权限扩大          |
| B2    | `content-admin-platform-b2-list-query-primitives-2026-07-13`             | URL query、debounce、latest-intent-wins、筛选 chip 基础原语      | 至少题目/材料两消费者；竞态与 URL 单测通过              |
| B3    | `content-admin-platform-b3-detail-feedback-primitives-2026-07-13`        | Detail Drawer 焦点、Toast、对象状态更新、冲突反馈                | 焦点闭环、错误恢复、重复提交和冲突测试通过              |
| B4    | `content-admin-platform-b4-form-contract-primitives-2026-07-13`          | 字段错误、摘要、禁用原因和 dirty-state 接口                      | 创建/编辑验证同源；不形成大一统表单框架                 |
| B5    | `content-admin-platform-b5-cumulative-audit-2026-07-13`                  | Batch B 净 diff 与 PIC 累计审计                                  | PIC 全表复核、重复/过度抽象检查、累计回归通过           |
| D0    | `content-admin-platform-d0-list-request-contract-tests-2026-07-13`       | 题目/材料列表请求一致性 TDD 合同                                 | RED 覆盖竞态、URL、刷新、焦点/滚动；不改行为前先失败    |
| D1    | `content-admin-platform-d1-question-list-consistency-2026-07-13`         | 题库列表应用请求和状态合同                                       | latest intent wins、URL 恢复、分页/筛选/更新状态通过    |
| D2    | `content-admin-platform-d2-material-list-consistency-2026-07-13`         | 材料列表应用相同合同                                             | 与题库语义一致；材料生命周期/锁定规则不回退             |
| D3    | `content-admin-platform-d3-list-return-recovery-2026-07-13`              | 详情/编辑返回的筛选、滚动、焦点恢复                              | 刷新、浏览器返回、直接 URL 和无目标 fallback 可预测     |
| D4    | `content-admin-platform-d4-cumulative-audit-2026-07-13`                  | Batch D 累计审计                                                 | PIC-02/03/04/08/10/11 与历史分页合同无漂移              |
| C0    | `content-admin-platform-c0-editor-route-wireflow-2026-07-13`             | 题目/材料 route、URL、返回、dirty-leave、锁定复制设计决策        | route/wireflow 与现有权限/生命周期映射完整；无实现      |
| C1    | `content-admin-platform-c1-question-create-editor-2026-07-13`            | 题目新建独立 editor route                                        | P0 语义验证保留；刷新/返回/键盘/错误摘要通过            |
| C2    | `content-admin-platform-c2-question-edit-copy-lock-2026-07-13`           | 题目编辑、锁定、复制路径                                         | 已发布引用锁定不绕过；复制新题闭环；详情仍为 Drawer     |
| C3    | `content-admin-platform-c3-material-create-editor-2026-07-13`            | 材料新建独立 editor route                                        | 语义空值/30000 限制/媒体表格规则与 Batch A 一致         |
| C4    | `content-admin-platform-c4-material-edit-copy-lock-2026-07-13`           | 材料编辑、锁定、复制路径                                         | 引用/停用/锁定规则不回退；返回状态恢复                  |
| C5    | `content-admin-platform-c5-editor-navigation-recovery-2026-07-13`        | 两类 editor 的 dirty leave、刷新与返回恢复收口                   | 不丢输入、不静默离开；直接 URL/冲突/无权限可恢复        |
| C6    | `content-admin-platform-c6-cumulative-audit-2026-07-13`                  | Batch C 累计审计                                                 | PIC-05/06/07/09/10/12/13 全覆盖；累计回归通过           |
| E0    | `content-admin-platform-e0-route-family-inventory-2026-07-13`            | 平台 route/page family 与例外候选清单                            | 每条 route 关联 PIC 状态、owner、风险和验证方式         |
| E1    | `content-admin-platform-e1-content-page-family-rollout-2026-07-13`       | paper/knowledge/resource/content AI 页面族                       | 内容生命周期、AI draft/review、Provider-closed 不回退   |
| E2    | `content-admin-platform-e2-operations-page-family-rollout-2026-07-13`    | user/org/auth/`redeem_code`/log 页面族                           | 手机号与卡密边界、authorization、审计脱敏不回退         |
| E3    | `content-admin-platform-e3-organization-page-family-rollout-2026-07-13`  | organization admin、员工、企业训练与 organization AI             | organization scope、edition、四步训练和数据域不改变     |
| E4    | `content-admin-platform-e4-learner-page-family-rollout-2026-07-13`       | practice/`mock_exam`/report/AI training 页面族                   | 学员 mobile-first；标准/高级版边界与历史恢复合同保持    |
| E5    | `content-admin-platform-e5-cross-role-exception-closure-2026-07-13`      | `super_admin`、跨工作区和例外台账收口                            | UI 一致性不成为越权路径；例外均有替代保护和依据         |
| E6    | `content-admin-platform-e6-cumulative-audit-2026-07-13`                  | Batch E 累计审计                                                 | route 级覆盖完整；A01-A30/AI/手机号/卡密/auth 全复核    |
| F0    | `content-admin-platform-f0-acceptance-readiness-2026-07-13`              | localhost 角色、账号、受控数据与验收矩阵准备                     | 无敏感输出；0704 override/Provider closed；条件样本单列 |
| F1    | `content-admin-platform-f1-content-admin-acceptance-2026-07-13`          | 内容后台代表流程                                                 | 题目/材料/试卷/资源/AI draft 代表路径通过               |
| F2    | `content-admin-platform-f2-operations-super-admin-acceptance-2026-07-13` | 运营与超级管理员代表流程                                         | 用户/组织/auth/卡密/审计及角色隔离通过                  |
| F3    | `content-admin-platform-f3-organization-acceptance-2026-07-13`           | organization admin/employee 代表流程                             | 训练、AI、组织范围和标准/高级版矩阵通过                 |
| F4    | `content-admin-platform-f4-learner-acceptance-2026-07-13`                | 个人标准/高级版代表流程                                          | practice/mock/report/AI 状态和恢复边界通过              |
| F5    | `content-admin-platform-f5-final-cumulative-audit-2026-07-13`            | 全 Program 最终累计审计                                          | PIC 全覆盖或有批准例外；全量门禁、两轮审查、无部署声明  |

## Conditional Tasks

### X1 `content-admin-platform-x1-valid-ai-paper-test-data-2026-07-13`

仅当 F0/F4 确认必须验证“开始/继续自测”的有效历史 AI 组卷恢复闭环，且当前库仍无有效样本时触发。必须使用当前服务端持久化 `paperAssembly` 契约创建受控样本，Provider 关闭，不从当前题库伪造旧试卷；需要精确备份/回滚、定向/全量门禁和独立双轮审查。

### X2 `content-admin-platform-x2-fresh-baseline-defect-repair-2026-07-13`

仅当当前 master 的新鲜可复现证据证明独立缺陷时触发。必须记录 roleLabel、route label、状态类别、问题类别、严重程度、实际/期望、复现步骤、建议方案和疑似同根因；不得借机重开 A01-A30 或旧 AI 残留。

## Per-task Required Reading And Evidence

每个任务计划必须包含 `SSOT Read List`，至少记录 Always、task-specific target requirements、上一任务 evidence/audit、目标源码、目标测试和一个类似实现。Evidence 必须包含 `Reading Evidence`，明确：

```yaml
status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true
```

涉及 AI、advanced、authorization、organization training 时必须附加 AI requirements SSOT、Phase4、最新 AI baseline/goal audit、advanced index、edition-aware requirements 与 ADR-007。

## Per-task Closeout Checkpoint

每个任务关闭必须记录：task commit、master ff-only merge、`origin/master` 同步、focused/full gates、两轮对抗式审查、PIC 覆盖变化、例外变化、短分支/worktree 清理、下一任务、X1/X2 触发判断和部署阻断。

## Batch Cumulative Audits

B、D、C、E、F 各自结束必须重新对照原始 PIC-01~13，而不是只看最近任务；审查 Batch 净 diff、重复实现、过度抽象、历史保护、例外台账、任务顺序和累计回归。

## Normal Stops

只允许三类正常中断：

1. 下一动作属于 staging/production/deploy；
2. requirements/ADR/traceability 出现无法消解的业务冲突；
3. 门禁持续失败、出现不可逆风险或发现敏感信息泄露。

其他同根因同范围问题在当前任务内修复；独立问题进入候选队列，不混入当前提交。
