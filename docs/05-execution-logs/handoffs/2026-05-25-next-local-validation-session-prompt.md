# Next Local Validation Session Prompt

复制下面提示词开启下一轮会话。

```text
继续 D:\tiku。请用中文沟通，严格遵守 AGENTS.md 与项目半自动化推进机制，不凭对话记忆继续，必须从仓库状态恢复。

本轮目标：暂停 Phase 11 staging 实施规划，改为从 clean master 做一次系统性本地验证，尽量找出本地产品、运行时、测试、证据和仓库卫生方面的潜在问题。不要部署，不连接 staging/prod，不读取或输出 .env.local secret，不改云资源，不改依赖，不改 schema/migration/script，除非我后续明确批准。

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
- 域名 jiandingtiku.cn 已申请
- DNS 解析未配置
- ICP 备案等待中
- 云服务器未采购
- 数据库服务未采购
- Phase 11 staging implementation planning 暂停，等资源准备好后再恢复

请从 clean master 创建短生命周期分支，创建本轮 task plan 和 evidence，执行一次本地验证/审查任务。优先覆盖：
1. 仓库状态、队列状态、外部 readiness 记录一致性
2. 本地质量门禁：AgentSystemReadiness、NamingConventions、Invoke-QualityGate、GitCompletionReadiness、git diff --check
3. 本地构建：npm.cmd run build
4. E2E：npm.cmd run test:e2e；如耗时或环境失败，记录具体失败原因和可复现命令
5. 关键本地业务流风险审查：auth/session、student practice/mock/report/mistake_book、content question/material/paper、admin ops、audit_log、ai_call_log、AI/RAG mock/local boundary
6. 对照最近 Phase 11 evidence，列出 P0/P1/P2/P3 问题分级、AC-to-runtime 矩阵、验证记录、Repository Hygiene Closeout Checklist、stagingDecision、下一步建议

允许：
- 只读扫描源码、测试和文档
- 运行本地测试和构建
- 使用已有 local/dev 测试数据和 ignored runtime 输出目录
- 为本轮验证新增 task plan/evidence 文档

禁止：
- 禁止读取或输出 .env.local secret
- 禁止连接 staging/prod
- 禁止部署
- 禁止改云资源
- 禁止新增/升级/删除依赖
- 禁止修改 package.json/lockfile
- 禁止修改 schema/migration/script，除非我后续明确批准
- 禁止记录 secret、token、Authorization header、raw provider payload、raw prompt/raw answer/raw model response、完整试卷/教材/OCR 全文或客户/类客户私密数据

如果验证发现需要代码修复，请先分级并说明是否属于本地 P0/P1/P2；遇到依赖/schema/migration/script/secret/env/真实 provider/腾讯云/staging/prod/部署/重大权限模型/破坏性数据操作，必须暂停请求批准，不得绕过。

本轮结束时，请形成 evidence，并根据机制决定是否提交、合入、推送和清理分支；若只是审查没有代码改动，也要保持仓库洁净并给出下一步建议。
```
