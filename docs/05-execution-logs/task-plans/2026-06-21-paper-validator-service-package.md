# Paper Validator Service Package

## 任务目标

实现 `paper` 题量硬规则的本地 validator/service 闭环：

- draft `paper` 允许 0 到 100 题。
- publish `paper` 允许 1 到 100 题。
- 第 101 题必须被拒绝。

## 已读取规范

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-06-21-paper-question-count-and-type-policy.md`

## 实现思路

1. 在 `src/server/validators/paper-draft.ts` 增加题量规则的纯函数与常量，集中表达 draft/publish 边界。
2. 在 `paper-draft-service` 的 add/publish/copy 边界调用题量规则，避免第 101 题进入 draft 或 publish。
3. 为 validator 写直接单元测试，为 service 写 RED/GREEN 行为测试。
4. 不修改 schema、migration、repository、数据库连接、e2e、dev server、依赖或 lockfile。

## TDD 顺序

1. RED: validator 测试覆盖 draft 0/100/101 和 publish 0/1/100/101。
2. RED: service 测试覆盖第 101 题 add 被拒绝、101 题 publish 被拒绝。
3. GREEN: 实现纯 validator 和 service 调用。
4. REFACTOR: 仅整理命名和复用，不改变行为。

## 验证命令

- `npm.cmd run test:unit -- src/server/validators/paper-draft.test.ts src/server/services/paper-draft-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check src\server\validators\paper-draft.ts src\server\validators\paper-draft.test.ts src\server\services\paper-draft-service.ts src\server\services\paper-draft-service.test.ts src\server\contracts\paper-draft-contract.ts docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-21-paper-validator-service-package.md docs\05-execution-logs\evidence\2026-06-21-paper-validator-service-package.md docs\05-execution-logs\audits-reviews\2026-06-21-paper-validator-service-package.md`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId paper-validator-service-package`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId paper-validator-service-package -SkipRemoteAheadCheck`

## 风险防御

- Evidence 不记录完整 paper 内容、私有答案、内部自增 ID、publicId 清单、密钥、token、数据库 URL、Provider payload 或 raw prompt。
- 当前任务只声明本地 validator/service/unit 通过，不声明强 runtime acceptance。
