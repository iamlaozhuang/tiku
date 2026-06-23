# L5 Seeded Local Account Scope Approval Package

packageId: L5_SEEDED_LOCAL_ACCOUNT_SCOPE_2026_06_23
status: prepared_not_approved_for_execution
preparedAt: "2026-06-23T00:11:44-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only

## 目的

本批准包用于下一步执行 seeded local account / 安全本地账号验收。普通理解就是：在本地 dev 环境里使用合成测试账号和
合成测试数据，验证真实登录、真实 API、真实本地数据库读写和浏览器角色流程。

这一步的可信度高于 fixture-only，因为它不再只靠模拟 API 返回值，而是要让本地系统真的完成账号、授权、内容、作答、
企业员工和审计相关流程。

## 当前已发现的现有能力

只读探查发现仓库已有这些入口：

- `scripts/db/Seed-DevDatabase.ps1`：运行 `src/db/dev-seed.ts`，向本地 dev 数据库 upsert 基础合成数据。
- 现有静态 seed 账号只有：
  - `student`：本地学员；
  - `super_admin`：本地超级管理员。
- 现有 e2e 可动态创建或验证：
  - 临时个人学员；
  - 临时企业员工；
  - 企业培训员工流程；
  - DB-backed 个人/企业标准版、高级版、升级、回落、范围和额度边界；
  - system ops、content ops、student、oversight 的综合角色流程。

重要限制：现有 seed 并没有已经独立准备好的 `content_admin`、`ops_admin`、`org_standard_admin`、
`org_advanced_admin`、`auditor` 专用静态账号。下一轮执行可以先用现有 `super_admin` 和动态账号覆盖真实本地流程，
但如果要求每个角色都必须由独立账号承担，则需要后续单独批准 seed/test 扩展任务。

## 如果批准，允许执行的范围

仅允许本地 dev：

- local target: `http://127.0.0.1:3000` 或 `http://localhost:3000`
- dev server: 可复用已存在的本地 dev server；如未启动，只能使用项目既有 `npm.cmd run dev -- --hostname 127.0.0.1`
- database: 仅允许本机 local/dev 数据库，且只能通过既有应用或既有脚本读取本地配置；不得打开、复制或记录 `.env*`
- seed: 仅允许运行既有 `scripts/db/Seed-DevDatabase.ps1`
- e2e: 仅允许运行本批准包列出的既有 Playwright spec
- evidence: 只记录命令、结果、测试数量、角色标签、覆盖结论和脱敏摘要

## 如果批准，允许执行的命令

按顺序执行：

1. 本地目标检查：
   - `Get-NetTCPConnection -LocalPort 3000 -State Listen`
   - `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000 -Method Head`
2. e2e 清单：
   - `npm.cmd run test:e2e -- --list`
