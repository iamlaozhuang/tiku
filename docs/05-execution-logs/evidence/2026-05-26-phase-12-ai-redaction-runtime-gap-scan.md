# Phase 12 AI Redaction Runtime Gap Scan Evidence

**Task id:** `phase-12-ai-redaction-runtime-gap-scan`

**Branch:** `codex/phase-12-ai-redaction-runtime-gap-scan`

**Date:** 2026-05-26

## Scope

This task executed the AI/RAG, model_config, prompt_template, redaction, secret masking, audit_log, and ai_call_log slice from the Phase 12 multi-role experience scripts. It records gaps only and does not change runtime/UI/test code.

## Files Checked

Standards, contracts, state, queue, and prior evidence:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/02-architecture/interfaces/phase-11-role-based-full-flow-acceptance-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-05-26-phase-12-role-scenario-script-plan.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-role-scenario-script-plan.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-model-config-admin-ui.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-model-config-local-mock-runtime.md`

Implementation and tests:

- `src/app/(admin)/ops/ai-audit-logs/page.tsx`
- `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx`
- `src/features/admin/model-config-management/AdminModelConfigManagement.tsx`
- `src/app/api/v1/model-providers/**`
- `src/app/api/v1/model-configs/**`
- `src/app/api/v1/prompt-templates/**`
- `src/app/api/v1/audit-logs/**`
- `src/app/api/v1/ai-call-logs/**`
- `src/server/services/admin-ai-audit-log-runtime.ts`
- `src/server/services/model-config-runtime.ts`
- `src/server/services/ai-mock-provider-runtime.ts`
- `src/server/services/ai-scoring-service.ts`
- `src/server/services/ai-explanation-hint-service.ts`
- `src/server/services/knowledge-recommendation-service.ts`
- `src/server/services/student-flow-runtime.ts`
- `src/server/mappers/ai-rag-mapper.ts`
- `e2e/admin-audit-navigation.spec.ts`
- `e2e/local-business-flow.spec.ts`
- `e2e/role-based-acceptance/role-based-full-flow.spec.ts`
- `tests/unit/admin-ai-audit-log-ops-baseline.test.ts`
- `tests/unit/admin-model-config-management-ui.test.ts`
- `tests/unit/phase-12-model-config-server-runtime.test.ts`
- `tests/unit/phase-12-model-config-local-mock-runtime.test.ts`
- `tests/unit/phase-11-ai-call-log-coverage-hardening.test.ts`

## Browser Operations

Browser verification path:

- This task used the repository Playwright e2e suite as the real-browser localhost path.
- The Browser plugin issue from prior admin/auth tasks remains: login text entry was unreliable because virtual clipboard support was unavailable, so Playwright is the cross-check browser channel.

Playwright browser paths from `npm.cmd run test:e2e`:

| Role        | Scenario                 | Route(s)                                                                                         | Expected                                                                          | Actual                                            |
| ----------- | ------------------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------- |
| admin       | AI audit navigation      | `/login` -> `/ops/users` -> `/ops/ai-audit-logs`                                                 | Admin shell navigates to existing AI/audit log route and read-only label.         | Passed.                                           |
| admin       | redaction browser checks | `/ops/ai-audit-logs`, local business flow admin surfaces                                         | Body does not contain token, secret sentinel, raw prompt, or raw answer text.     | Passed.                                           |
| admin       | oversight flow           | `/api/v1/audit-logs`, `/api/v1/ai-call-logs`, `/ops/ai-audit-logs`                               | Standard envelopes, non-empty logs, read-only UI, no raw prompt/answer sentinels. | Passed.                                           |
| student     | AI runtime local flow    | practice, mock_exam, exam_report, mistake_book paths                                             | Local mock AI/RAG flow completes without exposing raw answer/log sentinels.       | Passed.                                           |
| super_admin | model config API runtime | `/api/v1/model-providers`, `/api/v1/model-configs`, `/api/v1/prompt-templates` unit/API coverage | Secret and prompt body masking; public-id-only mutation contracts.                | Passed in unit/API coverage, not browser mounted. |

No browser evidence records credentials, tokens, Authorization headers, raw prompts, raw answers, raw model responses, raw provider payloads, plaintext redeem codes, generated passwords, full papers, full教材, OCR text, real secrets, environment values, or customer-like private data.

## Code Cross-Check Findings

- `ai-rag-contract.md` and `admin-ops-contract.md` explicitly require no raw prompt, raw answer, raw model response, raw provider payload, provider headers, tokens, database URLs, or secrets in DTOs/logs/evidence.
- Runtime API routes exist for `model-providers`, `model-configs`, `prompt-templates`, `audit-logs`, `ai-call-logs`, and `ai-call-logs/summary`.
- `model-config-runtime.ts` exposes `createRedactedModelConfigRuntimeSnapshot` and a `snapshotPolicy` of `redacted_metadata`.
- AI scoring, explanation/hint, learning suggestion, and knowledge recommendation build redacted call-log snapshots with model_config and prompt_template metadata.
- Unit tests cover masked model provider secret output, prompt template body masking, non-super-admin mutation denial, local mock model_config metadata, and AI call log redaction.
- E2E tests assert absence of sentinel strings including raw prompt/answer markers and provider payload field names in browser/API serialized output.
- `/ops/ai-audit-logs/page.tsx` renders `AdminAiAuditLogOpsBaseline`, which uses hardcoded preview data and simulated enable/disable toasts.
- `AdminModelConfigManagement` exists and has unit coverage, but `rg` shows it is imported only by its unit test, not by any route or admin page.

## Gap List

| Gap id     | Type                               | Severity | Role                   | Surface                                                    | Evidence                                                                                                                                                                                                                                                                                                                             | Repro Steps                                                                                                                                             | Suggested Follow-up                                                                                                                               |
| ---------- | ---------------------------------- | -------- | ---------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI-GAP-001 | UI 缺失 / 实现缺失                 | high     | super_admin            | model_provider, model_config, prompt_template admin UI     | `src/features/admin/model-config-management/AdminModelConfigManagement.tsx` implements provider/config/template management and redaction-safe inputs, but `rg AdminModelConfigManagement src tests e2e` finds only the component and its unit test. No admin route mounts it.                                                        | Login as admin and visit `/ops/ai-audit-logs`; there is no route/tab exposing the full `AdminModelConfigManagement` feature.                            | Add a UI integration task to mount `AdminModelConfigManagement` under the approved admin ops surface with live API data and role-gated mutations. |
| AI-GAP-002 | UI 缺失 / API 与 UI 不一致         | high     | ops_admin, super_admin | `/ops/ai-audit-logs`, audit_log, ai_call_log, cost summary | `src/app/(admin)/ops/ai-audit-logs/page.tsx` renders `AdminAiAuditLogOpsBaseline`; the baseline hardcodes model config, audit log, AI call log, and cost summary preview rows, and enable/disable buttons only simulate local toasts. Runtime APIs exist under `/api/v1/*`, so the UI is behind the implementation.                  | Login as admin, open `/ops/ai-audit-logs`, compare visible rows/buttons with `/api/v1/model-configs`, `/api/v1/audit-logs`, and `/api/v1/ai-call-logs`. | Add an AI/audit ops runtime UI task to replace static preview data with API-backed lists, filters, summaries, and mutation calls.                 |
| AI-GAP-003 | 测试缺失                           | medium   | super_admin            | model_provider/model_config/prompt_template browser flows  | Unit/API tests cover provider creation, secret masking, prompt template masking, config fallback, enable/disable, and role denial. Browser e2e currently reads model configs and visits `/ops/ai-audit-logs`, but does not perform browser CRUD flows for model provider/config/template management because the UI is not mounted.   | Run `npm.cmd run test:e2e` and inspect covered routes; no test fills model provider secret input, prompt template masked preview, or fallback controls. | After AI-GAP-001/002, add browser e2e for create/enable/disable/reorder and prompt-template masking using synthetic inputs only.                  |
| AI-GAP-004 | 测试缺失 / redaction assertion gap | medium   | admin, student         | `ai_call_log` redacted snapshots                           | E2E sensitive checks assert forbidden strings are absent, and unit tests inspect snapshot fields. Browser/API e2e does not yet assert positive presence and shape of safe metadata such as `modelConfigPublicId`, `snapshotPolicy`, `promptTemplateKey`, `promptTemplateVersion`, `evidenceStatus`, and redacted citation summaries. | Run role-based/full-flow e2e; it checks absence of sentinel raw terms but not the expected redacted metadata shape in returned AI log summaries.        | Add redaction-shape e2e/API assertions that verify safe metadata exists while forbidden raw fields remain absent.                                 |

## Non-Gap Passed Checks

- API routes use `/api/v1/` and public identifiers.
- Model provider API tests assert raw synthetic secret is not returned, not sent to mutation outputs, and not written into audit metadata.
- Prompt template API tests assert raw prompt body is not returned or persisted in mutation/audit outputs.
- AI call log list and summary tests assert no raw model response, provider payload, request body, or session token in returned payloads.
- Local mock AI runtime adds redaction-safe model_config metadata to AI call logs.
- E2E browser checks assert visible UI and serialized admin reads do not contain sensitive sentinel strings.

## Command Results

- `npm.cmd run test:e2e`
  - Result: pass.
  - Summary: 15 Playwright tests passed, including AI audit navigation, local business redaction assertions, and role-based oversight flow.
- `npm.cmd run test:unit`
  - Result: pass.
  - Summary: 130 test files passed, 519 tests passed.
- `npm.cmd run build`
  - Result: pass.
  - Summary: Next.js production build compiled successfully and generated 50 static pages. Build output named `.env.local` as an environment file but no environment value was read or recorded.
- `npm.cmd run lint`
  - Result: pass.
- `npm.cmd run typecheck`
  - Result: pass.
- `npm.cmd run format:check`
  - Result: pass.
  - Summary: all matched files use Prettier code style.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
  - Result: pass inventory before commit.
  - Summary: script reported only this task's docs/state/evidence files as unstaged/untracked before commit.
- `git diff --check`
  - Result: pass.

## Runtime/UI/Test/Docs Touch Summary

- Runtime source touched: no.
- UI source touched: no.
- Tests touched: no.
- Docs/state/queue touched: yes.
- Dependency manifests or lockfiles touched: no.
- Database schema/migration touched: no.
- `.env.local` / `.env.example` read or touched: no.
- Staging/prod/cloud/provider/deploy touched: no.

## Forbidden Scope Self-Check

- No dependency was added, removed, or upgraded.
- No package manifest or lockfile was modified.
- No `.env.local` or `.env.example` contents were read, changed, or copied.
- No staging, production, cloud, or real provider was contacted.
- No deployment or PR was created.
- No destructive data operation was executed.
- No raw prompt, raw answer, raw model response, raw provider payload, raw retrieved chunk, Authorization header, database URL, token, secret, plaintext redeem code, generated password, full paper, full教材, OCR full text, or private customer-like data is recorded in this evidence.

## 品味合规自检 Checklist

- [x] Scope stayed documentation/evidence-only; no AI/provider/redaction code was changed without a queue item.
- [x] Naming followed glossary terms: `ai_scoring`, `ai_explanation`, `ai_hint`, `kn_recommendation`, `learning_suggestion`, `model_provider`, `model_config`, `prompt_template`, `audit_log`, `ai_call_log`.
- [x] API references use `/api/v1/` and public identifiers only.
- [x] No API JSON `snake_case` payload was introduced.
- [x] No empty string was introduced as a replacement for `null`.
- [x] No auto-increment database `id` was exposed in evidence or URLs.
- [x] No hardcoded UI color/spacing/runtime code was added.
- [x] No secret, token, raw prompt, raw answer, raw model output, provider payload, raw retrieved chunk, full paper, full教材, generated password, plaintext redeem_code, or environment value was recorded.
- [x] Gaps were recorded for follow-up instead of being fixed outside the claimed task.
