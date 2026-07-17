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

实现主审确认 runtime 不再读取 request body，默认生成器提供约 96 bit 随机熵；成功使用既有 DTO、标准 envelope 与 `no-store`，not-found/permission/unavailable 不回显 secret。session revoke、ops/super 权限与固定脱敏审计保持。

首轮 UI 对抗发现重复点击会并发写入密码，乱序响应可能显示已失效 secret；用户 reset 网络异常也未捕获。两项均列为 P1 blocking 并以 deferred RED 测试固定。

## Round 2

Result: pass

独立范围复核确认现有 DTO 与管理员账号重置模式足以承载修复，不需要 schema、依赖或外部分发服务。范围明确拒绝首次登录强制改密与 F-0030 原子性重构；任何实现若修改这些边界即失去本次 scope 批准。

transition 阶段只允许五份治理文件。产品实现开始前必须先通过 P1 `transition_only` 与 Module ancestor checkpoint 守卫；该例外只适用于已通过 transition-only 的治理提交，其他 `in_progress` SHA 漂移继续 hard-block。

blocking 修复后复核确认同步 ref 在首个 await 前锁定，pending 禁用确认/取消并拒绝所有新 reset 入口；用户与后台账号路径均在 finally 释放，sequence 防止失效响应落地。deferred 双击只产生一个 POST，顺序新 reset 清除旧 secret，网络失败安全关闭弹窗且无 secret toast。

两项独立只读复核最终均为 `APPROVE`；聚焦 6 文件 41/41、完整 unit 405 文件 2439/2439、lint、typecheck、format 与 diff check 通过。

## Final Disposition

Decision: APPROVE

最终实现关闭了运营选择并保留用户长期凭据的路径：用户密码只由服务端生成，客户端 request body 不参与最终密码；成功结果只在 `no-store` 一次性窗口返回，UI 仅保留一个当前内存 secret；session revoke、权限和脱敏审计未回归。双击并发与网络失败 blocker 已由同步串行化及自动化测试关闭。

本批准仅支持 F-0108 静态关闭候选，不等同生产 runtime 验收。隔离 worktree build 的 Turbopack 根目录限制必须由 ff-only 合入后的 fresh-master build 替代；P0/P1/Module closeout/pre-push 任一失败都必须停止。跨标签页/客户端 reset、密码写入与 revoke 原子性继续属于 F-0030，RV-0016 保持未关闭。
