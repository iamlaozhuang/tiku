# 2026-07-08 Organization Training Read Model Kind Audit

## Adversarial Review

- Role boundary:
  - Organization training page remains gated by the existing organization advanced workspace access checks.
  - Standard organization admin unavailable state is unchanged.
  - No employee route permission was weakened.
- Data boundary:
  - New repository lookup selects metadata fields only.
  - No prompt, Provider payload, raw AI output, generated body, employee answer text, or raw DB row is returned.
  - UI displays product labels only; it does not render source task ids, internal ids, or raw JSON.
- Business boundary:
  - `sourceKind` and `contentKind` are read-only labels and do not grant capabilities.
  - `mock_exam`, missing AI metadata, non-organization AI metadata, or source-version-only lineage remains `unknown`.
  - Platform `paper` source maps to `platform_paper` plus `paper_training`.
  - Organization AI metadata maps to `ai_question`/`question_training` or `ai_paper`/`paper_training` only when generation kind is proven.
  - Manual draft fallback is only used for drafts without source task or source version metadata.
- Scope boundary:
  - No DB schema, migration, seed, fixture, dependency, package, lockfile, Provider, env, staging, prod, deploy, or Cost Calibration change.
  - Publish/copy/takedown write endpoints were not redesigned.
  - New creation-entry split and draft preview/publish gating remain deferred to later approved stages.
- Regression boundary:
  - Existing draft/published/taken-down list actions remain visible.
  - Existing route tests for publish, copy, takedown, source-context attach, employee visible list, draft save, submit, and readonly summary pass.
  - Adjacent admin AI entry tests pass.

## Residual Risk

- Server pagination is applied in the service read model after fetching visible lifecycle rows. This removes the prior hard 100-row truncation and keeps the change small, but it is not yet a database-level count/page query.
- Drafts copied from older versions without source metadata intentionally display `unknown` rather than guessing. This is acceptable for Stage 2 and avoids false labels.

## Conclusion

Stage 2 implementation is bounded and test-covered. It is suitable for commit, fast-forward merge, master gates, push, and branch cleanup under the approved four-stage closeout policy.
