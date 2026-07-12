# 0704 AI 生成关闭状态合同修复证据

## 结论

- taskId：`0704-ai-provider-closed-state-contract-2026-07-12`
- 批次：B2 / A06、A07、A20
- 结果：`pass_sanitized_availability_fail_closed_contract`
- Provider：保持关闭，未执行 Provider 请求、连接测试、Prompt 调试、payload 检查或 Cost Calibration。
- 数据：未读取环境值或数据库连接信息，未直接连接或修改数据库。

## RED

- 状态路由测试按预期因服务模块不存在而失败，证明此前没有提交前 availability 合同。
- 管理员组件 14 项中 2 项按预期失败，覆盖内容管理员与高级组织管理员：关闭提示不存在。
- 学习者组件新增的个人高级与企业员工高级上下文均按预期失败：关闭提示不存在。
- RED 未发起真实生成请求，未记录凭证、会话、Provider 信息或完整内容。

## GREEN

- 新增认证 GET `/api/v1/ai-generation/availability`，只返回 `generationAvailability: available | closed`。
- 无受控运行时时返回 `closed`；只有显式受控运行时存在时映射为 `available`，映射过程不执行运行时。
- 两个共享页面都在角色/版本边界通过后读取状态；closed 或异常均禁用生成，并在提交函数首行再次拦截。
- 关闭状态显示“AI 生成服务当前未开放”；状态异常显示通用不可用文案，不展示供应商、配置、凭证或环境细节。
- 标准授权继续进入原 unavailable 状态，不请求 availability，也不出现生成操作。

## 验证

- focused：3 个文件，31 项通过。
- B2 受影响回归：6 个文件，119 项通过。
- B1+B2 累计回归：27 个文件，346 项通过。
- 全量 unit：358 个文件，1947 项通过。
- lint：通过，0 error / 0 warning。
- typecheck：通过。
- format check：全仓通过。
- `git diff --check` 与禁止路径扫描：通过。
- `next build --webpack`：编译、TypeScript、89 个静态页面生成和构建追踪通过；新 availability 路由被注册为动态路由。
- Module Run v2 pre-commit hardening：15 个登记文件通过范围、敏感证据与术语扫描；Cost Calibration 保持阻断。

## Localhost 边界

- 现有 `localhost:3000` 服务健康，但当前挂载数据不是原 0704DB，私有角色目录不能用于该数据集。
- 本批不读取 env/secret、不猜测数据库配置，也不在错误数据集上伪造四角色交互结论。
- 合入后仅做匿名路由与服务健康 smoke；四角色脱敏浏览器验收保留到原 0704DB 恢复后的累计验收。

## 非声明

- 本证据不代表 staging、production、deploy、release readiness 或 production usability。
- 未新增依赖，未修改 package/lockfile、repository、schema、migration、seed 或正式内容写入合同。
