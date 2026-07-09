# 2026-07-08 Organization AI Question To Training Draft

## 任务

- 分支：`codex/org-ai-question-to-training-draft`
- 阶段：五阶段企业 AI 训练闭环 Stage 3
- 目标：只处理企业高级版管理员 `AI出题` 结果复制到企业训练题目草稿后的结构化可见与可发布预填。

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- 相关代码：`AdminAiGenerationEntryPage`、`organization-training` contract/service/route/repository、admin AI generation result persistence、route-integrated structured preview contract。

## Requirement Mapping Result

- Mapped to `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`: organization admin AI出题 output remains organization-owned and must not write formal platform content.
- Mapped to `docs/01-requirements/advanced-edition/modules/04-organization-training.md`: enterprise training drafts and published versions are organization-owned training artifacts, not formal question/paper/mock exam artifacts.
- Mapped to `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`: this stage covers only AI出题 result materialization into enterprise training draft details and publish prefill.
- Mapped to `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`: AI出题 structured preview is the safe input for draft materialization; AI组卷 remains a later separated stage.
- No unresolved requirement conflict was found for using existing redacted result snapshot storage; if durable draft snapshot storage requires schema expansion, it remains outside this branch and must get separate approval.

## 范围

允许：

- 在已有 `admin_ai_generation_result.content_redacted_snapshot` 中保存组织训练专用的 AI出题题目草稿快照。
- 通过现有企业训练草稿 `sourceTaskPublicId` 回读该快照。
- 让企业训练草稿详情返回真实题目结构，答案/解析仍默认折叠。
- “继续配置”时用可用草稿详情预填发布表单。
- 补服务、路由、UI focused unit tests。

禁止：

- 不处理 AI组卷。
- 不改 DB/schema/migration/seed/fixture。
- 不新增依赖，不改 package/lockfile。
- 不执行 Provider，不读 env，不连 staging/prod。
- 不写正式 `question`、正式 `paper`、正式 `mock_exam`、正式 `exam_report`、正式 `mistake_book`。
- 不输出 Provider payload、raw prompt、raw AI output、完整题目/材料原文、内部数字 id、凭证/session/cookie/token/env/DB URL。

## 实现思路

1. RED：新增单测证明组织 AI出题结果复制后，企业训练草稿详情仍不可用/发布表单仍为空。
2. GREEN：
   - 增加组织训练题目草稿快照类型与解析函数。
   - AI出题本地合同持久化时，服务端从结构化预览生成组织训练安全快照。
   - admin AI result persistence 支持按 task public id 读取该快照。
   - 企业训练草稿详情 read model 接收 draft questions 后返回 `available`。
   - 企业训练 UI 在“继续配置”时拉取草稿详情并预填发布表单；无快照则保留原“继续配置”空表单。
3. 对抗审查：
   - 标准版组织管理员不可获得入口或数据。
   - 草稿快照只来自同组织 task 关联，不靠 UI 直传答案解析。
   - `evidence_status=none` 仍阻断发布，`weak` 仍需确认。
   - 发布仍只写企业训练版本快照，不写正式内容域。

## 验证

- `corepack pnpm@10.26.1 exec vitest run src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`
- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId org-ai-question-to-training-draft-2026-07-08`
- 合入 `master` 后重复 targeted tests、lint、typecheck、diff check、pre-push readiness。
