# Content Admin Platform F2 Operations And Super-Admin Acceptance Plan

Date: 2026-07-14

Task: `content-admin-platform-f2-operations-super-admin-acceptance-2026-07-13`

Branch: `codex/content-admin-platform-f2-operations-super-admin-acceptance`

Profile: R3 / `independent_audit`

Baseline: `master == origin/master == 36bbef891265566c30da1a5c0657e7ccc6cdc761`

## Goal

Prove the canonical 0704DB `ops_admin` and `super_admin` representative localhost workflows for users, backend
accounts, organizations, `org_auth`, employees, `redeem_code`, contact configuration, audit logs and AI call logs.
Acceptance is read-only except for temporary login/logout sessions. It must preserve server-owned role, edition, phone,
card-plaintext and log-redaction boundaries without executing Provider, model-health, write, copy or disclosure actions.

## Required Reading

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-1-operations-and-super-admin.md`
- `docs/01-requirements/traceability/2026-07-12-phone-visibility-and-prelaunch-ai-paper-history-decision.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- B-F serial plan, standing authorization, PIC/exception ledger, E0 route inventory, E2 evidence/audit, F0 readiness
  evidence/audit and F1 closeout evidence/audit.
- Latest 0704 operations-list, role-routing, role-error-boundary and canonical credential evidence/audits.
- Canonical private 0704 index/catalog, retained only in process memory under the user's explicit 0704DB credential
  authorization.
- Current operations route entrypoints, user/org-auth/card/log runtime clients and focused role/phone/card/redaction
  tests.

Relevant reconciliation anchors are `CT-REQ-004` through `CT-REQ-015`, `CT-REQ-022`, `CT-REQ-027`, `CT-REQ-032`,
`CT-REQ-041` through `CT-REQ-043`, `CT-REQ-046`, `CT-REQ-049`, `CT-REQ-052`, `CT-REQ-058` and `CT-REQ-060`.
Later requirements and completed E2/0704 proof supersede historical partial UI observations; no closed A01-A30 class is
reopened without fresh current-master failure evidence.

## Representative Matrix

| Actor         | Surface                 | Representative proof                                                                                                                   | Mutation boundary                                 |
| ------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `ops_admin`   | overview and users      | role-aware landing, non-empty masked learner/employee list, read-only detail, backend-account boundary                                 | no reveal/copy/reset/disable/create               |
| `ops_admin`   | organizations and auth  | non-empty tree and employee list, truthful current auth state, read-only detail, explicit edition/scope states                         | no create/edit/move/import/transfer/unbind/cancel |
| `ops_admin`   | `redeem_code`           | non-empty eligible plaintext/list-detail state without retaining or copying any value                                                  | no generation/copy/filter mutation                |
| `ops_admin`   | contact and logs        | read-only contact preview, non-empty redacted audit detail, truthful AI-call-log state                                                 | no save/export/delete/model action                |
| `super_admin` | accounts and governance | role-aware landing, platform-account/model/Prompt capability distinction and redacted log state                                        | no account/model/Prompt/provider mutation         |
| both          | route isolation         | operations access remains allowed; unrelated workspaces fail closed for `ops_admin`; super-admin breadth does not erase context guards | no authorization-context change                   |

## Execution

1. Materialize F1 closeout and claim only F2 with F3 as the unique next task.
2. Read the private index then canonical catalog, start an isolated localhost process with the process-only 0704DB
   target and `AI_PROVIDER_ENABLED=false`, and log in once per canonical operations role.
3. Drive the representative routes with Playwright CLI. Retain only safe aggregate assertions; retain no screenshots,
   snapshots, DOM, traces, phones, card values, identifiers or private content.
4. Inspect read-only details and role-specific affordances without executing business writes, full-phone disclosure,
   card copy, Provider/model health, account, authorization, employee, contact or log actions.
5. Revoke both temporary sessions, stop the runtime and prove port/private-env/browser/cache cleanup.
6. Run focused operations, role, phone, card and redaction suites, lint, typecheck, changed-file format, diff,
   recovery/serial/security and Module Run gates. The same-scope shared-layout repair triggers a current-source build
   and one serial full regression; dependency, configuration and infrastructure remain unchanged.

## Boundary Guards

- Credentials, cookies, sessions, tokens, env/DB values, raw rows, phones, `redeem_code` values, identifiers, private
  content, screenshots, snapshots, DOM and traces never enter chat, repository artifacts or retained logs.
- Product data access is bounded to localhost reads. Full-phone reveal/copy and `redeem_code` copy are not executed
  because their audit writes would violate F2's database-mutation boundary.
- Eligible card plaintext may render in product UI, but automation records only role-eligibility booleans and never the
  value. Default phone display must remain masked.
- UI visibility is not authorization proof. Direct routes and focused server tests retain the authoritative boundary.
- Provider calls, model connection tests, Cost Calibration, dependency/schema/config changes and deployment are blocked.
- A fresh independent product defect is isolated through X2; optional empty data is reported truthfully, not fabricated.
- Fresh browser evidence found one same-scope F2 presentation defect: the authenticated `super_admin` context band was
  correct, but both split log pages still described the viewer as `ops_admin` because their local default prop bypassed
  the layout's authenticated roles. This is the F2 role-isolation contract itself, so the serial plan's same-root-cause,
  same-scope rule keeps the minimal repair in F2; X2 remains reserved for independent defects.

## Allowed Changes

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/active-state-history-index.yaml`
- `docs/05-execution-logs/task-plans/2026-07-14-content-admin-platform-f2-operations-super-admin-acceptance.md`
- `docs/05-execution-logs/evidence/2026-07-14-content-admin-platform-f2-operations-super-admin-acceptance.md`
- `docs/05-execution-logs/audits-reviews/2026-07-14-content-admin-platform-f2-operations-super-admin-acceptance-audit.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-pic-coverage-and-exception-ledger.md`
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`
- `src/components/AdminDashboardLayout/AdminDashboardLayout.test.tsx`
- `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx`

## Validation And Review

- Focused runtime acceptance: two canonical operations sessions, representative account/org/auth/card/log surfaces,
  legal envelopes, role isolation, no unexpected console/request error and complete cleanup.
- Focused unit proof: summary-first operations UI, user/org-auth/card contracts, split redacted logs, workspace guards,
  phone masking/disclosure denial, eligible card runtime and shared state/accessibility behavior.
- Round 1 attacks data integrity, account domains, role/edition/auth/card/log contracts and current requirement mapping.
  Round 2 attacks regression, privilege escalation, sensitive leakage, direct-route behavior, keyboard/focus/layout,
  accidental mutation, cross-page inconsistency and over-design.

The shared authenticated layout change triggers a current-source build and an extra bounded-concurrency full unit
regression. Closeout uses one F2 source/test/docs/state commit, ff-only merge to `master`, authorized push to
`origin/master`, equality proof and short branch/worktree cleanup. F3 starts automatically. No deployment.
