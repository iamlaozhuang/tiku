# Codex Automation UI Visibility Registration Repair Plan

## Task

- id: `module-run-v2-mechanic-automation-ui-visibility-registration-repair`
- branch: `codex/mechanism-serial-governance`
- task kind: `mechanism_repair`
- user request: make the existing Codex automation visible and manageable in the Codex UI without creating a duplicate automation.

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`

## Scope

Allowed actions:

- inspect current automation registration;
- create or update one Codex app-managed automation through the official Codex automation API when the existing local id is not present in the app registry;
- pause the stale local-only automation record so only one automation remains `ACTIVE`;
- update mechanism state and script defaults to the UI-managed primary automation id;
- verify direct view rendering and registration readiness;
- record redacted task evidence and review.

Blocked actions:

- create a duplicate automation;
- delete or pause the active automation unless explicitly requested;
- change product code, tests, e2e, dependencies, lockfiles, schema, migrations, env/secret, provider configuration, deploy, PR, force push, or Cost Calibration Gate.

## Approach

1. Confirm the existing automation exists and registration readiness is `ready`.
2. Try the official Codex automation update path against the existing local id.
3. If the app reports the local id does not exist, create a single UI-managed automation and make that id canonical.
4. Pause the stale local-only automation record instead of deleting it.
5. Verify that the automation can be rendered through the Codex automation tool and that the local registration readiness script reports a single active automation.
6. Record evidence. If UI list visibility still fails after tool-level create/update and direct view rendering, classify it as a Codex UI list-index issue rather than a Tiku mechanism configuration issue.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationRegistrationReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1`
- Codex automation tool `view` for the UI-managed active automation
- `git diff --check`

## Risk Defenses

- Do not create a second ACTIVE automation.
- Preserve the existing automation id.
- Do not expose raw automation prompt content in evidence.
- Keep high-risk capability gates blocked.
