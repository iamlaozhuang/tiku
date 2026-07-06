# 2026-07-06 Provider Count Timeout Observability Audit Review

## Verdict

The Provider-enabled content-admin failure is count-sensitive and timeout-like. With the same local owner-preview path, sufficient grounding, and credential availability, `questionCount=1` succeeds and parses a structured preview, while `questionCount=10` executes the Provider call but fails in the `gte_60s` bucket as `provider_error` with no generated content.

## Evidence-Supported Claims

- Grounding is not the differentiator: both probes had `sufficient` evidence with citation count `3`.
- Credential availability is not the differentiator: both probes saw a credential in local development env semantics.
- Route-integrated parsing is not the default-count failure point: the 10-count run produced no visible content to parse, while the 1-count run parsed successfully.
- The 0704 tiny Provider success evidence remains valid only for small counts.
- Default 10-question Provider success remains blocked.

## Adversarial Findings

1. Default-count content-admin AI出题 is still not usable.
   - The request reaches Provider execution but no draft or structured preview is produced.

2. Failure classification remains coarse.
   - The runtime observed `gte_60s`, but the sanitized category is `provider_error`, not `timeout`.
   - This suggests the thrown external error is not currently recognized as an `AbortError`, or the provider/runtime wraps it before classification.

3. Count `1` success cannot be generalized.
   - It proves the bridge, grounding, credential access, Provider call, and parser can work.
   - It does not prove default 10-question reliability, cost, latency, or production usability.

4. No source defect is proven by this audit.
   - The same source path can succeed with a smaller count.
   - A future fix should only happen after deciding whether product behavior should lower default count, change timeout/category mapping, or expose a safer retry/downshift path.

## Recommendation

Next decision should be product/ops scoped, not a broad source repair:

- either set a safer local/default generation count or bounded UX expectation;
- or run a separate source observability fix only for timeout/category mapping if clearer frontend/operator messaging is required;
- or run a fresh-approved Provider parameter experiment if the owner wants more counts, explicitly outside Cost Calibration.

Do not claim release readiness, production usability, staging readiness, or Cost Calibration from this evidence.

## 品味合规自检 Checklist

- 未修改产品源码、测试源码、schema、迁移、依赖或 lockfile。
- 临时 Provider 探针已删除，提交范围仅限 docs/evidence/state。
- evidence 只记录聚合状态、错误分类、布尔值、计数和命令结果。
- 未记录凭证、session、cookie、token、env 值、DB 原始行、内部 id、Provider payload、raw prompt、raw AI output、完整题目/试卷/材料。
- 未执行 staging/prod/deploy 或 Cost Calibration。
- 未把 1 题 Provider 成功外推为默认 10 题、release 或 production 结论。
