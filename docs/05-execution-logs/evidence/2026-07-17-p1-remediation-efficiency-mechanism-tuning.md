# P1 整改机制提速证据

日期：2026-07-17

任务：`p1-remediation-efficiency-mechanism-tuning-2026-07-17`

## Reading Evidence

status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true
Cost Calibration Gate remains blocked。

## Root-Cause Reproduction

Result: pass

- F-0132/F-0115 连续出现三类 scope-correction/guard hotfix，每次都要重新定义 base、branch、精确文件集、review contract 与 transition-only topology；重复设计成本高于实际最小修复。
- P1 完整 smoke 历史耗时约 9 分钟，Module pre-commit 约 3 分钟；开发循环若无分层会重复等待，但只跑快速矩阵又不能作为 closeout 证据。
- 普通 fixture/格式/报告整理曾触发与高风险安全设计相同的复核层级；disposable full checkout 还曾因 Windows long path 失败。
- 当前缺少一个统一入口，把 RC preflight、热修模板、smoke 分层、Subagent 门槛和 shared/sparse fixture 复用同时固定且明确禁止门禁降级。

## TDD Evidence

Result: pass

- 新 SOP 固定三态 preflight：`continue_product`、`governance_hotfix_first`、`hard_block_request_approval`，要求产品 RED 前先判断 allowlist correction。
- 热修模板固定一次性授权、单 parent、精确文件集、transition-only、唯一 review contract 与普通 SHA 漂移 hard-block。
- smoke 明确分为开发核心矩阵和 closeout 完整矩阵；核心层不得替代 commit/merge/push/closeout 证据。
- Subagent 仅对高风险设计、最终审查、跨边界安全复核强制；机械 fixture/格式/报告仍由本地门禁和主 Agent 自审兜底。
- disposable fixture 固定 `clone --shared --no-checkout`、fixed base、sparse checkout、case 隔离和 longpaths；不得减少任何拓扑负例。
- 第一轮 Module pre-push RED 证明旧 scope-correction 状态条件被机械误改；恢复旧路径后仍 RED，因为通用 closeout ancestor 抢先分类。最终仅对精确 transition topology 提高优先级，确保治理提交输出 transition-only ancestor 证据。

## Validation Results

Result: pass

- Windows PowerShell parser：6 个修改脚本通过。
- P1 完整 smoke：12 positive / 77 negative，`517.5s`，通过。
- Module pre-push 完整 smoke：首轮按预期 hard-block，修正状态条件与 transition 优先级后 `95s` 通过。
- Module pre-commit 完整 smoke：`195.7s` 通过。
- 实际 Module pre-commit 首轮因授权来源文本未满足既有 `current user message` 契约而 hard-block；在用户再次明确批准后，仅规范化该字段，P1/Module pre-commit 与 P0 baseline 随后通过。
- 旧 F-0115 scope-correction 状态条件恢复为 `in_progress`；本机制精确 slot 只接受 parent task `ready_for_closeout`。
- P1/Module pre-commit、P0 baseline 与 exact 11-file scope 在提交前最终通过。
- 两路独立只读对抗复核均 APPROVE，Critical/Important/Minor 均为 0。
- `git diff --check` 通过；state/queue、hook、产品、依赖、schema/migration、数据库、Provider、runtime/browser、P2、PR、force-push、deployment 均未修改。
