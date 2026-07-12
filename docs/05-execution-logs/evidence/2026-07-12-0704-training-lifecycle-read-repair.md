# 0704 企业训练生命周期读取修复证据

## 结论

- taskId：`0704-training-lifecycle-read-repair-2026-07-11`
- 批次：B1B / A02、A03
- 结果：`pass_source_contract_and_regression_with_localhost_deferred`
- Provider：关闭，未执行任何 Provider 请求。
- 数据库：未读取连接信息，未直接连接、写入或修改 0704DB。

## RED 证据

- 命令：`npm.cmd run test:unit -- src/server/repositories/organization-training-repository.test.ts`
- 结果：27 项中 1 项按预期失败。
- 失败形态：管理端列表读取到缺失发布范围的历史版本时，在复制范围快照处抛出运行时异常；该异常会放大为整页 500。
- 第二阶段 RED：路由读取部分完整性结果时，管理端和员工端均进入统一 500，共 2 项按预期失败。
- RED 输出未记录异常行内容、内部 ID、组织范围、凭证或会话。

## GREEN 证据

- 核心 mapper/repository/service/route：4 个文件，122 项通过。
- 受影响回归：7 个文件，150 项通过，覆盖管理端、员工端、AI 本地题源解析和页面入口。
- 全量 unit：357 个文件，1935 项通过。
- lint：通过，0 error。
- typecheck：`tsc --noEmit` 通过。
- format check：全仓库通过。
- `git diff --check`：通过。
- Module Run v2 pre-commit hardening：13 个任务范围文件通过；Cost Calibration 保持阻断。

## 行为证据

- 完整企业训练版本按原 DTO 映射，管理端和员工端列表行为不变。
- 缺失发布范围或发布时间的历史版本被隔离，不再导致列表 500。
- 管理端和员工端读取结果仅返回 `complete` / `partial` 与固定 `historical_version_unavailable` 告警码；不返回异常字段、内部 ID 或原始快照。
- 员工和组织管理员 AI 本地题源均排除不完整版本；未执行 AI Provider。
- 解析器不补默认组织、发布范围、发布时间、授权、状态或题目快照。

## Build 证据

- 默认 `next build`：在代码编译前被 fresh worktree 的外部 `node_modules` Junction 拒绝，属于 Turbopack 工作区路径限制。
- `next build --webpack`：生产代码编译成功；Next 类型生成阶段被未改动的卡密详情路由上下文阻断，该路由仍允许同步 `params`，不符合 Next 16 路由合同。
- 新发现登记为 A31 / B1D，必须独立分支修复；禁止混入 B1B。

## 延后项

- 当前 localhost 进程未挂载原 0704DB 环境，私有角色目录账号不能用于当前数据库；本批未读取 env/secret 或猜测连接配置。
- 0704DB 管理端和员工端交互复核保留到环境重新挂载后的累计验收，不影响本批确定性源代码与合同回归结论。
