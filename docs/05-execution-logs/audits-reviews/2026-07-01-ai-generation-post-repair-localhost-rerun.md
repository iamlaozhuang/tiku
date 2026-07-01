# Audit Review: AI generation post-repair localhost rerun

## Review Scope

- Task id: `ai-generation-post-repair-localhost-rerun-2026-07-01`
- Branch: `codex/ai-generation-post-repair-localhost-rerun`
- Scope is local owner-preview rerun through localhost UI and redacted evidence only.

## Adversarial Checklist

- [x] Eligible role entries are reachable without OP-03/OP-04 regressions for sampled advanced roles.
- [x] Cross-role route inventory covers every known AI 出题 / AI 组卷 surface before declaring the rerun complete.
- [ ] AI 出题 / AI 组卷 outputs are not accepted as valid when grounding is insufficient. Real Provider sample intentionally deferred because a product UI defect was found first.
- [ ] No exercised surface can generate generic history/logistics or unrelated content without selected resource-package/RAG evidence. Static gate exists; browser Provider proof deferred.
- [x] Visible generated result appears near the action surface where available.
- [x] History lists remain separated by generation type/task type on sampled routes.
- [ ] Ordinary role UI does not expose local-contract, redaction, raw enum, schema identifier, Provider, prompt, or payload terms. Failed for content and organization admin AI surfaces.
- [ ] Debug/governance wording is absent from learner, employee, organization admin, and content operation views unless the view is explicitly diagnostic. Failed for content and organization admin AI surfaces.
- [x] Provider calls are bounded and recorded only as status/count/duration/token summary. No Provider call was made in this rerun after the UI defect was found.
- [x] Evidence contains no credentials, secret material, raw Provider input/output, screenshots, raw DOM, raw DB rows, PII, or full content.
- [x] No source/test/dependency/schema/migration/seed/staging/prod/deploy/e2e automation/Cost Calibration/release readiness/final Pass work was performed.

## Findings

- P1 fail: shared admin AI generation visible-content/history surfaces expose a redacted local-contract summary phrase to ordinary content and organization administrators.
- Provider sample remains blocked until the admin UI wording/source mapping defect is repaired and rechecked.
