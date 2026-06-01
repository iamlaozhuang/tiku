# Phase 22 AI Scoring Persistence Smoke Plan

## Scope

Validate only local/mock/fake-provider-safe AI scoring, retry, `ai_call_log`, and persistence behavior.

## Commands

- `npm.cmd run test:unit -- src/server/services/ai-scoring-service.test.ts tests/unit/phase-7-ai-mock-provider-and-log-runtime-smoke.test.ts tests/unit/phase-11-ai-call-log-coverage-hardening.test.ts`

## Boundaries

- No real provider.
- No external service.
- No raw provider payload, raw prompt, raw student answer, or raw model response in evidence.

## Stop Conditions

Stop if validation requires real provider credentials, provider calls, env inspection, source/test changes, schema/migration changes, or DB repair.
