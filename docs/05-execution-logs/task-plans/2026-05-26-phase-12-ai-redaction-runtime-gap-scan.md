# Phase 12 AI Redaction Runtime Gap Scan

**Task id:** `phase-12-ai-redaction-runtime-gap-scan`

**Branch:** `codex/phase-12-ai-redaction-runtime-gap-scan`

**Goal:** Execute the AI/RAG, model_config, prompt_template, redaction, secret masking, audit_log, and ai_call_log slice from the Phase 12 role-scenario scripts with code inspection plus localhost browser/e2e validation. Record gaps only; do not change AI runtime, provider configuration, UI, tests, dependencies, schema, migrations, package manifests, lockfiles, scripts, or environment files.

## Read Standards

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

## allowedFiles

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`

## blockedFiles

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

## Role And Scenario Scope

Primary roles:

- `super_admin` for model_provider, model_config, prompt_template mutation boundaries.
- `ops_admin` for audit_log and ai_call_log read/summary boundaries.
- `content_admin` as insufficient-permission role for model/provider mutation denial.
- student flows that trigger local mock `ai_scoring`, `ai_explanation`, `ai_hint`, `kn_recommendation`, and `learning_suggestion` metadata.

Covered scripts from the prior plan:

- S2/S3 student AI/RAG display and redaction-safe output checks.
- S4 content knowledge recommendation metadata checks.
- S6 AI and redaction runtime script.

Deferred:

- Real provider, real secret, staging, prod, cloud, deployment, raw prompt/body retention, and provider payload retention remain blocked until explicit future approval.
- Business/UI fixes remain follow-up tasks seeded by the final closeout.

## Experience Script Design

### AI Log And Audit Read-Only Browser Flow

Preconditions:

- Local admin session exists through test/runtime fixture.
- Local dev server or Playwright web server uses `http://127.0.0.1:3000`.

Steps:

1. Login as admin.
2. Navigate to `/ops/ai-audit-logs`.
3. Confirm audit and AI call log read-only labels.
4. Confirm visible UI does not include known sensitive sentinel strings.
5. Cross-check whether UI is runtime-backed or static baseline.

Expected results:

- `audit_log` and `ai_call_log` are read-only.
- UI does not expose token, secret, raw prompt, raw answer, raw model response, or raw provider payload.
- Browser surface renders current runtime data where runtime APIs exist.

### Model Config And Prompt Template Boundary

Preconditions:

- Local model_config runtime APIs exist.
- No real provider or environment file is read.

Steps:

1. Inspect `/api/v1/model-providers`, `/api/v1/model-configs`, `/api/v1/prompt-templates`, and enable/disable/reorder routes.
2. Inspect DTO redaction fields: `secretStatus`, `maskedSecret`, `bodyDigest`, `bodyPreviewMasked`, and `snapshotPolicy`.
3. Inspect UI wiring for `AdminModelConfigManagement`.
4. Compare unit/API coverage with browser-level coverage.

Expected results:

- Secret input is short-lived and never returned.
- Prompt template UI/API returns digest and masked preview only.
- Model_config snapshots include redaction-safe metadata only.
- Browser coverage exercises the user-visible management surface.

### Student AI Runtime Redaction Boundary

Preconditions:

- Local mock provider/deterministic runtime is used.
- Synthetic test values are used only inside tests and never recorded as secrets.

Steps:

1. Inspect scoring, explanation, hint, knowledge recommendation, and learning suggestion redacted snapshots.
2. Inspect e2e checks for forbidden sensitive terms and raw provider payload terms.
3. Cross-check whether e2e verifies shape-specific redaction metadata, not just forbidden string absence.

Expected results:

- `ai_call_log` records model_config and prompt_template metadata.
- Request, response, error, and citation snapshots are redaction-safe.
- Browser/API e2e assertions prove both sensitive absence and expected safe metadata presence.

## Browser Verification Plan

- Use repository Playwright e2e as the real-browser verification path.
- Run `npm.cmd run test:e2e` for localhost Chromium coverage.
- Record route names, UI labels, public references, and aggregate pass/fail only.
- Do not record credentials, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, generated passwords, plaintext redeem codes, full papers, full教材, OCR text, real secrets, environment values, or customer-like private data.

## Code Cross-Check Paths

- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
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

## Risk Defense

- Documentation/evidence-only change.
- No AI runtime, provider, UI, test, dependency, package, lockfile, schema, migration, script, or environment file edit.
- No staging, production, cloud, real provider, deployment, or destructive data operation.
- Browser and command outputs are summarized with sensitive values omitted.
- Any implementation gap is recorded for follow-up rather than fixed in this task.

## Verification Commands

- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run format:check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Sensitive Information Red Lines

Do not record secrets, tokens, Authorization headers, database URLs, real customer data, raw provider payloads, raw prompts, raw answers, raw model responses, raw retrieved chunks, full教材, full paper/OCR text, plaintext redeem codes, generated passwords, or `.env.local` / `.env.example` contents.
