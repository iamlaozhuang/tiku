# Content Admin Platform F1 Content-Admin Acceptance Plan

Date: 2026-07-14

Task: `content-admin-platform-f1-content-admin-acceptance-2026-07-13`

Branch: `codex/content-admin-platform-f1-content-admin-acceptance`

Profile: R3 / `independent_audit`

Baseline: `master == origin/master == 2659e674fab4a1ff7a9ac16289d13f7ae2f7fe17`

## Goal

Prove one current `content_admin` representative localhost workflow across questions, materials, papers, resources,
knowledge nodes and content AI draft/review history. The runtime uses the canonical 0704DB target only through a
process-local override. Acceptance is read-only except for the product's temporary login/logout session lifecycle:
resource absence remains a truthful empty state, editor/create affordances are inspected without saving, and AI
Provider execution, generation submission and formal-adoption mutation remain closed.

## Required Reading

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- Latest acceptance normalization and goal-completion audit.
- B-F serial plan, standing authorization, PIC/exception ledger, E0 route inventory, E1 evidence/audit and F0
  readiness evidence/audit.
- Latest 0704 content AI and non-AI publish acceptance evidence/audits.
- Canonical private 0704 index/catalog, retained only in process memory under the user's explicit 0704DB credential
  authorization.
- Current content routes, runtime clients and focused question/material/paper/resource/knowledge/AI tests.

Chronology resolves the earlier incomplete AI acceptance: the 2026-07-09 goal closeout supersedes its earlier localhost
checkpoint and records a list-visible formal question and published paper while Provider remained unexecuted. No closed
A01-A30 or AI issue is reopened without fresh current-master failure evidence.

## Representative Matrix

| Surface         | Representative proof                                                                            | Mutation boundary                      |
| --------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------- |
| questions       | non-empty list, one safe detail/editor entry, clean return                                      | no save/publish/copy/disable           |
| materials       | non-empty list, one safe detail/editor entry, clean return                                      | no save/copy/disable                   |
| papers          | non-empty list, one safe detail/composer entry, clean return                                    | no create/compose/publish/archive/copy |
| resources       | truthful empty state plus visible create/upload affordance                                      | no upload/publish/index/disable        |
| knowledge nodes | non-empty content-owned tree/list context                                                       | no create/move/sort/disable            |
| content AI      | non-empty question/paper history, Provider-closed draft/review wording and formal-target status | no generation or formal adoption       |

## Execution

1. Materialize F0's completed closeout and claim only F1 with F2 as the unique next task.
2. Read the private index then canonical catalog, start an isolated localhost process with the process-only 0704DB
   target and `AI_PROVIDER_ENABLED=false`, and log in once as the canonical `content_admin`.
3. Drive the representative routes with Playwright CLI. Retain only redacted assertions and aggregate results; do not
   retain snapshots, screenshots, DOM, traces, identifiers or content.
4. Inspect read/detail/editor/composer/create affordances without submitting business forms. Prove Provider closure and
   observe AI history without generation or adoption requests.
5. Revoke the temporary session, stop the runtime and prove port/private-env/repository cleanup.
6. Run the focused content family suites, lint, typecheck, changed-doc format, diff, recovery/serial/security and Module
   Run gates. Build/full regression stay impact-triggered because F1 plans no source, test, config or infrastructure
   change.

## Boundary Guards

- Credentials, cookies, sessions, tokens, env/DB values, raw rows, identifiers, private content, generated content,
  screenshots, snapshots, DOM and traces never enter chat, repository artifacts or retained logs.
- Product data access is bounded to localhost reads. Direct SQL, business mutations, fixture/account changes,
  schema/migration/seed, dependency/config changes and private-file writes are blocked.
- AI availability may be read; Provider calls, generation submits, adoption writes and Cost Calibration are blocked.
- Content ownership and role/edition boundaries are server-authoritative; UI visibility cannot prove authorization.
- A fresh current-baseline defect is isolated through X2 instead of being silently folded into F1. Missing optional data
  is reported truthfully rather than fabricated.
- Deployment, PR creation and force push remain blocked; deployment requires fresh user approval.

## Allowed Changes

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/active-state-history-index.yaml`
- `docs/05-execution-logs/task-plans/2026-07-14-content-admin-platform-f1-content-admin-acceptance.md`
- `docs/05-execution-logs/evidence/2026-07-14-content-admin-platform-f1-content-admin-acceptance.md`
- `docs/05-execution-logs/audits-reviews/2026-07-14-content-admin-platform-f1-content-admin-acceptance-audit.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-pic-coverage-and-exception-ledger.md`

## Validation And Review

- Focused runtime acceptance: one canonical content-admin session, six content categories, controlled route/interactions,
  legal envelopes, no unexpected browser console/request errors, Provider closed and complete cleanup.
- Focused unit proof: question/material list and editor navigation; paper list/composer; resource/knowledge empty/detail and
  lifecycle boundaries; content AI history/adoption/availability; workspace role guard.
- Round 1 attacks data integrity, lifecycle and authorization contracts, accurate empty/history states and requirements
  alignment. Round 2 attacks regression, privilege expansion, exceptional navigation, sensitive leakage, cross-page
  inconsistency, accidental mutation and over-design.

Closeout uses one docs/state commit, ff-only merge to `master`, authorized push to `origin/master`, equality proof and
short branch/worktree cleanup. F2 starts automatically. No deployment.
