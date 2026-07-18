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

Decision: PENDING_SPEC_REVIEW

当前只完成设计物化，不等同 F-0116 实现、static closure、runtime 验收或生产可用。RV-0018 继续 pending。
