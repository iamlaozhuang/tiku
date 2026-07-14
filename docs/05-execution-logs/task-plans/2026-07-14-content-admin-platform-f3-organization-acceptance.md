# Content Admin Platform F3 Organization Acceptance Plan

Date: 2026-07-14

Task: `content-admin-platform-f3-organization-acceptance-2026-07-13`

Branch: `codex/content-admin-platform-f3-organization-acceptance`

Profile: R3 / `independent_audit`

Baseline: `master == origin/master == fa967f38f77275b16cbd801c3062c0efb5167b65`

## Goal

Prove the canonical 0704DB standard/advanced organization-admin and employee representative localhost workflows for
the organization portal, training administration, employee answering/read-only lifecycle, analytics and organization
AI. Acceptance is read-only except for temporary login/logout sessions. It preserves server-owned organization scope,
edition, authorization, training lifecycle and organization-private AI boundaries without executing Provider or any
business mutation.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/active-state-history-index.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- Always also includes the B-F serial plan, standing authorization, PIC/exception ledger, Program Init plan/evidence/audit
  and Module Run/closeout/archive SSOT/SOP.
- Requirements: requirements index; advanced index; edition-aware authorization; advanced authorization-context,
  organization-training, organization-analytics and organization-AI modules/stories; ADR-007.
- Traceability: current AI/Phase4 supersession baselines; role/auth/training decision package; current organization
  training, analytics and AI UI/UX contracts; current full-role UI/UX source entry.
- Evidence: latest AI goal audit; E3 implementation evidence/audit; E5/E6 cross-role/cumulative evidence; F0 readiness;
  F2 closeout; latest 0704 organization-admin/training/role-boundary and lifecycle recovery evidence/audits.
- Code/tests: organization portal/training/analytics/AI route entrypoints and clients; organization workspace access,
  session/role/availability contracts; focused organization-admin/employee/training/analytics/AI/role tests; E4 learner
  acceptance conventions as analogous implementation.

No stable/latest source conflict may be resolved from chat memory. Later traceability and closed baseline evidence
supersede older partial observations; A01-A30 and closed AI classes stay closed without fresh current failure evidence.

## Representative Matrix

| Actor                   | Surface                  | Representative proof                                                                      | Mutation boundary                                     |
| ----------------------- | ------------------------ | ----------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `org_standard_admin`    | portal and direct routes | organization context ready; standard member/admin view; advanced routes fail closed       | no employee/auth/training mutation                    |
| `org_advanced_admin`    | portal/training          | advanced context, non-empty training list/detail, lifecycle state and source scope        | no create/copy/publish/take-down                      |
| `org_advanced_admin`    | analytics and AI         | aggregate-only analytics; Provider-closed organization-private AI question/paper surfaces | no export/generation/copy-to-training/formal adoption |
| `org_standard_employee` | employee training        | standard edition cannot gain advanced organization-training capability                    | no answer/draft/submit                                |
| `org_advanced_employee` | employee training        | non-empty visible assignment and truthful pending/submitted/read-only state               | no answer/draft/submit/restart                        |
| all                     | scope and role isolation | organization scope remains server-owned; unrelated workspaces/direct routes fail closed   | no organization-context or authorization reassignment |

## Execution

1. Materialize F2 closeout and claim only F3 with F4 as the unique next task.
2. Complete the SSOT/code/test reading and reconcile standard/advanced, admin/employee, training and organization-AI
   contracts before runtime work.
3. Read the private index then canonical catalog, start an isolated localhost process with process-only 0704DB and
   `AI_PROVIDER_ENABLED=false`, then use one temporary session for each canonical matrix role.
4. Drive representative routes with Playwright browser automation. Use process-only environment variables for the
   credential-bearing run so no credential enters a CLI argument, then retain only safe aggregate assertions; retain no
   screenshot, snapshot, DOM, trace, identifier, employee answer, private content or runtime log.
5. Inspect read-only details, lifecycle/edition/scope states and disabled reasons without invoking training, analytics,
   AI, authorization or account mutations.
6. Revoke all sessions, stop runtime and prove browser/port/private-runtime/cache cleanup.
7. Run focused organization/role/AI gates, lint, typecheck, changed-doc format, diff, recovery/Program Guard and Module
   Run gates. Build/full remain impact-triggered unless source/test/shared-contract/config/infrastructure changes.

## Boundary Guards

- UI labels/navigation are not authorization proof; direct-route and focused server tests retain authority.
- Standard and advanced state comes from current service-derived authorization context, never from a client toggle.
- Organization scope is fixed by the authenticated context. No alternate organization identifier is supplied or probed.
- Employee answer text, training content, aggregate members and AI result content are private and never retained.
- Provider, generation, copy-to-training, formal content adoption, export, lifecycle and answer mutations are blocked.
- Credentials/session/env/DB values remain process-only; environment files are not written.
- Independent defects use X2; same-root/same-scope findings may be repaired only after materializing exact source/test
  scope and RED proof. X1 is unrelated unless F4 later satisfies its explicit condition.
- Dependency/schema/fixture changes, deployment, PR and force-push remain blocked.

## Allowed Changes

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/active-state-history-index.yaml`
- `docs/05-execution-logs/task-plans/2026-07-14-content-admin-platform-f3-organization-acceptance.md`
- `docs/05-execution-logs/evidence/2026-07-14-content-admin-platform-f3-organization-acceptance.md`
- `docs/05-execution-logs/audits-reviews/2026-07-14-content-admin-platform-f3-organization-acceptance-audit.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-pic-coverage-and-exception-ledger.md`

## Validation And Review

- Focused browser acceptance covers four canonical organization roles, direct-route edition/role guards, non-empty
  portal/training inputs, aggregate-only analytics, Provider-closed AI and complete cleanup.
- Focused tests cover organization standard/advanced workspace access, portal, training admin/employee, analytics,
  organization AI availability and shared workspace role guards.
- Round 1 attacks identity/target correctness, organization scope, edition/auth source, lifecycle/data integrity and AI
  domain separation. Round 2 attacks regression, privilege escalation, exceptional/direct paths, leakage, accessibility,
  cross-page consistency and over-design.

Closeout uses one F3 docs/state commit unless same-scope repair is proven, then ff-only merge to `master`, authorized
push to `origin/master`, equality proof and short branch/worktree cleanup. F4 starts automatically. No deployment.
