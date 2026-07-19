# F-0143 employee personal AI context evidence

## Scope

- Task: `p1-remediation-rc-02-employee-personal-ai-context-2026-07-18`
- Finding: `F-0143`
- Branch: `codex/p1-rc02-employee-personal-ai-context`
- Product base: `23fda0d64873dfb8b3e08f4145b24828716039e8`
- Current stage: product implementation, full validation, and two-round review complete; pending governance gates and closeout commits.

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

## Requirement Mapping Result

Result: pass

- Advanced-edition requirements explicitly allow personal and organization authorization to coexist, select personal by default, require explicit context selection, preserve personal history after organization membership, and require server-side revalidation.
- The current AI-generation baselines do not supersede or close F-0143.
- F-0142 authorization termination policy remains a separate finding and is not imported into this task.

## Recovery and requirement evidence

- Restored from repository state, task queue, latest evidence/audit, and the merged F-0117 baseline without redoing completed work.
- Read the advanced-edition requirement index, edition-aware authorization requirements, ADR-007, the personal AI generation requirement chain, current AI-generation baseline evidence, and UI role/design baselines.

## JIT Revalidation Result

Result: pass

F-0143 remains reproducible at the current base. UI intent carries the selected authorization, while server request/history paths still derive organization scope from employee identity before honoring a valid personal authorization.

## Root-Cause Reproduction

Result: pass

Independent read-only revalidation and main-thread source review reached the same result:

1. The UI exposes explicit personal and organization authorization contexts and sends the selected authorization public id.
2. The request route currently forces an employee into organization authorization and ownership; a valid employee personal advanced context can fail with `403057`.
3. Request and result history currently derive owner from employee identity, so personal records can be hidden after organization membership.
4. The learning-session route can already locate a personal result before organization scope; this behavior needs regression protection, not a new policy implementation.

The pre-change focused baseline covered seven relevant test files and passed 144 tests. That result proves existing coverage does not encode the missing employee-personal selected-context invariant; it does not invalidate the finding.

## Approval evidence

The user approved `F-0143 方案 A` on 2026-07-18. The approved boundary is recorded in `docs/05-execution-logs/acceptance/2026-07-18-p1-f0143-employee-personal-ai-context-authorization.md`.

## Scope Freeze

Result: pass

- F-0117 is recorded closed only after its commit, ff-only merge, `origin/master` push, worktree cleanup, and short-branch cleanup had already passed.
- Repository recovery checkpoints match the transition base, local `master`, and `origin/master` at `4f63c3c17731cbc686bb234b89a64c31f36ab03b`.
- F-0143 is the sole in-progress P1 task.
- The transition allowlist contains only state, approval, plan, evidence, audit, and written-spec files.
- The separate written-spec review gate remains `waiting_for_spec_review`.
- No schema, migration, dependency, database, Provider, browser/runtime, P2, PR, force-push, or deployment action is authorized or performed.

## Independent Transition Review Evidence

Result: pass

The independent review initially blocked three issues: stale repository checkpoints, a shared history/generation resolver that would have imported F-0142 lifecycle semantics, and an incomplete result-history propagation allowlist. Main-thread verification confirmed all three against the repository.

The corrected transition aligns all checkpoints to `4f63c3c17731cbc686bb234b89a64c31f36ab03b`, separates raw ownership validation from current generation eligibility, and adds the request API plus result-history model/validator/service/service-test chain to the product allowlist. Independent re-review returned `APPROVE`; current transition changes remain exactly seven governance/spec files.

## Validation log

- `git diff --check`: pass.
- Prettier scoped check across the seven transition files: pass.
- Initial P1 `manual` invocation without an explicit changed-file set: expected hard block because a task transition cannot prove its control-file scope from an empty candidate list. No guard or scope was changed in response.
- P1 `pre_commit` with the exact staged transition, including the review corrections: pass; transition mode `standard`, materialized task count 12, P1/P2 counts 125/18, runtime validation count 21.
- P0 global baseline: pass; 35 P0 findings, 143 P1/P2 impacts, 21 runtime-pending items, and zero dependency cycles.
- Module pre-commit hardening: pass; all seven staged files matched the task allowlist, with sensitive-evidence and terminology scans preserved.

No secret, personal data, token, or runtime credential is included in this evidence.

## Product implementation evidence

Result: pass

