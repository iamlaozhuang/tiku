# P0 RC-05 Evidence

Date: 2026-07-15

Task: `p0-remediation-rc-05-knowledge-resource-rag-citation-2026-07-14`

Status: `ready_for_closeout`

result: pass

## Baseline And Recovery

- claim base/master/origin/live remote: `d8ea27882f98679db8f83992316cd9c6661bee3d`
- branch: `codex/p0-rc-05-knowledge-resource-rag-citation`
- worktree: `D:/tiku/.worktrees/p0-rc-05`
- RC-04 origin sync、worktree cleanup、short branch cleanup：pass。
- `D:/tiku-readonly-audit`：`a84224fa12ec85b28e6acd945deba2afa28c6c02`，clean/read-only。
- F-0068/F-0075/F-0076/F-0080/F-0081/F-0084：`confirmed`；目标 authority 文件相对审计 baseline 无变化，RC-04 UI 差异不消除根因。

## Reading Evidence

status: complete

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

conflictsFound: false

已按 task plan 读取必需规范、ADR、SSOT、AI baseline、finding、runtime backlog 与源代码。未使用 Subagent。

## Requirement Mapping Result

| finding | status    | static remediation target                                                                                  |
| ------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| F-0068  | confirmed | transaction-scoped base/current/parent locks plus same-base/same-profession database constraints           |
| F-0075  | confirmed | remove deterministic production fallback; only durable executor/RAG facts may yield recommendation success |
| F-0076  | confirmed | question-revision task, candidate, supersession and conditional review facts                               |
| F-0080  | confirmed | immutable index generation/chunk facts and independent keyword/vector retrieval signals                    |
| F-0081  | confirmed | disabled no-op guard, old-generation retention and atomic activation                                       |
| F-0084  | confirmed | complete validated `knowledge_node_resource` authority and descendant retrieval                            |

## Approval Boundary

- schema/migration source authoring、generation、static test、isolated commit：approved。
- database apply/read/write、fixture/seed/backfill、runtime/browser/e2e/Provider：blocked。
- dependencies、PR、force push、deployment：blocked。
- 普通 ff-only merge、origin/master push 与合入后 cleanup：task-level standing authorization 已物化，仍须全部门禁通过。

## Validation Log

- schema/migration source checkpoint：`89b13de1f fix(rag): add durable index and recommendation facts`。
- implementation checkpoint：`8621aac91 fix(rag): enforce durable knowledge retrieval facts`。
- focused RC-05/schema：`2/2` files、`13/13` tests passed。
- final full unit：`387/387` files、`2289/2289` tests passed，`274.40s`。
- generation provenance 契约补齐后的首次 full run 发现 `1/2289` 个旧 DTO 期望缺少显式 `generationPublicId: null`；修正后 targeted `9/9` 与最终 full unit 全绿。
- `npm run lint -- --max-warnings=0`：pass，zero warnings。
- `npm run typecheck`：pass。
- `npm run format:check`：pass。
- `npm run build`：pass；92 个静态页面生成，resource、knowledge-node、question recommendation、student/mistake/owner consumer routes 存在。
- `git diff --check`：pass。
- P0 serial manual/pre-commit guard：pass；current RC-05，next RC-06。
- pre-commit hardening 首次识别 6 个缺失 allowlist 文件，补全 task scope 后再次识别测试 fixture 的禁用旧术语；按 glossary 改为 `authorization`，targeted `2/2` files、`4/4` tests passed，最终 hardening pass。
- branch module closeout、pre-push 与 fresh-master 门禁属于后续 closeout；任一失败即阻止 RC-06 claim。

## Static Remediation Proof

- F-0068：knowledge base、current node、parent node 由同一 transaction 读取并加锁；same-base/same-profession/self-parent/cycle fail closed，复合 FK 约束抵御并发漂移。
- F-0075：删除生产字符串匹配、首节点 fallback、伪 model/prompt/citation；未配置真实 executor 时只返回 durable pending/failed，不生成正式绑定。
- F-0076：question create/update/copy 同 transaction enqueue current-revision task，disable supersede；candidate、citation snapshot、confirm/ignore actor/time 持久化；stale revision、URL/task question 不一致、重复或并发 review fail closed。
- F-0080：resource index generation、chunk、keyword fact、vector fact 持久化；success 必须有完整连续 chunk、1536 维有限向量与有效 model config，激活切换原子完成；检索不再把 token overlap 同时伪装成 semantic score。
- F-0081：disabled/draft/indexing 等状态在 idempotency replay lookup 前拒绝；旧无 generation 的 `mark/save indexing` 写入口已删除；失败或过期 generation 不替换 active generation。
- F-0084：resource create/update relation 使用完整 public ID 集合并锁定验证，同 base、同 profession、active；列表、详情、推荐 citation scope、descendant retrieval 只消费 `knowledge_node_resource`。
- citation 对外 DTO 与 evidence summary 显式携带 generation public ID；本地显式测试适配器使用 `null`，不省略 key。
- student scoring、mistake explanation、owner preview 默认消费 PostgreSQL retrieval；local catalog 仅在显式提供 local adapter/storage root 时使用。

