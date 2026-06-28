# organization-workspace-polish-local-browser-validation-2026-06-28 Task Plan

## Status

- Task id: `organization-workspace-polish-local-browser-validation-2026-06-28`
- Branch: `codex/org-workspace-ux-polish-serial-20260628`
- Approval: current user serial batch approval on 2026-06-28.
- Execution order: task 3 after task 1 and task 2 closed and committed.
- Scope: redacted local browser validation against existing localhost/127.0.0.1 target only.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/01-requirements/traceability/2026-06-28-standard-advanced-next-ux-polish-queue-planning.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-workspace-state-polish-source-only.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-workspace-polish-permission-contract-tdd.md`

## Validation Matrix

Allowed route groups:

- `/organization/portal`
- `/organization/organization-training`
- `/organization/organization-analytics`
- `/organization/ai-question-generation`
- `/organization/ai-paper-generation`

Allowed role labels:

- standard organization admin
- advanced organization admin

Evidence may record only:

- role label;
- route label;
- visible state category;
- pass/fail status;
- aggregate counts;
- redacted notes.

## Procedure

1. Confirm `http://127.0.0.1:3000` is already reachable with a HEAD request.
2. Connect to the existing in-app browser target.
3. Observe the allowed organization routes for available role/session state.
4. Record only sanitized role/route/state/count evidence.
5. If target is unavailable, authentication is missing, or role separation cannot be observed without credentials, DB, seed, dev-server, e2e, or raw storage inspection, stop and record a blocked validation result.

## Forbidden Evidence

- credentials;
- token, cookie, localStorage;
- raw DOM;
- screenshots;
- traces;
- DB rows;
- Provider payload;
- prompts;
- raw AI output;
- plaintext `redeem_code`;
- full `question` or `paper` content.

## Validation Commands

```powershell
powershell.exe -NoProfile -Command "try { $r = Invoke-WebRequest -Uri http://127.0.0.1:3000 -Method Head -TimeoutSec 3 -UseBasicParsing; \"pass:$($r.StatusCode)\" } catch { \"fail\"; exit 1 }"
in_app_browser_existing_localhost_observation_sanitized_summary_only
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-28-organization-workspace-polish-local-browser-validation.md docs/05-execution-logs/evidence/2026-06-28-organization-workspace-polish-local-browser-validation.md docs/05-execution-logs/audits-reviews/2026-06-28-organization-workspace-polish-local-browser-validation.md docs/05-execution-logs/acceptance/2026-06-28-organization-workspace-polish-local-browser-validation.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-workspace-polish-local-browser-validation-2026-06-28
```

## Stop Conditions

- Local target is not already reachable.
- Validation requires starting a dev server, running e2e, modifying source/test/e2e/scripts, accessing DB/schema/migration/seed, reading `.env*`, reading or recording credentials/tokens/cookies/localStorage/raw DOM/screenshots/traces, calling Provider, or touching staging/prod/deploy/payment/external service.
- Browser evidence cannot be kept to role/route/state/count/redacted notes.
