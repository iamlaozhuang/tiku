# Content Admin Platform B4 Form Contract Primitives Audit

Date: 2026-07-13

Task: `content-admin-platform-b4-form-contract-primitives-2026-07-13`

Verdict: `APPROVE`

No blocking findings.

Cost Calibration Gate remains blocked.

## Round 1 — Correctness, Data Integrity, Requirements, And Contracts

- Attacked validation-source drift. Question create/edit still share `QuestionWriteForm` and
  `getQuestionIntegrityIssues`; material create/edit still share `MaterialWriteForm` and `getMaterialIntegrityIssues`.
  The presentation contract consumes returned issues without duplicating or transforming business rules.
- Attacked first-invalid behavior. Issue order remains authoritative; unavailable fields fall forward, grouped fieldsets
  retain `tabIndex=-1`, and exact `data-field` equality replaces selector interpolation. Direct and consumer tests prove
  focus lands on the expected invalid target.
- Attacked error accessibility. The top summary is an alert, field errors remain linked through `aria-describedby`, and
  invalid controls keep `aria-invalid`; fixed validation messages do not include server diagnostics.
- Attacked duplicate submission and disabled meaning. Existing in-flight guards remain before the request; both save
  buttons explicitly reference a visible polite status explaining that a save is in progress.
- Attacked dirty-state accuracy. Each keyed form captures one lazy mount baseline, nested form values contribute to the
  caller fingerprint, and edits change the exposed state from `clean` to `dirty` without adding leave behavior early.

## Round 2 — Regression, Privilege, Exceptional Paths, Consistency, And Over-Design

- Attacked lint and React lifecycle regression. The initial ref-based draft was rejected by lint; the correction uses
  lazy state initialization, avoids render-time ref access, and keeps the baseline stable through parent rerenders.
- Attacked validation UX regression. Save remains enabled before validation and disabled only during the existing
  request; invalid submit still blocks the request, focuses the first target, and preserves author input.
- Attacked route and privilege expansion. No editor route, leave prompt, API, service, authorization, content lifecycle,
  AI, database, Provider, dependency, build configuration, or deployment behavior changed.
- Attacked data leakage. Components render only caller-provided fixed validation/status copy; tokens, raw API messages,
  internal ids, phone data, `redeem_code`, Prompt/Provider data, and authorization internals are absent.
- Attacked over-design. The contract owns no schema adapter, deep-equality implementation, form registry, context
  provider, global state machine, router integration, or universal serializer; fingerprint policy stays with callers.

## Approval

`APPROVE`: scope, focused validation, PIC accounting, and protected authorization/content-lifecycle boundaries match the
B4 contract.
