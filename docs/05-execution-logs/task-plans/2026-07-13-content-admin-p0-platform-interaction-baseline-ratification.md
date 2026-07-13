# 内容后台 P0 数据完整性与平台交互契约立项方案

**日期：** 2026-07-13

**任务：** `content-admin-p0-platform-interaction-baseline-ratification-2026-07-13`

**分支：** `codex/content-admin-interaction-baseline`

**基线：** `1bd47916acb5608faf5186175bfb659cd8509212`

## 目标

在不修改产品源码、测试或运行数据的前提下，形成一份可由产品负责人审批的后续实现基线：

1. 判定内容后台新建题目、新建材料的 P0 数据完整性问题是否具备立项证据；
2. 将现有后台通用要求与 2026-07-07 全角色 UI/UX 基线归一为平台级交互契约；
3. 给出可独立审批、独立测试、独立回滚的实施批次，不把设计建议直接解释为代码授权；
4. 明确后续实现的验收矩阵、停止条件与例外登记机制。

## 已读取基线

- `AGENTS.md`、project state、task queue、代码品味十诫和 ADR-001 至 ADR-007。
- 标准版与高级版需求索引、题库/材料模块与故事、后台通用交互要求、edition-aware authorization 要求。
- 2026-07-02 AI requirements SSOT、Phase4 baseline、最新 AI acceptance baseline evidence 与 goal-completion audit。
- 2026-07-07 全角色 UI/UX source implementation entry、全局基础、内容后台批次与设计复核。
- 2026-07-12 B0-B6 累计收口和 push 收口，以及手机号决策、enforcement、validation 的 plan/evidence/audit。
- 2026-07-13 预上线 AI 组卷测试数据清理的 plan/evidence/audit。
- 当前题目/材料客户端默认值、表单禁用条件、服务端 validator、既有单元测试和后台交互合同实现。

## 当前证据假设

- 新建题目表单把题干、解析、标准答案、选项和评分点填入可提交的演示值；新建材料表单把标题和正文填入可提交的演示值。
- 客户端保存门禁主要覆盖长度，服务端主要覆盖非空、类型和部分题型约束；既有测试把上述演示值当作正常写入样本。
- 这构成“占位内容可被误当正式内容保存”的新鲜当前基线风险证据，但本任务不运行写入验证、不创建正式内容，也不改数据库。
- 现有 `US-06-01`、后台通用交互规则和 2026-07-07 UI/UX 基线已经覆盖分页、URL 恢复、状态模板、危险确认、列表/详情分离等方向，但尚需归一为带规范等级和例外机制的平台契约。

## 产物

1. `docs/05-execution-logs/acceptance/2026-07-13-content-admin-p0-platform-interaction-baseline-approval-package.md`
2. `docs/05-execution-logs/evidence/2026-07-13-content-admin-p0-platform-interaction-baseline-ratification.md`
3. `docs/05-execution-logs/audits-reviews/2026-07-13-content-admin-p0-platform-interaction-baseline-ratification-audit.md`
4. project state 与 task queue 的文档型任务登记。
5. `docs/01-requirements/traceability/2026-07-13-content-admin-p0-platform-interaction-contract.md` 与需求索引入口（产品批准后）。

## 允许范围

- 只允许修改上述 plan、acceptance、evidence、audit、project state、task queue，以及产品批准后的稳定 traceability 和需求索引入口。
- 允许只读检查当前源码、测试、Git 与治理门禁。
- 允许运行不产生业务数据的现有定向单测与文档质量检查。

## 禁止范围

- 不修改 `src/**`、`tests/**`、`e2e/**`、schema、migration、fixture、seed、依赖、lockfile、env 或运行配置。
- 不登录、不操作浏览器、不截图、不抓取 raw DOM，不读取私有账号文件。
- 不连接或写入数据库，不启用 Provider，不执行 AI 生成、Cost Calibration、staging、production、deploy、PR 或任何远端写操作。
- 不创建实现提交，不合入 `master`，不 push；这些动作需要新的明确批准。

## 编制顺序

1. 冻结问题陈述与证据链，区分“当前风险证据”“尚未运行时复现”和“设计建议”。
2. 建立 P0 验收矩阵，覆盖客户端、API、题型语义、材料、编辑/复制/锁定回归和可访问性。
3. 建立平台交互契约，按 `MUST`、`SHOULD`、`MAY/例外` 分级，并定义详情 Drawer、轻量 Dialog、任务 Drawer、独立编辑页和复杂 Composer 的适用边界。
4. 将实现拆为 P0 数据完整性、共享交互原语、题目/材料编辑器、列表请求行为、平台推广与全角色验收批次。
5. 两轮对抗式审查：第一轮攻击数据完整性与绕过路径；第二轮攻击平台一致性、过度抽象、权限/edition/AI/企业训练边界与回归风险。
6. 运行 scoped format、`git diff --check`、允许文件清单检查和 Module Run v2 文档门禁，记录真实结果。

## 停止条件

- 证据不足以证明 P0 风险来自当前基线，或只能通过数据库写入、浏览器写入、Provider 或敏感材料才能继续。
- 平台契约与稳定需求、ADR、2026-07-07 UI/UX 基线发生无法按来源层级解决的冲突。
- 需要把设计建议直接提升为稳定需求 SSOT，或需要批准产品源码、测试、schema、fixture、依赖或远端动作。
- 发现会重开 A01-A30 或已关闭 AI 问题但没有新鲜当前基线失败证据。

## 交付门禁

- 立项包只能给出 `recommend_approve`、`recommend_revise` 或 `do_not_approve` 建议，不替产品负责人完成最终批准。
- 后续任何实现批次必须重新建短分支/worktree、读取精确需求与源码、先写测试、执行全量门禁和两轮对抗式审查。
- 在产品负责人批准本立项包前，不把平台契约写入稳定 requirements SSOT，也不启动实现。
