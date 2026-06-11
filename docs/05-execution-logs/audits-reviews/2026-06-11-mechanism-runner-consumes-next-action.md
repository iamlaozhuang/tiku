# Mechanism Runner Consumes Next Action Review

## Review Decision

APPROVE

## Review Scope

- `scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/Get-TikuNextAction.Smoke.ps1`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- task plan and evidence for this task

## Findings

No blocking findings.

## Checks

- Runner calls `Get-TikuNextAction.ps1` before startup readiness in each step.
- Runner echoes `nextActionDecision` and `diagnosticOnly: true` output.
- Runner hard-stops only when the diagnostic fails or omits `nextActionDecision`.
- Startup readiness and existing runner decisions remain authoritative.
- Runner smoke asserts the diagnostic output and preserves existing decision assertions.
- SOP now documents the diagnostic as preflight visibility only.
- `-SkipPrimaryRepositoryPostureCheck` is explicit and default-off.

## Taste Compliance Checklist

- Naming follows existing PowerShell control script conventions.
- No product API, database, UI, schema, or naming-surface changes were introduced.
- No dependency, lockfile, env/secret, provider, staging/prod/cloud/deploy, payment, or external-service change.
- No startup, closeout, schema, local capability, or blocked-gate authority was weakened by default.
- No glossary replacement or self-invented business terms. Required anchors include `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, and `ai_call_log`.
- Cost Calibration Gate remains blocked.
- Validation evidence is recorded before local commit.

## Residual Risk

Runner plan-only reaches a seed proposal for `ai-task-and-provider`, but this remains proposal-only. It does not approve implementation or auto-seed application without the separate approval required by the existing mechanism.
