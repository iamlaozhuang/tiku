# 最小安全内核退役实施计划

> 本任务由用户在委托线程 `019f6e05-5ceb-7502-be59-1be5f4ab6e2d` 明确批准；禁止 Subagent，禁止在机制完整 closeout 前开始 F-0009 产品 RED。

## 目标与架构

- 任务 ID：`minimal-safety-kernel-retirement-2026-07-20`
- 分支：`codex/minimal-safety-kernel`
- 目标：把普通任务的强制执行面从按 finding/task/SHA/files 硬编码的多层状态机，原子替换为单一、数据驱动、可测试的最小安全内核。
- 架构：`.husky/pre-commit`、`.husky/pre-push` 只调用 `Test-MinimalSafetyKernel.ps1`；任务目标、精确允许文件和验收命令由一个通用 JSON 合同声明。`project-state.yaml` 与 `task-queue.yaml` 只保留排期、恢复和 WIP=1，不再作为提交授权状态机。
- 技术栈：PowerShell、Git、Husky、现有 npm/pnpm 工具；不新增依赖。

## R0 读取证据

已读取：

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- ADR-001 至 ADR-007
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/lean-module-run-v3-governance.md`
- `docs/04-agent-system/sop/mechanism-tuning-authorization-and-slimming-plan.md`
- `docs/04-agent-system/sop/p1-approved-same-task-transition.md`
- `docs/04-agent-system/sop/p1-remediation-efficiency-loop.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- Husky 三个 hook、P1/P0/Module guard 与 smoke 的入口、函数/常量/调用和结论面
- 2026-07-17 至 2026-07-19 机制 evidence/audit 与失败热修历史
- 失败候选补丁只读盘点；SHA-256 为 `dda7679091ed785a4b9d4eb0a6a1fed8467cb0998682e6bb79ee6dda602f2733`，与委托一致。该补丁新增 757 行、删除 40 行，并再次为 F-0009/task/base SHA/files 增加专属分支，因此仅作为失败证据，不应用。

## 真实强制链

```text
AGENTS / operating manual / SOP
  -> .husky/pre-commit
     -> ContentAdmin guard -> recovery guard -> P0 guard -> P1 guard
     -> Module pre-commit guard -> lint-staged
  -> .husky/pre-push
     -> ContentAdmin guard -> recovery guard -> P0 guard -> P1 guard
     -> P1 transition mode分流 -> Module pre-push guard
  -> .husky/post-commit -> Module post-commit advisory
  -> guards读取 state/queue + task plan/evidence/audit + exact task/finding/SHA/file constants
  -> 每个 guard 再由独立 smoke 重复覆盖同一合同
```

当前八个 P1/P0/Module 主 guard/smoke 合计 `17,554` 行、`1,122,213` 字节。P1 主 guard 单文件 4,089 行，包含 55 个 task/finding/SHA 专属标识；失败候选继续扩张同一模式，证明根因是运行时编排结构而非缺少下一个例外。

## 设计取舍

1. **选用：单一通用内核。** 一份任务合同、一份 guard、一份 characterization smoke；hook 不再按 Program/finding 分流。优点是执行路径短、无 per-finding 代码、普通任务不改脚本；代价是放弃候选内容的密码学式自证，改由精确 diff、实际命令和主线程审查共同保证。
2. **拒绝：继续裁剪三套旧 guard。** 即使抽公共 helper，仍保留 P1/P0/Module 三次判定与 transition 双轨，无法消除适配热修。
3. **拒绝：纯文档清单。** 不能对直接 master、额外文件、失败测试、未授权 push 和高风险文件形成可执行硬阻断。

## 必须保留的最小安全内核

- pre-commit：拒绝 `master/main`；任务合同必须有非空目标、精确 `allowedFiles`、验收命令；实际 staged/unstaged/untracked diff 必须精确落在 allowlist；运行验收命令；产品 TypeScript 变更必须声明并运行 `test`、`lint`、`typecheck` 三类命令；`git diff --check` 必须通过。
- 高风险：依赖、数据库/schema/migration、权限/授权、部署、secret/env 的受保护路径必须有对应 fresh approval source；否则硬阻断。
- pre-push：只允许显式环境授权下推送 `origin/master`；拒绝非 master、非 fast-forward、脏工作区和一任务多提交。
- closeout：验证 `master == origin/master`、工作区 clean、无残留短分支和额外 worktree。
- Git：一任务一提交、ff-only、远端同步、清理保持硬约束。
- 审查：普通任务一次主线程对抗式审查；高风险变更仍须 fresh approval，是否独立审查由风险而非任务 ID 决定。

