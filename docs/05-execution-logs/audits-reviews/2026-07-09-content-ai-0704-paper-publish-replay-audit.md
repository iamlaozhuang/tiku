# 2026-07-09 Content AI 0704 Paper Publish Replay Audit

## Scope

- Reviewed branch: `codex/content-ai-0704-paper-publish-replay`
- Scope boundary: local 0704 content-admin AI组卷 formal paper publish replay and authorized student visibility only.
- Out of scope: source implementation, Provider execution, screenshots, raw DOM, schema/migration/seed, dependency/package changes, staging/prod/deploy, Cost Calibration, and broad release readiness.

## Adversarial Review

- Role boundary:
  - Publish used `super_admin` as a content-capable admin role because the scenario `content_admin` credential did not authenticate against current 0704 state.
  - Student visibility used a personal user with matching product authorization, not admin access.
  - Personal advanced learner, organization advanced employee, and organization advanced admin AI code paths were not modified.
- Data boundary:
  - The AI组卷 target was an existing formal paper draft composed from platform formal question references.
  - Publish went through the existing paper publish service, including draft status, score alignment, non-empty paper_section, and paper question count validation.
  - The local account fixture was created through product APIs only; no direct DB mutation was used.
- Authorization boundary:
  - Existing private learner/employee accounts had no matching scope, so they were not used to overclaim visibility.
  - The added local fixture received a matching personal activation through redeem-code redemption, then visibility was checked through `GET /api/v1/student-papers`.
- Sensitive information:
  - Evidence records only route labels, status categories, field-shape findings, and aggregate counts.
  - No secret, token, cookie, credential, plaintext redeem_code, env value, DB URL, raw DB row, internal id, Provider payload, raw prompt/output, full question, full paper, material, resource, or chunk content is recorded.

## Residual Risk

- This is local 0704 acceptance evidence, not release readiness or production usability.
- The product-route account fixture is acceptable for this local replay but should not be interpreted as a general fixture seeding process.
- Provider-enabled generation remains blocked without fresh approval.

## Verification Summary

- Runtime paper publish replay: pass.
- Local account fixture and student visibility replay: pass.
- Targeted content AI / paper regression: pass, 6 files, 116 tests.
- Adjacent personal learner AI regression: pass, 4 files, 96 tests.
- Adjacent organization regression: pass, 6 files, 119 tests.
- Lint: pass.
- Typecheck: pass.
- Diff check: pass.
- Scoped Prettier check: pass.
- Module Run v2 precommit hardening: pass.
- Module Run v2 prepush readiness: pass.
