# B3 AI 任务生命周期一致性修复审计

**日期：** 2026-07-12

**任务：** `user-led-b3-ai-task-lifecycle-2026-07-12`

## 对抗式复核

| 检查项        | 结论                                                                           |
| ------------- | ------------------------------------------------------------------------------ |
| 根因闭环      | pass；新结果落库后任务状态未成功更新，且两个写操作不原子，均已由同一事务修复。 |
| 事务回滚      | pass；owner/actor/task 更新未命中时抛错，结果插入随事务回滚。                  |
| 并发幂等      | pass；唯一冲突返回 null 并复用胜出事务结果，不生成重复结果。                   |
| 历史兼容      | pass；仅 `pending + resultPublicId` 读时映射成功，不回填数据库。               |
| 状态保真      | pass；无结果 pending、failed 及其他状态不被兼容逻辑覆盖。                      |
| 权限隔离      | pass；owner、actor、task publicId 条件保持，未扩大组织或个人范围。             |
| Provider 红线 | pass；未调用 Provider，Provider-closed 行为不变。                              |
| 正式域红线    | pass；结果保持草稿且禁止正式采用，未写题目或试卷正式域。                       |
| 数据与配置    | pass；无 schema、migration、fixture、seed、依赖、env 或数据库数据改动。        |
| 回归门禁      | pass；360 文件、1970 用例、lint、typecheck、format 和 webpack build 通过。     |

## 反证与残余风险

- 默认全量并发先后触发两个未改动 UI 测试波动；独立复跑全部通过，降低 worker 后仅保留一个硬编码 5 秒超时。最终使用 10 秒测试进程超时完成全量，不修改产品或测试代码。
- Module Run v2 pre-commit 的默认范围扫描因 YAML anchor 解析为空数组而异常退出；人工精确比对 9 个文件均属于 allowedFiles 后，把同一 blockedFiles 列表显式物化到当前任务，使真实 hook 可以完整执行范围扫描，未扩大本批范围。
- 第一次提交由真实 hook 正确拒绝，因为 project-state 深层 `currentTask` 尚指向上一已关闭任务；B3 指针修正后才允许重新提交，未使用 `--no-verify`。
- mapper 兼容只修复展示合同，不回填历史任务行；这是刻意的数据零写入策略，后续若需要数据治理必须独立审批。
- 本批未执行真实 Provider 或数据库集成写入；事务行为由 Drizzle mock、类型检查及现有 repository/service/route 回归覆盖。
- B0-B2 的数据库迁移缺口与本批独立，未以应用兼容绕过企业训练截止时间字段。

## 品味合规自检 Checklist

- [x] 从持久化不变量出发：结果存在时任务应成功，两个状态必须原子提交。
- [x] 未用 UI 文案或客户端状态掩盖后端生命周期错误。
- [x] API envelope、JSON 命名、数据库命名和正式域合同未改变。
- [x] 未扩大角色、版本、owner、actor 或企业边界。
- [x] 未新增依赖、schema、migration、fixture、seed、env 或魔法样式。
- [x] 错误和超时如实记录，只把有最终汇总的运行记为通过。
- [x] A14 与 A15 未触碰，Provider、敏感信息和远端发布红线保持。

## 审计结论

APPROVE：B3 适合按既定授权执行单批提交、ff-only 合入、主分支复验、普通 push 与短分支清理；不得借此执行 B0-B2 数据库迁移或任何 Provider-enabled 行为。
