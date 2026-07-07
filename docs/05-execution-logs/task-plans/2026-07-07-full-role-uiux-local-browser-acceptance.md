# 2026-07-07 Full Role UIUX Local Browser Acceptance Package Plan

Task id: `full-role-uiux-local-browser-acceptance-2026-07-07`

Branch: `codex/full-role-uiux-local-browser-acceptance-2026-07-07`

## Goal

Run a redacted localhost-only browser acceptance package for the completed full-role UIUX source remediation series.

This task is limited to an already running local service on `localhost` / `127.0.0.1`. It must not start staging/prod,
capture screenshots, read raw DOM, record sessions/cookies/tokens/localStorage, read env values, connect to DB, execute
Provider calls, modify product source/tests/dependencies, or claim release readiness, production usability, final Pass,
staging/prod readiness, Provider readiness, or Cost Calibration.

## Fresh Approval Boundary

User approved local browser manual acceptance on 2026-07-07 with these limits:

- `localhost` only.
- No screenshots.
- No raw DOM capture.
- No session/cookie/token/localStorage recording.
- No env read.
- No DB connection.
- No Provider execution.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/05-execution-logs/task-plans/2026-07-07-full-role-uiux-source-remediation-control-matrix.md`
- `docs/05-execution-logs/evidence/2026-07-07-full-role-uiux-acceptance-confirmation-package.md`
- `docs/05-execution-logs/audits-reviews/2026-07-07-full-role-uiux-acceptance-confirmation-package-adversarial-audit.md`
- Branch 2-8 source remediation task plans, evidence, and adversarial audits as indexed by the control matrix.

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-07-full-role-uiux-local-browser-acceptance.md`
- `docs/05-execution-logs/evidence/2026-07-07-full-role-uiux-local-browser-acceptance.md`
- `docs/05-execution-logs/audits-reviews/2026-07-07-full-role-uiux-local-browser-acceptance-adversarial-audit.md`

Forbidden:

- Product source, tests, DB, account/fixture material, Provider, env, dependency, package/lockfile, schema/migration/seed,
  screenshots, raw DOM, browser storage, staging/prod/deploy, PR, force push, Cost Calibration, final Pass, production
  usability, or release readiness claims.

## Browser Method

1. Confirm the repository was clean and branch was created from `origin/master`.
2. Detect an already listening local server on allowed localhost ports.
3. Probe only `http://127.0.0.1:<port>` or `http://localhost:<port>` and never external URLs.
4. Use a fresh Playwright browser context without persistent storage.
5. Do not call screenshot, trace, storageState, cookies, localStorage/sessionStorage, or raw DOM APIs.
6. Do not dump page body text, HTML, headers with secrets, request payloads, response payloads, or internal identifiers.
7. Record only sanitized route labels, HTTP/browser status, URL path labels, and allowlisted boolean UI signal checks.

## Acceptance Surface

| Area               | Route labels                                                                                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public/auth        | `/`, `/login`, `/register`                                                                                                                                                         |
| Learner shell      | `/home`, `/profile`, `/practice`, `/mock-exam`, `/exam-report`, `/mistake-book`, `/redeem-code`, `/organization-training`                                                          |
| Learner AI         | `/ai-generation`                                                                                                                                                                   |
| Organization admin | `/organization/portal`, `/organization/organization-training`, `/organization/organization-analytics`, `/organization/ai-question-generation`, `/organization/ai-paper-generation` |
| Content admin      | `/content/papers`, `/content/questions`, `/content/materials`, `/content/resources`, `/content/knowledge-nodes`, `/content/ai-question-generation`, `/content/ai-paper-generation` |
| Operations/admin   | `/ops/users`, `/ops/organizations`, `/ops/redeem-codes`, `/ops/contact-config`, `/ops/ai-audit-logs`, `/ops/resources`                                                             |

## Validation Plan

1. Run the localhost-only browser probe with redacted output.
2. Write evidence with route status table and explicit non-claims.
3. Run `npm.cmd run lint`.
4. Run `npm.cmd run typecheck`.
5. Run focused full-role UIUX source regression set from the closeout package.
6. Run scoped Prettier check, `git diff --check`, Module Run v2 precommit and prepush readiness.

Cost Calibration Gate remains blocked.
