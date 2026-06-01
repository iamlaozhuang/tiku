# Phase 22 E2E Order Data Isolation Diagnosis Plan

## Objective

Diagnose the prior non-blocking observation where `role-based full-flow` once redirected to `/redeem-code` instead of `/home`, using only existing e2e commands and without changing tests or runtime code.

## Commands

- `npm.cmd run test:e2e -- e2e/role-based-acceptance/role-based-full-flow.spec.ts`
- `npm.cmd run test:e2e`
- `git status --short --branch`

## Evidence Rules

- Record route/result summaries only.
- Do not record credentials, session tokens, plaintext `redeem_code`, raw student answers, prompts, model responses, or provider payloads.

## Output

- Evidence file: `docs/05-execution-logs/evidence/2026-06-01-phase-22-e2e-order-data-isolation-diagnosis.md`
