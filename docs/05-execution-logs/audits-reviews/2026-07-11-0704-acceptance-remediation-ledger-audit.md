# 0704 localhost 验收问题台账 B0 对抗式审计

**日期：** 2026-07-11
**结论：** pass for B0 closeout；不代表 B1-B6 完成或 release readiness。

## 对抗式检查

| 检查项            | 结果 | 证据摘要                                                             |
| ----------------- | ---- | -------------------------------------------------------------------- |
| 台账完整性        | pass | A01-A30 均已材料化，A14/A15 明确保护。                               |
| 分支隔离          | pass | 变更位于独立短分支，不在 master 直接开发。                           |
| Provider 边界     | pass | 无外部请求、配置/凭证读取或 Cost Calibration；只使用内存 runner。    |
| legacy alias 边界 | pass | AI 新路径只保留 canonical 值；student legacy 路径未删除。            |
| 授权边界          | pass | org_auth 仍验证事务内重查，未放宽 overlap 或 quota 规则。            |
| 组织范围          | pass | 未增加默认值或范围推断，未扩大 organization 可见范围。               |
| 正式内容边界      | pass | 未增加 question/paper 正式写入或绕过评审路径。                       |
| 敏感信息          | pass | evidence 无凭证、会话、DB URL、手机号、卡密、raw AI 内容或 payload。 |
| 回归稳定性        | pass | 默认并发 357/357 files、1929/1929 tests；未降低 worker。             |
| 依赖与数据        | pass | 无 package、lockfile、schema、migration、seed 或直接 DB 写。         |
| 治理范围          | pass | Module Run v2 扫描 16 个登记文件；scope、敏感证据和术语检查通过。    |

## 失败注入复核

- nullable 查询字段缺失时，精确 contract 断言会失败。
- AI 路径重新出现 legacy alias 时，inventory 测试会失败。
- org_auth 事务后 overlap 重查被删除或顺序错误时，源码证明测试会失败。
- mistake_book/admin AI 测试遗漏内存依赖时，会落入统一 500 envelope 并失败，不会伪造成功。
- 组织树刷新未完成时，测试等待具体 tree API 增量，避免点击旧节点造成假阴性。

## 剩余风险与下一门禁

- B0 仅恢复 master 单测健康并冻结台账；A01-A30 的产品修复仍按 B1-B6 串行执行。
- A14 在产品明确决策前继续保持现状。
- A15 在 B4 可改善文案和 accessible name，但不得删除明文能力或绕过角色审计。
- B2 开始前必须重新读取 AI requirements SSOT、phase4 baseline、最新 baseline evidence 和 goal-completion audit。
- B1B/B3 开始前必须重新读取 advanced edition SSOT、edition-aware authorization requirements 和 ADR-007。
- 每批必须累计回归已完成批次；任何 Provider 请求、角色能力扩大、组织范围推断、正式内容直写或敏感输出立即停止。
