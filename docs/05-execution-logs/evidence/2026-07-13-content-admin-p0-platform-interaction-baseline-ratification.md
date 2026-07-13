# 内容后台 P0 数据完整性与平台交互契约立项证据

**日期：** 2026-07-13

**任务：** `content-admin-p0-platform-interaction-baseline-ratification-2026-07-13`

**分支：** `codex/content-admin-interaction-baseline`

**起始基线：** `1bd47916acb5608faf5186175bfb659cd8509212`

result: approved_ready_for_local_closeout

## Git 与任务边界

- 立项前确认 `master == origin/master == 1bd47916acb5608faf5186175bfb659cd8509212`，主工作区 clean。
- 本任务位于独立 worktree，只修改 task plan、approval package、evidence、audit、project state 和 task queue。
- 未修改产品源码、测试、schema、migration、fixture、seed、依赖、lockfile、env 或私有文件。
- 未使用浏览器、截图、raw DOM、账号、数据库、Provider、staging、production、deploy、PR 或远端写操作。
- 产品批准前未执行 commit、ff-only merge 或 push；当前仅本地 commit、ff-only merge 和清理获批，普通 push 仍阻断。

## 产品审批与稳定需求提升

- 产品负责人于 2026-07-13 明确回复“批准三项，先启动 Batch A”。
- P0-01 至 P0-14、PIC-01 至 PIC-13、任务容器表和实施顺序已提升到稳定 traceability。
- 当前批准允许本 docs-only 任务本地提交、ff-only 合入和清理，并允许启动独立 Batch A；普通 push 仍未批准。

## 当前基线事实

### 客户端默认值

- `AdminQuestionMaterialManagementClient.tsx:351-375`：单选题默认生成 A-D 选项、A 为正确项，并预填解析、标准答案、评分点和题干。
- 同文件 `381-387`：材料预填标题和正文。
- 同文件 `1807-1813`、`2214`：题目保存门禁只覆盖题干/解析长度。
- 同文件 `2409-2411`、`2534`：材料保存门禁只覆盖正文长度。

### 服务端与测试合同

- `question.ts:378-466`：创建 validator 覆盖必填、枚举和部分题型关系，但未形成完整的客观题选项/正确答案一致性门禁。
- `material.ts:105-143`：创建 validator 覆盖非空、正文长度、枚举和等级。
- `admin-question-material-ui.test.ts:1351-1382`：以“新建题目题干”等值断言题目创建成功。
- 同测试 `2009-2050`：以“新建案例材料/新建材料正文”等值断言材料创建成功。

以上证据证明当前合同允许演示默认内容沿正常创建路径发送。它不证明某条真实数据库记录已经受到污染；本任务没有执行写入。

## 定向基线验证

| 检查                                                                     | 结果                                   |
| ------------------------------------------------------------------------ | -------------------------------------- |
| `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts` | pass；1 file，36 tests                 |
| scoped Prettier check                                                    | pass；8 个允许文件                     |
| `git diff --check`                                                       | pass                                   |
| allowed-file / blocked-path diff inventory                               | pass；仅 8 个预期文件，无越界路径      |
| `Test-ModuleRunV2PreCommitHardening.ps1`                                 | pass；8 个文件通过 scope/敏感/术语扫描 |

定向测试通过的解释：它确认当前创建、编辑、停用、复制行为仍稳定，包括把演示默认值当作可保存内容；它不是 P0 已修复的证据。

## 需求与基线映射

- `US-02-01`：题目按题型引导，具备题干、选项、答案、解析、评分点等结构化字段。
- `US-02-06`：材料含标题、正文、分类、状态和锁定/复制规则。
- `US-06-01`：后台分页、排序、筛选刷新、确认、Toast、并发冲突和 URL 状态恢复。
- 2026-07-07 Batch 0：工作区上下文、状态模板、按钮层级、AI/内容生命周期与脱敏基线。
- 2026-07-07 Batch 5：题目、材料、试卷列表/详情分离，内容生命周期优先和 `super_admin` 不绕过规则。
- 2026-07-12 B0-B6：A01-A30 已有关闭/保护结论；本任务没有新鲜失败证据时不重开。
- AI goal-completion 与 acceptance normalization：旧 AI 问题保持 closed/superseded，本任务不触碰 Provider 或历史恢复合同。

## 立项产物

- P0-01 至 P0-14：客户端/API/题型/材料/回归/可访问性硬验收矩阵。
- PIC-01 至 PIC-13：平台 `MUST` 合同，另有 `SHOULD` 和任务容器例外表。
- 六个后续批次：P0 数据完整性、契约 SSOT/共享原语、独立编辑工作区、列表请求一致性、平台推广、全角色验收。
- 产品负责人只需审批 P0 矩阵、平台契约和实施顺序；每个实现批次仍需 fresh approval。

## Module Run v2 锚点

- Batch range: single docs-only baseline-ratification task.
- RED: 当前新建题目/材料用演示默认内容形成可提交状态，客户端与服务端缺少一致的语义完整性门禁，现有测试将其作为成功路径。
- GREEN: 产品负责人已批准三项，稳定 traceability 已物化；本任务不声称 P0 已修复，Batch A 仍需独立 TDD 和验证。
- Commit: pending at evidence freeze; local docs commit and ff-only merge are approved, the final hash is reported in the delivery, and push remains blocked.
- localFullLoopGate: pass for this docs-only task after the focused current-baseline test, scoped formatting, diff check, allowed-file inventory, two adversarial reviews, self-review, and Module Run v2 pre-commit hardening.
- threadRolloverGate: not_required; the review package and recovery paths are explicit.
- nextModuleRunCandidate: `content-admin-p0-data-integrity-implementation_requires_fresh_approval`.
- blocked remainder: this docs task blocks source/test changes, browser, screenshots, credentials, DB, Provider, dependency, schema, fixture, staging, production, deploy, PR, push, and Cost Calibration; Batch A source/test work is separately approved in its own worktree.
- Cost Calibration Gate remains blocked.

## 非声明

- 不声明 P0 已修复、运行时脏数据已复现、六张截图已完成可访问性验证或平台契约已实现。
- 不声明 release readiness、production usability、final Pass 或全平台体验一致性已完成。

## 过程反证

- 第一次 Module Run v2 pre-commit hardening 因新任务把 `blockedFiles` 写成 YAML alias，而治理脚本获得空 pattern 数组后 fail closed；这不是产品或源码失败。
- 将本任务的 blocked path 物化为显式列表后重新执行，6 个允许文件全部通过 scope、敏感证据和术语扫描。未削弱门禁，也未修改脚本。
- 产品批准后扩展稳定需求入口与索引，再次按 8 个允许文件执行并通过全部扫描。
- 首次实际 `git commit` 被 Hook 阻断：无参数 Hook 从陈旧的 `currentTask` 选中了上一项 AI 测试数据任务；根因不是源码或范围失败，而是本任务只更新了顶层 phase/latest 记录，未同步 Hook 的任务选择入口。随后将 `currentTask` 与本任务队列条目一致化，未修改 Hook、未跳过门禁。
