# 2026-07-08 AI Paper Knowledge Consumption

## Task Metadata

- Task ID: `ai-paper-knowledge-consumption-2026-07-08`
- Branch: `codex/ai-paper-knowledge-consumption-2026-07-08`
- Scope: AI组卷知识点参数在题源解析与组卷选择链路中的消费修复。
- Non-scope: UI、Provider、DB/schema/migration/seed/fixture、env、package/lockfile、授权/edition 语义、正式题/正式卷直接写入。

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-question-engine-and-paper-composition.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-repair-verification-and-implementation-plan.md`
- `src/server/services/ai-paper-route-source-resolution-service.ts`
- `src/server/services/ai-paper-route-plan-select-wiring-service.ts`
- `src/server/services/ai-paper-route-assembly-service.ts`
- `src/server/services/ai-paper-plan-and-select-service.ts`
- `src/server/contracts/route-integrated-provider-execution-contract.ts`
- `src/server/repositories/question-repository.ts`
- `src/server/validators/question.ts`
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/admin-ai-generation-local-contract-route.ts`
- `src/server/services/personal-ai-generation-learning-session-paper-source-resolver.ts`

## Current Gap Verification

- `resolveAiPaperRouteQuestionSources` 当前平台正式题查询固定传入 `knowledgeNodePublicId: null`，即使 `generationParameters.knowledgeNodeMode === "selected"` 且存在 `knowledgeNodePublicIds`。
- `assembleAiPaperFromPlan` 会按 exact / nearby / same_scope 降级选题；如果题源未先按已选知识点收窄，`same_scope` 可把无关知识点题目补入选卷结果。
- 企业训练快照当前 DTO 不携带知识点绑定字段，本任务不新增 schema 或训练快照结构，只保持企业来源边界不扩大。

## Implementation Plan

1. 先补红灯测试：
   - 题源解析在 selected 模式下必须排除非选中知识点平台题；
   - `includeDescendants=false` 时平台题查询必须按选中知识点逐项收窄并去重；
   - route plan/select wiring 不得用无关知识点题目补足 selected 组卷。
2. 修复 `ai-paper-route-source-resolution-service.ts`：
   - 对 selected 知识点范围生成平台题源查询；
   - 合并多次查询结果并按 public id 去重；
   - 根据 selected IDs 与可用 parent 映射执行 exact/descendant 过滤；
   - 保持 balanced / comprehensive / weak point priority 的原有全域题源行为。
3. 保持 Provider 不执行、DB 不连接、schema 不改、正式内容不直接写入。
4. 运行 targeted tests、lint、typecheck、diff、Module Run v2 gates。
5. 写脱敏 evidence 与 adversarial audit 后提交、合入、推送、清理。

## Risk Controls

- 不改变登录、角色、授权、edition 判断。
- 不新增账号、不读写 DB、不改 seed/fixture。
- 不改 Provider 调用链，不记录 prompt/payload/raw AI output。
- 不暴露内部数值 id、凭证、session、cookie、token、env、DB URL、原始数据行、完整题目/材料。
- 不改 `package.json` 或 lockfile。

## Self-Review Rounds

- Round 1: 用测试确认缺口真实存在，避免凭感觉修改。
- Round 2: 对修复后链路做反向复核，确认 selected/balanced、descendant/off-scope、个人/企业/内容/组织角色边界均不混淆。
- Round 3: 门禁前检查 diff、evidence、audit、任务指针和 allowedFiles，避免越界提交。
