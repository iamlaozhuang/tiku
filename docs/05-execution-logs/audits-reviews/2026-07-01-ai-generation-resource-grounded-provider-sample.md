# AI Generation Resource-Grounded Provider Sample Audit Review

## Scope

- Review local resource grounding setup and real Provider sample rerun for AI 出题 / AI 组卷.

## Findings

- [P1] `ADMIN-AI-IDEMPOTENCY-01`: Admin AI generation uses deterministic task/result identity by workspace, generation kind, and actor. The persistence layer reuses existing task/result rows and does not refresh evidence or visible draft state after a later successful Provider execution. This explains why a fresh grounded AI 出题 run can execute Provider and parse `10/10` drafts while the product summary still shows `资料不足`.
- [P1] `ADMIN-AI-PAPER-VISIBLE-01`: Content admin AI 组卷 showed Provider execution and a result reference, but no visible structured paper preview. Treat as blocked for cross-role rerun until stale result reuse and visible-result materialization are repaired.
- [P2] `PRODUCT-UI-GOVERNANCE-01`: Ordinary AI generation pages no longer exposed `本地合约` or `已脱敏` during the rerun, but ordinary product surfaces still contain governance-style wording and student AI history/detail labels expose technical enum names. These must be converted to business language across the shared admin and student AI components.
- [P2] `RAG-QUERY-TOKENIZATION-01`: Local retrieval is sensitive to Chinese token overlap. Runtime-only keyword reinforcement made the approved owner-preview sample sufficient without relaxing gates, but durable source repair should centralize retrieval/query construction instead of per-route workarounds.

## Adversarial Review Notes

- Do not treat Provider execution alone as success. The user-visible state must show the correct evidence status and visible draft structure for the same request.
- Do not rerun the full role matrix before `ADMIN-AI-IDEMPOTENCY-01` is fixed. Otherwise repeated Provider calls can keep reusing stale result metadata and produce misleading evidence.
- The two user-reported issue families must stay in the cross-role matrix:
  - grounded generation must be enforced and reflected in UI for content admin, organization advanced admin, personal advanced student, and organization advanced employee;
  - internal/governance terms must be absent from ordinary paid-user/admin operation surfaces while still allowed in ops audit contexts.
- The next source repair should reuse the shared admin AI route/service/result persistence contracts and the shared student/admin AI UI components. Do not create role-specific duplicate fixes.

## Boundary Checklist

- No credentials or session material recorded.
- No `.env*` values recorded or modified.
- No Provider payload, prompt, raw AI input/output, or full generated content recorded.
- No full resource, material, or chunk content recorded.
- No raw DOM, screenshot, trace, HTML dump, DB raw row, internal id, or PII recorded.
- No source, test, dependency, package, lockfile, schema, migration, seed, staging, prod, deploy, PR, force-push, release-readiness, final Pass, or Cost Calibration changes.
