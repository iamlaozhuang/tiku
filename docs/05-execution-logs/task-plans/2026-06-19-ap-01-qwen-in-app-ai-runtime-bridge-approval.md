# AP-01 Qwen In-App AI Runtime Bridge Approval

## Task

- Task id: `ap-01-qwen-in-app-ai-runtime-bridge-approval`
- Branch: `codex/ap-01-qwen-in-app-ai-runtime-bridge-approval`
- Base commit: `7bdab5a0`
- Date: `2026-06-19`
- Scope: docs/state approval package only.

## Mandatory Readings

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-cost-calibration-and-in-app-ai-experience-approval-detailing.md`

## Code Surfaces Read Only

- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-local-browser-experience-service.ts`
- `src/server/services/ai-explanation-hint-service.ts`
- `src/server/services/ai-generation-task-provider-adapter-service.ts`
- `src/server/models/ai-rag.ts`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`
- `package.json`

## Current Finding

- The student in-app candidate entry remains `/ai-generation`.
- The request route remains `POST /api/v1/personal-ai-generation-requests`.
- The current application response mode remains `local_browser_experience`.
- The current runtime status remains `local_contract_only`.
- Existing service-level AI explanation/hint code already supports injected runners and redacted AI call log snapshots.
- The existing provider adapter can create server-side model handles without a provider call, and explicitly reports
  `providerCallExecuted=false`.

## Allowed Files

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-01-qwen-in-app-ai-runtime-bridge-approval.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-in-app-ai-runtime-bridge-approval.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-in-app-ai-runtime-bridge-approval.md`

## Blocked Files And Capabilities

- `.env*`
- `package.json`
- lockfiles
- `src/**`
- `e2e/**`
- `tests/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`
- `playwright-report/**`
- `test-results/**`
- Provider/model calls.
- Env secret reads or writes.
- Provider/model/base URL configuration changes.
- Cost Calibration Gate execution.
- Staging/prod/cloud/deploy.
- Payment/external service.
- Dependency/schema/migration/product/test/e2e changes.
- PR, push, force push.
- Destructive database operations.
- Raw sensitive evidence.

## Approval Boundary To Materialize

This task approves the boundary for a later bridge implementation task only. The later task may implement one of these
local-only options:

1. A default-blocked runtime bridge from the student personal AI generation route to the existing service-level
   explanation/hint runner abstraction.
2. An equivalent controlled local runner that exercises the same service-level redaction and result-mapping contract,
   while clearly recording that it is not full UI route execution if it bypasses the browser route.

The approved bridge implementation must:

- default to `local_contract_only` or `provider_call_blocked`;
- require an explicit local-only test/runtime switch before the bridge path can run;
- use deterministic fake runner behavior or a provider-call-blocked runner for implementation validation;
- avoid `.env.local` and all secret reads;
- avoid provider calls, retries, streaming, and cost calibration;
- preserve redacted snapshots through `createAiCallLogRedactedSnapshots` or an equivalent redaction layer;
- keep raw prompt, raw response, raw provider payload, raw errors, raw question/answer/material content, and raw DB rows
  out of evidence;
- add focused tests in the later implementation task if source code changes are made.

## Next Execution Boundary

- Next implementation candidate: `ap-01-qwen-in-app-ai-runtime-bridge-implementation`.
- Provider/model execution after the bridge remains blocked.
- A real in-app Qwen request requires a separate fresh approval after bridge validation passes.
