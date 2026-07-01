# 2026-07-01 AI 出题 / AI 组卷八角色矩阵复跑 Evidence

## 范围

- Task id: `ai-generation-eight-role-matrix-rerun-2026-07-01`
- Branch: `codex/ai-generation-eight-role-matrix-rerun`
- Evidence mode: role/route/workflow/status/count summaries only.

## 边界确认

- staging/prod/cloud/deploy: not executed.
- Real Provider call: not executed in this task.
- e2e: not executed.
- Source/schema/migration/seed/dependency changes: not executed.
- Screenshots, raw DOM, trace, HTML dump, raw DB rows, internal ids, PII, credentials, session material, env values, Provider payloads, prompts, raw AI I/O, and full question/paper/material/resource/chunk content: not recorded.
- Credential handling after 2026-07-01T11:04:40-07:00 approval: local private role credentials may be read and entered into `localhost` only; credential values remain excluded from stdout, evidence, commits, and final summaries.

## 数据前提

- Local resource import source task: `ai-generation-resource-import-contract-2026-07-01`.
- Imported aggregate coverage: 3 questions, 62 resources, 3 knowledge nodes, 3 materials, 3 papers, 3 paper questions.

## Preflight

| Item                | Result | Summary                                                                                      |
| ------------------- | ------ | -------------------------------------------------------------------------------------------- |
| Branch              | pass   | `codex/ai-generation-eight-role-matrix-rerun` created from clean `master`.                   |
| Standards           | pass   | AGENTS, 十诫, ADR, task queue, core walkthrough contract, and root-cause protocol were read. |
| Route inventory     | pass   | Student, organization, and content AI generation routes exist in source routing.             |
| Localhost readiness | pass   | `http://localhost:3000/` opened in the in-app browser and returned the local app title.      |

## Manual Login Coordination

| Time                      | Result  | Summary                                                                                                                               |
| ------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-01T10:52:30-07:00 | pending | Browser remains on the local home page; no role context has been entered by the user yet.                                             |
| 2026-07-01T10:53:28-07:00 | blocked | Rechecked browser state; still on the local home page, so role matrix cannot proceed without user manual login.                       |
| 2026-07-01T11:04:40-07:00 | resumed | User authorized agent to read local private role credentials and enter them into the in-app browser for localhost owner preview only. |

## Blocked Audit

- Blocking condition: role matrix rerun requires the user to manually enter credentials for each role; no role context is currently active.
- Consecutive occurrences: at least three goal continuation turns reached the same manual-login waiting point.
- Self-service alternatives rejected: I did not read, request, type, store, or infer credentials; I did not inspect browser storage or session material.
- Unblock condition: user manually logs in to any pending role in the in-app browser and provides the role label plus issue summary.
- Resolved by: user granted scoped local credential read/input approval; credential values remain non-evidence and non-output.

## 角色矩阵

| Role                        | AI 出题        | AI 组卷        | Evidence summary                                                                                                                                                              |
| --------------------------- | -------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `personal_standard_student` | not_applicable | not_applicable | Standard learner shows AI training unavailable; AI 出题/组卷 controls are disabled; no expired-auth text.                                                                     |
| `personal_advanced_student` | pass           | pass           | Advanced learner can access AI training controls; both AI 出题/组卷 controls are enabled; history pagination exists; no expired-auth text.                                    |
| `org_standard_employee`     | not_applicable | not_applicable | Standard employee shows AI training unavailable; AI 出题/组卷 controls are disabled; no expired-auth text.                                                                    |
| `org_advanced_employee`     | pass           | pass           | Advanced employee can access AI training controls; both AI 出题/组卷 controls are enabled; history pagination exists; no expired-auth text.                                   |
| `org_standard_admin`        | not_applicable | not_applicable | Standard organization admin lands in organization portal; direct organization AI routes show no generation controls and are denied/unavailable.                               |
| `org_advanced_admin`        | pass           | pass           | Advanced organization admin lands in organization portal with AI entries; organization AI pages expose enabled controls, 1-5 level options, isolated history, and pagination. |
| `content_admin`             | pass           | pass           | Content AI pages expose enabled controls, 1-5 level options, isolated history, and pagination.                                                                                |
| `ops_admin`                 | not_applicable | not_applicable | Ops admin lands in ops workspace with AI log visibility only; no AI production entry; direct AI production routes resolve as not found/no controls.                           |

