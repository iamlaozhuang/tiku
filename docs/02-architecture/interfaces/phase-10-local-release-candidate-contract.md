# Phase 10 Local Release Candidate Contract

## Status

Planning anchor for Phase 10.

## Purpose

Phase 10 is the local release candidate hardening phase. Its goal is to prove that the MVP can be repeatedly validated in the local `dev` environment before any staging, production, real cloud, or customer-network work starts.

This phase exists because there is no suitable cloud server environment yet. It deliberately uses the developer-owned local environment with Docker and local-only secrets.

## Environment Boundary

Phase 10 is scoped to `dev` only, as defined by ADR-004:

- Local Docker PostgreSQL with pgvector.
- Local-only `.env.local`.
- Local filesystem inputs for real教材/试卷/resource files.
- Local browser, API, unit, build, and E2E validation.

Phase 10 must not:

- Deploy to `staging` or `prod`.
- Create, modify, or connect production resources.
- Create public object storage URLs.
- Connect local code to staging or production databases.
- Commit `.env.local`, credentials, real provider keys, raw model responses, raw prompts, or large verbatim real content.

## Inputs

- `docs/02-architecture/interfaces/phase-9-mvp-acceptance-contract.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-closeout-release-readiness.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- Real local教材/试卷/resource files supplied by the user during later approved tasks.
- Real `model_provider` credentials supplied by the user during later approved tasks through local uncommitted `.env.local`.

## Acceptance Scope

Phase 10 must prove these local release candidate properties:

1. A clean local checkout can reproduce the project setup, Docker database, migrations, seed data, quality gates, build, and E2E validation.
2. Local database rebuild and seed rehearsal is deterministic and does not require production data.
3. Real教材/试卷/resource files can be dry-run imported locally without committing sensitive or large source content.
4. Real `model_provider` credentials can be introduced safely for local smoke tests without exposing secrets.
5. AI scoring, AI explanation, AI hint, `kn_recommendation`, RAG retrieval, `evidence_status`, `citation`, and `ai_call_log` redaction can be validated locally.
6. The full local MVP acceptance flow can be rerun after the real-content and optional real-provider smoke tests.

## Real Provider Rules

Real provider testing is allowed only after a task explicitly records human approval.

Rules:

- API keys and secrets must be entered by the user into `.env.local` or another local uncommitted secret store.
- The agent must not ask the user to paste API keys into chat.
- Evidence may record provider name, model name, feature flag state, sanitized error class, request count, and coarse latency range.
- Evidence must not record API keys, full authorization headers, raw prompts, raw answers, raw model responses, provider payloads, or long-lived signed URLs.
- Smoke tests must use a small bounded sample count and must avoid retry storms.
- If a provider call fails, classify the failure without printing sensitive request or response bodies.

## Real Content Rules

Real教材/试卷/resource testing is allowed only in local `dev` unless a later task explicitly changes the boundary.

Rules:

- Store real source files outside Git or under a path already ignored by Git.
- Do not commit real教材/试卷 files unless a future task explicitly creates sanitized fixtures.
- Evidence may record file type, count, page count, hash prefix, import status, and redacted structure summary.
- Evidence must not include long verbatim textbook excerpts, full papers, answer keys, raw OCR output, or private customer/customer-like data.
- Object storage paths, if simulated locally, must use the `dev` prefix.

## Task Ordering

1. `phase-10-planning-and-queue-seeding`
2. `phase-10-local-fresh-checkout-readiness`
3. `phase-10-local-db-rebuild-seed-rehearsal`
4. `phase-10-local-real-content-import-dry-run`
5. `phase-10-local-real-ai-provider-safety-plan`
6. `phase-10-local-real-ai-provider-smoke-test`
7. `phase-10-local-rag-real-content-smoke-test`
8. `phase-10-local-mvp-acceptance-rerun-closeout`

## Non-Goals

- No cloud server setup.
- No staging or production deployment.
- No production database, production object storage, production credentials, or production provider quota.
- No WeChat mini program implementation.
- No dependency changes unless a later task passes the dependency introduction gate with explicit human approval.
- No schema or migration changes unless a later task explicitly allows them and records the gate result.
- No broad product expansion beyond proving the current MVP locally.

## Validation Expectations

Every Phase 10 task must include:

- Task plan before implementation unless the queue explicitly marks it as `evidence_only`.
- Evidence under `docs/05-execution-logs/evidence/`.
- `Test-TaskClaimReadiness.ps1` for the claimed task.
- `Test-AgentSystemReadiness.ps1`.
- `Invoke-QualityGate.ps1`.
- `npm.cmd run build` when runtime, local setup, or acceptance behavior is touched.
- `npm.cmd run test:e2e` when browser or end-to-end correctness is relevant.
- `Test-NamingConventions.ps1`.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`.

Future real provider and real content tasks must additionally include explicit privacy and redaction evidence.
