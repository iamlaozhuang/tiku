# 2026-07-10 0704 Post-AI Acceptance Roadmap

## Purpose

This roadmap organizes the owner-approved post-AI acceptance work after the 0704 AI generation, RAG citation, log privacy,
history recovery, and account readiness coverage has been closed. It prevents duplicate reruns and defines stage-level
acceptance standards before each validation branch starts.

## Global Rules

- Each stage runs on a fresh `codex/*` branch from latest `origin/master`.
- Each stage starts by reading `AGENTS.md`, state, queue, this roadmap, the 0704 coverage ledger, relevant requirement
  SSOT, and recent evidence.
- Each business validation stage must read the private 0704 credential index and use only in-memory credentials for a
  redacted readiness preflight.
- Validation-only comes first. If a real product defect is found, record redacted symptoms, stop the validation branch,
  and open a separate repair branch.
- Evidence may include role labels, route labels, status categories, authorization context categories, command results,
  and test counts.
- Evidence must not include credentials, passwords, cookies, tokens, sessions, localStorage, Authorization headers, env
  values, DB URLs, raw DB rows, internal numeric ids, Provider payloads, raw prompts, raw AI output, full
  `question`/`paper`/`material`/resource/chunk content, employee raw answers, plaintext `redeem_code`, screenshots, raw
  DOM, traces, or private fixture values.
- Provider-enabled, direct DB mutation, destructive DB operation, staging/prod/deploy, env/secret, payment, and Cost
  Calibration remain blocked unless a later stage receives fresh explicit approval.

## Stage Matrix

| Order | Task id                                     | Primary objective                                                           | Required roles                                                                                                                                                                     | Main acceptance standard                                                                                                                                                  |
| ----: | ------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|     1 | `0704-authorization-lifecycle-acceptance`   | Prove authorization state controls access boundaries.                       | `personal_standard_student`, `personal_advanced_student`, `org_standard_admin`, `org_advanced_admin`, `org_standard_employee`, `org_advanced_employee`, `ops_admin`, `super_admin` | `effectiveEdition` and source authorization decide allow/deny; UI visibility is not treated as the boundary.                                                              |
|     2 | `0704-org-multitenancy-boundary-acceptance` | Prove organization data and admin/employee boundaries do not cross tenants. | `org_standard_admin`, `org_advanced_admin`, `org_standard_employee`, `org_advanced_employee`, `ops_admin`                                                                          | Organization admins see scoped summaries/status only; employees and other organizations cannot access unrelated data.                                                     |
|     3 | `0704-non-ai-learning-smoke`                | Prove standard learning still works after AI closure.                       | `personal_standard_student`, `personal_advanced_student`, `org_standard_employee`, `org_advanced_employee`                                                                         | Ordinary practice, `mock_exam`, report, mistake-book, and resume states remain usable without AI rerun.                                                                   |
|     4 | `0704-content-non-ai-publish-smoke`         | Prove formal content maintenance is stable without AI generation reruns.    | `content_admin`, `super_admin`                                                                                                                                                     | `question`, `material`, and `paper` publish/takedown/edit-copy boundaries remain correct and do not corrupt referenced content.                                           |
|     5 | `0704-exception-degradation-smoke`          | Prove failure states are safe and understandable.                           | Stage-specific affected roles                                                                                                                                                      | Provider disabled, quota/authorization/source insufficiency, duplicate submit, stale history, and empty states do not leak sensitive internals or pollute formal records. |
|     6 | `0704-release-candidate-local-gates`        | Produce the final local release-candidate confidence packet.                | readiness preflight roles only                                                                                                                                                     | No pending mandatory acceptance gap, no sensitive evidence, static gates and Module Run v2 pass on `master`.                                                              |

## Stage 1 Acceptance Standard

Authorization lifecycle validation passes only if:

- standard personal and standard organization contexts cannot access advanced AI or enterprise-training capabilities;
- advanced personal and advanced organization contexts can discover eligible advanced entries;
- organization employee access is derived from current valid `org_auth` context, not personal authorization or stale UI
  cache;
- organization admins and employees cannot use personal `edition_upgrade` semantics to alter `org_auth`;
- expired, cancelled, revoked, missing, or out-of-scope authorization produces a clear denied/unavailable status;
- any `redeem_code` evidence remains redacted and never records plaintext values or internal ids.

Stop conditions:

- readiness preflight fails for any in-scope role;
- actual validation needs DB write, Provider execution, screenshot/raw DOM, or staging/prod access not separately
  approved;
- observed behavior contradicts ADR-007 or edition-aware authorization requirements.

Stage result:

- `0704-authorization-lifecycle-acceptance`: closed by
  `docs/05-execution-logs/evidence/2026-07-10-0704-authorization-lifecycle-acceptance-evidence.md`.
