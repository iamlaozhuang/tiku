# P1 RC-02 员工解绑成员生命周期审查

日期：2026-07-16

任务：`p1-remediation-rc-02-employee-unbind-lifecycle-2026-07-16`

## Transition Disposition

Decision: APPROVE_SCOPE

F-0114 经 post-P0 即时深复检后只批准 residual：P0 已关闭 quota release、session revoke、旧训练 read-only 与 retained employee row 再绑定的主要路径，不重复实现；剩余缺口是当前成员读模型仍误用历史 employee 行，以及企业训练写事务未与解绑按 employee identity 串行。

批准范围严格限定为 session/运营详情/组织门户的 current membership 投影、训练 draft/submit 的同锁重验，以及相应 repository/service/static tests。保留个人授权、已提交历史、组织快照、P0 quota/session 语义与 `ops_admin` / `super_admin` 写权限。

不得引入 membership schema/历史表、migration、物理删除 employee、真实 DB/runtime/browser 或合并其他 finding。

## Round 1

Result: pass

实现审查必须攻击：personal 用户的 stale organization context、门户总数与名单分叉、解绑后正式再入职、重复/跨组织解绑、quota/session/read-only 回归，以及 lookup 完成后 unbind 与 answer save/submit 交错导致重新写回 `in_progress`。任一成立均阻断关闭。

第一轮范围主审确认只修门户计数不足以关闭根因：session/运营投影仍可把历史 employee 行伪装为当前绑定，训练写事务也仍可在解绑后重开未提交状态。三类 residual 必须同批验证。

## Round 2

Result: pass

transition 阶段只允许五份治理文件。产品实现开始前必须先通过 P1 `transition_only` 与 Module ancestor checkpoint；该例外只适用于通过 transition-only 的治理提交，其他 `in_progress` SHA 漂移继续 hard-block。

第二轮范围复核确认无需 schema/migration：现行首版可把 `user_type = employee` 作为明确 current membership 状态，同时保留 employee 行承载历史身份并供受控再绑定复用。若实现发现该模型不足，必须停止而非扩域。

## Final Disposition

Decision: APPROVE

实现后两轮对抗审查均 PASS。当前成员投影统一使用 `user_type = employee`；训练写入以原 `employee_org_auth.id` 作为 membership generation，在共享 employee identity lock 下先重验 exact reservation，再进入 answer lock/read/write，关闭了 unbind + same-org rebind ABA。personal authorization、retained employee identity、submitted history、quota/session/read-only 和 ops/super write boundary 均保留。

聚焦 6 文件 90/90、完整 unit 405 文件 2448 项、lint、typecheck、format、build、P1/P0 与 Module pre-commit 均通过。批准进入独立实现提交与 ready-for-closeout 提交；最终关闭仍以 ff-only merge、fresh-master 门禁、origin/master 同步和隔离资源清理为准。

本结论只关闭 F-0114 static residual，不等同 runtime 验收或生产可用。RV-0018 至 RV-0021、schema/migration、真实数据库、Provider、P2、PR、force push 与部署继续阻断。
