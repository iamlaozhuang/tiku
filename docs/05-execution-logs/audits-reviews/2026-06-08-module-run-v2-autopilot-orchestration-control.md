# Module Run v2 Autopilot Orchestration Control Audit Review

Status: APPROVE

## Findings

- No blocking findings.
- Handoff generator provides a redacted recovery package with `create_thread` and `send_message_to_thread` instructions.
- Thread launch policy separates suggestion, required rollover, approval, tool availability, and handoff presence.
- Autopilot orchestrator emits `autopilotDecision: launch_new_thread` only when launch approval and thread tool
  availability are present.
- This task does not start the next module implementation.

## Required Checks

- Handoff generator smoke must pass.
- Thread launch policy smoke must pass.
- Autopilot orchestrator smoke must pass.
- Evidence must include `handoffGenerator`, `threadLaunchDecision`, `autopilotDecision`, `create_thread`,
  `send_message_to_thread`, `nextModuleRunCandidate`, and Cost Calibration Gate remains blocked.

## Residual Risks

- `automation.mode` remains `local_auto_candidate`; a separate mode transition can propose `guarded_auto_candidate`.
- PowerShell scripts cannot call Codex thread tools directly. Codex agent orchestration must consume the machine-readable
  decision and call `create_thread`.
- New thread startup still requires recovery audit before any business implementation.

## Verdict

APPROVE. The mechanism now fits the “autopilot” target at the local control and Codex-agent decision layer, with hard
blocks preserved.
