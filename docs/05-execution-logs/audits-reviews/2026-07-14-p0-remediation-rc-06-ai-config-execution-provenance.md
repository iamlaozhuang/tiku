# P0 RC-06 两轮对抗式复核

status: pending

## Round 1

重点：根因、diff、安全与事务。

- pending：确认修复权威写/执行路径，不以 UI 隐藏、last4 或 fixture 成功替代真实事实。
- pending：secret 不进入普通持久化、响应、日志、错误、snapshot 或 evidence。
- pending：task enqueue/claim/lease/retry/result 原子性、FIFO、幂等、成功固定与失败恢复。
- pending：migration/source data compatibility；不执行 apply/backfill。

## Round 2

重点：跨角色、状态机、API 与回归。

- pending：super/ops/content/student/org 角色和 direct URL/API 拒绝。
- pending：mock/practice/mistake/owner consumer 无 fake success；model/prompt/result provenance 完整。
- pending：null/[]、camelCase、publicId、standard envelope、enum/field 前后端一致。
- pending：P1/P2 仅影响映射，RC-07/08 不提前实现，runtime IDs 保持 pending。

reviewResult: pending
