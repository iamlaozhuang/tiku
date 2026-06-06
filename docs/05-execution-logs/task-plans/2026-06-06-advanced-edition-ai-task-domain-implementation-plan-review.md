# Advanced Edition AI Task Domain Implementation Plan Review Task Plan

## Scope

- Task id: `phase-31-advanced-edition-ai-task-domain-implementation-plan-review`
- Task kind: docs-only review.
- Source: `docs/superpowers/plans/2026-06-06-advanced-edition-ai-task-domain-implementation-plan.md`
- Branch: `codex/advanced-edition-requirements-freeze-prep`

## Review Plan

1. Check coverage against Task Group 2 requirements: status model, worker/recovery, cancellation, retry, default value governance, snapshots, logging, and blocked work.
2. Check implementation handoff quality: file boundaries, service/repository/model layering, test plan, and downstream dependencies.
3. Check terminology: `authorization`, `personal_auth`, `org_auth`, `redeem_code`, `paper`, `mock_exam`, `audit_log`, and `ai_call_log`.
4. Check guardrails: no real provider execution, no cost measurement, no env/secret, no staging/prod/cloud/deploy, no payment, no external-service action, and no `Cost Calibration Gate` execution.
5. Record findings, update clarifications only when they avoid ambiguity, and update queue/state handoff.

## Validation

- `git diff --check`
- Prettier check for changed docs and state files.
- `Select-String` review markers for `pass_with_clarifications`, `Coverage Matrix`, `Queue Integrity Review`, and `Blocking findings: none`.
- Diff-level terminology scan for forbidden non-project terms.
