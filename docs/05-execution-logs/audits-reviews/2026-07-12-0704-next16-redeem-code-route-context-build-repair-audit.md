# 0704 Next 16 卡密详情路由上下文构建修复对抗审计

## 审计结论

- A31：关闭。Next 16 生成路由类型与详情 handler 均只接受异步 `params`，webpack 生产构建完整通过。
- 生产改动为单一类型成员收窄，运行时仍通过 `await context.params` 读取参数。
- 本批不改变卡密产品能力、明文可见性、授权、审计或数据访问语义。

## 对抗矩阵

| 边界          | 攻击/失败形态                                | 结果                                                   |
| ------------- | -------------------------------------------- | ------------------------------------------------------ |
| Next 路由合同 | 同步对象联合污染生成 RouteContext            | 已关闭；type-level 测试要求 Promise-only               |
| 运行时兼容    | 收窄类型导致详情参数无法读取                 | 未发生；现有生产和测试调用均使用 Promise，`await` 保留 |
| 未登录        | 类型修复绕过 session 校验                    | 未发生；认证流程未改，回归通过                         |
| 角色隔离      | `content_admin` 或其他角色获得明文详情       | 未发生；角色守卫未改，回归通过                         |
| 卡密敏感信息  | 证据、日志或提交出现明文或 hash              | 已阻断；仅记录类型符号、命令与计数                     |
| 详情边界      | invalid publicId、not-found 或 no-store 回退 | 未发生；详情 runtime 回归通过                          |
| 标准/高级版   | 路由修复改变卡类型或授权语义                 | 未发生；edition 与 `effectiveEdition` 路径未改         |
| 数据层        | 为构建修复修改 repository/schema             | 未发生；无 API、repository、数据库或迁移变化           |
| Provider      | 构建或测试触发 Provider                      | 未发生；Provider 持续关闭                              |

## 回归与构建审查

- 卡密详情、批次、并发、角色、UI 和审计相关测试通过。
- B1A 组卷、B1B 企业训练、B1C 资源路由累计回归通过。
- webpack 构建已完成类型生成和静态页面生成，不再停在卡密详情路由类型。
- 并行门禁造成的单例超时已通过隔离复跑和完整串行复跑解释，无测试配置改动。
- 无依赖、lockfile、env、schema、migration、seed 或远端变化。

## 品味合规自检 Checklist

- [x] 读取十诫、ADR-007、授权与卡密需求、Next 16 路由合同及最新卡密 audit。
- [x] 以 type-level RED 证明失败，再实施单行 GREEN。
- [x] 未引入兼容适配层、重复路由类型或无关抽象。
- [x] 未以 UI 显隐替代服务端 session、角色、授权和明文边界。
- [x] API envelope、camelCase、publicId 与 no-store 语义未变。
- [x] 未新增依赖、数据库、schema、迁移、seed、Provider 或敏感日志。
- [x] 执行受影响、累计、全量、lint、typecheck、format、diff 和生产构建验证。
