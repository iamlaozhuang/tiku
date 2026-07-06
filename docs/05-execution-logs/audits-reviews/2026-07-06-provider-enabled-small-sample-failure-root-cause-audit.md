# 2026-07-06 Provider-Enabled Small-Sample Failure Root-Cause Audit Review

## Verdict

Root cause localized. The current content-admin Provider-enabled 10-question default path reaches local owner-preview runtime, has sufficient grounding, sees a Provider credential, and executes one Provider call. It then fails in the Provider execution layer after the configured 60s window with `provider_error`, no HTTP status/code, no visible generated content, and no structured preview.

## Evidence-Supported Claims

- The failure is not a grounding materialization problem: grounding was `sufficient` with citation count `3`.
- The failure is not a missing credential problem under development env semantics: credential presence was true.
- The failure is not a standard-role authorization problem: the probe used the content-admin runtime boundary.
- The failure is not a structured-preview parser problem: no visible generated content existed to parse.
- The earlier 0704 Provider success evidence for requested `1` question and `2` paper questions cannot be extrapolated to the content-admin frontend-equivalent default of `10` questions.
- Cost Calibration was not executed.

## Adversarial Findings

1. Provider-enabled default-count success remains blocked.
   - The 10-question content-admin path fails after one Provider call.
   - No usable draft, structured preview, or requested-count match was produced.

2. Current failure category is coarse.
   - Runtime duration was in the `gte_60s` bucket, but the sanitized failure category is `provider_error`, not `timeout`.
   - Because raw provider errors are not recorded, this audit cannot prove whether the external failure was a true timeout, wrapped abort, network failure, or provider-side failure.

3. Localhost route corroboration is partial.
   - The route reached a 60s HTTP 200 POST path under `next dev`.
   - The wrapper failed before printing the redacted response aggregate, so route response semantics are not claimed from that run.

4. Prior pass evidence remains bounded.
   - The 0704 runtime acceptance Provider pass is still valid for smaller samples.
   - It does not prove frontend default count or broader model health, latency, quota, or production usability.

## Unsupported Externalizations

- Do not claim Provider-enabled generation success for content-admin default AI出题.
- Do not claim local adversarial acceptance overall pass.
- Do not claim release readiness, final Pass, production usability, staging/prod readiness, or Cost Calibration.
- Do not claim a confirmed code defect without a separate source-level reproducer.

## Recommendation

Next useful work should be a separate, fresh-approved Provider parameter/timeout observability audit:

- compare requested question count `1` versus `10` without recording raw output;
- keep Provider calls bounded and counted;
- decide whether the route should expose a safe timeout category separately from generic `provider_execution_failed`.

No product source fix was made in this audit because the confirmed failure is localized to Provider execution behavior, not to grounding, authorization, persistence, or frontend mapping.

## 品味合规自检 Checklist

- 未修改产品源码、测试源码、schema、迁移、依赖或 lockfile。
- 临时探针已删除，提交范围仅限 docs/evidence/state。
- evidence 只记录聚合状态、错误分类、布尔值、计数和命令结果。
- 未记录凭证、session、cookie、token、env 值、DB 原始行、内部 id、Provider payload、raw prompt、raw AI output、完整题目/试卷/材料。
- 未执行 staging/prod/deploy 或 Cost Calibration。
- 未把本地 Provider 小样本失败外推为 release/production 结论。
