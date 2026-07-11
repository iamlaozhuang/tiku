# 2026-07-10 0704 Owner Preview Provider Gate Hardening Plan

## Task

- taskId: `0704-owner-preview-provider-gate-hardening-2026-07-10`
- branch: `codex/0704-owner-preview-provider-gate-hardening`
- taskKind: `provider_gate_hardening`
- trigger: `CR-001_provider_env_governance_default_route_wiring`

## Reading Completed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-code-readonly-preview-risk-assessment.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-code-readonly-preview-risk-assessment-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-10-0704-code-readonly-preview-risk-assessment-audit.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-staging-readiness-design.md`

## Objective

Close the owner-preview Provider/env governance finding before any preview/staging env or Provider preparation work.

The code must prove:

- owner-preview Provider execution is disabled by default outside production and in production;
- a runtime credential alone cannot enable Provider execution;
- Provider-capable owner-preview control requires an explicit local owner-preview gate;
- production remains blocked even if the explicit gate is present;
- the existing request, RAG grounding, redaction, quota, timeout, and route bridge constraints remain intact.

## Scope

Allowed source/test files:

- `src/server/services/owner-preview-qwen-visible-ai-runtime-control.ts`
- `src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts`

Allowed governance files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-10-0704-owner-preview-provider-gate-hardening.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-owner-preview-provider-gate-hardening-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-10-0704-owner-preview-provider-gate-hardening-audit.md`

## Explicit Non-Scope

- No Provider execution.
- No env, secret, token, credential, session, cookie, DB URL, or localStorage value read or output.
- No `.env*`, package, lockfile, dependency, schema, migration, seed, staging, prod, deploy, Cost Calibration, browser login, screenshot, raw DOM, or direct DB action.
- No route behavior broadening, no authorization relaxation, no generated AI content inspection.

## Implementation Plan

1. Add an explicit owner-preview Provider gate resolver to `owner-preview-qwen-visible-ai-runtime-control`.
2. Require the explicit gate and local target marker before returning Provider-capable runtime bridge controls.
3. Keep production blocked regardless of gate markers.
4. Keep the Provider credential reader lazy and only reachable after the explicit gate is satisfied.
5. Update targeted tests for disabled-by-default behavior, missing/invalid gate blocking, production blocking, credential redaction, and existing RAG grounding tokens.

## Validation Plan

Run:

- `corepack pnpm@10.26.1 exec vitest run src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts`
- targeted adjacent AI runtime bridge tests
- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 run typecheck`
- `git diff --check`
- Module Run v2 pre-commit hardening
- Module Run v2 pre-push readiness with remote-ahead skip if the task policy allows it

## Adversarial Review Focus

- A runtime credential alone must not enable Provider traffic.
- Production must stay blocked even with explicit local markers.
- Evidence must not contain env values, credentials, raw Provider payload, raw prompt, raw AI output, or full content.
- Route guards, edition boundaries, employee/admin privacy, and RAG redaction must not regress.
- No package, schema, DB, staging, prod, deploy, or Cost Calibration boundary may be touched.
