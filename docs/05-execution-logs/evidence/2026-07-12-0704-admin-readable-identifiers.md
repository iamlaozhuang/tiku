# 0704 后台可读业务语义修复证据

## 结论

- taskId：`0704-admin-readable-identifiers-2026-07-12`
- 批次：B4 / A08-A13、A16、A17、A26、A30
- 结果：`pass_readable_business_semantics_and_sanitized_admin_controls`
- Provider：保持关闭，未执行 Provider 请求、连接测试、Prompt 调试、payload 检查或 Cost Calibration。
- 数据：未读取环境值、数据库连接信息、凭证或会话，未直接连接或修改数据库。
- 决策保护：A14 手机号策略未修改；A15 合资格运营角色的卡密明文能力、角色限制和既有审计合同未修改。

## RED 与 GREEN

- RED：按真实失败形态覆盖试卷、题目、材料和资源操作中的标识回显与重复辅助名称；材料、知识点、标签手工标识输入；推荐项缺失业务名称时回退标识；审计原始枚举和内部措辞；组织与运营页面标识回显。
- GREEN：17 个直接相关测试文件、153 项通过，覆盖只读标签选项 route、名称选择器、内部 `publicId` 提交合同、推荐 fail closed、审计中文映射、业务对象唯一辅助名称以及 A14/A15 保护。
- 全量 unit：359 个文件、1963 项通过。首次全量执行暴露 3 项旧试卷文案断言，已按业务名称合同修正后全量通过。

## 行为证据

- 试卷、题目、材料、资源、用户、组织、授权、卡密、模型配置与内容预览操作使用名称、题干摘要、题型、状态、层级路径或业务计数表达上下文，不依赖内部标识完成扫读或辅助技术辨识。
- 题目材料工作区与资源上传按业务名称选择材料、知识点和标签；边界层仍提交不透明 `publicId`，未改变写接口语义。
- 新增标签查询只返回鉴权角色可用的公共标识与名称，复用既有内容管理员 guard，不增加写能力。
- 推荐项缺少知识点名称或路径时显示不可用并禁止选择，不回退内部标识。
- 审计动作和目标类型使用中文映射，未知值安全回退；运营日志使用“用量”“输入摘要”等产品语言，不展示 raw Prompt、原始输出、Provider payload 或内部治理措辞。
- URL 段继续按不透明值编码，服务端授权、版本、组织上下文、已发布和锁定内容边界未放宽。

## 质量门禁

- 直接相关回归：17 个文件、153 项通过。
- 全量 unit：359 个文件、1963 项通过。
- lint：通过，0 error / 0 warning。
- typecheck：`tsc --noEmit` 通过。
- format check：全仓通过。
- `git diff --check`：通过。
- `next build --webpack`：编译、TypeScript、页面数据、90 个静态页面和构建追踪通过，包含新增只读标签 route。
- 默认 Turbopack build：在编译前因当前 worktree 的 `node_modules` 外部 junction 被拒绝；未形成源码失败证据，webpack production build 已通过。
- Module Run v2 pre-commit hardening：34 个登记文件通过范围、敏感证据与术语扫描；Cost Calibration 保持阻断。
- localhost：`/login` HTTP 200。

## 合并后稳定性诊断

- 本地 master 首次默认并发全量 unit 为 1960/1963：2 项既有扫描型用例在全仓并发资源压力下超时，1 项 B4 材料选择用例在异步选项 ready 前操作禁用控件。
- 将 3 个失败文件以单 worker 隔离复跑，47/47 通过，确认生产合同未失败；随后为两个绑定测试补充异步业务名称选项 ready 条件，不修改生产代码。
- 题目材料 UI 单文件以单 worker 连续执行 3 次，每次 36/36 通过。
- 稳定性补丁快进合入本地 master 后，以单 worker 运行全量 unit：359 个文件、1963 项全部通过；master 上 lint、typecheck、全仓 format check 与 `git diff --check` 同步通过。

## Localhost 边界

- 当前 localhost 进程未挂载原 0704DB，私有角色目录账号不能用于当前数据集。
- 本批不读取 env/secret、不猜测数据库配置，也不在错误数据集上伪造角色交互结论；原 0704DB 角色验收保留到累计验收。
- 未创建包含敏感信息、完整业务内容或内部标识的截图与 raw DOM 证据。
- 本证据不代表 staging、production、deploy 或 release readiness。
