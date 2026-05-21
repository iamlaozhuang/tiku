# Phase 7 AI Mock Provider And Log Runtime Smoke Task Plan

## Metadata

- Task id: `phase-7-ai-mock-provider-and-log-runtime-smoke`
- Branch: `codex/phase-7-ai-mock-provider-and-log-runtime-smoke`
- Base branch: `master`
- Queue status at claim: `pending -> claimed`
- Task plan policy: `required`
- Dependency changes: not allowed and not intended.

## Required Reading Completed

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest handoff evidence: `docs/05-execution-logs/evidence/2026-05-21-phase-7-audit-log-runtime-baseline.md`

## Scope

Allowed implementation scope:

- `docs/05-execution-logs/task-plans/2026-05-21-phase-7-ai-mock-provider-and-log-runtime-smoke.md`
- `docs/05-execution-logs/evidence/2026-05-21-phase-7-ai-mock-provider-and-log-runtime-smoke.md`
- `docs/05-execution-logs/audits-reviews/2026-05-21-phase-7-ai-mock-provider-and-log-runtime-smoke-security-review.md`
- `src/ai/**`
- `src/app/api/v1/ai-call-logs/**`
- `src/app/api/v1/model-configs/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- `e2e/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked scope:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `drizzle/**`
- `.env.example`

## Implementation Plan

1. Write RED unit tests in `tests/unit/phase-7-ai-mock-provider-and-log-runtime-smoke.test.ts`.
   - Assert a deterministic mock AI provider returns a learning suggestion without requiring real provider credentials.
   - Assert the mock AI runtime appends an `ai_call_log` entry with redacted request, response, and provider payload snapshots.
   - Assert admin `GET /api/v1/model-configs`, `GET /api/v1/ai-call-logs`, and `GET /api/v1/ai-call-logs/summary` require an authenticated admin session and return public-id-only DTOs.
   - Assert the returned logs do not expose raw prompts, raw answers, raw model output, provider payloads, API keys, bearer tokens, session tokens, or numeric database ids.
2. Run the focused RED command:
   - `npm.cmd run test:unit -- tests/unit/phase-7-ai-mock-provider-and-log-runtime-smoke.test.ts`
   - Expected first failure: no mock provider runtime service exists and AI call log routes still use the unavailable service.
3. Implement the minimal mock runtime boundary.
   - Add a deterministic mock provider under `src/ai/` that supports the seeded `learning_suggestion` function only.
   - Add an AI call log runtime repository that can append/list/summarize redaction-safe `ai_call_log` rows and list `model_config` rows.
   - Wire only read routes for `GET /api/v1/model-configs`, `GET /api/v1/ai-call-logs`, and `GET /api/v1/ai-call-logs/summary`.
   - Keep `model_config` enable/disable routes unavailable because provider-affecting mutations are deferred by the runtime slice contract.
4. Run GREEN and adjacent regression checks.
5. Create the required security review artifact at `docs/05-execution-logs/audits-reviews/2026-05-21-phase-7-ai-mock-provider-and-log-runtime-smoke-security-review.md`.
6. Run task validation commands from the queue and record evidence:
   - `Test-TaskClaimReadiness.ps1`
   - `npm.cmd run test:unit`
   - `Invoke-QualityGate.ps1`
   - `npm.cmd run build`
   - `Test-NamingConventions.ps1`
   - `Test-GitCompletionReadiness.ps1 -BaseBranch master`
7. Update task state through `implemented`, `validated`, `committed`, merge/push closeout, and `closed` only after matching evidence exists.

## Risk Defense

- Mock provider first: no real provider SDK, credentials, network calls, or environment variables are introduced.
- Admin authorization: AI/model log read routes require an authenticated admin session.
- API contract: every route returns `{ code, message, data, pagination? }`.
- Public identifier boundary: DTOs expose `publicId` only and never expose database `id`.
- Redaction: logs persist and return hash/length/status summaries, not raw prompts, raw answers, raw outputs, raw provider payloads, provider errors, secrets, tokens, or passwords.
- Schema boundary: this task does not modify `src/db/**` or `drizzle/**`; raw SQL handles absent local tables as empty read lists where needed.
- No dependency changes: package and lock files remain untouched.
- No horizontal expansion: this task wires only mock AI logging and read-only admin surfaces needed by the Phase 7 runtime slice.
