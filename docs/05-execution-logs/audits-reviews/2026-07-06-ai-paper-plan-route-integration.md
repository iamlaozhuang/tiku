# 2026-07-06 AI paper plan route integration adversarial audit

## Review Stance

This review uses反证优先：先检查本包证据不能证明什么，再记录可证明的最小结论。

## Findings

### P1: 本包仍未证明本地正式题库选题已接入 route runtime

Evidence: focused unit only covers Provider instruction and structured preview parsing. The new `ai-paper-plan-and-select-service` and `ai-paper-source-adapter-service` are not invoked by admin or personal route handlers in this package.

Impact: cannot claim AI组卷 runtime already assembles final paper containers from platform or enterprise formal sources.

Disposition: expected residual; next package should wire route/service assembly with injected source adapters or repositories under local unit tests.

### P1: `paper_draft` preview kind remains as compatibility wrapper

Evidence: structured preview kind remains `paper_draft` to avoid expanding UI blast radius in this backend-focused package. Semantics now reject nested generated question content and summarize plan sections only.

Impact: current UI naming may still look like old paper draft behavior until later UI packages update all-Chinese product wording and paper-container UX.

Disposition: expected residual; must not use this package as UI/UX pass evidence.

### P2: Content-admin formal paper draft adoption is not solved here

Evidence: content-admin paper adoption previously depended on nested generated question drafts. This package blocks those nested generated question bodies at the route-integrated preview layer and does not create a new formal draft adoption path from selected existing platform questions.

Impact: content-admin AI组卷 direct creation of reviewable paper draft remains a follow-up implementation task.

Disposition: route-side safety improved; governed paper draft materialization remains open.

## Pass Evidence

- TDD RED was observed against the old AI组卷 contract.
- Focused GREEN passed for shared instruction/parser/admin-runtime/personal-runtime files.
- Typecheck, lint, and diff check passed.
- No Provider, DB runtime, browser, env/secret, dependency, schema, migration, seed, staging/prod/deploy, or Cost Calibration action was executed.

## Boundary Check

- Evidence is redacted.
- No credentials, sessions, cookies, tokens, env values, DB rows, internal ids, Provider payloads, raw prompts, raw AI output, full question, full answer, full paper, material text, screenshots, DOM, trace, or private fixture values are recorded.
- This is not release readiness, production usability, staging readiness, Provider readiness, final Pass, or Cost Calibration evidence.