## 从普通任务强制路径退役

- finding/task/base SHA/exact files 的脚本硬编码。
- state/queue transition 作为 commit/push 授权机。
- ContentAdmin/P0/P1/Module 多套 hook guard 对同一范围、拓扑、证据的重复判断。
- 普通低风险任务的 plan/evidence/audit 三件套；以后只需通用任务合同，复杂或高风险任务才保留计划/证据。
- freshness key、同 SHA 重复 full smoke、transition-only 分流和重复 closeout 编排。
- 旧脚本、旧 smoke、历史 evidence/audit 保留只读，不删除、不改写；从 hook 入口解除并在索引标记 superseded。

## 冻结文件范围

### allowedFiles

1. `AGENTS.md`
2. `.husky/pre-commit`
3. `.husky/pre-push`
4. `.husky/post-commit`
5. `docs/04-agent-system/operating-manual.md`
6. `docs/04-agent-system/sop/minimal-safety-kernel.md`
7. `docs/04-agent-system/sop/task-lifecycle-governance.md`
8. `docs/04-agent-system/sop/automation-loop.md`
9. `docs/04-agent-system/sop/lean-module-run-v3-governance.md`
10. `docs/04-agent-system/sop/mechanism-tuning-authorization-and-slimming-plan.md`
11. `docs/04-agent-system/sop/p1-approved-same-task-transition.md`
12. `docs/04-agent-system/sop/p1-remediation-efficiency-loop.md`
13. `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
14. `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
15. `docs/04-agent-system/state/project-state.yaml`
16. `docs/04-agent-system/state/task-queue.yaml`
17. `docs/04-agent-system/state/task-safety.json`
18. `docs/05-execution-logs/task-plans/2026-07-20-minimal-safety-kernel-retirement.md`
19. `scripts/agent-system/Test-MinimalSafetyKernel.ps1`
20. `scripts/agent-system/Test-MinimalSafetyKernel.Smoke.ps1`

### blockedFiles

- `package.json`、所有 lockfile、workspace 配置和新增依赖。
- `src/**`、`tests/**`、`e2e/**` 产品与产品测试源码。
- `src/db/**`、`drizzle/**`、`migrations/**`、`seed/**`、数据库执行。
- `.env*`、secret、provider、cloud、deploy、PR、force-push。
- 历史 evidence、audit、acceptance、旧 guard/smoke 内容；它们只读保留。
- F-0009 产品代码、测试与 RED 命令。

允许范围在本文件落盘后冻结；需要新增文件即停止，不做兼容热修。

## 风险与防御

- **自我退役被旧 hook 拦截**：先使用候选 hook 的正常 pre-commit 路径；不使用 `--no-verify`。若旧机制是唯一障碍且无法通过通用路径解决，停止并请求唯一 escape hatch。
- **任务合同自扩权**：合同变化也必须在 `allowedFiles` 中，主线程审查合同与实际 diff；高风险路径另有固定类别阻断。
- **命令注入**：验收命令以 JSON `executable + arguments[]` 表示，不经 shell 字符串求值。
- **安全退化**：characterization 负例覆盖产品文件夹带、未授权高风险、direct master、额外文件、失败测试、push 未授权、残留 worktree。
- **双轨残留**：同一提交同时替换 hook、规范、SOP 和索引；旧 guard 不再从正常入口调用。
- **范围膨胀**：不新增 workflow engine、缓存、freshness、transition 或 per-finding 常量。

## RED / GREEN 实施步骤

### Task 1：characterization RED

- [x] 新建 `Test-MinimalSafetyKernel.Smoke.ps1`，以临时 Git 仓库覆盖一个普通低风险正例和七类规定负例。
- [x] 运行 focused smoke，确认因 `Test-MinimalSafetyKernel.ps1` 缺失而 RED，且不是 fixture/parser 错误。

