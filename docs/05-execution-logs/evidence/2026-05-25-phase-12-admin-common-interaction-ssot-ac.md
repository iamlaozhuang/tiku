# Phase 12 Admin Common Interaction SSOT AC Evidence

## 任务边界

- TaskId: `phase-12-repair-admin-common-interaction-ssot-ac`
- Branch: `codex/phase-12-admin-common-interaction-ssot-ac`
- Scope: existing admin UI components, tests, evidence, and queue state.

## 外部与安全边界

- No cloud resources created or modified.
- No staging/prod connection.
- No deployment.
- No package, lockfile, dependency, schema, migration, script, `.env.local`, or `.env.example` change.
- No provider call.
- No secret, token, Authorization header, provider payload, raw prompt, raw answer, raw model response, full paper, full textbook, OCR full text, customer or customer-like private data recorded.

## SSOT AC 对照

| AC                                              | Runtime result                                                                                                                                                                                                                    |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-06-01 AC-1 列表默认分页 20 条，支持 50 / 100 | Pass. 内容运营题库/材料、试卷、知识点树本地后台列表均提供 `每页条数` 选择，默认 20，支持 50 和 100。                                                                                                                              |
| US-06-01 AC-2 表头点击切换升序/降序             | Pass. 以上列表均提供 `更新时间排序` 切换，按 `updatedAt` 在降序和升序之间切换。当前实现为按钮触发，等价覆盖 SSOT 要求的列表排序行为。                                                                                             |
| US-06-01 AC-3 筛选条件变化后自动刷新            | Pass. 题库/材料、试卷、知识点树筛选条件变化后会基于最新筛选结果重新计算排序和可见列表；E2E 覆盖筛选后新增/编辑/取消交互闭合。                                                                                                     |
| US-06-01 AC-4 批量操作需二次确认弹窗            | Pass within current runtime surface. 当前未新增批量操作入口；现有关键写操作发布、归档、停用均补齐二次确认弹窗。                                                                                                                   |
| US-06-01 AC-5 危险操作红色按钮 + 二次确认       | Pass. 题目停用、材料停用、试卷归档使用 destructive 样式，并在提交前要求确认；试卷发布也作为关键状态变更要求确认。                                                                                                                 |
| US-06-01 AC-6 操作成功/失败 Toast 提示          | Pass. 沿用现有 mutation 成功/失败 Toast，并通过确认后才触发运行时写操作。                                                                                                                                                         |
| US-06-01 AC-7 关键写操作乐观锁或原子操作        | Boundary recorded. 本任务 allowedFiles 只允许 UI 和测试，不允许改 service/repository/schema/migration/script；本轮确认 UI 不绕开现有 server action。服务层原子性/乐观锁需要后续独立 server-side AC-7 任务在明确授权后验证或实现。 |

## 验证记录

- Claim readiness: PASS.
  - Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-12-repair-admin-common-interaction-ssot-ac`
- TDD RED: Expected FAIL before implementation.
  - Command: `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts tests/unit/admin-paper-ui.test.ts tests/unit/admin-content-knowledge-ops-baseline.test.ts`
  - Result: 6 expected failures for missing common pagination/sort controls and confirmation dialog coverage.
- Unit GREEN: PASS.
  - Command: `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts tests/unit/admin-paper-ui.test.ts tests/unit/admin-content-knowledge-ops-baseline.test.ts`
  - Result: 3 test files passed, 39 tests passed.
- E2E focused verification: PASS.
  - Command: `npm.cmd run test:e2e -- e2e/content-action-closures.spec.ts`
  - Result: 1 Chromium test passed.
- Build: PASS.
  - Command: `npm.cmd run build`
- Agent readiness: PASS.
  - Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- Naming conventions: PASS.
  - Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- Git completion inventory: PASS.
  - Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- Whitespace diff check: PASS.
  - Command: `git diff --check`

## 实现摘要

- 题库/材料后台列表增加通用 `每页条数` 控制和 `更新时间排序` 切换。
- 试卷后台列表增加通用 `每页条数` 控制和 `更新时间排序` 切换。
- 知识点树后台列表增加通用 `每页条数` 控制和 `更新时间排序` 切换。
- 题目停用、材料停用、试卷发布、试卷归档补齐确认弹窗，危险操作使用 destructive 样式。
- 保留现有 server action 和 Toast 运行时路径；不新增批量操作，不改变数据模型。

## Repository Hygiene Closeout Checklist

- package/lockfile changed: No.
- schema/migration/script changed: No.
- `.env.local` / `.env.example` changed or read: No.
- cloud/staging/prod/deploy/provider touched: No.
- secret/raw provider payload/raw prompt/raw answer/raw model response recorded: No.
- full paper/textbook/OCR/private customer-like data recorded: No.
- allowedFiles boundary respected: Yes.
- post-task status: Ready for commit, merge, push, and branch cleanup after final gate rerun.
