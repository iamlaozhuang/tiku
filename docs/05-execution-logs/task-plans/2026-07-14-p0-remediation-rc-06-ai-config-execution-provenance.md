# P0 RC-06 AI 配置、任务执行与结果真实性整改方案

## 任务边界

- taskId：`p0-remediation-rc-06-ai-config-execution-provenance-2026-07-14`
- finding：F-0062、F-0101、F-0102、F-0134；四项均保留独立验收义务。
- branch/worktree：`codex/p0-rc-06-ai-config-execution-provenance` / `D:\tiku\.worktrees\p0-rc-06`
- source baseline：`f3af180ee9be32ec8d74ef3a297ed4bf2072dc0e`
- audit baseline：`7aac83765ca4b650b73b1612013e26a0111775ae`
- WIP：仅 RC-06；不进入 RC-07、P1/P2 实现或 21 项 runtime acceptance。

## 第一性原理根因

AI 结果可信必须同时满足：调用选择来自受治理的 `model_config` 和 `prompt_template` 版本；凭据只通过受保护引用解析；任务状态、重试、超时、幂等和结果来源是持久事实；UI/API 对角色能力诚实；开发 fixture 不能进入生产成功语义。当前实现把这五个事实拆断：密钥输入被销毁而 UI 仍声称 configured，运行时默认 local_mock/环境变量，任务队列仅为内存测试抽象，答案长度与固定文案被包装为 AI 成功，治理组件又没有正式入口。

最小内聚修复边界是建立一条从治理输入到结果来源的闭环：

1. write-only secret writer 只返回 opaque `api_key_secret_ref`，读取端仅返回状态与 last4；
2. persisted `model_config` + prompt version 形成不可变执行快照，production 禁用 local fixture；
3. `ai_scoring_task` 作为持久 FIFO、认领、lease、重试和幂等事实源，attempt/result 记录来源；
4. 未配置真实执行适配器时明确 unavailable，不产生分数、AI 文案、伪 requestId 或 citation；
5. super/ops 通过正式路由访问治理能力，写/测试/Prompt 全文由服务端角色边界兜底。

## SSOT Read List