- Task 1 created the shared raw-ownership/effective-generation service. Raw ownership accepts only an exact personal authorization owned by the actor or an exact organization authorization for the actor's current organization; zero, duplicate, foreign, and old-organization matches fail closed. Raw history ownership does not decide lifecycle, expiry, cancellation, edition, capability, downgrade, or continuation.
- Task 2 made local-browser generation require both the raw repository and effective authorization service, revalidate the exact selected authorization, and overwrite all client owner/source/organization/quota facts. Employee personal and employee organization contexts remain independently selectable.
- Task 3 propagated the exact selected authorization through request-history list/count and the joined task condition. Missing, empty, or foreign selection fails before repository access; raw inactive/expired ownership remains history-readable without importing F-0142.
- Task 4 propagated the same exact selection through result list/count/detail, split canonical exact-selected detail lookup from the existing learning-session owner-only lookup, and retained actor plus owner constraints on the joined task.
- Task 5 selects personal before organization, includes the encoded selected id in generation/request/result/detail calls, clears old context state before reload, uses independent request/result history sequences, and invalidates stale detail responses.
- Task 6 added the employee-personal learning-session regression without changing learning-session source: lookup succeeds under personal owner/actor semantics and does not substitute organization ownership.
- Persistent product diff is exactly 22 allowlisted files: 19 tracked modifications plus the implementation plan and two new authorization-context service files. Blocked-file matches are zero.

## RED to GREEN evidence

Result: pass

- Shared authorization policy: new tests failed while the service was absent, then passed `26/26` after the raw/effective split.
- Generation POST: employee personal selection, server-owned metadata, missing dependency, foreign/wrong scope/standard/capability, and authorization-isolated idempotency cases failed on the identity-derived implementation, then passed after shared resolution and production composition wiring.
- Request history: route and repository tests first exposed missing exact authorization propagation, then passed `90/90` after list/count and SQL condition alignment.
- Result history/detail: model, validator, service, route, repository, and API composition tests first exposed broad owner-only lookup, then passed `80/80` after exact list/count/detail propagation.
- UI selected context: URL/default/context-switch tests failed before selected-id propagation and stale-response invalidation. The independent review then added three delayed-Promise RED tests: request-to-result pagination, result-to-request pagination, and request pagination while initial result history was pending; all three failed on the shared sequence and passed after the split.
- Learning session: the employee-personal persisted-result regression passed on existing source, proving this task preserved rather than reimplemented that behavior.

## Round 1 Review

Result: pass

Main-thread adversarial review covered the authorization trust boundary, server-owned metadata, exact request/result isolation, UI stale-response behavior, learning-session compatibility, redaction, and the approved file boundary. No unresolved Round 1 finding remains.

## Round 2 Review

Result: pass

Independent whole-diff review initially reported one Critical, one Important, and one Minor finding. After focused RED-to-GREEN fixes, independent rereview reported `Critical 0 / Important 0 / Minor 0`; main-thread verification confirmed every fix and the exact allowlist.

## Independent review fix evidence

Result: pass

- Initial independent Round 2 found `Critical 1 / Important 1 / Minor 1`.
- Critical: the route accepted only numeric `level` during authorization but the canonical validator also accepted numeric strings. `level: "4"` could therefore become a null authorization scope before later normalization, bypass scope comparison, reach persistence/Provider, and lose authorization-scoped idempotency. Four RED cases reproduced wrong numeric-string scope, absent scope, invalid scope, and same-owner multi-personal-auth hash reuse. The route now uses an explicit absent/invalid/valid reader aligned to canonical levels `1..5`; local-browser generation requires valid normalized scope before persistence. Fresh request-route result: `57/57`.
- Important: request/result pagination shared one sequence, so an interleaved request could stale-return the other side and leave it permanently loading. Independent sequences now let single-side pagination invalidate only itself, while context/task/combined reload invalidates both. Fresh component result: `25/25`.
- Minor: canonical result detail depended on an exact/owner-only union. The repository now exposes a required-authorization selected-context port and a separate owner-only legacy port; the history service depends only on the exact port, while learning-session source remains unchanged. Fresh repository/history/learning result: `43/43`.
- Main-thread focused reruns independently confirmed the three fixes. Independent whole-diff rereview returned Ready with `Critical 0 / Important 0 / Minor 0` and no new finding.

## Validation Results

Result: pass

- Exact focused command: `9/9` files and `226/226` tests passed; main-thread duration `33.41s`, independent verification `31.50s`.
- First full-unit attempt: `420/421` files and `2772/2773` tests passed in `971.79s`. The sole failure was the task-external asynchronous notice test `student-mock-exam-report-ui` under full-suite load.
- Isolated diagnosis: the exact failed case passed `1/1`; the complete task-external file passed `42/42` without any source/test change.
- Fresh complete rerun: `421/421` files and `2773/2773` tests passed in `904.59s` with `--maxWorkers=1`.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `npm.cmd run format:check`: pass.
- Default worktree `npm.cmd run build` stopped before compilation because Turbopack rejects the external `node_modules` junction. The repository-established equivalent `npm.cmd run build -- .worktrees/p1-rc02-employee-personal-ai-context`, run from `D:/tiku` with the root-installed identical dependency set, compiled successfully, completed TypeScript, and generated `96/96` static pages. No package, lockfile, dependency topology, or Next configuration changed.
- `git diff --check`: pass.
- Browser/runtime, real database, external Provider, P2, PR, force push, and deploy were not executed and are not claimed.