命令：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-MinimalSafetyKernel.Smoke.ps1 -Profile focused
```

预期：非零；明确报告最小内核尚不存在。

### Task 2：最小 GREEN

- [x] 新建单一内核，读取通用 JSON 合同，安全执行数组命令，检查 branch/diff/high-risk/push/closeout。
- [x] 新建任务合同并运行 focused smoke，目标 `< 180s`。
- [x] 仅在 GREEN 后整理重复 helper，保持新增机制代码明显少于退役入口的 17,554 行。

### Task 3：原子切换

- [x] 修改三个 hook，只保留 lint-staged + 单一内核入口。
- [x] 新建最小 SOP，精简 AGENTS/operating manual；将旧 SOP、索引条目标记为 superseded/read-only。
- [x] 更新 state/queue 的当前机制任务与 P1 resume anchor，但不再增加 transition 授权字段。

首轮候选冻结于 `2026-07-20T10:27:23.2116201-07:00`。首轮 characterization RED 为 1 次（311ms，因生产内核缺失）；
GREEN 前完成 fixture 纠正，随后 focused 稳定低于 14 秒。对抗审查又固定并修复了两类真实缺口：验收命令不可借
`kind` 字段伪装 test/lint/typecheck；smoke 在真实 Git hook 内不得继承 `GIT_DIR`/`GIT_INDEX_FILE` 并误操作调用方仓库。
新内核与 smoke 最终共 775 行，低于退出普通运行入口的 17,554 行；20 个实际 changed files 与 20 个冻结
allowedFiles 完全一致。

首次真实 `git commit` 未绕过 hook，lint-staged 通过后，focused smoke 因 Git 局部环境泄漏失败。失败未产生提交；
共享仓库被 fixture 写入的 `core.bare=true` 和 smoke identity 已恢复为 `core.bare=false`、仓库原身份，暂存区完整。
修复后用独立 sentinel 仓库模拟 hook 环境，前后 config SHA-256 一致，证明 fixture 不再污染调用方仓库。

### Task 4：代码冻结后的 full profile

- [x] 最终候选 full characterization GREEN：16.087s；包括 pre-commit、pre-push、clean-master/closeout 临时仓库演练。
- [x] P0 global baseline：`pass`；P0 serial program：`pass_closed_program`。
- [x] scoped Prettier、PowerShell parser、`git diff --check`、diff/删增量、敏感内容与 task 专属常量扫描通过。
- [x] 首轮主线程内部审查完成并新增 Git 环境隔离与 validation kind 语义校验；后续 R3 对抗式复核仍发现四项阻断，见 Task 6。

完整命令：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-MinimalSafetyKernel.Smoke.ps1 -Profile full
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationSerialProgram.ps1 -Phase manual
.\node_modules\.bin\prettier.cmd --check AGENTS.md docs/04-agent-system/operating-manual.md docs/04-agent-system/sop/minimal-safety-kernel.md docs/04-agent-system/sop/task-lifecycle-governance.md docs/04-agent-system/sop/automation-loop.md docs/04-agent-system/sop/lean-module-run-v3-governance.md docs/04-agent-system/sop/mechanism-tuning-authorization-and-slimming-plan.md docs/04-agent-system/sop/p1-approved-same-task-transition.md docs/04-agent-system/sop/p1-remediation-efficiency-loop.md docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md docs/04-agent-system/state/mechanism-source-of-truth-index.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/task-safety.json docs/05-execution-logs/task-plans/2026-07-20-minimal-safety-kernel-retirement.md
git diff --check
```

本会话累计 focused 17 次（9 次 GREEN、8 次 RED/fixture 失败），full 4 次（3 次 GREEN、1 次 fixture 原因失败）；
每次 full 对应代码或 fixture 已变化的新候选，同一候选未重复 full。最终候选 focused 12.597s、full 16.087s，
均低于 3 分钟目标；从 90 分钟起点到最终代码冻结为 24 分 41 秒。

### Task 5：提交边界

- [x] stage 精确 20 个 allowed files，运行真实 pre-commit。
- [x] 形成本地提交 `2336bedb7`：`refactor(governance): replace guards with minimal safety kernel`。
- [x] 未获得 fresh merge/push 授权，停在本地分支；未使用 `--no-verify`。

`2336bedb7` 未共享、未合入、未推送。R3 对抗式复核发现四项阻断，因此该 SHA 仅是待 amend 候选，不能视为 R3
完成：验证命令执行后的 candidate identity 未重检；路径规范化错误剥离 leading dot；高风险批准可由合同自声明；
pre-push 未绑定 canonical origin URL 与 hook stdin SHA。

### Task 6：R3 阻断项限界修复

- [x] 四个独立 review characterization 在生产修复前均 RED，且失败原因分别命中 candidate mutation、leading-dot
      path、高风险自授权和错误 push URL 被旧候选放行。
