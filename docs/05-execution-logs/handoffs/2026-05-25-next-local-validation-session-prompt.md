# Next Local Validation Session Prompt

复制下面提示词开启下一轮本地验证会话。

```text
继续 D:\tiku。请用中文沟通，严格遵守 AGENTS.md 与项目半自动化推进机制，不凭对话记忆继续，必须从仓库状态恢复。

本轮目标：暂停 Phase 11 staging 实施规划，从 clean master 做一次系统性本地验证，尽量找出本地产品、运行时、测试、证据和仓库卫生方面的潜在问题。不要部署，不连接 staging/prod，不读取或输出 .env.local secret，不改云资源，不改依赖，不改 package.json/lockfile，不改 schema/migration/script，除非我在本会话后续明确批准。

请先恢复门禁并读取：
- AGENTS.md
- docs/03-standards/code-taste-ten-commandments.md
- docs/02-architecture/adr/
- docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md
- docs/02-architecture/interfaces/phase-11-staging-resource-plan.md
- docs/02-architecture/interfaces/phase-11-staging-secret-and-env-plan.md
- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml
- docs/05-execution-logs/evidence/2026-05-25-phase-11-pause-and-local-validation-handoff.md

当前外部资源状态：
- 域名 jiandingtiku.cn 已申请。
- DNS 解析未配置。
- ICP 备案等待中。
- 云服务器未采购。
- 数据库服务未采购。
- Phase 11 staging implementation planning 暂停，等资源准备好后再恢复。

本轮本地验证允许我作为用户参与以下体验：
- 我可以在本地内容后台手工创建、上传或录入受控测试资料，包括测试专用资料、项目库里已有教材引用、项目库里已有真题卷引用。
- 如果资料涉及完整教材、完整试卷、OCR 全文、客户或类客户私密数据，不得写入 evidence；只能记录脱敏摘要、操作入口、状态、截图路径、publicId 或本地/ignored runtime 路径。
- 如果上传链路要求真实腾讯云 COS、公开对象存储 URL、staging/prod 存储或云资源配置，必须暂停并请求批准；当前无云服务器和数据库采购，不做云资源验证。

本轮允许 local/dev 真实 AI provider 小流量体验：
- 我批准在 local/dev 环境中最多进行 5 次真实 AI provider 调用体验，用于验证 ai_scoring、ai_explanation、ai_hint、learning_suggestion、kn_recommendation 或 RAG 引用链路。
- 禁止读取、输出或复制 .env.local secret。
- 禁止记录 secret、token、Authorization header、raw provider payload、raw prompt、raw answer、raw model response。
- evidence 只记录脱敏摘要、调用入口、调用次数、成功/失败状态、是否 fallback、耗时区间、错误类别和复现步骤。
- 如果真实 provider 未配置、余额不足、网络失败或权限失败，不要绕过 secret/env 边界；记录失败原因和可复现步骤，然后改用 mock/local AI 验证。
- 如产生真实 provider 费用，必须控制在上述最多 5 次调用范围内。

请从 clean master 创建短生命周期分支，创建本轮 task plan 和 evidence，执行一次本地验证/审查任务。优先覆盖：
1. 仓库状态、队列状态、外部 readiness 记录一致性。
2. 本地质量门禁：Test-AgentSystemReadiness、Invoke-QualityGate、Test-NamingConventions、Test-GitCompletionReadiness、git diff --check。
3. 本地构建：npm.cmd run build。
4. E2E：npm.cmd run test:e2e；如耗时或环境失败，记录具体失败原因和可复现命令。
5. 关键本地业务流风险审查：auth/session、student practice/mock/report/mistake_book、content question/material/paper、admin ops、audit_log、ai_call_log、AI/RAG mock/local boundary。
6. 人工内容后台体验：内容创建/资料上传/材料引用/真题卷引用/后续答题链路可见性。
7. local/dev AI 体验：最多 5 次真实 provider 调用；如不可用则记录原因并回退 mock/local AI。
8. 对照最近 Phase 11 evidence，列出 P0/P1/P2/P3 问题分级、AC-to-runtime 矩阵、验证记录、Repository Hygiene Closeout Checklist、stagingDecision、下一步建议。

允许：
- 只读扫描源码、测试和文档。
- 运行本地测试、E2E 和构建。
- 使用已有 local/dev 测试数据、项目库里的受控教材/真题引用、以及 ignored runtime 输出目录。
- 为本轮验证新增 task plan/evidence。
- 在本地内容后台进行受控测试资料体验。
- 在 local/dev 中最多 5 次真实 AI provider 调用体验。

禁止：
- 禁止读取或输出 .env.local secret。
- 禁止连接 staging/prod。
- 禁止部署。
- 禁止改云资源或创建公开对象存储 URL。
- 禁止新增、升级或删除依赖。
- 禁止修改 package.json/lockfile。
- 禁止修改 schema/migration/script，除非我后续明确批准。
- 禁止记录 secret、token、Authorization header、raw provider payload、raw prompt、raw answer、raw model response、完整试卷/教材/OCR 全文或客户/类客户私密数据。

如果验证发现需要代码修复，请先分级并说明是否属于本地 P0/P1/P2；遇到依赖、schema/migration/script、secret/env、腾讯云、staging/prod、部署、重大权限模型、破坏性数据操作，必须暂停请求批准，不得绕过。

本轮结束时，请形成 evidence，并根据机制决定是否提交、合入、推送和清理分支；若只是审查没有代码改动，也要保持仓库洁净并给出下一步建议。
```
