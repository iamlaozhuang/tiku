# AI Paper Knowledge Source Selection Evidence

## Requirement Mapping Result

- 矩阵行：`ai-paper-knowledge-source-selection-2026-07-08`
- 覆盖角色：personal advanced student；organization advanced employee；organization advanced admin；content admin。
- 覆盖范围：AI 组卷服务层本地正式题源选择，不跑 Provider。
- 需求映射：
  - AI 组卷继续只从正式题源本地选择，不生成最终题目正文、选项、答案或解析。
  - Provider 方案 section 未带 public id 时，服务层用用户提交的 `generationParameters.knowledgeNodePublicIds` 作为 section 知识点范围。
  - section 知识点范围为空时不再算 exact 命中，避免“空范围 = 精准匹配”。
  - 个人和内容后台仍只使用平台正式题；组织员工/管理员仍只额外使用同组织已发布训练快照。

## Changed Files

- `src/server/services/ai-paper-plan-and-select-service.ts`
- `src/server/services/ai-paper-plan-and-select-service.test.ts`
- `src/server/services/ai-paper-route-assembly-service.ts`
- `src/server/services/ai-paper-route-assembly-service.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-08-ai-paper-knowledge-source-selection.md`
- `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-control-matrix.md`

## Validation

- `npm.cmd exec -- vitest run src/server/services/ai-paper-plan-and-select-service.test.ts src/server/services/ai-paper-route-assembly-service.test.ts src/server/services/ai-paper-route-source-resolution-service.test.ts src/server/services/ai-paper-source-adapter-service.test.ts`：pass，4 files，19 tests。
- `npm.cmd run lint`：pass。
- `npm.cmd run typecheck`：pass。
- `git diff --check`：pass。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-paper-knowledge-source-selection-2026-07-08`：pass。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-paper-knowledge-source-selection-2026-07-08 -SkipRemoteAheadCheck`：pass。

## Redaction And Safety

- 未连接 DB，未读取或写入 DB rows。
- 未执行 Provider-enabled 调用，未记录 Provider payload、raw prompt 或 raw AI output。
- 未读取 env 值，未记录凭证、cookie、session、token、localStorage 或 Authorization header。
- 未读写 rawfiles，未记录完整题目、试卷、材料或资源正文。
- 未改 package/lockfile、schema/migration/seed/fixture。