- [x] 验证前后核对 HEAD、staged tree、name-status、完整 worktree status 与 changed-file identity；验证新增 staged
      文件、改写同路径 staged 内容或制造 untracked 文件均 fail closed。
- [x] 只移除精确 `./` 前缀，保留 `.github`/`.env`；拒绝绝对路径、盘符、空路径段和 `..` 逃逸。
- [x] 合同 approval ID 不产生权限；外部进程 token 必须同时绑定 approval ID、task ID、risk 和 staged tree。
- [x] pre-push 将 hook URL、configured origin 与 candidate-external `tiku.canonicalOriginUrl` 归一化核对，并将唯一
      master update 的 local SHA/remote old SHA 分别绑定 `HEAD`/`origin/master`。
- [x] 冻结修复候选，仅运行一次新的 full；随后运行 P0 baseline、P0 serial、format/parser/diff 检查。
- [x] amend 为新的单一提交并停下等待再次对抗复核；禁止 merge、push、cleanup 和 F-0009 RED。

RED 命令均为以下形式，`ReviewCase` 分别取 `candidate_mutation`、`path_boundary`、`external_approval`、
`push_binding`；四次退出码均为 1：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-MinimalSafetyKernel.Smoke.ps1 -Profile focused -ReviewCase <review_case>
```

RED 证据：旧候选分别错误放行 `smuggled.md` 被 validation staged、`.github/workflows/check.yml`、合同内非空 approval
字符串和 `https://example.invalid/wrong.git`。最小 GREEN 后四组定向用例分别为 3、5、5、5 个，退出码均为 0；
其中 approval 负例分别攻击 task、risk、candidate tree 绑定，push 负例分别攻击 URL、local SHA、remote old SHA 和
目标 ref。

修复候选于 `2026-07-20T10:54:10.1449715-07:00` 冻结。冻结前 focused 汇总为 29 个用例、退出码 0、37.056s；
candidate-external canonical origin 已写入本地 Git config，值与当前 `remote.origin.url` 一致，未写入候选 diff。

冻结后的唯一新 full 命令为：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-MinimalSafetyKernel.Smoke.ps1 -Profile full
```

结果：33 个用例、退出码 0、41.808s。随后 P0 global baseline 为 `pass`、退出码 0、1.527s；P0 serial 为
`pass_closed_program`、退出码 0、1.160s；PowerShell parser errors 为 0，`git diff --check` 退出码 0，合计
0.677s。首次 scoped Prettier check 因本计划新增段落格式退出 1（0.881s），只对本计划执行 Prettier write 后
复检退出 0（0.992s）；生产脚本与 full 覆盖的行为未在 full 后修改，未重复 full。

## 产品恢复锚点

- 原 P1 Goal：保持 `in_progress`，不关闭、不替换。
- 下一 finding：`F-0009`。
- 下一拟定任务：`p1-remediation-rc-03-org-auth-closure-actions-2026-07-20`。
- 产品 RED：尚未开始；机制完整 closeout 前保持未开始。
- 失败候选补丁和 candidate tree 不作为实现基线。

## 预算、回滚与唯一停止条件

- 90 分钟 focused GREEN 起点：`2026-07-20T10:02:42.1317344-07:00`。
- focused 目标：单次 `< 180s`。
- full：代码冻结后同一候选最多一次。
- 回滚点：基线 `fd696676c7cb85aad208bb9df70a020b3c1467be`；未提交时可删除本任务新增文件并恢复本任务精确 diff，禁止影响其他路径。
- 唯一 stop condition：在 90 分钟内无法取得 focused GREEN，或取得 GREEN 必须扩大冻结范围、引入依赖/数据库/schema/产品源码/部署/secret/env、降低质量门禁、写入 per-finding/task/SHA 例外、使用 hook bypass；届时只报告一个根因 blocker。

## 计划自审

- 规格覆盖：R0–R3、安全内核、退役项、对抗负例、预算、回滚、产品 anchor 均有对应步骤。
- 无 `TBD`、`TODO` 或占位实现。
- 名称一致：生产脚本 `Test-MinimalSafetyKernel.ps1`，smoke `Test-MinimalSafetyKernel.Smoke.ps1`，合同 `task-safety.json`。
- 无新增依赖、产品源码、数据库/schema、部署、secret/env 或 F-0009 专属实现。
