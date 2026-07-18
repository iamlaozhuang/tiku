# P1 F-0116 Design Path Guard Hotfix Evidence

## Reading Evidence

status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true

Cost Calibration Gate remains blocked.

已读取 P1 task transition allowlist、transition-only 输出条件、Module ancestor checkpoint 拓扑，以及 F-0132/F-0115 exact hotfix 正负 fixture。

## Root-Cause Reproduction

Result: pass

当前 P1 transition 只允许 scope control、`planPath`、`evidencePath`、`auditReviewPath` 与 `freshApprovalSource`。F-0116 task 已显式声明且 allowlist 冻结的 `designPath` 仍被归类为 implementation change，稳定复现 `P1_PROGRAM_TRANSITION_FILE_SCOPE_INVALID` 和 `P1_PROGRAM_TRANSITION_CONTAINS_IMPLEMENTATION_CHANGE`。

## TDD Evidence

Result: pass

- RED 1：完整 P1 smoke 稳定报 `P1_PROGRAM_TRANSITION_FILE_SCOPE_INVALID next-design.md` 与 implementation change。
- GREEN 1：当前 task 合法、平铺的 `docs/superpowers/specs/<name>.md` designPath 正例通过；未声明规格、nested、traversal、absolute outside 与 `designPath: src/**` 负例继续 hard-block。
- RED 2：三套 smoke 的新 exact-hotfix contract 在生产 marker 缺失时立即失败。
- GREEN 2：精确十文件 P1/Module bridge 生效；Module pre-push 的同一 exact commit 在 `standard` 模式报 `HARD_BLOCK_P1_F0116_DESIGNPATH_HOTFIX_REQUIRES_TRANSITION_ONLY`，`transition_only` 才输出 exact-one-parent，额外 replay 再次失败。

## Validation Results

Result: pass

- 6 个 PowerShell parser：pass。
- P1 完整 smoke：pass，`12 positive, 77 negative`。
- Module pre-commit 完整 smoke：pass。
- Module pre-push 完整 smoke：pass。
- 合法平铺 designPath、未声明/nested/traversal/outside design、产品路径伪装、exact one-parent、standard-mode rejection、replay 与普通 SHA 漂移均在对抗矩阵中覆盖。

## Round 1

Result: pass

第一性原理复核：规格文件只有在当前 task 以单一 scalar 显式声明、canonical 位于仓库内、无 `..` 且匹配平铺 `docs/superpowers/specs/<name>.md` 时才属于治理 artifact；其他路径仍是 implementation change。

## Round 2

Result: pass

独立治理复核确认 exact 十文件、固定 base/branch/parent/status、parent 不含授权、INDEX/HEAD 一致、单 parent、transition-only 与 Module 独立 topology 均保留。`standard`、重放、额外提交、额外文件和普通 `in_progress` SHA drift 不获 ancestor checkpoint。

## Security and Boundary Result

Result: pass

未扩大 state/queue、产品、依赖、schema/migration、数据库、Provider、runtime/browser、P2、PR、force push 或 deploy 权限；未修改 pre-push hook 编排。
