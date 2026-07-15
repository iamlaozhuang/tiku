# P0 Remediation Schema And Migration Source Approval

Date: 2026-07-15

Program: `p0-remediation-rc-01-to-rc-08-2026-07-14`

Status: `approved`

## Approval Source

用户明确批准本串行 Goal 内为修复 P0 所必需的 schema/migration 源码编写、静态测试和提交，并再次确认“批准审批请求”。

## Covered Boundary

- 仅限当前 WIP 根因簇 task plan 与 queue `allowedFiles` 明确列出的 schema、Drizzle migration source、snapshot/journal 和静态测试。
- 允许按项目规范生成、审查并提交 migration source；迁移提交与业务实现提交隔离。
- 允许验证 migration source 的结构、顺序、可逆/兼容策略与 fresh checkout 生成一致性。

## Still Excluded

- 不批准对任何 dev/staging/prod 数据库执行 migrate、apply、push、read、write、backfill 或数据诊断。
- 不批准 fixture/seed、数据库连接、运行时验收、Provider、依赖、env/secret、PR、force push 或部署。
- `drizzle-kit push` 在任何环境仍禁止。

此批准不改变 `D:/tiku-readonly-audit` 的只读边界，也不把静态 migration source 验证表述为数据库迁移验收通过。
