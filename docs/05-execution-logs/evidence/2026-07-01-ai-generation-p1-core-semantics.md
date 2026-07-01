# 2026-07-01 AI 出题 / AI 组卷 P1 核心语义修复 Evidence

## 范围

- 任务 id：`ai-generation-p1-core-semantics-2026-07-01`
- 分支：`codex/ai-generation-p1-core-semantics`
- 覆盖问题：OP-01、OP-05、OP-06
- Evidence 模式：只记录问题编号、角色标签、流程标签、状态、数量摘要、命令和脱敏结果。

## 预检

- 规范读取：已读取 `AGENTS.md`、十诫、全部 ADR、project-state、task-queue、专项合同、中央授权包、根因与复用协议。
- 当前基线：P0 已合入后的本地分支基线。
- 当前任务边界：P1 不执行真实 Provider、DB、浏览器、`.env*`、依赖、schema/migration/seed、部署、release readiness、final Pass、Cost Calibration。
- 最新授权刷新：用户确认可在限定范围内预授权高风险类别，但必须避免回归和新问题；P1 仅记录该授权来源，不消费高风险能力。

## 根因与复用记录

| Issue | 影响流程               | 根因边界                                  | 复用策略                                                                          | 保护性测试 |
| ----- | ---------------------- | ----------------------------------------- | --------------------------------------------------------------------------------- | ---------- |
| OP-01 | AI 出题 / AI 组卷      | `service_business_logic`、`route_adapter` | 复用个人端 route-integrated Provider 执行服务，补齐 `taskType` 语义               | pass       |
| OP-05 | AI 出题 / AI 组卷 参数 | `api_contract`、`ui_interaction_state`    | 复用后台 AI generation entry surface test，统一等级合同                           | pass       |
| OP-06 | AI 出题结果            | `structured_parser`、`provider_adapter`   | 复用 route-integrated visible generated content contract，增加结构化摘要/失败状态 | pass       |

## RED/GREEN 记录

- RED focused tests：pass。首次 focused unit 失败 12 项，失败点对应旧等级、缺 `taskType`/routeWorkflow、缺结构化预览和 UI 展示。
- GREEN focused tests：pass。修复后 focused unit 6 个文件、56 个测试通过。

## 验证记录

- focused unit：pass，6 个文件、56 个测试。
- prettier scoped check：pass。
- lint：pass。
- typecheck：pass。
- git diff --check：pass。
- Module Run v2 pre-commit hardening：pass。
- Module Run v2 pre-push readiness：pass。

## 变更摘要

- OP-01：个人 AI 出题 / AI 组卷 Provider requestContext 增加 `taskType` 与 `routeWorkflow`，Provider 指令按任务类型区分 AI 出题和 AI 组卷，不再由 `aiFuncType=explanation` 决定生成场景。
- OP-05：后台 AI 出题 / AI 组卷等级参数统一为 `1级` 到 `5级`，默认 `3级`，移除旧工种标签显示。
- OP-06：共享 route-integrated visible generated content 增加结构化预览合同；AI 出题校验请求数量 10，满足时返回 10 条安全草稿摘要，不满足时返回结构化解析失败；AI 组卷返回 `paper_section`、题量、题型分布、知识点覆盖的计数摘要。

## 未执行项目

- 真实 Qwen Provider 调用：未执行。
- DB 连接、reset、seed、resource import：未执行。
- D 盘资源包读取或导入：未执行。
- 浏览器登录、e2e、raw DOM/screenshot/trace：未执行。
- `.env*` 读取或修改：未执行。
- package/lockfile/依赖变更：未执行。
- schema/migration/seed 改动：未执行。
- staging/prod/cloud/deploy、release readiness、final Pass、Cost Calibration：未执行。

## 敏感信息排除

- 密码、cookie、token、session、localStorage、Authorization header：未读取、未记录。
- `.env*` 值、连接串、Provider key：未读取、未记录。
- DB 原始行、内部自增 id、PII、手机号/邮箱原文、完整卡密：未读取、未记录。
- Provider payload、prompt、raw AI input/output：未记录。
- 完整 question/paper/material/resource/chunk 内容：未记录。
- screenshot、trace、raw DOM、HTML dump：未生成、未记录。
