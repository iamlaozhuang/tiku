# 0704 localhost 验收问题台账与修复批次

**日期：** 2026-07-11

**分支：** `codex/0704-acceptance-remediation-ledger`

**基线：** `fa65cbd9bb676d813e627221e23f71a7476e05d8`
**范围：** B0 台账冻结、决策边界和 master 单测基线健康修复。

## 已读取约束

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-06-21-paper-question-count-and-type-policy.md`

后续 AI、edition、authorization 和五项内容后台批次在各自短分支重新读取对应 SSOT、最新 baseline evidence、goal-completion audit、task plan、evidence 与 audit。

## 不可突破边界

- Provider 保持关闭；不得执行真实 Provider 请求、读取 Provider 配置或凭证、检查 payload、执行 Cost Calibration。
- 不访问 staging、production、deploy、env 或 secret。
- 不新增依赖、迁移或 seed；不直接写数据库。
- 凭证只允许验收进程内使用，不进入终端输出、截图、日志、evidence 或仓库。
- 截图只用于已批准的 localhost 脱敏验收；不抓 raw DOM。
- 每个根因独立短分支、RED/GREEN、证据、对抗式审计和提交；后批必须累计回归前批。

## 冻结问题台账

| ID  | 严重度      | 状态         | 问题与修复方向                                                       | 批次        |
| --- | ----------- | ------------ | -------------------------------------------------------------------- | ----------- |
| A01 | P0          | confirmed    | 组卷选择器按真实分页数组 envelope 读取，覆盖题目和材料模式。         | B1A         |
| A02 | P1          | confirmed    | 企业训练管理端隔离不完整历史版本，禁止推断发布范围。                 | B1B         |
| A03 | P1          | confirmed    | 员工可见训练复用安全版本解析，无效版本不得进入列表。                 | B1B         |
| A04 | P2          | confirmed    | 列表完整性失败时禁用新建并提供恢复入口。                             | B3          |
| A05 | P1          | confirmed    | 资源 `publicId` 作为不透明值处理，URL 段统一编码。                   | B1C         |
| A06 | P2          | confirmed    | 服务端提供脱敏生成可用性；Provider 关闭时前置禁用。                  | B2          |
| A07 | P2          | confirmed    | 首屏解释 AI 不可用，不暴露 Provider、环境或凭证细节。                | B2          |
| A08 | P2          | confirmed    | 试卷搜索、反馈和 accessible name 不显示业务标识。                    | B4          |
| A09 | P2          | confirmed    | 题目操作以题干摘要、题型和序号提供唯一上下文。                       | B4          |
| A10 | P2          | confirmed    | 材料操作以标题和状态提供唯一上下文。                                 | B4          |
| A11 | P2          | confirmed    | 知识点推荐显示名称和路径，缺失时不回退为 ID。                        | B4          |
| A12 | P2          | confirmed    | 材料、知识点、标签改为业务名称搜索/树选择器。                        | B4          |
| A13 | P2          | confirmed    | 组织首页只展示名称、路径、范围摘要和数量。                           | B4          |
| A14 | decision    | deferred     | 保持当前手机号展示，不在未决策前顺手掩码。                           | B0 guard    |
| A15 | requirement | protected    | 保留合资格运营角色卡密明文能力，验证角色限制、审计与证据脱敏。       | B0/B4 guard |
| A16 | P2          | confirmed    | 审计动作和目标类型使用可读中文，未知值显示兜底文案。                 | B4          |
| A17 | P3          | confirmed    | 技术措辞改为运营可读文案，移除原始内部徽标和 Cost Calibration 措辞。 | B4          |
| A18 | P2          | confirmed    | 已登录角色不符进入 forbidden，未登录才进入 login。                   | B3          |
| A19 | P2          | confirmed    | 标准版不可用页保留组织后台壳和返回入口。                             | B3          |
| A20 | P2          | confirmed    | Provider-closed 状态覆盖四类允许角色且不扩大标准版权限。             | B2          |
| A21 | gap         | accepted     | 补 Playwright 键盘用例和人工 Tab/Shift+Tab/Escape 验收。             | B6          |
| A22 | gap         | accepted     | 单元/服务层构造多页；0704DB 只验证已有真实多页数据。                 | B6          |
| A23 | gap         | accepted     | 仅通过现有 practice/mock API 创建或恢复会话，禁止直接 DB 写。        | B6          |
| A24 | P3          | confirmed    | 仅修 0704 中文组织 fixture，不改生产展示逻辑。                       | B5 data     |
| A25 | P3          | confirmed    | 仅修材料验收 fixture 的可读性，不批量改生产内容。                    | B5 data     |
| A26 | P3          | confirmed    | 普通运营文案统一使用名称、路径或选择器表达。                         | B4          |
| A27 | P3          | confirmed    | 卡密筛选空态使用统一列表空态并保留筛选分页。                         | B5 desktop  |
| A28 | P3          | confirmed    | 移动端底部操作区补安全区和稳定导航间距。                             | B5 mobile   |
| A29 | P3          | verify-first | 页面禁止横向溢出，表格仅在自身容器滚动。                             | B5 mobile   |
| A30 | P2          | confirmed    | 重复查看/复制/详情操作使用业务对象名称作为 accessible name。         | B4          |

## 串行批次

1. B0：冻结 A01-A30、保护 A14/A15、恢复 master 单测基线健康。
2. B1A：A01 组卷选择器响应契约。
3. B1B：A02/A03 企业训练读取修复。
4. B1C：A05 资源标识路由兼容。
5. B2：A06/A07/A20 Provider-closed 状态合同。
6. B3：A04/A18/A19 错误态、角色和 edition 边界。
7. B4：A08-A13/A16/A17/A26/A30 可读标识与辅助技术名称。
8. B5：A24-A29，按 data、desktop、mobile 分支隔离。
9. B6：A21-A23 键盘、分页和 practice/mock 完整验收。

## B0 基线失败与处置

全量单测在未改代码的 master 基线上得到 357 个测试文件、1929 个测试，其中 8 个测试稳定失败，另有 1 个仅在全量并发时偶发失败。

| 类别                        | 根因判定                                                                              | 最小修复                                                         |
| --------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| question/material 查询断言  | 既有测试未跟随已确认的 nullable 查询字段。                                            | 更新精确调用断言，不改生产查询合同。                             |
| org_auth 并发证明           | 源码已经按批量输入循环创建，旧字符串锚点失效。                                        | 更新源码证明锚点，继续验证事务内重查后的 overlap 优先级。        |
| mistake_book AI explanation | 测试注入业务 repository 后遗漏新增 AI 审计 repository，意外落到 PostgreSQL 默认实现。 | 注入内存审计 recorder，继续断言零真实 Provider。                 |
| admin AI persistence        | 测试 helper 遗漏新增组卷和组织训练 repository 依赖，意外落到 PostgreSQL 默认实现。    | 注入受控内存依赖，禁止网络和真实 Provider。                      |
| legacy alias inventory      | AI 新路径接受/输出 `multiple_choice`，违反 2026-06-21 SSOT 的兼容范围。               | AI 路径只接受和输出 canonical `multi_choice`，更新对应测试输入。 |
| admin user org UI 偶发失败  | 单 worker 复跑通过，属于全量并发下资源/时序不稳定。                                   | 完成稳定失败修复后再全量复跑；若复现则单独定位，不用重试掩盖。   |

## B0 RED/GREEN 与门禁

1. RED 已由未改 master 的稳定失败提供，记录失败文件和测试计数，不记录敏感数据。
2. GREEN 只修上述根因，不改业务权限、Provider 开关、schema、依赖或 UI。
3. 运行 focused tests、全量 `test:unit`、`lint`、`typecheck`、`format:check`、`git diff --check`。
4. 写入脱敏 evidence 与 adversarial audit；一个任务一个提交。
5. 任何角色能力扩大、组织范围推断、正式内容直写、Provider 请求、敏感输出或无法解释的新失败均立即停止。
