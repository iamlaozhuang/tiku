# Content AI 0704 Next Proof Approval Package

## Decision Needed

The full content backend AI出题 / AI组卷 business loop remains unproven on localhost 0704 after the latest closed tasks.
The next proof cannot safely continue by ordinary no-Provider POST because current code only persists a generated draft
when the runtime bridge returns acceptable generated content.

Approve exactly one next path before the next executable branch starts.

## Option A: Fresh Provider-Enabled Localhost Replay

Use this when the acceptance goal is to prove the real AI/RAG generation path.

Required approval text:

> 批准在 localhost / 127.0.0.1 上执行一次内容后台 AI 出题和 AI 组卷 Provider-enabled 0704 验收；允许进程内读取必要 Provider 凭证但不得输出 env 值、Provider payload、raw prompt、raw AI output、完整题目/试卷/材料/资源/chunk、session/cookie/token/localStorage/Auth header，并只写脱敏 evidence。

Execution boundaries for the future branch:

- localhost / 127.0.0.1 only.
- Provider call allowed only for the approved content backend AI出题 / AI组卷 replay.
- No staging/prod/deploy/Cost Calibration.
- No credential value in chat, logs, commits, evidence, screenshots, or exports.
- No raw prompt, raw AI output, Provider payload, full question, full paper, full material, full resource, or full chunk in evidence.
- After generation, verify review/adoption/detail/publish/user-usable path with redacted status evidence only.
- Run targeted tests for content AI generation, formal draft adoption, paper draft/publish, and role-boundary regressions.

## Option B: Approved Local 0704 Fixture/History Refresh

Use this when the acceptance goal is to prove product closed-loop behavior without live Provider execution.

Required approval text:

> 批准对本地 0704 DB 做一次非破坏性、脱敏的内容 AI 出题/组卷验收历史补齐；只允许面向 localhost 验收创建或更新可发布的 AI 出题评审记录与 AI 组卷试卷草稿，不允许 destructive DB 操作、schema/migration/seed/package 变更，不输出 DB URL、凭证、raw DB row、内部 id、完整题目/试卷/材料/资源/chunk。

Execution boundaries for the future branch:

- Confirm the local process target is 0704 before any write, without outputting DB URL or credentials.
- Non-destructive data changes only; no delete/truncate/drop/reset.
- No schema, migration, seed, dependency, package, or lockfile change.
- No Provider call and no env/secret output.
- Create only the minimum publishable AI出题 review target and AI组卷 paper draft target needed for acceptance.
- Preserve role/edition boundaries for `personal_advanced_student`, `org_advanced_employee`, and `org_advanced_admin`.
- Evidence must be aggregate/status-level only.

## Recommended Sequence After Approval

1. Open one short branch for the approved proof path only.
2. Re-read requirements, ADRs, latest evidence, and affected code before execution.
3. Execute the approved path with redacted evidence.
4. If a source defect is reproduced, stop and open a separate `codex/*` fix branch for that single issue.
5. After proof data exists, replay content AI出题 publish loop.
6. Replay content AI组卷 publish loop.
7. Replay role-boundary regression for personal advanced learner, organization advanced employee, and organization advanced admin.
8. Close with targeted tests, lint, typecheck, diff check, Module Run v2 gates, adversarial audit, merge, push, and branch cleanup.

## Non-Claims

- No Provider execution is approved by this package itself.
- No DB mutation is approved by this package itself.
- No final business-loop Pass is claimed by this package.
- No release readiness, staging/prod, deployment, production usability, Cost Calibration, or broad production coverage is claimed.
