# role-separated-full-8-row-post-admin-ai-local-contract-loop-browser-rerun-2026-06-26

## Scope

Run a local real-browser full eight-row role-separated acceptance rerun after the content/organization/admin AI local
contract focused pass.

No MVP final Pass is declared.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/05-execution-logs/evidence/2026-06-26-content-organization-ai-generation-admin-local-contract-loop-focused-browser-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-content-organization-ai-generation-admin-local-contract-loop-focused-browser-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-26-role-separated-full-8-row-post-ops-visible-label-repair-browser-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-role-separated-full-8-row-post-ops-visible-label-repair-browser-rerun.md`

## Acceptance Mapping Result

Mapped rows:

- `personal_standard_student`: no advanced AI or backend access.
- `personal_advanced_student`: personal AI entry and submit controls remain available; backend admin routes denied.
- `org_standard_employee`: no advanced AI, no organization training workflow, and backend admin routes denied.
- `org_advanced_employee`: personal AI and organization training entries remain available; backend admin routes denied.
- `org_standard_admin`: organization portal available, advanced organization AI/training hidden or unavailable, direct
  local-contract POST denied.
- `org_advanced_admin`: organization AI/training entries available; local-contract organization AI submit summaries are
  redacted and Provider/Cost blocked; content/ops routes denied.
- `content_admin`: content AI entries available; local-contract content AI submit summaries are redacted and
  Provider/Cost blocked; organization/ops routes denied.
- `ops_admin`: ops routes available; content/organization routes denied; visible technical-token cleanup remains intact.

The task records local browser evidence only. Provider/Cost, staging/prod, payment, external services, and final Pass
remain outside this task.

## Execution Plan

1. Register the task in `task-queue.yaml` and `project-state.yaml` with the allowed files and blocked gates.
2. Confirm Playwright availability and local target health.
3. Read the approved local private role-account credential file in memory only; verify the eight role labels have login
   and password field categories without printing values.
4. Run Playwright Chromium against `http://127.0.0.1:3000` for all eight role rows.
5. Record only redacted route/status/count/API-summary evidence.
6. Run scoped formatting and Module Run v2 readiness gates.
7. Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch.

## Risk Controls

- No source, test, e2e, package, lockfile, env, DB, seed, schema, migration, or account mutation is allowed.
- No Provider/model call, Cost Calibration, staging/prod, payment, external service, PR, force-push, or final Pass claim
  is allowed.
- Browser evidence must not include raw credentials, account identifiers, tokens, cookies, local/session storage,
  Authorization headers, raw DOM, screenshots, traces, Provider payloads, prompts, generated content, or full
  question/paper content.

## Validation Commands

- `npx.cmd playwright --version`
- `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/login -TimeoutSec 8`
- Local real-browser full eight-row rerun with redacted output only.
- `npx.cmd prettier --write --ignore-unknown ...`
- `npx.cmd prettier --check --ignore-unknown ...`
- `git diff --check`
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId role-separated-full-8-row-post-admin-ai-local-contract-loop-browser-rerun-2026-06-26`
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId role-separated-full-8-row-post-admin-ai-local-contract-loop-browser-rerun-2026-06-26 -SkipRemoteAheadCheck`
