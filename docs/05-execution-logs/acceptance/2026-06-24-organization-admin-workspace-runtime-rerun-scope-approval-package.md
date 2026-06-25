# Organization Admin Workspace Runtime Rerun Scope Approval Package

## Summary

- Package id: `ORGANIZATION_ADMIN_WORKSPACE_RUNTIME_RERUN_SCOPE_2026_06_24`.
- Source task id: `organization-admin-workspace-runtime-rerun-scope-approval-2026-06-24`.
- Source repair task id: `organization-admin-workspace-runtime-repair-2026-06-24`.
- Package status: prepared for human review.
- Runtime execution approved by this task: no.
- Final MVP Pass claim: none.

This package defines the exact boundary for a later local runtime rerun of the organization admin workspace rows. It does
not itself approve browser/runtime execution, credential handling, account actions, source changes, Provider work, or
final acceptance Pass.

## SSOT Read List

- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/01-user-auth.md`.
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/stories/epic-06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`.
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.

## Requirement Mapping Result

- Pass for package preparation: the target runtime rows map to R2, R3, R4, US-06-13, US-06-14, organization training,
  organization AI generation, and edition-aware authorization requirements.
- Not a runtime result: the package does not prove that the UI or route guards behave correctly in the browser.
- Not a product-source result: no source, test, schema, migration, dependency, env, Provider, account, or database action
  is approved here.

## Role Mapping Result

| Role row             | Required allow behavior                                                                                         | Required deny or unavailable behavior                                                                                                        | Chinese UI check |
| -------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `org_standard_admin` | Lands in `/organization/portal`; sees organization-scoped employee and authorization/status summaries.          | No `企业训练`, `统计摘要`, `AI出题`, or `AI组卷`; direct advanced routes show Chinese denied/unavailable state; no `/ops/*` or `/content/*`. | Required.        |
| `org_advanced_admin` | Lands in `/organization/portal`; sees `企业训练`, `统计摘要`, `AI出题`, and `AI组卷` inside organization scope. | No global system operations, no content authoring, no Provider/cost/payment/staging/prod surfaces.                                           | Required.        |

## Acceptance Mapping Result

- Later runtime rerun must record per-row allow and deny observations for `org_standard_admin` and `org_advanced_admin`.
- Later runtime rerun must explicitly check visible UI language. Required user-facing text must be Chinese for landing,
  navigation, loading, empty, error, denied, unavailable, and logout states.
- Later runtime rerun may observe only the route, visible Chinese labels, visible allow/deny state, and redacted outcome
  summary.
- Later runtime rerun must not claim final standard/advanced MVP Pass unless a separate final acceptance task is approved
  and all required rows pass.

## Proposed Later Runtime Scope

- Local targets only:
  - `http://127.0.0.1:3000`
  - `http://localhost:3000`
- Mandatory role rows:
  - `org_standard_admin`
  - `org_advanced_admin`
- Optional direct-route probes if approved in the later task:
  - `/organization/portal`
  - `/organization/organization-training`
  - `/organization/organization-analytics`
  - `/organization/ai-question-generation`
  - `/organization/ai-paper-generation`
  - `/ops/users`
  - `/content/papers`

## Credential And Evidence Rules

- If login is required, the owner manually enters credentials.
- Codex must not read credential documents, type credentials, reveal credentials, reset passwords, create accounts, disable
  accounts, mutate seed data, inspect local storage/session/cookies, or embed screenshots/HTML dumps in evidence.
- Evidence may record only:
  - role row;
  - route path;
  - visible Chinese UI pass/fail summary;
  - allowed or denied state summary;
  - redacted issue id if a gap is found.
- Evidence must not contain secrets, tokens, database URLs, Authorization headers, passwords, plaintext `redeem_code`,
  raw prompts, provider payloads, raw generated AI content, raw employee answer text, full `paper` content, screenshots,
  traces, local storage, session contents, or raw page dumps.

## Blocked Without Fresh Approval

- Browser/runtime execution.
- Dev server start.
- Owner credential entry or account action.
- Credential document reading by Codex.
- Source, test, script, e2e, schema, migration, seed, database, dependency, lockfile, or `.env*` changes.
- Provider/model calls, Provider configuration, provider payload evidence, or Cost Calibration.
- Staging/prod/cloud/deploy, payment, or external-service work.
- PR creation/update, force push, or force-with-lease.
- Final MVP Pass.

## Successor Task Proposal

- Proposed successor id: `organization-admin-workspace-runtime-rerun-2026-06-24`.
- Proposed successor status: `blocked_pending_fresh_runtime_approval`.
- Required approval phrase: approve `ORGANIZATION_ADMIN_WORKSPACE_RUNTIME_RERUN_SCOPE_2026_06_24`.
- The successor must create its own task plan, SSOT Read List, Role/Acceptance Mapping Result, evidence, audit, and
  allowed runtime/file boundary before any browser/runtime action.