3. dev seed：
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Seed-DevDatabase.ps1`
4. DB-backed 授权版本：
   - `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER='1'; npm.cmd run test:e2e -- e2e/edition-aware-authorization-db-backed-local-flow.spec.ts`
5. 企业员工流程：
   - `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER='1'; npm.cmd run test:e2e -- e2e/organization-training-local-full-flow.spec.ts`
6. 综合角色全流程：
   - `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER='1'; npm.cmd run test:e2e -- e2e/role-based-acceptance/role-based-full-flow.spec.ts`
7. 如综合流程没有产生足够的审计或 AI 调用日志，再执行最小数据准备：
   - `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER='1'; npm.cmd run test:e2e -- e2e/validation-data-prep.spec.ts`

不允许执行全量 `npm.cmd run test:e2e`、`npm.cmd run test:e2e:ui`、headed/debug 模式或未列出的 spec。

## 角色和场景验收矩阵

| 场景                         | 下一轮如何验                                                       | 预期证据等级                  | 仍需注意                                                     |
| ---------------------------- | ------------------------------------------------------------------ | ----------------------------- | ------------------------------------------------------------ |
| 个人标准版学员               | dev seed 学员 + DB-backed 授权规格                                 | local DB-backed / browser/API | 不能记录密码或 token。                                       |
| 个人高级版学员               | DB-backed 授权规格创建高级版 `personal_auth`                       | local DB-backed / API         | 使用合成 public id 摘要，不记录 DB 行。                      |
| 个人标准版升级高级版         | DB-backed 授权规格创建 `auth_upgrade`                              | local DB-backed / API         | 只记录状态摘要。                                             |
| 企业标准版授权               | dev seed `org_auth` + DB-backed 授权规格                           | local DB-backed / API         | super_admin 视角，不等同于独立企业管理员账号。               |
| 企业高级版授权               | DB-backed 授权规格创建高级版 `org_auth`                            | local DB-backed / API         | super_admin 视角，不等同于独立企业管理员账号。               |
| 企业授权升级、范围、额度边界 | DB-backed 授权规格                                                 | local DB-backed / API         | 不记录内部数值行或数据库 URL。                               |
| 企业员工流程                 | `organization-training-local-full-flow.spec.ts` 动态创建员工并登录 | local role flow               | 能证明员工流程，但不是固定员工账号。                         |
| 内容运营正向流程             | `role-based-full-flow.spec.ts` content readiness                   | local role flow               | 现有规格由 super_admin 执行，不是独立 `content_admin` 账号。 |
| 系统运营正向流程             | `role-based-full-flow.spec.ts` system ops readiness                | local role flow               | 现有规格由 super_admin 执行，不是独立 `ops_admin` 账号。     |
| 审计/审核角色                | `role-based-full-flow.spec.ts` oversight flow                      | local role flow               | 现有规格由 super_admin 执行，不是独立 auditor 账号。         |

## 证据脱敏规则

严禁记录：

- 密码、token、Authorization header、cookie、localStorage 值；
- `.env*` 内容、数据库 URL、API key、secret；
- plaintext `redeem_code`；
- 原始 prompt、原始 AI 输出、Provider request/response payload；
- 原始作答文本、完整试卷、完整材料、内部自增 `id` 或原始 DB 行；
- Playwright screenshot、trace、HTML report、页面全文 dump。

允许记录：

- 命令名称；
- pass/fail；
- spec 名称和测试数量；
- 角色标签；
- public id 类型分类，例如 `paper_public_id`、`org_auth_public_id`；
- 红线结论：哪些场景通过、部分通过、仍阻塞。

## 停止条件

出现以下任一情况必须停止：

- 需要打开、复制、编辑或输出 `.env*`；
- 目标不是 `127.0.0.1` / `localhost`；
- seed 需要 schema migration、`drizzle-kit push`、drop、truncate、reset 或生产式清理；
- e2e 需要未列出的 spec、全量 suite、UI/headed/debug 模式；
- 需要 Provider/model 调用或 Provider 配置；
- 需要 staging/prod/cloud/deploy、payment、external-service；
- 证据会暴露密码、token、数据库 URL、plaintext `redeem_code` 或原始 DB 行；
- 现有 seed/e2e 无法满足独立角色账号要求。

## 清理策略

下一轮执行只允许使用 acceptance-owned synthetic test data：

- 既有 dev seed 走 upsert，可重复运行；
- 动态 e2e 数据必须使用合成标签或时间后缀；
- 不允许删除非本批次创建的数据；
- 不允许 drop、truncate、reset 数据库；
- 如果需要清理动态测试数据，必须先生成单独 cleanup 计划并获得批准。

## 下一步精确批准语句

要执行本批准包，laozhuang 需要明确回复：

`批准 L5_SEEDED_LOCAL_ACCOUNT_SCOPE_2026_06_23`

该批准只允许执行本文件列出的本地 seed、DB-backed、role-flow、evidence 命令和边界。它不批准 env/secret 读取、
schema migration、destructive DB、Provider、Cost Calibration、staging/prod/cloud、payment、external-service、push、
PR、force push 或最终验收 Pass。
