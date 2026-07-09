# 2026-07-09 Learner AI Paper Parameters Contract Audit

## Adversarial Review

- Hidden default mismatch: mitigated by sending the visible learner AI组卷 distribution, structure, difficulty, and learning objective values through `generationParameters`.
- Invalid enum fallback risk: mitigated by using existing contract normalizers and rejecting invalid `questionTypeDistribution` or `paperStructure` values.
- Personal/organization source confusion: personal AI组卷 still submits no enterprise source preference; organization employee AI组卷 preserves the selected source preference.
- AI出题 regression: added AI组卷-only fields are attached only for `ai_paper_generation`; AI出题 keeps its existing parameter shape.
- Scope creep: this branch does not change AI组卷 assembly, learning-session creation, paper container persistence, enterprise training, content admin AI, or formal record writes.
- Sensitive evidence: evidence and tests do not include credentials, raw DB rows, Provider payloads, prompts, raw AI output, or full question/paper/material content.

## Residual Risk

- The visible AI组卷时长目标 control remains a UI-only field because the existing route-integrated generation parameter contract has no duration field. Adding one would be a separate contract extension task.
- This branch only ensures parameter submission and validation. Starting AI组卷 from the assembled paper container remains the next planned branch.

## 品味合规自检 Checklist

- 已使用既有 route-integrated 参数契约和 normalizer，没有新增重复枚举体系。
- API JSON 字段继续使用 `camelCase`，枚举值继续使用既有小写下划线合同值。
- 未新增依赖，未修改 package 或 lockfile。
- 未引入 schema、migration、seed 或 destructive DB 操作。
- 未把凭证、session、cookie、token、env、Provider payload、raw prompt、raw AI output 或完整题目/试卷/材料写入 evidence。
- 修改范围仅覆盖 learner AI组卷参数提交与验证，没有改组卷选题、学习会话、企业训练或内容后台链路。
