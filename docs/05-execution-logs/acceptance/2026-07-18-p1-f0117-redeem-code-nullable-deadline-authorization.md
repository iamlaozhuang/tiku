# F-0117 redeem_code 长期可兑换授权

Status: approved

日期：2026-07-18

任务：`p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18`

## Human approval

当前用户明确批准：“批准 F-0117 方案 A，仅批准 schema/migration source，不批准数据库执行。”

该 fresh approval 将 `schemaMigration` 精确授权为 `approved_source_generation_only_no_execution`：允许修改 `src/db/schema/auth.ts`，并使用既有 Drizzle 工具生成、审查 migration SQL、snapshot 与 journal 源文件。

## 明确未授权

- 不运行 `drizzle-kit migrate`、`drizzle-kit push` 或任何 SQL；
- 不连接、读取或修改 dev/staging/prod 数据库；
- 不做 backfill、seed、数据修复或数据库验收；
- 不新增/升级依赖，不修改 package/lockfile；
- 不扩展 Provider、browser/runtime、P2、PR、force-push 或 deploy 权限。

书面规格仍需用户复核。规格复核前，本授权不允许写产品、测试、schema 或 migration 源码。
