# 2026-07-06 AI paper local selection route assembly adversarial audit

## Review Stance

This review uses 反证优先: first identify what this package still cannot prove, then record the narrow evidence it can support.

## Requirement Mapping Result

- Requirement source: `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`.
- This package makes the new AI组卷 contract more true by connecting parsed paper-plan output to local formal-source selection at service level.
- It does not claim the full AI组卷 closed loop, runtime persistence, UI completion, browser acceptance, Provider readiness, release readiness, production usability, staging/prod, or Cost Calibration.

## Findings

### P1: 本包仍未证明 DB-backed route runtime 已能取到正式题源

Evidence: tests inject already resolved platform and enterprise selectable question candidates. No repository, route handler, DB connection, or local 0704 runtime path is executed.

Impact: cannot claim end-to-end AI组卷 runtime already creates paper containers from the live local DB.

Disposition: expected residual; later package should wire repository/route or runtime path under an approved local scope.

### P1: 本包不解决任何 UI/UX 风险

Evidence: no frontend files are changed. Existing learner, employee, organization admin, and content admin UI requirements remain future packages.

Impact: cannot claim all-Chinese UI, tab UX, visible quantity controls, source labels, preview-before-answer, or paper-container UX.

Disposition: expected residual; UI packages remain required.

### P2: Content-admin formal paper draft adoption remains open

Evidence: this package returns a local assembly result but does not create or persist a governed content paper draft.

Impact: content-admin AI组卷 direct creation of reviewable paper draft remains a follow-up.

Disposition: route/service selection foundation is ready; formal adoption should be separate.

## Pass Evidence

- TDD RED was observed before service implementation.
- Focused GREEN passed for the new route assembly service.
- Combined focused unit tests passed across route assembly, plan/select, source adapter, and route-integrated structured preview services.
- Typecheck, lint, and diff check passed.
- Module Run v2 pre-commit hardening passed.

## Boundary Check

- Evidence is redacted.
- No Provider, DB runtime, browser, env/secret, dependency, schema, migration, seed, staging/prod/deploy, or Cost Calibration action was executed.
- No credentials, sessions, cookies, tokens, env values, DB rows, internal ids, Provider payloads, raw prompts, raw AI output, full question, full answer, full paper, material text, screenshots, DOM, trace, or private fixture values are recorded.
