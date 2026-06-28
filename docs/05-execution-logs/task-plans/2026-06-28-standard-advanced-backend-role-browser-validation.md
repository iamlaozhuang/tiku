# Standard Advanced Backend Role Browser Validation Task Plan

## Task

- Task id: `standard-advanced-backend-role-browser-validation-2026-06-27`
- Branch: `codex/standard-advanced-backend-role-browser-validation-20260628`
- Task kind: `local_browser_validation`
- Scope: local-only browser validation for backend workspace role and edition states.
- Runtime claim: local browser observation only.
- Release claim: none.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`
- `docs/05-execution-logs/evidence/2026-06-27-backend-workspace-role-guard-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-admin-standard-advanced-workspace-source-contract.md`

## Approval Boundary

Current user approved local browser validation task `standard-advanced-backend-role-browser-validation-2026-06-27`.

Allowed:

- use only an existing local target on `localhost` or `127.0.0.1`;
- run browser validation for task-queue-listed backend roles and routes;
- record only role, route, status, count, and redacted summary evidence;
- modify only this task's state, queue, task plan, evidence, audit, and acceptance documents.

Blocked:

- credentials, token, cookie, localStorage, raw DOM, screenshot, trace, DB row, Provider payload, prompt, raw AI output, plaintext `redeem_code`, full `question` or `paper` content in evidence;
- DB, schema, migration, seed;
- Provider, Provider configuration, Cost Calibration;
- staging/prod/deploy, payment, external service;
- source, tests, e2e, scripts, package, lockfile, `.env*`;
- PR, force push, release readiness, final Pass.

## Validation Matrix

The browser run will use the already running local target `http://127.0.0.1:3000`.

The matrix validates:

| Row | Role/state                                            | Route group                                                | Expected result                                                                           |
| --- | ----------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1   | unauthenticated                                       | `/ops/users`, `/content/questions`, `/organization/portal` | redirects to login without backend chrome                                                 |
| 2   | `content_admin`                                       | content workspace and operations route                     | content entry ready; operations route denied or blocked                                   |
| 3   | `ops_admin`                                           | operations workspace and content route                     | operations entry ready; content route denied or blocked                                   |
| 4   | `org_standard_admin`                                  | organization portal and advanced routes                    | organization portal ready; advanced entries hidden or standard-unavailable                |
| 5   | `org_advanced_admin` with advanced capability summary | organization portal and advanced routes                    | advanced entries visible; advanced direct routes reach ready or local-contract-safe state |

## Execution Method

- Do not run `npm.cmd run test:e2e` because the current task does not approve e2e specs or generated Playwright reports.
- Do not start `npm.cmd run dev`; the target must already be reachable.
- Use a transient headless Playwright script from stdin. It will:
  - launch Chromium headless;
  - navigate only to `http://127.0.0.1:3000` routes;
  - fulfill session and route responses with in-memory redacted fixtures;
  - avoid screenshots, tracing, video, raw DOM dumps, and storage output;
  - print only sanitized row statuses and aggregate counts.

## Validation Commands

- `powershell.exe -NoProfile -Command "try { $r = Invoke-WebRequest -Uri http://127.0.0.1:3000 -Method Head -TimeoutSec 3 -UseBasicParsing; \"pass:$($r.StatusCode)\" } catch { \"fail\"; exit 1 }"`
- Inline headless Playwright browser validation against `http://127.0.0.1:3000` with sanitized stdout only.
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-28-standard-advanced-backend-role-browser-validation.md docs/05-execution-logs/evidence/2026-06-28-standard-advanced-backend-role-browser-validation.md docs/05-execution-logs/audits-reviews/2026-06-28-standard-advanced-backend-role-browser-validation.md docs/05-execution-logs/acceptance/2026-06-28-standard-advanced-backend-role-browser-validation.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-28-standard-advanced-backend-role-browser-validation.md docs/05-execution-logs/evidence/2026-06-28-standard-advanced-backend-role-browser-validation.md docs/05-execution-logs/audits-reviews/2026-06-28-standard-advanced-backend-role-browser-validation.md docs/05-execution-logs/acceptance/2026-06-28-standard-advanced-backend-role-browser-validation.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId standard-advanced-backend-role-browser-validation-2026-06-27`

## Evidence Redaction

Evidence will contain only:

- task id;
- branch;
- target origin class `localhost`;
- role labels;
- route labels;
- pass/fail/blocked status;
- aggregate count;
- command names and sanitized summaries.

Evidence will not contain credentials, token, cookie, localStorage, raw DOM, screenshots, traces, DB rows, Provider payloads, prompts, raw AI output, plaintext `redeem_code`, or full `question`/`paper` content.

## Closeout Policy

Local commit is allowed for this task evidence transaction. Fast-forward merge to `master`, push to `origin/master`, and branch cleanup require fresh explicit closeout approval after evidence review.

Cost Calibration Gate remains blocked pending fresh explicit approval.
