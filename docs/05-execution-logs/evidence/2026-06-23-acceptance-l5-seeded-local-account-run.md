# Acceptance L5 Seeded Local Account Run Evidence

taskId: acceptance-l5-seeded-local-account-run-2026-06-23
status: closed
result: pass_seeded_local_account_existing_paths_with_dedicated_role_account_gaps_recorded
recordedAt: "2026-06-23T00:26:47-07:00"
branch: codex/runtime-blocker-evidence-batch-20260623
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only
approvalPackageId: L5_SEEDED_LOCAL_ACCOUNT_SCOPE_2026_06_23

## 这次实际验收了什么

这次验收的是“seeded local account / 安全本地账号”路径。普通理解就是：在本地 dev 环境里，用项目已有的合成
测试账号、合成授权、合成企业、合成题目和合成训练数据，让系统真的连本地数据库、真的登录本地页面、真的走 API 和
浏览器流程。

这类证据比 fixture-only 更可信，因为它不只是假装 API 返回数据，而是让本地系统实际写入和读取本地 dev 数据。
但它仍然不是 staging、生产环境、真实客户数据、真实支付、真实 Provider 或最终上线验收。

## 本地目标和命令证据

| 检查项或命令                                                                                                                    | 结果    | 摘要                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| `Get-NetTCPConnection -LocalPort 3000 -State Listen`                                                                            | pass    | `127.0.0.1:3000` 有本地监听进程。                                                     |
| `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000 -Method Head`                                                         | pass    | 返回 HTTP 200。                                                                       |
| `npm.cmd run test:e2e -- --list`                                                                                                | pass    | 发现 36 个 e2e tests，分布在 16 个 spec 文件中；此命令只列出清单，不运行全量套件。    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Seed-DevDatabase.ps1`                                     | pass    | 本地 dev seed 通过；原始输出已按脱敏策略抑制，未写入证据。                            |
| `TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER=1; npm.cmd run test:e2e -- e2e/edition-aware-authorization-db-backed-local-flow.spec.ts` | pass    | 2 个 DB-backed 授权版本用例通过。                                                     |
| `TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER=1; npm.cmd run test:e2e -- e2e/organization-training-local-full-flow.spec.ts`            | pass    | 1 个企业培训管理员到员工完整本地流程用例通过。                                        |
| `TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER=1; npm.cmd run test:e2e -- e2e/role-based-acceptance/role-based-full-flow.spec.ts`       | pass    | 6 个综合角色全流程用例通过。                                                          |
| `TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER=1; npm.cmd run test:e2e -- e2e/validation-data-prep.spec.ts`                             | skipped | 综合角色全流程已经包含审计和 AI 调用日志只读摘要证据，因此未执行条件性数据准备 spec。 |

## 本次包含的运行时规格

| 规格文件                                                       | 用例数 | 覆盖重点                                                                             |
| -------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------ |
| `e2e/edition-aware-authorization-db-backed-local-flow.spec.ts` | 2      | 个人和企业授权的标准版、高级版、升级、升级过期、升级撤销、范围和额度边界。           |
| `e2e/organization-training-local-full-flow.spec.ts`            | 1      | 管理员创建训练草稿、引用来源、复制、发布，以及企业员工答题。                         |
| `e2e/role-based-acceptance/role-based-full-flow.spec.ts`       | 6      | 预检数据、系统运营、内容运营、学员正向、学员无授权负向、审计与 AI 调用日志只读摘要。 |
| `e2e/validation-data-prep.spec.ts`                             | 0      | 条件性备用数据准备，本轮因前一规格已提供足够审计/AI 日志证据而未运行。               |

## 普通人可读的角色和场景覆盖矩阵

| 需要验收的场景                     | 本次结果                | 普通话说明                                                                                                   | 是否足以作为最终验收通过      |
| ---------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| 个人标准版                         | 通过本地 DB-backed 验证 | 系统能从本地数据库读到个人标准版授权，并按标准版权益计算。                                                   | 否，只能证明本地 dev。        |
| 个人高级版                         | 通过本地 DB-backed 验证 | 系统能从本地数据库读到个人高级版授权，并按高级版权益计算。                                                   | 否，只能证明本地 dev。        |
| 个人标准版升级高级版               | 通过本地 DB-backed 验证 | 标准版个人授权存在有效升级时，系统能把实际权益算成高级版。                                                   | 否，只能证明本地 dev。        |
| 个人升级过期或撤销后回落           | 通过本地 DB-backed 验证 | 升级过期或撤销后，系统会回到标准版，不继续错误给高级版权益。                                                 | 否，只能证明本地 dev。        |
| 企业标准版授权                     | 通过本地 DB-backed 验证 | 系统能从本地数据库读到企业标准版授权、授权范围和额度信息。                                                   | 否，只能证明本地 dev。        |
| 企业高级版授权                     | 通过本地 DB-backed 验证 | 系统能从本地数据库读到企业高级版授权，并能区分高级版生效状态。                                               | 否，只能证明本地 dev。        |
| 企业标准版升级高级版               | 通过本地 DB-backed 验证 | 企业标准版授权有有效升级时，系统能把实际权益算成高级版。                                                     | 否，只能证明本地 dev。        |
| 企业授权范围不匹配                 | 通过本地 DB-backed 验证 | 授权范围不匹配时，系统不会把不该看的企业授权当成可用授权。                                                   | 否，只能证明本地 dev。        |
| 企业授权额度不足                   | 通过本地 DB-backed 验证 | 企业额度达到上限时，系统能返回安全失败结果，不暴露内部数据。                                                 | 否，只能证明本地 dev。        |
| 企业员工训练流程                   | 通过本地角色流程验证    | 本地系统可以创建或复用企业训练数据，让员工完成训练答题流程。                                                 | 否，仍不是 staging/生产验收。 |
| 企业员工标准版和高级版分别登录使用 | 部分通过                | 本轮证明了企业授权版本计算和员工训练流程，但没有用两个独立员工账号分别跑标准版和高级版完整路径。             | 否，仍需专门账号或测试扩展。  |
| 企业标准版管理员                   | 部分通过                | 本轮证明了企业授权和管理员侧训练流程，但管理员执行侧主要是本地超级管理员视角，不是独立企业标准版管理员账号。 | 否，仍需专门账号或测试扩展。  |
| 企业高级版管理员                   | 部分通过                | 本轮证明了企业高级授权事实，但没有独立企业高级版管理员账号完成全部管理员路径。                               | 否，仍需专门账号或测试扩展。  |
| 内容运营                           | 部分通过                | 综合角色流程证明内容管理入口和内容准备路径可用，但不是独立 `content_admin` 账号完成正向内容工作流。          | 否，仍需专门账号或测试扩展。  |
| 系统运营                           | 部分通过                | 综合角色流程证明用户、企业、卡密、授权等系统运营准备路径可用，但不是独立 `ops_admin` 账号完成全部流程。      | 否，仍需专门账号或测试扩展。  |
| 学员正向答题                       | 通过本地角色流程验证    | 学员可以在本地完成授权、练习、模考、提交、报告和学习建议相关路径。                                           | 否，只能证明本地 dev。        |
| 学员无授权负向路径                 | 通过本地角色流程验证    | 没有授权的学员不能直接看到或使用受保护的试卷和答题路径。                                                     | 否，只能证明本地 dev。        |
| 审计/审核角色                      | 部分通过                | 综合角色流程证明 `audit_log` 和 `ai_call_log` 只读摘要可见且脱敏，但不是独立 auditor 账号执行。              | 否，仍需专门账号或测试扩展。  |

## 安全和脱敏结论

本次证据没有记录：

- `.env*` 内容、数据库 URL、API key、secret、token、Authorization header、cookie、localStorage；
- seed 账号密码或生成密码；
- plaintext `redeem_code`；
- 原始 prompt、原始 AI 输出、Provider request/response payload；
- 原始作答文本、完整 `paper`、完整 `material`、内部自增 `id` 或原始 DB 行；
- Playwright screenshot、trace、HTML report、页面全文 dump。

本次允许并已经记录的只有：

- 命令名称；
- pass/fail/skipped；
- spec 名称和测试数量；
- 角色标签；
- 本地覆盖结论和残余缺口。

## 文档和机制门禁

| 命令                                                                                               | 结果 | 摘要                                                                             |
| -------------------------------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------- |
| `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`                             | pass | 只格式化本任务 5 个 docs/state 文件。                                            |
| `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`                             | pass | 所有匹配文件符合 Prettier 格式。                                                 |
| `git diff --check`                                                                                 | pass | 没有空白错误。                                                                   |
| changed evidence/state redaction scan                                                              | pass | 没有命中本轮禁止记录的本地账号明文、数据库 URL、原始 prompt 或原始 answer 标记。 |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-l5-seeded-local-account-run-2026-06-23` | pass | allowedFiles、Cost Calibration blocked、敏感证据和术语扫描通过。                 |

