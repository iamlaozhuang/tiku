# 0704 错误状态、角色与版本边界修复证据

## 结论

- taskId：`0704-role-error-boundary-2026-07-12`
- 批次：B3 / A04、A18、A19
- 结果：`pass_role_error_edition_and_training_integrity_boundaries`
- Provider：保持关闭，未执行 Provider 请求、连接测试、Prompt 调试、payload 检查或 Cost Calibration。
- 数据：未读取环境值、数据库连接信息、凭证或会话，未直接连接或修改数据库。

## RED 与 GREEN

- RED：4 个文件共 35 项，9 项按预期失败，覆盖缺失集中会话分类、错误角色误跳登录、会话异常误跳登录、标准版高级路由丢失组织壳、训练列表不完整或失败时仍允许创建。
- GREEN：5 个直接相关文件共 36 项通过，包含既有水合用例对真实未认证 session 响应的显式建模。
- 受影响累计回归：16 个文件、232 项通过，覆盖会话、后台工作区、标准/高级版、企业训练 B1B 和 AI 关闭状态 B2。
- 全量 unit：358 个文件、1954 项通过。

## 行为证据

- 会话响应集中分类为 `authorized`、`unauthorized`、`forbidden`、`error`；只有真实未认证跳转登录。
- 学员与管理员错误角色均显示拒绝状态，不渲染目标工作区内容；会话异常显示安全重试，不伪造退出登录。
- 标准版组织管理员直达高级路由时保留组织后台壳、标准版上下文、允许的导航和组织概览返回入口，高级页面 children 不渲染。
- 企业训练列表仅在完整性为 `complete` 时允许新建；`partial` 保留合法只读行并暂停创建，错误和畸形合同 fail closed，均提供重试与返回组织概览。
- 未推断组织范围、发布时间或授权上下文，未改服务端授权和正式内容合同。

## 质量门禁

- lint：通过，0 error / 0 warning。
- typecheck：`tsc --noEmit` 通过。
- format check：全仓通过。
- `git diff --check` 与禁止路径扫描：通过。
- `next build --webpack`：编译、TypeScript、89 个静态页面生成和构建追踪通过。
- Module Run v2 pre-commit hardening：15 个登记文件通过范围、敏感证据与术语扫描；Cost Calibration 保持阻断。
- localhost：`/login` HTTP 200。

## Localhost 边界

- 当前 localhost 进程未挂载原 0704DB，私有角色目录账号不能用于当前数据集。
- 本批不读取 env/secret、不猜测数据库配置，也不在错误数据集上伪造角色交互结论；原 0704DB 角色验收保留到累计验收。
- 本证据不代表 staging、production、deploy 或 release readiness。
