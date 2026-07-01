# 2026-07-01 AI 出题 / AI 组卷真实 Provider 小样本 Evidence

## 范围

- Task id: `ai-generation-real-provider-sample-2026-07-01`
- Branch: `codex/ai-generation-real-provider-sample`
- Evidence mode: provider status, duration bucket, token count, failure category, and visible structure/count summary only.

## 边界确认

- staging/prod/cloud/deploy: not executed.
- e2e: not executed.
- Source/schema/migration/seed/dependency changes: not executed.
- Cost Calibration, release readiness, final Pass: not executed or claimed.
- Credentials may be read and entered into `localhost` only; credential values are not recorded.
- `.env*` values are not read or modified.
- Provider payloads, prompts, raw AI input/output, and full generated content are not recorded.

## Preflight

| Item                 | Result | Summary                                                                                          |
| -------------------- | ------ | ------------------------------------------------------------------------------------------------ |
| Branch               | pass   | `codex/ai-generation-real-provider-sample` created from clean pushed `master`.                   |
| Prior matrix         | pass   | `ai-generation-eight-role-matrix-rerun-2026-07-01` closed and pushed; eligible roles identified. |
| Provider call budget | pass   | Maximum `8` calls; exactly `8` UI submit attempts were executed.                                 |

## Provider Samples

| Role                        | Function | Executed | Status                           | Duration bucket | Token count | Visible structure/count summary                                                   | Failure category                        |
| --------------------------- | -------- | -------- | -------------------------------- | --------------- | ----------- | --------------------------------------------------------------------------------- | --------------------------------------- |
| `personal_advanced_student` | AI 出题  | yes      | no_visible_feedback_after_submit | 60s+            | not_visible | no visible result/error/loading state after submit                                | no_feedback_after_submit                |
| `personal_advanced_student` | AI 组卷  | yes      | summary_visible                  | 15-30s          | not_visible | structure_parse_failed; `paper_section` count `0`; feedback far below action area | structure_parse_failed_and_far_feedback |
| `org_advanced_employee`     | AI 出题  | yes      | summary_visible                  | 30-60s          | not_visible | structure_parse_failed; draft count `0/10`; feedback far below action area        | structure_parse_failed_and_far_feedback |
| `org_advanced_employee`     | AI 组卷  | yes      | summary_visible                  | 15-30s          | not_visible | structure_parse_failed; `paper_section` count `0`; feedback far below action area | structure_parse_failed_and_far_feedback |
| `org_advanced_admin`        | AI 出题  | yes      | summary_visible                  | 5-15s           | not_visible | structure_parse_failed; draft count `0/10`; feedback near action area             | structure_parse_failed                  |
| `org_advanced_admin`        | AI 组卷  | yes      | summary_visible                  | 15-30s          | not_visible | structure_parse_failed; `paper_section` count `0`; feedback near action area      | structure_parse_failed                  |
| `content_admin`             | AI 出题  | yes      | summary_visible                  | 15-30s          | not_visible | structure_parse_failed; draft count `0/10`; feedback near action area             | structure_parse_failed                  |
| `content_admin`             | AI 组卷  | yes      | summary_visible                  | 15-30s          | not_visible | structure_parse_failed; `paper_section` count `0`; feedback near action area      | structure_parse_failed                  |

## OP 映射

| Issue   | Current status | Evidence summary                                                                                                                                                                |
| ------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OP-06` | fail           | Real Provider returns result references, but all visible structured previews fail parsing: AI 出题 shows `0/10`; AI 组卷 shows `paper_section 0`.                               |
| `OP-07` | fail_mixed     | Admin/content pages show near-action summaries, but learner-side summaries are far below the action area, and one learner AI 出题 submit showed no visible feedback after 120s. |

## 问题清单

| 问题编号     | 涉及角色                                                                                    | 页面/流程                                         | 实际现象                                                                                                                    | 期望行为                                                                                               | 是否阻塞 | 备注/疑似根因                                                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| PROVIDER-001 | `personal_advanced_student`, `org_advanced_employee`, `org_advanced_admin`, `content_admin` | AI 出题 / AI 组卷真实 Provider 返回后的结构化预览 | Provider 调用可执行并返回结果引用，但结构化预览全部解析失败；AI 出题可见草稿计数为 `0/10`，AI 组卷 `paper_section` 为 `0`。 | AI 出题应按请求数量展示结构化草稿；AI 组卷应展示 paper_section、题量、题型分布、知识点覆盖等结构摘要。 | 是       | 疑似 Provider 输出 JSON/结构契约与 parser 期望不一致，或 prompt/schema 约束不足；需检查结构化解析器、Provider response adapter、生成 schema。 |
| PROVIDER-002 | `personal_advanced_student`, `org_advanced_employee`                                        | 学员/员工 AI 出题 / AI 组卷提交反馈               | 学员侧 AI 组卷和企业高级员工两类生成摘要出现在远离操作区的位置；个人高级 AI 出题有一次提交后无可见加载、错误或结果反馈。    | 提交后应在操作区附近出现加载、成功、失败或结构化结果摘要；长耗时也应有明确状态。                       | 是       | 疑似学员页面结果区布局仍在页面后段，且某些请求状态未稳定进入 loading/result/error 分支。                                                      |
| PROVIDER-003 | all executed Provider samples                                                               | Provider token usage evidence                     | UI 未展示 token 计数，浏览器证据只能记录 `not_visible`，未读取 Provider payload/log/raw response。                          | 后续若需要 token 证据，应通过安全元数据字段展示或在脱敏日志中提供计数。                                | 否       | 不影响用户功能，但影响 Provider 小样本可观测性；不得通过读取 raw payload 补证。                                                               |

## 验证记录

| Command                                                                                                            | Result                             | Summary                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm.cmd exec -- prettier --check --ignore-unknown <changed-docs>`                                                 | pass                               | All scoped docs/state files use Prettier style.                                                                                                                          |
| `npm.cmd run lint`                                                                                                 | pass                               | ESLint completed without errors.                                                                                                                                         |
| `npm.cmd run typecheck`                                                                                            | pass                               | `tsc --noEmit` completed without errors.                                                                                                                                 |
| `git diff --check`                                                                                                 | pass                               | No whitespace errors.                                                                                                                                                    |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-real-provider-sample-2026-07-01`                     | pass                               | Scope, sensitive evidence, terminology, and Module Run anchors passed.                                                                                                   |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-real-provider-sample-2026-07-01 -SkipRemoteAheadCheck` | pass_after_state_checkpoint_update | Initial run found repository SHA drift from the prior pushed matrix task; `project-state.yaml` checkpoint was updated to the current pushed master SHA and rerun passed. |

## 脱敏检查

- Pass: no credentials, cookie, token, session value, localStorage value, Authorization header, `.env*` value, DB raw row, internal id, PII, Provider payload, prompt, raw AI I/O, full question/paper/material/resource/chunk content, screenshot, trace, raw DOM, or HTML dump was written to evidence.
