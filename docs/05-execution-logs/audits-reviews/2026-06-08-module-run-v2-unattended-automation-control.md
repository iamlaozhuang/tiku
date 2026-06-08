# Module Run v2 Unattended Automation Control Audit Review

Status: APPROVE

## Findings

- No blocking findings.
- The unattended readiness script provides a machine-readable local hard-block decision surface.
- The thread rollover script provides deterministic `continue_current_thread`, `suggest_new_thread`,
  `require_new_thread`, and `stop_for_human_handoff` decisions.
- Remote Codex scheduling or thread creation is not enabled by this task.

## Required Checks

- Unattended readiness smoke must prove continue and hard-block decisions.
- Thread rollover smoke must prove continue, suggest, require, and stop decisions.
- Evidence must include `unattendedStopDecision`, `threadRolloverDecision`, hard block behavior, and Cost Calibration
  Gate remains blocked.

## Residual Risks

- `automation.mode` remains `local_auto_candidate`; this task does not upgrade mode by itself.
- The mechanism is ready for a guarded unattended local loop, but push, thread creation, provider, env/secret,
  staging/prod/cloud/deploy, payment, external-service, dependency, schema, migration, and Cost Calibration Gate actions
  still require separate approval.

## Verdict

APPROVE for local mechanism control. Continue to use hard-block hooks and the new unattended stop-decision scripts
before any business Module Run v2 work.