- Result category: `pass_targeted_authorization_lifecycle_contract_smoke`.
- Rerun rule: no full 0704 AI or enterprise-training chain rerun; use this stage as the current authorization lifecycle
  gate unless a later task records fresh contrary evidence.

## Stage 2 Acceptance Standard

Organization and multitenancy boundary validation passes only if:

- organization admin route/service checks filter by scoped `organization`;
- `org_standard_admin` remains read-only for roster/status/auth status and cannot manage training, AI, or employee
  mutation;
- `org_advanced_admin` can access advanced organization surfaces only inside its allowed organization scope;
- organization admins cannot view employee learner AI raw results, raw answers, global AI logs, Provider payloads, or raw
  task payloads;
- cross-organization list, detail, analytics, training, and employee access are denied or empty by status category;
- admin-visible analytics remain aggregate and separate enterprise-training metrics from formal learning signals.

Stage result:

- `0704-org-multitenancy-boundary-acceptance`: closed by
  `docs/05-execution-logs/evidence/2026-07-10-0704-org-multitenancy-boundary-acceptance-evidence.md`.
- Result category: `pass_targeted_org_multitenancy_boundary_contract_and_localhost_api_smoke`.
- Rerun rule: no full enterprise-training publish or learner AI chain rerun; use this stage as the current organization
  and tenant boundary gate unless a later task records fresh contrary evidence.

## Stage 3 Acceptance Standard

Non-AI learning smoke passes only if:

- authorized personal and employee learners can enter ordinary practice and `mock_exam` flows;
- answer, submit, result/report, objective `mistake_book`, and resume/continue categories work at status level;
- standard and advanced editions both retain baseline non-AI learning access when authorization scope is valid;
- authorization loss, paper takedown, or account/organization disable terminates in-progress work by status category;
- evidence records no full stem, answer, analysis, report snapshot, or raw answer content.

Stage result:

- `0704-non-ai-learning-smoke`: closed by
  `docs/05-execution-logs/evidence/2026-07-10-0704-non-ai-learning-smoke-evidence.md`.
- Result category: `pass_targeted_non_ai_learning_contract_runtime_ui_and_localhost_api_smoke`.
- Rerun rule: no AI generation, full browser E2E, or write-heavy learning chain rerun; use this stage as the current
  ordinary learning gate unless a later task records fresh contrary evidence.

## Stage 4 Acceptance Standard

Content non-AI publish smoke passes only if:

- `content_admin` can access formal content maintenance surfaces;
- draft `question`, `material`, and `paper` lifecycle status categories behave as expected;
- publish validation blocks incomplete paper status categories;
- published `paper` and referenced `question`/`material` boundaries remain immutable where required;
- takedown blocks new learner starts while preserving historical status categories;
- AI generation formal adoption is not rerun unless a later explicit task asks for it.

## Stage 5 Acceptance Standard

Exception and degradation smoke passes only if:

- Provider-disabled or Provider-unavailable states use safe user-facing status categories and never leak Provider payloads,
  raw prompts, raw AI output, or stack traces;
- insufficient formal question sources, missing knowledge coverage, weak/none `evidence_status`, and empty lists produce
  safe adjustment or denial categories;
- duplicate submit, stale history, refresh, relogin, and resume failure paths are idempotent by status category;
- failures do not create formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` records
  outside approved flows;
- admin-side summaries remain redacted.

## Stage 6 Acceptance Standard

Release-candidate local gates pass only if:

- `master` is clean and aligned with `origin/master` before and after the packet;
- coverage ledger has no mandatory pending post-AI acceptance item;
- all prior stage evidence and audit files exist and use redacted status categories only;
- no unapproved package/lockfile, schema, migration, seed, env, secret, Provider, staging/prod/deploy, or Cost
  Calibration work exists in the release-candidate diff;
- targeted tests, lint, typecheck, format, `git diff --check`, sensitive-evidence scan, and Module Run v2 gates pass.

## Execution Order

1. Seed roadmap and queue tasks.
2. Run `0704-authorization-lifecycle-acceptance`.
3. Run `0704-org-multitenancy-boundary-acceptance`.
4. Run `0704-non-ai-learning-smoke`.
5. Run `0704-content-non-ai-publish-smoke`.
6. Run `0704-exception-degradation-smoke`.
7. Run `0704-release-candidate-local-gates`.

## Closeout Rule

Every stage must close with:

- task plan;
- redacted evidence;
- adversarial audit;
- updated ledger or roadmap status;
- targeted tests and static gates;
- Module Run v2;
- commit, fast-forward merge to `master`, master-side gates, push, short-branch delete, clean/aligned confirmation.
