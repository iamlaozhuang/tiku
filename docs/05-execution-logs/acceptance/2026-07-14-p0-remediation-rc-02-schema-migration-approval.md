# P0 RC-02 Schema / Migration Approval

Status: approved

## Human approval

- 用户在当前 Goal 中明确批准 schema/migration 源码编写、测试和提交范围，并在 RC-02 启动后再次回复“批准审批请求”。
- 本批准只适用于 `p0-remediation-rc-02-organization-scope-quota-employee-2026-07-14`。

## Approved scope

- 为组织命令并发控制增加可审查的 revision 字段。
- 为员工继承的每条 `org_auth` 增加可证明、可唯一约束的额度占用关联。
- 编写 Drizzle schema、迁移 SQL、snapshot/journal、静态迁移测试和回滚说明。
- schema/migration 使用独立提交，不混入业务实现提交。

## Explicit exclusions

- 不执行 migration，不连接或读写任何数据库。
- 不修改依赖、lockfile、环境变量、Provider 或外部配置。
- 不执行 21 项 runtime validation，不创建 PR，不部署，不 force push。
