# 0704 资源 publicId 路由兼容修复证据

## 结论

- taskId：`0704-resource-id-routing-repair-2026-07-11`
- 批次：B1C / A05
- roleLabel：内容管理员
- routeLabel：资料与知识库管理
- 结果：`pass_opaque_encoded_resource_route_contract_with_localhost_deferred`
- Provider：关闭，未执行任何 Provider 请求。
- 数据库：未读取连接信息，未直接连接、写入或修改 0704DB。

## RED 证据

- 命令：`npm.cmd run test:unit -- tests/unit/admin-content-knowledge-ops-baseline.test.ts`
- 结果：19 项中 1 项按预期失败，其余 18 项通过。
- 失败形态：包含历史下划线和路径保留字符的资源标识被前端格式正则禁用，查看入口不发起详情请求。
- RED 输出未记录真实业务标识、凭证、会话、内部 ID 或完整资料内容。

## GREEN 证据

- 资源标识只做非空检查，不再由前端解释格式或改写原值。
- 单一路径构造函数使用 `encodeURIComponent`，统一服务详情、校对保存、发布、重建检索索引、停用和启用。
- 测试同时断言六类操作均使用编码路径，原始特殊字符路径从未发送；空标识保持禁用。
- focused：1 个文件，19 项通过。
- 受影响回归：4 个文件，29 项通过。
- B1A-B1C 累计回归：14 个文件，230 项通过。
- 全量 unit：357 个文件，1936 项通过。

## 静态与构建门禁

- lint：通过，0 error。
- typecheck：`tsc --noEmit` 通过。
- format check：全仓库通过。
- `git diff --check`：通过。
- Module Run v2 pre-commit hardening：7 个登记文件通过范围、敏感证据与术语扫描；Cost Calibration 保持阻断。
- 默认 `next build`：被 worktree 外部 `node_modules` Junction 的 Turbopack 根目录限制阻断。
- `next build --webpack`：业务代码编译成功；Next 类型生成随后被已登记 A31 卡密详情路由上下文类型阻断。
- B1C 未修改 A31 文件；A31 保持 B1D 独立根因、分支和回滚边界。

## 行为与边界

- 历史下划线和含 URL 保留字符的资源标识可进入全部既有资源操作。
- 特殊字符只作为编码后的单一路径段，不改变资源路由层级、查询或片段。
- 服务端角色、not-found、资源状态迁移和审计仍是最终裁决；未修改 API、service、repository、validator 或 schema。
- 未新增依赖、lockfile、migration、seed 或环境文件变化。
- 当前 localhost 未重新挂载原 0704DB；脱敏交互复核延后到环境恢复后的累计验收。
- 未执行 staging、production、deploy、env/secret、Cost Calibration 或远端动作。