- `D:\tiku\AGENTS.md`
- `docs/03-standards/glossary.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/ADR-001` 至 `ADR-007`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-and-quota.md`
- `docs/01-requirements/advanced-edition/modules/05-platform-operations.md`
- `docs/01-requirements/advanced-edition/modules/06-retention-and-audit.md`
- 对应 standard/advanced stories、九角色 catalog 中 UC-SUPER-011/012、UC-OPS-011/012、UC-CONTENT-012/014、UC-PADV-005/008/009、UC-ORGADVADM-009/010、UC-ORGADVEMP-005/008/009。
- AI baseline recovery：2026-07-02 AI generation requirements SSOT alignment、phase4 baseline alignment、最新 baseline evidence、goal-completion audit。
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- 最新角色/授权/运营 decision package、traceability、UI source-entry baseline 与私有设计板 manifest/page matrix（只读）。
- 原始 finding register、runtime backlog、启动包、整改 ledger、serial plan、RC-05 evidence。

## Requirement Decision Map

| 决策            | 当前 SSOT 结论                                             | 实现约束                                                                |
| --------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| 模型治理        | super_admin 可写和连接测试；ops_admin 仅脱敏摘要           | 服务端仍需拒绝 ops 写/测试；UI 不以隐藏代替授权                         |
| Prompt Registry | 首期只读；super 可看全文，ops 仅元数据                     | 不新增编辑/启停 UI；响应不向 ops 返回正文                               |
| API Key         | write-only、受保护存储、轮换后供对应配置使用               | validator 不销毁输入；repository 只存 opaque ref/last4/status；绝不回显 |
| 连接测试        | 最小合成请求；失败不自动停用                               | 仅注入 adapter；无 adapter/secret 时 honest failure；不读取用户内容     |
| AI 评分         | 整卷异步 FIFO，单题 60 秒，最多三次，成功结果固定          | task/attempt 持久化；claim/retry/lease/timeout/幂等由事实驱动           |
| 执行快照        | 任务启动时锁定模型、Prompt、输入、RAG、授权与约束          | 不从可变当前配置重建历史事实；日志仅脱敏 provenance                     |
| fixture         | 仅显式测试依赖                                             | production 默认 unavailable；local_mock 不能产生业务成功                |
| API             | `{ code, message, data, pagination? }`、camelCase、null/[] | 不暴露 internal id、secret ref、raw Prompt/Provider IO                  |

## Conflict Check

- 2026-07-02 最新关闭材料明确旧 AI 生成 20 类问题已 closed/superseded；RC-06 不重开这些旧类，只修复当前四个 validated P0 的共享执行真实性边界。
- 当前授权允许 schema/migration 源码、静态测试和提交，不允许数据库 apply/read/write、secret/env、Provider、worker 激活、runtime/browser/e2e。源码中的 adapter/worker contract 与测试替身可实现，真实接入继续 pending。
- RC-06 只保证静态修复和本地门禁，不能表述为 RV-0012、RV-0017、RV-0021 通过。

## 当前基线重验

审计 baseline 后 RC-04/05 修改了 `ai-rag.ts`、mock/practice/student/mistake retrieval 链路，因此：

- F-0062：`baseline_changed`。现有默认 scoring runner 仍按答案长度打分，生产装配仍缺持久队列/timeout/一致 retry。
- F-0101：`confirmed`。完整治理组件仍无生产路由和菜单入口。
- F-0102：`confirmed`。secret 输入仍只派生 last4/configured，`api_key_secret_ref` 无 writer/resolver，运行时仍 local_mock/环境变量分叉，connection test 未调用 adapter。
- F-0134：`root_cause_alias`（alias F-0062，非重复、非解决）。RC-05 改变 retrieval 装配，但练习/错题的固定 AI 文案、长度评分与伪 provenance 仍存在。

## 业务不变量

- 任何成功 AI 结果都必须能追溯到 task/attempt、model_config、prompt version 和真实 executor outcome。
- secret 值不得进入数据库普通列、响应、日志、错误、测试快照或 evidence。
- 无凭据、无配置、无 executor、未知 provider/model、local fixture 均不得产生成功或分数。
- 成功评分不可被重试覆盖；失败最多三次；并发认领只允许一个 owner；lease/timeout 后恢复不重复记分。
- mock_exam 交卷不等待逐题 Provider；主观题进入 scoring，最终按全部成功或 partial failed 收敛。
- ops 不得写模型、测试连接或读 Prompt 全文；super 写动作仍需服务端授权。
- 标准/高级、个人/组织上下文和 object scope 不得因 AI 执行层被绕过。

## 实现步骤（TDD）

1. RED：添加 RC-06 schema/source 契约测试，证明 durable task、FIFO/claim/lease、快照、唯一幂等键与 opaque secret ref 约束缺失。
2. GREEN：新增 `ai_scoring_task` schema/migration source；不执行 migration，不读取或回填历史数据。
3. RED/GREEN：secret store 与 Provider connection adapter。validator 将 secret 仅传给 injected writer；writer 返回 opaque ref；默认 resolver/test adapter unavailable。
4. RED/GREEN：治理正式路由、导航和角色视图；移除组件在缺 callback 时本地伪保存/伪测试的成功路径。
5. RED/GREEN：durable queue repository/runtime，事务认领、FIFO、lease、timeout、max retry、success reuse、result provenance；mock submit/retry 共用同一 runtime。
6. RED/GREEN：practice、mistake、owner preview 和 student default 装配拒绝 local fixture；缺真实执行时返回显式 unavailable/failed，不写伪分数或 AI 文案。
7. focused → full unit → lint/typecheck/format/build/diff/guard；两轮不同重点的对抗式复核。
8. 独立提交，fresh master ff-only 合入后全门禁，push origin/master，写 closeout evidence，清理 worktree/短分支后领取 RC-07。

## 对抗测试矩阵

- 正常：governed model/prompt 选中并锁定；synthetic connection adapter 成功；task FIFO 执行并记录 redacted provenance。
- 授权：ops 写/测试/Prompt 全文；content/student/organization 深链；跨 organization task/result；他人 mock/answer。
- 状态：disabled/unknown config、missing prompt、invalid transition、late completion after cancel/timeout、success retry。
- 并发/幂等：重复 submit/retry、并发 claim、response lost、lease expiry、恰好第 1/3/4 次。
- 事务失败：enqueue 中途失败、attempt append 失败、result write 失败、retry rollback。
- 输入：null secret、空 scoring points、未答题、超长无关文本、NaN/边界分数、未知 provider/model。
- 契约：camelCase、标准 envelope、null/[]、publicId、enum 对齐；无 internal id/secret/raw Prompt/Provider IO。
- 角色回归：super、ops、content、个人标准/高级、组织标准/高级员工与组织高级管理员。

## 数据兼容与爆炸半径

- 新表避免对历史 attempt 强制 backfill；新写路径只为新任务创建强约束记录。
- migration 必须使用单数 snake_case、public_id 唯一、外键与索引命名规范；不把自增 id 暴露至 URL/API。
- mock/practice/mistake 与 admin AI governance 是共享高爆炸半径；默认行为从 fake success 改为 honest unavailable 可能改变旧测试和 UI 状态，但这是必要的安全收敛。
- 不自动迁移旧 in-memory job、local_mock 结果或历史 configured metadata；历史数据处理需要后续数据库审批与独立方案。

## P1/P2 影响映射（只记录）

- 可能覆盖：F-0021、F-0038、F-0039、F-0063、F-0091、F-0105、F-0150、F-0156、F-0160、F-0174、F-0177、F-0178。
- 可能语义变化：F-0103、F-0104。
- 全部保留到 P0 新基线后重验；本任务不关闭、不降级、不实现 P1/P2。

## 验证命令

```text
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-P0RemediationSerialProgram.ps1 -Phase manual
corepack pnpm@10.15.1 exec vitest run tests/unit/p0-rc-06-ai-config-execution-provenance.test.ts tests/unit/p0-rc-06-schema-migration-source.test.ts --reporter=dot
corepack pnpm@10.15.1 run test:unit
corepack pnpm@10.15.1 run lint
corepack pnpm@10.15.1 run typecheck
corepack pnpm@10.15.1 run format:check
corepack pnpm@10.15.1 run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p0-remediation-rc-06-ai-config-execution-provenance-2026-07-14
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p0-remediation-rc-06-ai-config-execution-provenance-2026-07-14
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p0-remediation-rc-06-ai-config-execution-provenance-2026-07-14 -SkipRemoteAheadCheck
```

## 暂停与排除

- 暂停：需要真实 secret/env、Provider/模型请求、数据库 apply/read/write/backfill/seed、worker 激活、依赖、PR、force push、部署或 runtime/browser/e2e。
- 排除：RC-07 报告/快照完整性、RC-08 组织训练、P1/P2 修复、Cost Calibration、21 项运行时验收。
- 现有任务级 standing authorization 仅覆盖通过门禁后的 local commit、ff-only master merge、origin/master push 与 cleanup。
