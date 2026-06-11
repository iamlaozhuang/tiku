# Codex Automation UI Visibility Registration Repair Review

## Review Decision

APPROVE

## Scope

- Codex app-managed automation id `tiku-module-run-v2-autopilot`
- stale local-only automation id `tiku-module-run-v2-autopilot-2`
- automation registration readiness script and smoke
- startup, runner, unattended, stopped-hygiene, and run-registry smoke fixtures
- project-state automation id
- automation governance docs and this task plan/evidence

## Findings

No blocking findings.

## Checks

- The repair did not create two active schedulers.
- The stale local-only automation remains present but `PAUSED`.
- `project-state.yaml` now points to the UI-managed active automation.
- Registration readiness counts only TOML records with `status = ACTIVE`.
- The prompt still contains the required current and historical automation identity anchors.
- The on-demand mechanic anchor `tiku-module-run-v2-mechanic-2` remains documented for pre-commit repair scope checks.
- Direct Codex automation view renders the active automation card.
- High-risk gates remain blocked.

## Residual Risk

The Codex UI list may require a refresh or app-side cache update before the card appears in the list view. The direct automation card render confirms that the active automation exists in the Codex app registry.

## Taste Compliance Checklist

- No product UI, API, database, schema, or service behavior was changed.
- No dependency or lockfile was changed.
- No env/secret, provider, deploy, payment, PR, or force push action was performed.
- Script naming remains aligned with existing Module Run v2 automation naming.
- Evidence avoids secrets, raw prompts, provider payloads, cleartext redeem_code, and full paper content.
- Cost Calibration Gate remains blocked.
