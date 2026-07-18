# F-0115 Module pre-commit 治理热修证据

日期：2026-07-17

任务：`p1-f0115-module-precommit-hotfix-2026-07-17`

## Reading Evidence

status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true
Cost Calibration Gate remains blocked。

## Root-Cause Reproduction

Result: pass

- 固定 base：`1fd9906992c567368044a8ede98eaee840a0b1fa`；分支：`codex/p1-f0115-module-precommit-hotfix`。
- 在 F-0115 产品 worktree 的 exact 50-file staged set 上，旧 Module pre-commit 产生 9 个确定性误报：3 个 Next 动态目录 `[publicId]` 被 PowerShell `-like` 当作 character class；其余为 plan-only loopback database URL、源码 identifier/SQL expression 与测试 fixture assignment。
- 第一轮 GREEN 后真实 staged set 仍在 `postgres-employee-import-command-repository.test.ts:2191` 对 password 字段绑定 `passwordHash` 且尾随逗号的形态误报；根因是 assignment capture 含尾随 TypeScript 逗号。新增该形态 smoke，并只规范化源码表达式的语法尾界符。
- 真实 secret、Bearer/private key/provider key、非 fixture database URL、越界路径和未授权 SHA drift 未获得豁免。

## TDD Evidence

Result: pass

- 路径：`[publicId]` literal 正例、`[other]` 越界负例与 `*` wildcard 正例。
- 敏感值：仅 bare 源码 identifier（含尾随逗号）、当前 assignment 自身无 quoted literal 的 SQL expression、精确 `placeholder-password-hash-{1,2}` / `Bearer admin-session-token` sentinel 与精确 plan-only loopback tuple 为正例。
- 对抗负例：quoted password/token、伪 `test-` 前缀、SQL 内 quoted literal（含紧邻 backtick 与前置空白）、safe SQL 后第二个恶意 SQL、同一行第二个普通 secret、真实 database URL 与 localhost `test_*` database URL 均继续 hard-block。
- review contract：P1 与 Module 均要求 Reading Evidence/三段结果/Round 1/Round 2/Decision 各唯一，且拒绝任意 `Result: fail`、`Decision: REJECT`、重复 heading/pass。
- transition：固定 base/branch/单 parent/精确 10 文件为一次性 `transition_only`；extra commit replay 与普通 `in_progress` SHA drift 继续 hard-block。
- Windows PowerShell 5 fixture 曾因无 BOM UTF-8 中文句号解析失败；仅将 fixture 文本标点改为 ASCII。disposable clone 曾因完整 checkout 长路径失败；改为与既有测试一致的 sparse checkout，并补齐 P1 frozen SSOT 三文件读取面。

## Validation Results

Result: pass

- Windows PowerShell parser：6 个修改脚本全部通过。
- `Test-P1RemediationSerialProgram.Smoke.ps1`：最终加固后通过，`12 positive, 77 negative`，`551.2s`；预期 contradiction fixture 同时被 P1 与 Module guard hard-block。
- `Test-ModuleRunV2PreCommitHardening.Smoke.ps1`：最终自托管载荷拆分后通过，`203.4s`；运行时仍生成原始恶意 assignment/URL，smoke 源码不直接携带被测凭据形态。
- `Test-ModuleRunV2PrePushReadiness.Smoke.ps1`：通过，`89s`。
- 使用热修脚本对产品 worktree exact 50-file staged set 运行 Module pre-commit：scope 50/50、sensitive scan、terminology scan 全部通过，`4.3s`。
- 两轮最终独立只读复核均为 APPROVE，Critical/Important/Minor 均为 0。
- `git diff --check`：通过。
- 修改面保持精确 10 个授权文件；未修改 project-state/task-queue、产品源码、依赖、schema/provider/runtime、P2、deploy 或远端配置。
