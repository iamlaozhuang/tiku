# Content Admin Platform F4 Learner Acceptance Plan

Date: 2026-07-14

Task: `content-admin-platform-f4-learner-acceptance-2026-07-13`

Branch: `codex/content-admin-platform-f4-learner-acceptance`

Profile: R3 / `independent_audit`

Baseline: `master == origin/master == 42a7499023df916fefbe0406181309df913fc1cd`

## Goal

Prove the canonical 0704DB personal standard and advanced student representative localhost workflows for home,
practice, `mock_exam`, report, profile and personal AI. Acceptance is read-only except for temporary login/logout
sessions. It preserves service-derived authorization/edition, formal-learning record boundaries, Provider-closed AI and
persisted-snapshot-only historical resume semantics without starting or mutating a learner activity.

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
- Requirements: learner authorization context, practice, `mock_exam`, report/profile, personal AI and historical resume
  modules/stories plus current UI/UX contracts and ADRs.
- Traceability: current AI/Phase4 supersession, role/auth/training decision package, personal-AI and learner-flow
  contracts, and the latest full-role learner baseline.
- Evidence: E4 implementation evidence/audit, E5/E6 cumulative proof, F0 readiness, F3 closeout, current 0704 learner
  runtime/history recovery evidence and audits.
- Code/tests: learner layout/home/practice/mock/report/profile/personal-AI routes and clients; session, authorization,
  availability, persisted-result and resume contracts; focused learner/auth/AI tests; F3 as analogous acceptance.

No stable/latest source conflict may be resolved from chat memory. Later traceability and closed baseline evidence
supersede older partial observations; A01-A30 and closed AI classes stay closed without fresh current failure evidence.

## Representative Matrix

| Actor                       | Surface                  | Representative proof                                                                 | Mutation boundary                           |
| --------------------------- | ------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------- |
| `personal_standard_student` | home/profile             | standard personal authorization context, truthful profile/auth state, no advanced AI | no redeem/profile/auth mutation             |
| `personal_standard_student` | practice/mock/report     | non-empty selection surfaces and current non-empty report read path                  | no start/answer/save/submit/retry           |
| `personal_standard_student` | personal AI direct route | advanced-only capability fails closed                                                | no availability misuse or generation        |
| `personal_advanced_student` | home/profile/learning    | advanced personal context and truthful practice/mock/current empty report state      | no formal-learning mutation                 |
| `personal_advanced_student` | personal AI              | Provider-closed entry, empty history and disabled generation                         | no generation/answer/formal-record mutation |
| both                        | history/resume isolation | only persisted valid snapshots can resume; current missing sample remains truthful   | no fabricated `paperAssembly`               |

## Execution

1. Materialize F3 closeout and claim only F4 with F5 as the unique next task.
2. Complete SSOT/code/test reading and reconcile standard/advanced, formal learning, personal AI and historical resume
   contracts before runtime work.
3. Read the private index then canonical catalog, start an isolated localhost process with process-only 0704DB and
   `AI_PROVIDER_ENABLED=false`, then use one temporary session for each canonical personal-student role.
4. Drive representative routes with Playwright browser automation. Credentials stay in process environment variables;
   retained evidence is limited to safe booleans/counts and excludes screenshots, DOM, identifiers, answers and content.
5. Inspect list/detail/read-only states and disabled reasons without invoking practice, mock, report, profile, redeem or
   AI mutations. Do not create a historical sample inside F4.
6. Revoke sessions, stop runtime and prove browser/port/private-runtime/cache cleanup.
7. Run focused learner/auth/AI gates, lint, typecheck, changed-doc format, diff, recovery/Program Guard and Module Run
   gates. Build/full remain impact-triggered unless source/test/shared-contract/config/infrastructure changes.

Execution note: the standard-student value in the canonical catalog did not authenticate. The user's explicit permission
to read repository-external credential documents allowed the exact 0704 source document named by that catalog row to be
used without exposing or changing any value. This bounded credential fallback does not change product scope or authorize
private-catalog mutation; the resulting maintenance candidate is recorded in evidence.

## Boundary Guards

- UI navigation is not authorization proof; server session/authorization contracts and direct-route tests remain
  authoritative.
- Standard/advanced state comes from current effective authorization context, never a client toggle.
- Practice, mock, report and mistake-book are formal learning domains. Personal AI self-training remains isolated.
- Provider, generation, answer, draft, submit, retry, redeem, profile mutation and historical fixture creation are
  blocked.
- X1 remains false unless F4 proves a valid persisted `paperAssembly` resume sample indispensable to representative
  acceptance; truthful Provider-closed empty history plus focused resume contracts are sufficient by default.
- Credentials/session/env/DB values remain process-only; environment files are not written.
- Independent defects use X2; same-root/same-scope repair requires materialized exact source/test scope and RED proof.
- Dependency/schema/fixture changes, deployment, PR and force-push remain blocked.

## Allowed Changes

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/active-state-history-index.yaml`
- `docs/05-execution-logs/task-plans/2026-07-14-content-admin-platform-f4-learner-acceptance.md`
- `docs/05-execution-logs/evidence/2026-07-14-content-admin-platform-f4-learner-acceptance.md`
- `docs/05-execution-logs/audits-reviews/2026-07-14-content-admin-platform-f4-learner-acceptance-audit.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-pic-coverage-and-exception-ledger.md`

## Validation And Review

- Browser acceptance covers personal standard/advanced sessions, direct-route edition guards, current practice/mock/
  report/profile data states, Provider-closed personal AI and cleanup.
- Focused tests cover learner navigation, authorization context, practice/mock/report/profile, AI availability/history,
  formal-learning isolation and persisted-resume boundaries.
- Round 1 attacks identity/target correctness, authorization source, record/data integrity and AI/formal-domain separation.
  Round 2 attacks regression, privilege escalation, exceptional/empty states, cross-page consistency, accessibility,
  sensitive retention and over-design.

Closeout uses one F4 docs/state commit unless a same-scope repair is proven, then ff-only merge to `master`, authorized
push to `origin/master`, equality proof and short branch/worktree cleanup. F5 starts automatically. No deployment.
