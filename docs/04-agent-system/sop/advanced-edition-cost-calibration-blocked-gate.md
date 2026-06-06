# Advanced Edition Cost Calibration Blocked Gate

## Purpose

This SOP prevents the advanced edition Cost Calibration Gate from being mistaken for approved work. The gate is registered in the queue, but execution remains blocked.

Cost Calibration Gate remains blocked pending fresh explicit approval.

## Gate Status

Current status:

- `phase-30-advanced-edition-cost-calibration-gate` is a `blocked_gate`.
- The gate has not been approved for execution.
- Existing docs may describe the inputs needed for the gate, but those descriptions are not permission to run measurements or connect services.

## Fresh Approval Required

Fresh explicit approval is required before any of the following:

- provider cost measurement;
- model selection measurement;
- sample AI task measurement;
- real provider call;
- provider account, quota, model, endpoint, or fallback configuration;
- env/secret creation, reading, update, or rotation;
- staging, prod, cloud, deploy, or public endpoint action;
- payment, pricing, external-service, invoice, refund, or reconciliation action;
- production quota package default point value decision;
- behavior cost point value decision;
- production concurrency, timeout, retry, idempotency, or peak threshold default decision.

## Trigger Terms

If a task, comment, or user request mentions any of the following, stop and verify approval scope before acting:

- provider
- model cost
- token cost
- sample measurement
- real API call
- API key
- secret
- `.env`
- staging
- prod
- cloud
- deploy
- payment
- external-service
- pricing
- quota default
- concurrency threshold
- timeout threshold

## Allowed Without Gate Execution

The following docs-only work remains allowed when explicitly queued:

- documenting that Cost Calibration Gate is blocked;
- listing required future approval inputs;
- writing evidence that no provider/env/secret/staging/prod/cloud/deploy/payment/external-service action occurred;
- updating queue or project state to preserve the blocked status.

Allowed docs-only work must still avoid sensitive payloads and must not create implementation tasks for the blocked gate.

## Evidence Requirement

Every related task must record:

- `Cost Calibration Gate remains blocked pending fresh explicit approval`;
- no provider call;
- no env/secret access or modification;
- no staging/prod/cloud/deploy action;
- no payment or external-service action;
- no production default point, threshold, or pricing decision.

## Non-Goals

This SOP does not approve Cost Calibration Gate execution. It does not approve provider, env/secret, staging/prod/cloud/deploy, payment, or external-service work.
