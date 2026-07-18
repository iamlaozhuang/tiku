# P1 RC-02 员工导入服务端预检设计任务方案

日期：2026-07-17

任务：`p1-remediation-rc-02-employee-import-preflight-2026-07-17`

分支：`codex/p1-rc02-employee-import-preflight`

工作树：`D:/tiku/.worktrees/p1-rc02-employee-import-preflight`

## 目标

在不写产品代码的前提下，物化用户已批准的 F-0116 方案 A，关闭 F-0115 状态并建立 F-0116 WIP=1 设计阶段。设计提交完成后等待用户书面规格复核，再编制实现计划。

## 已读取规范

- `AGENTS.md`、品味十诫、ADR-001 至 ADR-007、requirement SSOT reading governance。
- 标准/高级版需求索引、管理员运营 module/story、edition-aware authorization、advanced ops authorization/quota module/story。
- `2026-07-02-ops-authorization-ui-ux-contract.md`、role/auth/ops decision package、CT-REQ-002/003/009/010/011/012/022/051/054/058。
- 2026-07-07 UI/UX source entry、全角色 baseline、batch 0 与 batch 1。
- F-0116 ledger/post-P0 map、F-0115 evidence/audit、当前 UI/parser/command/service/repository/tests。

## 精确设计阶段范围

本提交只允许：

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- 本 task plan、evidence、audit
- `docs/superpowers/specs/2026-07-17-employee-import-server-preflight-design.md`

产品源码、测试、实现计划在用户复核规格前必须零 diff。

## 实施顺序

1. 将 F-0115 从 `ready_for_closeout` 转为 `closed`，补齐五项 closeout checkpoint。
2. 物化 F-0116 design-stage task，固定 branch/worktree、allowedFiles、blockedFiles、验证命令与 stop conditions。
3. 写入已批准的方案 A 规格，明确 server parser、逐行 preflight、preview revision、JIT confirmation、UI 与 RED 矩阵。
4. 运行 P1 transition、P0、Module pre-commit，提交并通过真实 pre-push transition-only topology。
5. 等待用户复核已提交规格；复核前不调用 writing-plans、不写产品代码。

## 风险防御

- 其他 `in_progress` SHA drift 继续 hard-block；ancestor checkpoint 只接受通过 transition-only 的单父治理提交。
- 不把 preview revision 当作鉴权或事务边界；最终安全事实仍由 F-0115 repository JIT 锁与校验决定。
- 不通过前端 parser parity、客户端缓存或降级 negative matrix 伪造关闭。
- schema/migration/dependency/database/Provider/browser/runtime/P2/PR/force-push/deploy 均阻断。

## Stop Conditions

- transition guard 未识别精确 state/queue 拓扑；
- 规格复核未获用户批准；
- 设计需要持久 preview 表、migration、外部 cache 或真实 DB；
- allowlist 无法覆盖最小实现且需要独立 scope-correction。
