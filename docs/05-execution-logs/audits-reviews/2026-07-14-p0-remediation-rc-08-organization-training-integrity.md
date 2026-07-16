# P0 RC-08 企业训练完整性对抗式复核

status: pass_branch_closeout_ready

reviewerMode: same_agent_two_distinct_rounds_no_subagent

Verdict: `APPROVE_BRANCH_CLOSEOUT / fresh_master_gate_passed`

## Round 1

status: passed

focus: canonical aggregate、权威写路径、authorization、revision、幂等、事务回滚、数据兼容与表面修补反证。

result: passed_after_remediation

- 验证 publish/save/submit 的权威事实均来自锁定后的 canonical aggregate；客户端 payload 已移除 evidence、count、score 和 authorization lineage 权威。
- 验证 draft/version、answer/scoring task、scoring task/answer 均在单事务内转换；失败抛错可整笔回滚。
- 发现受信 evidence 与浏览器编辑状态不一致：改为 public id + 内容完整签名匹配时才保留服务端 evidence，任意编辑自动降级 weak/0，依据状态只读。
- 发现 scoring worker 可在 lease 过期后回写且结果未绑定 canonical objective/standard answer：补 immutable questionResults/short-answer id 基线、lease 条件、objective 与答案事实防篡改验证。
- 复核 additive migration、旧 draft/revision 默认值及历史 submitted 不重算策略；未执行数据库回填或迁移。

## Round 2

status: passed

focus: 跨角色状态交接、API/枚举、analytics、AI scoring provenance、隐私、P1/P2 语义与反向破坏。

result: passed_after_remediation

- 复核 org_advanced_admin → published version → org_advanced_employee → organization analytics 全链路；analytics 查询仅接收 `submitted`、非空 score/submittedAt，排除 scoring/scoring_failed。
- 发现 service 层 revision/终态预检查会阻止响应丢失后的同 operation replay；移除非权威抢跑判断，由事务比较 operation + payload digest，同 operation 返回原对象，异 operation 返回 recoverable conflict。
- 复核 UI 重试 operation id 在相同 payload 下稳定、payload 变化后轮换；管理端先 PATCH canonical draft 再发送最小 publish 命令，员工端只发送 revision/operationId/answerItems。
- 复核 taken_down/deadline/非法 option/缺题/null/空集合/跨 organization/错 authorization/standard edition/并发与失败收敛测试范围。
- 复核 API camelCase、标准 envelope、null/[]、public id、标准答案可见时机与 raw prompt/provider payload 隐私；未发现新的 P0/P1 反向破坏。
- P1/P2 仅保留影响映射；F-0122/F-0028/F-0099/F-0124/F-0125/F-0144/F-0147/F-0166/F-0167 等待 P0 新基线后复验。

## 结论

- F-0121、F-0123、F-0145 的静态整改证据成立；F-0123 的 root-cause alias 关系保留，不改写为 duplicate。
- `RV-0020` 与全局 21 项 runtime validation 仍为 pending；本结论不是数据库/浏览器/Provider 业务验收通过。
- 无 Subagent；两轮由同一 Agent 以不同 checklist 自对抗完成，未表述为独立审查者。

reviewResult: pass_branch_closeout_ready_fresh_master_passed
