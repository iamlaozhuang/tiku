# Phase 13 AI Audit Model Config Runtime UI Task Plan

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

## Queue Scope

- Task id: `phase-13-ai-audit-model-config-runtime-ui`
- Source gaps: `AI-GAP-001`, `AI-GAP-002`
- Dependency: `phase-12-experience-gap-closeout-plan` is already closed.
- Human approval: local follow-up claim only; do not call real providers or read env files.

## Allowed Files

- `src/app/(admin)/ops/ai-audit-logs/**`
- `src/features/admin/model-config-management/**`
- `src/features/admin/**`
- `src/app/api/v1/model-providers/**`
- `src/app/api/v1/model-configs/**`
- `src/app/api/v1/prompt-templates/**`
- `src/app/api/v1/audit-logs/**`
- `src/app/api/v1/ai-call-logs/**`
- `src/server/services/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `tests/unit/**`
- `e2e/**`
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

- Mount `AdminModelConfigManagement` on `/ops/ai-audit-logs`.
- Replace static AI/audit preview rows with API-backed model provider, model_config, prompt_template, audit_log, ai_call_log, and cost summary data.
- Wire model provider/config/template local UI actions to existing REST endpoints with standard response envelopes.
- Preserve redaction boundaries: no raw prompt, raw answer, raw model response, raw provider payload, secret, token, object key, or database URL rendered/logged.

## Implementation Plan

1. Add focused unit expectations that `/ops/ai-audit-logs` loads runtime APIs and renders `AdminModelConfigManagement` with API data.
2. Refactor `AdminModelConfigManagement` to accept optional async runtime callbacks while keeping existing local-only unit behavior as fallback.
3. Refactor `AdminAiAuditLogOpsBaseline` to fetch runtime data with the local session token, render loading/empty/error states, pass API-backed data/actions into `AdminModelConfigManagement`, and render read-only audit/AI/cost summaries.
4. Add/adjust E2E coverage for browser visibility and redaction on `/ops/ai-audit-logs`.
5. Record any model provider real-secret/provider integration as out of scope; this task only uses metadata endpoints and local runtime data.

## Browser Verification Plan

- Focused: visit `/ops/ai-audit-logs` as local admin through Playwright.
- Expected: mounted model config management tabs, API-backed model/audit/AI/cost rows, no raw prompt/answer/provider payload/secret/token text, no framework overlay.
- Full: run `npm.cmd run test:e2e`.

## Code Cross-Check Paths

- `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx`
- `src/features/admin/model-config-management/AdminModelConfigManagement.tsx`
- `src/server/contracts/admin-ai-audit-log-ops-contract.ts`
- `src/server/services/admin-ai-audit-log-runtime.ts`
- `src/server/repositories/admin-ai-audit-log-runtime-repository.ts`
- `tests/unit/admin-ai-audit-log-ops-baseline.test.ts`
- `tests/unit/admin-model-config-management-ui.test.ts`
- `e2e/admin-audit-navigation.spec.ts`

## Risk Defense

- Do not read `.env.local` or `.env.example`.
- Do not add dependencies or alter lockfiles.
- Do not call real provider, cloud, staging, or prod.
- Do not expose raw prompt/template body, raw answer/model response, provider payload, secret values, Authorization headers, database URL, or internal numeric ids.
- Keep API responses in `{ code, message, data, pagination? }`.
- Keep external URLs using public ids only.

## Validation Commands

- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Sensitive Information Red Lines

- Do not record secret, token, Authorization header, database URL, raw provider payload, raw prompt, raw answer, raw model response, complete paper content, OCR full text, or customer/private data.
