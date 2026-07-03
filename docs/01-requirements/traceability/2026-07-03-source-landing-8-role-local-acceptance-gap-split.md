# 2026-07-03 Source Landing 8 Role Local Acceptance Gap Split

## Split Task

- Task ID: `repair-student-practice-restart-acceptance-harness-2026-07-03`
- Source task: `source-landing-8-role-local-acceptance-2026-07-03`
- Status: `pending`
- Priority: `p0`

## Trigger

The approved 8-role local acceptance run stopped at `personal_standard_student`. The existing student practice UI acceptance spec timed out while waiting for `POST /api/v1/practices/{redacted}/restart` immediately after the first restart click.

## Classification

- Gap type: `acceptance_harness_contract_drift`
- Product-source defect claim: not made.
- Acceptance status: blocked until repaired and rerun.

## Evidence Summary

- Current UI contract: the first resume-panel restart click opens a confirmation panel.
- Current request trigger: the confirmation action emits the restart request.
- Existing spec behavior: waits for the request after the first click without confirming.

## Repair Scope

- Update the existing student practice local acceptance harness to follow the two-step restart confirmation contract.
- Preserve redaction: no credentials, session values, cookies, headers, env values, DB rows, internal numeric ids, PII, plaintext `redeem_code`, Provider payloads, Prompt text, AI input/output, full content, screenshots, traces, or DOM dumps in evidence.
- Rerun the 8-role local acceptance from the beginning after repair.

## Out Of Scope

- Product source changes unless the repair task finds fresh evidence that the product behavior is wrong.
- Direct DB access, env secret access, Provider calls, schema changes, dependency changes, staging/prod/deploy, Cost Calibration, release readiness, final Pass, or production usability claims.
