# P1 RC-02 用户密码重置一次性分发审查

日期：2026-07-16

任务：`p1-remediation-rc-02-user-password-reset-distribution-2026-07-16`

## Transition Disposition

Decision: APPROVE_SCOPE

F-0108 当前静态失效路径可复现：运营 UI 要求手工输入用户新密码；validator 强制接收 `newPassword`；runtime 直接 hash 运营选定的秘密；成功响应不返回一次性分发窗口。该流程允许运营长期保留学员员工凭据，现有 session 撤销和审计记录不能消除该接管能力。

批准范围严格限定为服务端生成用户密码、标准 envelope 的 `no-store` 一次性成功响应、UI 去除密码输入与仅内存显示，以及对应 service/合同/UI smoke tests。现有 `operations` / `super_admin` 权限、session 撤销、目标身份检查和脱敏审计必须保持。

不得引入首次登录强制改密：D05 已明确首版不要求。不得将 F-0030 的事务原子性、reset token、邮件/短信、schema/migration、依赖、真实数据库或 runtime acceptance 混入本任务。

## Round 1

Result: pass

实现审查必须攻击客户端 body 携带任意密码、成功/失败响应缓存、secret 进入 toast/log/audit、旧秘密在 UI 残留、连续重置同时显示多个秘密、管理员账号重置回归、角色扩大和 session 未撤销。任何一项成立均阻断关闭。

从认证秘密控制权逆向审查 UI → runtime → repository，确认单独补成功 toast 或 session 撤销都不能关闭缺口：只要运营能选择被 hash 的最终密码，就仍保留长期接管能力。最小完整范围必须同时移除客户端密码输入、改由服务端生成并提供一次性成功分发。

## Round 2

Result: pass

独立范围复核确认现有 DTO 与管理员账号重置模式足以承载修复，不需要 schema、依赖或外部分发服务。范围明确拒绝首次登录强制改密与 F-0030 原子性重构；任何实现若修改这些边界即失去本次 scope 批准。

transition 阶段只允许五份治理文件。产品实现开始前必须先通过 P1 `transition_only` 与 Module ancestor checkpoint 守卫；该例外只适用于已通过 transition-only 的治理提交，其他 `in_progress` SHA 漂移继续 hard-block。

## Final Disposition

Decision: PENDING_IMPLEMENTATION_AND_TWO_ROUND_REVIEW

当前只批准 F-0108 静态修复范围，不预先批准产品 diff 或关闭 finding。最终结论必须以 RED/GREEN、完整静态回归、两轮对抗复核、fresh-master build 和 P0/P1/Module closeout 门禁为依据；RV-0016 保持未关闭。
