# P1 F-0117 Smoke Scope-Correction Guard Hotfix Evidence

## Reading Evidence

status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true
Cost Calibration Gate remains blocked.

已完整读取 `AGENTS.md`、代码品味十诫、ADR-001 至 ADR-007、任务 brief、当前 state/queue，以及既有 F-0117 spec-transition exact one-time guard pattern。

## Root-Cause Reproduction

Result: pass

- 根因：F-0117 产品任务的 `allowedFiles` 未包含既有 migration source smoke，导致后续只能通过越权修改或放宽普通路径继续，两者均不可接受。
- RED（均为预期 exit 1，既有 fixture 尚未运行失败）：
  - `Test-P1RemediationSerialProgram.Smoke.ps1`：缺少新 task/file-set/anchor/marker。
  - `Test-ModuleRunV2PreCommitHardening.Smoke.ps1`：缺少 exact 12-file admission。
  - `Test-ModuleRunV2PrePushReadiness.Smoke.ps1`：缺少 exact-one-parent transition topology。
- 900 秒 P1 smoke 为外部 timeout 中断，不是测试 finding；同一命令以 1800 秒 timeout 完整复跑并 exit 0。

## TDD Evidence

Result: pass

- RED 先于生产守卫修改；三套 smoke 均先精确因新 contract 不存在而失败。
- GREEN 仅沿用既有 exact one-time pattern，新增固定 task/base/branch/parent/file-set 与专属诊断。
- 未抽象新机制，未修改 generic ancestor fallback，未放宽普通 `in_progress` SHA drift。
- 新 fixture 覆盖 wrong base/branch/task/status、missing state、missing queue、missing/extra file、state/queue 额外 delta、authorization 缺失/重复/篡改、standard mode、replay、多父提交、普通 SHA drift，以及把产品 smoke 内容夹入治理提交。

## External Review Remediation

Result: pass

- 外部独立审查初判 `Task quality: Needs fixes`：P1 与 Module pre-commit candidate 错误地同时要求 state、queue 和 identity，导致 missing state/queue 只能落入通用 finding；fixture cleanup 还用 `-ErrorAction SilentlyContinue` 吞错。
- 补充 missing state/queue 负例后取得预期 RED：pre-commit 和 pre-push 均缺少 `P1_PROGRAM_F0117_SMOKE_SCOPE_CORRECTION_ALLOWLIST_MISMATCH`，只输出通用 findings。
- 最小修复把 candidate 识别收窄为任一专属 identity 文件命中；phase 及现有排他上下文保持不变，exact 12-file set 继续负责缺失 state/queue 的专属 hard-block。
- 清理改为系统 temp 直系子目录与精确 `tf117pc-xxxxxxxx`、`tf117sp-xxxxxxxx`、`tf117pp-xxxxxxxx` 名称校验，最多 3 次短重试，最终残留抛出专属 cleanup failure，不再静默。
- 首轮 GREEN 揭示旧长根 fixture 含 7,812 项、最长路径 287 字符，触发 `F0117_SMOKE_SCOPE_PRECOMMIT_CLEANUP_FAILED`；缩短根名后 focused cleanup proof 3/3 通过，pre-commit full smoke 通过。
- pre-push missing-state 首轮 GREEN 仅输出 `CONTEXT_INVALID`；保留该 RED 后，仅将 committed exact file-set 校验前置于 context，未删除或放宽任何 context 条件。missing state/queue 现在同时得到 P1 `ALLOWLIST_MISMATCH` 与 Module `FILE_SET_INVALID`，wrong context 仍得到 `CONTEXT_INVALID`。
- 独立 reviewer 对修正后快照 `8ed6dc3` 完成最终复审：`Task quality: Approved`，Critical/Important/Minor 均为 0；原 Important 与 Minor 已按最小范围解决，未扩大普通产品任务或 generic ancestor fallback 的授权面。

## Exact Projection

- `project-state.yaml` 仅把三个 repository checkpoint SHA 从 `366f17446e9fc75a777ebfe5977ad72db1062eb7` 投影到 `3e3c400fe3cc7d41b476d9a5d37b1cc9c52f3e5a`。
- `task-queue.yaml` 仅在 F-0117 migration source test 后加入 `tests/unit/p1-employee-import-command-migration-source.test.ts`。
- task status、execution gate、finding、capability、closeoutPolicy 和其他 allowlist 未变。

## Negative Matrix

| Case                                                            | Expected disposition                                       |
| --------------------------------------------------------------- | ---------------------------------------------------------- |
| wrong base / branch / task / status                             | F-0117 smoke scope-correction dedicated context hard-block |
| missing state / missing queue                                   | P1 allowlist + Module exact file-set hard-block            |
| missing / extra other governance file                           | exact file-set hard-block                                  |
| state / queue extra delta                                       | dedicated projection hard-block                            |
| authorization missing / duplicate / tampered field or file list | dedicated authorization hard-block                         |
| standard mode                                                   | dedicated transition-only hard-block                       |
| replay                                                          | dedicated replay/materialized hard-block                   |
| multi-parent commit                                             | dedicated topology hard-block                              |
| ordinary unrelated `in_progress` SHA drift                      | generic repository SHA drift remains hard-blocked          |
| product smoke content bundled into governance commit            | exact file-set hard-block                                  |

## Validation Results

Result: pass

- PowerShell parser：6/6，exit 0。
- Module pre-commit full smoke：最终 exit 0，446.6 秒；missing state/queue 双守卫专属 finding 与短根 cleanup 均通过。
- Module pre-push full smoke：最终 exit 0，339.5 秒；missing state/queue file-set、wrong context、transition topology 与短根 cleanup 均通过。
- P1 full smoke：最终 exit 0，965.6 秒；`15 positive, 81 negative`，并串行执行共享新 fixture。
- 首次精确 stage：12/12 个治理文件，unstaged/untracked 均为空。
- P1 staged candidate：exit 0；输出 `p1F0117SmokeScopeCorrectionAuthorization: approved_one_time`、`p1ProgramGuardResult: pass`、`p1TransitionScopeMode: standard`。`pre_commit` 校验的是尚未物化为提交的 index；`transition_only` 与单父拓扑由 pre-push fixture 覆盖。
- P0 global baseline：exit 0；`p0GlobalBaselineResult: pass`、`programStatus: closed`。
- Module staged candidate：exit 0；`preCommitScopeMode: p1_f0117_smoke_scope_correction`、`filesToScan: 12`、`pre-commit hardening passed`。
- `git diff --check`：exit 0。
- `npm.cmd run format:check` 首轮精确指出本 evidence 与 task plan 两个新 Markdown 文件格式不合规；仅对这两个文件运行项目既有 Prettier 后复跑，exit 0，未改依赖或其他文件。

## Scope Freeze

- 产品 smoke 文件内容未修改；其路径只作为 queue allowlist 数据与 negative fixture probe 出现。
- 无产品、schema、migration、依赖、lockfile、数据库、Provider、runtime/browser、P2 或远端动作。
- 本子任务未执行 Git commit、merge、push 或 worktree cleanup。
- 历史 6 个 `tiku-f0117-smoke-scope-precommit-*` 残留未作为 GREEN 输入。主线程随后先验证其 resolved path 全部是 system temp 直系子目录且严格匹配 `tiku-f0117-smoke-scope-precommit-[0-9a-f]{32}`，再在同一 PowerShell 进程使用 .NET extended path 删除；`removed=6/6`，`remainingCount=0`。
