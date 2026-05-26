# Phase 13 AI Redaction Shape And Management E2E Task Plan

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/01-requirements/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-experience-gap-closeout-plan.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-ai-redaction-runtime-gap-scan.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-13-ai-audit-model-config-runtime-ui.md`

## Queue Scope

- Task id: `phase-13-ai-redaction-shape-and-management-e2e`
- Source gaps: `AI-GAP-003`, `AI-GAP-004`
- Dependency: `phase-13-ai-audit-model-config-runtime-ui` is closed and merged to `master`.
- Human approval: local follow-up claim only; use synthetic/local inputs only.

## Allowed Files

- `e2e/**`
- `tests/unit/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`

## Blocked Files

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/db/schema/**`
- `drizzle/**`

## Task Scope

- Add e2e/API assertions for redaction-safe positive metadata shape on `audit_log`, `ai_call_log`, cost summary, and model configuration management surfaces.
- Add browser coverage for the mounted model configuration management tabs/actions using local synthetic data only.
- Assert forbidden raw fields and sentinel strings are absent from UI and serialized API responses.
- Do not change runtime behavior, schemas, providers, dependencies, or environment files.

## Implementation Plan

1. Extend or add Playwright coverage for `/ops/ai-audit-logs` after local admin login.
2. Verify the model configuration management tabs are mounted and redaction-safe controls are visible without raw prompt/provider payload leakage.
3. Fetch local `/api/v1/audit-logs`, `/api/v1/ai-call-logs`, and `/api/v1/ai-call-logs/summary` from the authenticated browser context.
4. Assert standard response envelopes, public ids, safe metadata fields, and absence of forbidden raw fields/markers.
5. Keep assertions resilient to local seed cardinality while requiring at least one safe redacted metadata signal from the existing local runtime data.

## Browser Verification Plan

- Flow under test: `/login` -> `/ops/users` -> `/ops/ai-audit-logs` -> model config management tabs -> redaction-safe API reads.
- Browser plugin will be attempted first; if it remains blocked for localhost, Playwright is the recorded fallback.
- Expected: no raw prompt, raw answer, raw model response, raw provider payload, token, secret, database URL, or Authorization header visible or returned.

## Code Cross-Check Paths

- `e2e/admin-audit-navigation.spec.ts`
- `e2e/local-business-flow.spec.ts`
- `e2e/role-based-acceptance/role-based-full-flow.spec.ts`
- `tests/unit/admin-ai-audit-log-ops-baseline.test.ts`
- `tests/unit/admin-model-config-management-ui.test.ts`

## Risk Defense

- Do not read `.env.local` or `.env.example`.
- Do not add dependencies or alter lockfiles.
- Do not call real provider, cloud, staging, or prod.
- Do not create, output, or persist raw prompt, raw answer, raw model response, raw provider payload, Authorization header, token, secret, database URL, full paper, full教材, OCR full text, or private customer-like data.
- Use local synthetic credentials already present in e2e fixtures only.
- Keep API assertions on standard response envelopes and public identifiers only.

## Validation Commands

- `npm.cmd run test:e2e`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Sensitive Information Red Lines

- Do not record secret, token, Authorization header, database URL, raw provider payload, raw prompt, raw answer, raw model response, full paper content, OCR full text, or customer/private data.