## 走查摘要

- Credential input: executed only against `http://localhost:3000/login`; values were not printed, saved, or written to evidence.
- Session switching: used logout and known local session marker removal without reading cookie, token, session, localStorage, or Authorization values.
- Provider execution: not triggered; enabled generation buttons were not clicked in this no-Provider matrix task.
- Learner/employee authorization: four learner-side roles no longer show `授权已失效`; standard roles are disabled by edition, advanced roles are enabled.
- Organization admin edition: advanced organization admin no longer shows standard-backend downgrade wording; AI 出题/组卷 entries are visible.
- Admin level contract: organization and content AI pages expose level options `1级` through `5级`; older `高级工/中级工/技师` options were not observed.
- History behavior: admin pages show current `generationKind` filtering, requested-time descending copy, and pagination controls; learner source contract uses distinct `taskType` query values for AI 出题 and AI 组卷.

## OP 映射

| Issue   | Current rerun status    | Evidence summary                                                                                                                        |
| ------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `OP-01` | pass_pre_provider       | Learner AI 出题 / AI 组卷 controls are edition-aware: standard disabled, advanced enabled.                                              |
| `OP-02` | pass_pre_provider       | Imported local resource baseline is present; advanced/content/org AI pages no longer present empty-data blocker in pre-submit controls. |
| `OP-03` | pass                    | Personal standard/advanced and org standard/advanced employee flows did not show expired authorization text.                            |
| `OP-04` | pass                    | Advanced organization admin lands in organization portal with AI entries; no standard-backend downgrade wording observed.               |
| `OP-05` | pass                    | Organization and content admin level options are `1级` through `5级`.                                                                   |
| `OP-06` | blocked_provider_sample | Quantity/structure correctness requires actual generation output; deferred to real Provider sample task.                                |
| `OP-07` | blocked_provider_sample | Post-generation feedback placement requires actual generation output; deferred to real Provider sample task.                            |
| `OP-08` | pass_pre_provider       | Admin history surfaces are filtered by `generationKind`; learner contract uses distinct `taskType` values.                              |
| `OP-09` | pass_pre_provider       | Admin and learner history surfaces expose pagination; admin history states requested-time descending copy.                              |

## 问题清单

| 问题编号  | 涉及角色                                      | 页面/流程                   | 实际现象                                                                             | 期望行为                                                                                                             | 是否阻塞                                                | 备注/疑似根因                                                                        |
| --------- | --------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| RERUN-001 | Eligible advanced learner/admin/content roles | AI 出题 / AI 组卷生成后结果 | 本轮按边界未点击生成按钮，无法验证实际返回数量、结构化草稿、反馈位置和本次可见结果。 | 在 real Provider 小样本中验证每个已打通角色最多一次 AI 出题和一次 AI 组卷，证据只记状态/耗时桶/token 计数/失败类别。 | 阻塞最终 owner preview，不阻塞本轮 no-Provider 矩阵收口 | 需要下一任务 `ai-generation-real-provider-sample-2026-07-01`；不得在本任务伪造通过。 |

## 验证记录

| Command                                                                                                               | Result | Summary                                                                |
| --------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------- |
| `npm.cmd exec -- prettier --check --ignore-unknown <changed-docs>`                                                    | pass   | All scoped docs/state files use Prettier style.                        |
| `npm.cmd run lint`                                                                                                    | pass   | ESLint completed without errors.                                       |
| `npm.cmd run typecheck`                                                                                               | pass   | `tsc --noEmit` completed without errors.                               |
| `git diff --check`                                                                                                    | pass   | No whitespace errors.                                                  |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-eight-role-matrix-rerun-2026-07-01`                     | pass   | Scope, sensitive evidence, terminology, and Module Run anchors passed. |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-eight-role-matrix-rerun-2026-07-01 -SkipRemoteAheadCheck` | pass   | Git readiness, evidence, audit, and closeout policy checks passed.     |

## 脱敏检查

- Pass: no credentials, cookie, token, session value, localStorage value, Authorization header, `.env*` value, DB raw row, internal id, PII, Provider payload, prompt, raw AI I/O, full question/paper/material/resource/chunk content, screenshot, trace, raw DOM, or HTML dump was written to evidence.
