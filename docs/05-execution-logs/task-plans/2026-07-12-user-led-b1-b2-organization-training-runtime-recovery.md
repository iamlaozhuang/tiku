# User-led B1-B2 Organization Training Runtime Recovery Plan

## 基线与批准

- Task id: `user-led-b1-b2-organization-training-runtime-recovery-2026-07-12`
- Branch: `codex/user-led-b1-b2-org-training-runtime`
- Start SHA: `4ef7980845a7e6b0e9f28140e28acea230c1b4be`
- 产品实施、提交、ff-only 合入、普通推送与清理：用户已批准。
- 若证据确认迁移缺失，用户已明确批准稳妥执行现有 `20260710110500_add_organization_training_answer_deadline` 迁移。

## 已读取基线

- `AGENTS.md`、state/queue、代码品味十诫、环境/运行时/授权 ADR。
- 标准与高级版需求索引、edition-aware authorization、企业训练 module/story 和路径关闭记录。
- 2026-07-10 截止时间修复与边界验收 evidence、B0 只读诊断结论、B3/B6 保护边界。
- 现有迁移 SQL、Drizzle journal/schema/repository/mapper、管理员与员工列表路由、UI 和测试。
- 系统性调试、TDD 与 Drizzle 迁移纪律。

## 根因假设与验证

1. 运行时代码的所有企业训练版本查询都选择 `answer_deadline_at`。
2. 该字段对应迁移已生成并登记，但 2026-07-10 evidence 明确记录“未对任何数据库执行”。
3. 当前 0704DB 的管理员与员工列表均返回标准运行时错误 `500001`，与字段缺失时查询失败一致。
4. 先用只读元数据查询确认列和索引状态；只在缺失时执行迁移。若列已存在，禁止重复执行并回到错误链诊断。

## 数据库安全流程

1. 从当前 localhost 服务进程环境中只在内存继承数据库 override；验证目标包含 0704 标记，禁止输出连接串。
2. Provider 必须保持关闭。
3. 只读查询 `information_schema` / `pg_indexes`，不读取业务行；当前证据确认 deadline 列、索引和 Drizzle journal 均不存在。
4. 审阅迁移仅包含一个 nullable timestamp column 和一个普通 btree index，无 DROP、UPDATE、DELETE 或数据回填。
5. 在仓库外创建迁移前备份；备份失败则停止。
6. 因恢复库没有 Drizzle journal，禁止直接运行会重放全部历史迁移的 `drizzle-kit migrate`。读取仓库内既有迁移文件并校验其内容，在单个数据库事务中只执行该文件的两条已审阅语句；不生成、不编辑迁移/schema，也不伪造历史 journal。
7. 回查列、索引和迁移状态；使用用户当前已登录的 localhost 会话，仅验证企业训练列表 API 的标准响应 envelope 和聚合数量，不读取业务明细、不截图、不抓 raw DOM。任何异常立即停止，不继续 UI 修改。

## UI 修复

- 先写 RED 测试，要求列表和写操作失败提示不向非技术用户展示 `500001` 等内部数值代码。
- 最小改动 `createApiErrorMessage`，保留明确的业务动作、重试和返回组织概览路径。
- 不改变授权计算、创建禁用、loading/empty/error、scope、deadline 或提交语义。

## 风险与阻断

- 禁止改 `.env.local`、数据库 URL、凭证、session、cookie、token 或 Provider 配置。
- 禁止新迁移、schema 源码、fixture、seed、依赖、staging、production、deploy、PR、force push 和 Cost Calibration。
- 禁止任何 destructive DB 操作；若备份、目标校验或元数据状态不符合预期则停止。
- localhost 结果不代表 staging、production 或 release readiness。

## 验证与收口

- TDD RED/GREEN；企业训练 admin/employee/repository/service/route/mapper/schema 定向回归。
- 真实 0704DB 管理员与员工列表标准响应验证，凭证只在内存使用且不写证据。
- 全量 unit、lint、typecheck、format、webpack build、diff check。
- 两轮对抗式审查：跨企业、标准版直达、截止时间、下架、重复提交、正式域隔离、Provider、敏感信息和迁移幂等边界。
- evidence/audit、Module Run v2、单批提交、ff-only 合入、master 复验、普通 push、0/0 和短分支清理。