## RED / GREEN

- RED：cross-base/profession/self-parent、125 节点完整关系、disabled rebuild、old active failure、keyword-only、independent scores、candidate citation/node scope；GREEN：RC-05 focused helpers、repository source guards 与 route tests 全绿。
- RED：推荐路径返回同步伪成功、本地页面审查、URL task 混淆、旧 revision confirm、single-candidate ignore 后无法继续；GREEN：durable task/candidate review 和 current question revision handoff。
- 第一轮复核 RED：existing request 在 disabled status gate 前 replay，且 legacy indexing writes 可绕过 generation transaction；删除旧入口并前置 current-state gate 后 GREEN。
- 第一轮复核 RED：publish 未锁 resource、编辑/disable 未 supersede pending generation、question/resource lock order 可成环、任意 same-profession resource 可作为 candidate citation；分别通过 row lock、supersession、统一 lock order、exact `knowledge_node_resource` scope 修正。
- 第二轮复核 RED：citation runtime 已含 generation，但 API DTO/downstream mapper 丢失；补齐 required nullable contract、evidence generation set 与跨角色 fixture 后 GREEN。
- 第二轮复核 RED：confirm 后 UI 保留旧 `question.updatedAt`，后续编辑必然 stale；响应同时携带 task revision/current revision，UI 更新 current revision 后 GREEN。

## Command Accounting

```text
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-P0RemediationSerialProgram.ps1 -Phase manual
corepack pnpm@10.15.1 exec vitest run tests/unit/p0-rc-05-knowledge-resource-rag-citation.test.ts tests/unit/p0-rc-05-schema-migration-source.test.ts --reporter=dot
npm run test:unit -- --run
npm run lint -- --max-warnings=0
npm run typecheck
npm run format:check
npm run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p0-remediation-rc-05-knowledge-resource-rag-citation-2026-07-14
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p0-remediation-rc-05-knowledge-resource-rag-citation-2026-07-14
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p0-remediation-rc-05-knowledge-resource-rag-citation-2026-07-14 -SkipRemoteAheadCheck
```

localFullLoopGate: pass_branch_gates_fresh_master_required_after_merge

## Review Log

Round 1: pass — authority、transaction、lock order、idempotency、disabled boundary、schema/data compatibility。

Round 2: pass — content/student/mistake/owner handoff、API/enums/null/list、citation provenance、P1/P2 boundary、full regression。

## P1/P2 Impact Mapping Only

- potentially covered：F-0069、F-0070、F-0071、F-0088、F-0029、F-0040、F-0032、F-0035、F-0085、F-0031、F-0089、F-0037、F-0082、F-0086、F-0087。
- semantic change：F-0083。
- 上述 finding 全部保留到 P0 冻结新 baseline 后重验；未关闭、降级或改写审计原状态。F-0069 的 descendant path/depth 漂移尤其不因本 RC 的 scope constraint 被误判已修复。

## Non-Actions

- 未执行 database apply/read/write、fixture、seed、backfill、历史数据诊断或 migration apply。
- 未执行 runtime/browser/e2e、真实 embedding/vector Provider、AI Provider、RV-0013、RV-0014 或 Cost Calibration。
- 未修改依赖、package/lockfile、env/secret 或外部配置；未创建 PR、未 force push、未部署。
- 未修改 `D:/tiku-readonly-audit` 或任何原始 finding 状态；未进入 RC-06/P1/P2 实现。

Cost Calibration Gate remains blocked.

threadRolloverGate: continue_same_goal_after_rc_05_closeout

nextModuleRunCandidate: `p0-remediation-rc-06-ai-config-execution-provenance-2026-07-14`