## Two-round adversarial review

Result: approved_pending_governance_gates

- Main-thread Round 1 checked raw/effective policy separation, exact personal/org selection, client metadata overwrite, zero persistence/Provider failure paths, list/count/detail SQL isolation, multiple personal authorization separation, UI stale-response behavior, public-id/redaction, learning-session regression, and blocked-surface inventory.
- Independent Round 2 reviewed the entire diff from the approved spec without using Round 1 as its premise. After the three accepted findings above were fixed, final rereview reported Ready, `Critical 0 / Important 0 / Minor 0`, all 22 files allowlisted, and zero blocked-file changes.
- No unresolved product, security, review, scope, or validation blocker remains. Governance gates and Git closeout are still pending and are not pre-claimed here.

## Closeout readiness projection

Result: pre_product_closeout_readiness_pass_prepush_deferred_to_ready_transition

- Cost Calibration Gate remains blocked.
- `corepack pnpm@11.9.0 exec vitest run src/server/services/personal-ai-generation-authorization-context.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-result-history-service.test.ts src/server/services/personal-ai-generation-learning-session-route.test.ts src/server/repositories/personal-ai-generation-request-repository.test.ts src/server/repositories/personal-ai-generation-result-repository.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/student-personal-ai-generation-ui.test.ts --maxWorkers=1`: pass, `9/9` files and `226/226` tests.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual`: pass; standard mode, one active F-0143 task, P1/P2 counts `125/18`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1`: pass; `35` P0 findings, `143` P1/P2 impacts, `21` runtime-pending items, and zero dependency cycles.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-rc-02-employee-personal-ai-context-2026-07-18`: pass; all `24` current product/evidence files are allowlisted, with sensitive-evidence and terminology scans preserved.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p1-remediation-rc-02-employee-personal-ai-context-2026-07-18`: first run correctly hard-blocked nine missing closeout-evidence projection anchors; after this section recorded established facts and scheduling decisions, the fresh retry passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p1-remediation-rc-02-employee-personal-ai-context-2026-07-18 -SkipRemoteAheadCheck`: the pre-product diagnostic correctly hard-blocked because state still records the transition-hotfix ancestor `0fe8edae7` while `master`/`origin/master` are `23fda0d64`, and the current candidate contains product changes. No ancestor exception is used for a product candidate. Fresh pre-push must run only after the product commit and exact ready state/queue transition.
- `threadRolloverGate: stop_after_f0143_closed_and_clean_for_deferred_mechanism_charter_checkpoint`.
- `nextModuleRunCandidate: none_until_p1_mechanism_execution_compatibility_charter_v2_1_is_received`; no next P1 product task is materialized or claimed, and the next product RED must remain unstarted.

## Git closeout checkpoint

- productCommit: `finalized_by_commit_containing_this_record` with message `fix(ai-generation): honor selected employee authorization`.
- readyGovernanceCommit: pending exact state/queue transition after the product commit.
- masterMerge: pending.
- originMasterSync: pending.
- productWorktreeCleanup: pending.
- finalClosedProjection: pending after product merge/push/cleanup; it must not materialize the next product task.

## 品味合规自检 Checklist

1. 无颜色、间距、主题或 Tailwind token 变更。
2. React history/detail loading 状态均可在交错请求后稳定收敛。
3. 复杂状态逻辑保持在既有 page/service 边界，未引入新的展示层业务分叉。
4. API 路径保持复数 kebab-case，JSON 字段保持 camelCase，响应保持 `{ code, message, data, pagination? }`。
5. 外部 URL 只使用 public id；未暴露数据库自增 id。
6. Drizzle 条件复用既有 task join，无手写 SQL、schema、migration 或数据库执行。
7. 个人与组织授权、owner、quota owner 的项目术语保持一致，未自造缩写。
8. Client owner/source/organization/quota 输入始终不受信任并由服务端覆盖。
9. 测试使用隔离 fixture 与不可变构造，未修改共享运行时状态。
10. 无垃圾注释、依赖变更、敏感信息、Provider/runtime/browser/P2/部署越界。
