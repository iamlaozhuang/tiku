# Acceptance L5 Fixture-Only Role Coverage Run Evidence

taskId: acceptance-l5-fixture-only-role-coverage-run-2026-06-23
status: closed
result: pass_fixture_only_existing_specs_with_seeded_account_gaps_recorded
recordedAt: "2026-06-23T00:05:20-07:00"
branch: codex/runtime-blocker-evidence-batch-20260623
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only

## 这次实际验收了什么

这次只验收“fixture-only”的本地浏览器证据。普通理解就是：系统没有创建真实账号，也没有登录真实账号，
而是在浏览器测试里拦截 API 请求，返回预先写好的模拟数据，看页面和权限边界是否按预期表现。

这类证据可以证明“前端页面、路由和权限分支在给定数据下能正常工作”，但不能证明“真实账号、真实数据库数据、
真实企业员工和真实运营人员在本地环境里都已经走通”。

## 本地目标和命令证据

| 检查项或命令                                                                                                          | 结果 | 摘要                                                                               |
| --------------------------------------------------------------------------------------------------------------------- | ---- | ---------------------------------------------------------------------------------- |
| local port check                                                                                                      | pass | `127.0.0.1:3000` 正在监听，进程为本机本地进程。                                    |
| `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000 -Method Head`                                               | pass | 返回 HTTP 200。                                                                    |
| `npm.cmd run test:e2e -- --list`                                                                                      | pass | 发现 36 个 e2e tests，分布在 16 个 spec 文件中；此命令只列出清单，不运行全量套件。 |
| `TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER=1; npm.cmd run test:e2e -- e2e/edition-aware-authorization-local-flow.spec.ts` | pass | 3 个 fixture-only 授权版本用例通过。                                               |
| `TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER=1; npm.cmd run test:e2e -- e2e/admin-role-denial-browser.spec.ts`              | pass | 2 个 fixture-only 管理角色互斥权限用例通过。                                       |

本任务没有运行 DB-backed、seeded local account、真实凭证、staging 命名、Provider、Cost Calibration 或全量 e2e 规格。

## 本次包含的 fixture-only 规格

| 规格文件                                             | 用例数 | 覆盖重点                                                                |
| ---------------------------------------------------- | ------ | ----------------------------------------------------------------------- |
| `e2e/edition-aware-authorization-local-flow.spec.ts` | 3      | 个人/企业标准版和高级版授权、升级、升级失效回落、范围不匹配、额度不足。 |
| `e2e/admin-role-denial-browser.spec.ts`              | 2      | 内容运营不能访问系统运营数据；系统运营不能访问内容编辑数据。            |

## 普通人可读的角色和场景覆盖矩阵

| 需要验收的场景           | 本次结果 | 普通话说明                                                                                        | 是否足以作为正式 L5 通过                       |
| ------------------------ | -------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 个人标准版               | 覆盖     | 模拟了个人用户拥有标准版授权，页面能显示标准版、个人授权、专业等级和个人额度归属。                | 否，只是 fixture 证据。                        |
| 个人高级版               | 覆盖     | 模拟了个人用户拥有高级版授权，页面能显示高级版状态。                                              | 否，只是 fixture 证据。                        |
| 个人标准版升级到高级版   | 覆盖     | 模拟了原本标准版、升级后按高级版生效的情况。                                                      | 否，只是 fixture 证据。                        |
| 个人升级过期或撤销后回落 | 覆盖     | 模拟了升级过期、升级撤销后回到标准版，页面能显示对应状态。                                        | 否，只是 fixture 证据。                        |
| 企业标准版管理员         | 部分覆盖 | 模拟了管理员视角下企业标准版授权列表，能显示企业标准版、额度和授权范围。                          | 否，未验证真实管理员账号。                     |
| 企业高级版管理员         | 部分覆盖 | 模拟了管理员视角下企业高级版授权列表，能显示高级版、额度和升级状态。                              | 否，未验证真实管理员账号。                     |
| 企业标准版升级到高级版   | 覆盖     | 模拟了企业授权从标准版升级到高级版后的显示。                                                      | 否，只是 fixture 证据。                        |
| 企业升级过期或撤销后回落 | 覆盖     | 模拟了企业升级过期、撤销后回到标准版。                                                            | 否，只是 fixture 证据。                        |
| 企业授权范围不匹配       | 覆盖     | 模拟了授权范围不匹配时，系统返回安全失败包络，不暴露内部数据。                                    | 否，只是 fixture 证据。                        |
| 企业授权额度不足         | 覆盖     | 模拟了额度已满时，系统返回安全失败包络，不暴露内部数据。                                          | 否，只是 fixture 证据。                        |
| 企业员工标准版           | 缺口     | 本次只模拟了企业员工列表数据，没有模拟企业员工本人登录后使用标准版权益。                          | 否，仍需 seeded local account 或新增 fixture。 |
| 企业员工高级版           | 缺口     | 本次没有模拟企业员工本人登录后使用高级版权益。                                                    | 否，仍需 seeded local account 或新增 fixture。 |
| 内容运营                 | 部分覆盖 | 验证了内容运营不能访问企业、授权、用户等系统运营数据；没有验证内容运营创建/编辑题目、材料、试卷。 | 否，正向内容流程仍缺证据。                     |
| 系统运营                 | 部分覆盖 | 验证了系统运营不能访问题目、材料、试卷等内容编辑数据；没有验证用户、企业、卡密、授权正向流程。    | 否，正向系统流程仍缺证据。                     |
| 审计/审核角色            | 缺口     | 本次没有运行审计日志、AI 调用日志或最终审核角色的 fixture-only 正向流程。                         | 否，仍需专门证据。                             |
| 未登录访问保护           | 已有证据 | 上一 L5 标准任务已经证明未登录访问受保护页面会回到登录页；本任务没有重复跑这部分。                | 否，只是 L5 的一部分。                         |

## 安全和脱敏结论

本次 fixture-only 规格同时检查了这些安全边界：

- API 响应保持 `{ code, message, data, pagination? }` 标准包络；
- JSON 字段使用 camelCase；
- 外部响应没有出现内部自增 `id` 字段；
- 页面和响应中没有出现测试 session 值、密钥、Provider payload、数据库 URL、明文 `redeem_code`、原始 prompt、
  原始答案、原始 AI 输出或完整试卷/材料内容；
- 失败场景返回安全错误，不把内部数据展示给浏览器用户。

## 决策影响

本任务可以判定为：fixture-only 角色覆盖补证通过，但正式 L5 角色全流程仍不能判通过。

原因很直接：验收要求覆盖真实使用路径时，至少还缺这些证据：

- 企业员工标准版和高级版的登录后真实使用路径；
- 内容运营的正向内容工作流；
- 系统运营的正向账号、企业、授权、卡密工作流；
- 审计/审核角色查看 `audit_log` 和 `ai_call_log` 的运行时证据；
- seeded local account 或人工输入安全本地账号后的真实账号证据。

因此，本次证据不允许用来声明 Standard MVP Pass、Advanced MVP Pass、L6 owner preview ready、Provider ready、
Cost Calibration ready、staging ready、release ready、production ready 或最终验收通过。

## 仍然阻塞的门禁

- seeded local account creation or login
- database connection, seed, migration, or data change
- `.env*` or secret access
- Provider/model runtime calls
- Cost Calibration Gate
- staging/prod/cloud deploy or access
- payment or external-service work
- formal final acceptance Pass

## Artifact Hygiene

Playwright 可能生成本地忽略产物 `playwright-report/` 和 `test-results/`。这些不是验收证据，没有加入 Git。
