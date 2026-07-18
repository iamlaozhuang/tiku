# P1 RC-02 员工导入服务端预检审查

日期：2026-07-17

任务：`p1-remediation-rc-02-employee-import-preflight-2026-07-17`

## Transition Disposition

Decision: APPROVE_SCOPE

批准物化用户已批准的方案 A 规格，当前提交仅关闭 F-0115 checkpoint、切换 F-0116 design-stage WIP，并新增 design plan/evidence/audit/spec。产品源码和测试必须零 diff。

## Round 1

Result: pass

第一性原理复核确认：浏览器 parser parity 不能证明服务端最终语义；权威 preview 必须由服务端解析并读取当前逐行账号、组织、授权与 quota 事实。preview revision 只用于识别陈旧确认，不能替代角色校验、F-0115 transaction locks 或最终逐行 JIT validation。

当前最小设计复用既有 command，不新增 preview persistence、schema 或 secret storage。单建与批量共享 preflight，避免形成两套安全语义。

## Round 2

Result: pass

范围复核确认设计提交严格为 6 文件；queue 的产品 allowlist 预先覆盖 parser/contract/repository/service/route/UI/tests，blockedFiles 保持 schema、migration、依赖、真实 DB、Provider、browser/runtime、P2、PR、force-push 与 deploy。

规格必须提交后由用户书面复核。未经复核不得编制实现计划或修改产品源码；若实现需要持久 preview state 或新 schema，按 stop condition 停止。

## Final Disposition

Decision: APPROVE

用户已于 2026-07-18 书面批准规格；实现、静态验证和两轮对抗审查现已完成，批准进入 F-0116 static closeout。该结论不等同 runtime/database 验收或生产可用；RV-0018 继续 pending。

## 2026-07-18 Full-Regression Scope Audit

Result: closed_by_approved_exact_scope_correction

对抗式复核确认聚焦矩阵与 typecheck 已通过；full unit 的 3 个失败只来自两个未在当前 allowedFiles 内的旧 smoke tests。它们要求已被 F-0116 设计明确淘汰的浏览器/legacy rows 组装路径，不能通过恢复旧行为来绿化。

允许的最小修正只能是：把 `tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts` 与 `tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts` 精确加入 F-0116 allowedFiles，并将其更新为 raw source、服务端 preview 与 `expectedPreviewRevision` 合同。不得扩大产品能力、依赖、schema、database、provider、runtime、P2 或远端动作边界；未经批准保持 hard-block。

用户已书面批准该精确修正。最终两个 smoke 2 files / 5 tests、聚焦矩阵 16 files / 240 tests、full unit 419 files / 2667 tests 全部通过；未恢复旧 rows transport 或浏览器 parser。

## 2026-07-18 Implementation Round 1

Result: pass

对抗式复核覆盖 parser 边界、集合查询、身份与 quota、revision、零写入失败路径、响应丢失恢复、事务/JIT 竞争、角色边界和脱敏。发现完成态仍持有 preview/raw source/password 引用；先以回归测试复现，再清除 hook/page 敏感状态。复核后无未关闭 blocker。

## 2026-07-18 Independent Round 2

Result: pass

独立只读审查发现并关闭 late preview、future auth quota reservation、stale confirmation、file read ordering/close、preflight explanation、501 early-stop 六项问题；follow-up 又关闭 session token/view change 下的敏感字段与 pending read 清理问题。最终复核结论：全部 CLOSED，无新 blocker，`Ready to merge: Yes (static review scope)`。

## Final Static Disposition

Decision: APPROVED_FOR_STATIC_CLOSEOUT_GATES

- 最终聚焦、full unit、lint、typecheck、format、diff check、browser-parser negative scan 和原始 Turbopack production build 均有新鲜通过证据。
- preview revision 仍非授权凭证；确认重新认证/解析/读取事实，最终安全边界仍是 F-0115 transaction/JIT guard。
- 无 schema、migration、dependency、database、provider、runtime、P2、PR、force-push 或 deploy 扩权；RV-0018 继续 pending，不声称 runtime/database closure。
- 当前无未解决 blocker；允许进入既有 P1/Module governance gates，不允许绕过普通 `in_progress` SHA drift hard-block。
