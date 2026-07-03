# 2026-07-02 Admin Model Prompt Log Governance UI/UX Contract Task Plan

## Task

Create package 5 of the serial UI/UX requirement contracts: admin model configuration, Prompt registry, and log
governance.

## Scope

Docs-only requirement and UI/UX contract work for `model_provider`, `model_config`, super-admin-only connection test,
read-only Prompt registry, `audit_log`, `ai_call_log`, cost summary, role boundaries, and redaction boundaries.

No product source, tests, schema, migration, database, Provider, browser/runtime, dependency, deploy, Cost Calibration,
release readiness, final Pass, or production usability work is allowed.

## Branch

`codex/admin-model-prompt-log-governance-uiux-contract-2026-07-02`

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`

## Source Inspection

Read-only source inspection targets:

- `src/features/admin/model-config-management/AdminModelConfigManagement.tsx`
- `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx`
- `src/app/(admin)/ops/ai-audit-logs/page.tsx`
- `src/app/api/v1/model-providers/**`
- `src/app/api/v1/model-configs/**`
- `src/app/api/v1/prompt-templates/**`
- `src/app/api/v1/audit-logs/route.ts`
- `src/app/api/v1/ai-call-logs/**`
- `src/server/contracts/admin-ai-audit-log-ops-contract.ts`
- `src/server/contracts/ai-call-log/log-governance-contract.ts`
- `src/server/contracts/audit-log/log-governance-contract.ts`
- `src/server/services/admin-ai-audit-log-runtime.ts`
- `src/server/services/admin-ai-audit-log-ops-service.ts`
- `src/server/services/ai-call-log/route-handlers.ts`
- `src/server/services/audit-log/route-handlers.ts`
- `src/ai/prompts/templates.ts`

## Implementation Plan

1. Reconcile existing model, Prompt, `audit_log`, and `ai_call_log` decisions from standard requirements, advanced log
   governance, and current-thread traceability.
2. Inspect current source for model config UI/API, Prompt template UI/API, log contracts, role checks, and Prompt catalog.
3. Write a docs-only UI/UX contract that separates:
   - existing decisions;
   - role and access contract;
   - model/config and connection-test contract;
   - Prompt read-only registry contract;
   - AI/audit log governance contract;
   - current source alignment;
   - follow-up source gaps.
4. Write redacted evidence with command summaries only.
5. Record two self-review passes.
6. Update `project-state.yaml` and `task-queue.yaml` for the package.
7. Run formatting and Module Run v2 gates.
8. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch only after gates pass.

## Risk Controls

- Do not expose credentials, env values, raw DB rows, sessions, cookies, Authorization headers, plaintext
  `redeem_code`, Provider payloads, raw prompts, raw AI IO, raw employee answers, full question/paper/material/resource
  content, or Prompt full text in evidence.
- Do not run browser, Provider, database, schema, migration, or dependency commands.
- Do not modify `src/**`.
- Treat implementation observations as static evidence only, not runtime acceptance.
- Stop for user decision if a new product conflict appears. This package found implementation gaps against already
  confirmed decisions, not a new decision conflict.

## Validation Commands

Planned:

- `npm.cmd exec -- prettier --write --ignore-unknown <package files>`
- `npm.cmd run format:check`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-model-prompt-log-governance-ui-ux-contract-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId admin-model-prompt-log-governance-ui-ux-contract-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-model-prompt-log-governance-ui-ux-contract-2026-07-02 -SkipRemoteAheadCheck`

## Closeout

Closeout is approved by the user's serial package instruction, limited to this docs-only package and subject to passing
the declared gates.
