# Organization Workspace UX Polish Local Browser Validation Plan

Task id: `organization-workspace-ux-polish-local-browser-validation-2026-06-28`

Branch: `codex/organization-workspace-browser-validation-20260628`

Task kind: `local_browser_validation`

## Read Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-28-standard-advanced-ux-polish-queue-planning.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-workspace-page-states-polish-source-only.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-workspace-ux-polish-permission-contract-tdd.md`
- `browser:control-in-app-browser` skill

## Scope

Allowed:

- use the in-app browser against an existing `localhost` or `127.0.0.1` target only;
- record only role label, route, observed state label, element/control count, and pass/fail summary;
- update this task plan, evidence, audit, acceptance, `project-state.yaml`, and `task-queue.yaml`.

Forbidden:

- source, test, e2e, script, package, lockfile, `.env*`, schema, migration, seed changes;
- starting a dev server or modifying local runtime configuration;
- DB connection/read/write, Provider call/configuration, Cost Calibration;
- staging/prod/deploy, payment/OCR/export/external-service;
- screenshots, traces, raw DOM dumps, raw page text dumps, cookies, tokens, localStorage/sessionStorage, credentials, Authorization headers, database URLs, DB rows, Provider payloads, prompts, raw AI output, plaintext `redeem_code`, employee subjective answers, full `question` or `paper` content;
- PR, force push, release readiness, final Pass.

## Browser Validation Approach

1. Confirm the current in-app browser target or one explicit local URL is `localhost` or `127.0.0.1`.
2. Do not start a dev server. If no existing local target responds, record `blocked_existing_local_target_unavailable`.
3. Do not request, read, print, or record credentials, cookies, tokens, storage, screenshots, traces, or raw DOM.
4. If an existing authenticated local session is already present, observe the smallest route/state matrix possible:
   - standard organization admin: organization portal and advanced-only route gated state;
   - advanced organization admin: organization portal and advanced organization entry/rendered state.
5. If only one role is available without credentials, record partial evidence and mark the unavailable role rows blocked.
6. Evidence must be summarized as counts and labels only, for example `advancedEntryCount=4`, `standardAdvancedEntryCount=0`, `state=standard-unavailable`, without raw text dumps.

## Validation Commands

- existing local target HTTP check only after approval;
- approved redacted local browser observation only after approval;
- scoped Prettier write/check on docs/state/evidence files;
- `git diff --check`;
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`;
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-workspace-ux-polish-local-browser-validation-2026-06-28`.

## Evidence And Review

- Write evidence with no screenshot, trace, raw DOM, raw page dump, token, cookie, localStorage, credential, DB row, Provider payload, prompt, raw AI output, plaintext `redeem_code`, employee subjective answer, or full content.
- Write audit review because the task consumes browser-runtime approval and handles redaction rules.
- Acceptance is limited to local browser observation; it is not release readiness or final Pass.

## Stop Conditions

- No existing local target is available.
- Authentication requires credentials that are not already entered by the user in the browser.
- Any observation would require recording sensitive data or raw browser artifacts.
- Any source/test/runtime/server/DB/Provider/deploy/payment/external-service action becomes necessary.