## 决策影响

本任务可以判定为：现有 seeded local account / 本地数据库 / 本地浏览器路径补证通过。

这意味着 Standard MVP 和 Advanced MVP 的 L5/L6 前置证据比 fixture-only 阶段更强：个人授权、企业授权、升级、
员工训练、学员答题、系统运营、内容运营、审计和 AI 调用日志摘要都已经有本地运行时证据。

但它仍然不能声明最终验收通过，原因是：

- 还没有独立 `content_admin`、`ops_admin`、企业标准版管理员、企业高级版管理员、auditor 专用账号的逐角色证明；
- 企业员工标准版和高级版还没有用两个独立员工账号分别完整跑通；
- L6 owner preview 还没有由 laozhuang 作为责任主体做人工预览确认；
- Provider、Cost Calibration、staging、payment、external-service、prod release 都仍未批准或未执行；
- 本轮只覆盖本地 dev，不覆盖 staging、生产或真实客户数据。

因此，本次证据允许推进到 L6 owner preview readiness，但不允许声明 Standard MVP Pass、Advanced MVP Pass、
staging ready、release ready、production ready 或最终验收通过。

## 仍然阻塞的门禁

- 独立角色账号扩展：`content_admin`、`ops_admin`、企业标准版管理员、企业高级版管理员、auditor；
- 企业员工标准版和高级版的独立账号分流验证；
- L6 owner preview actual walkthrough；
- `.env*` or secret access；
- schema migration、`drizzle-kit push`、drop、truncate、reset；
- Provider/model runtime calls；
- Cost Calibration Gate；
- staging/prod/cloud deploy or access；
- payment or external-service work；
- push、PR、force push；
- formal final acceptance Pass。

## Artifact Hygiene

Playwright 可能生成本地忽略产物 `playwright-report/` 和 `test-results/`。这些不是验收证据，没有加入 Git。
