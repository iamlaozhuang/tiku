# 2026-07-02 Content Resource Management UI/UX Contract Task Plan

## Task

Create package 6 of 6: content resource management and content-admin UX contract.

## Scope

Docs-only UI/UX requirement contract for resource and Markdown/RAG knowledge-base management ownership, IA, non-technical
workflow, access boundaries, current source alignment, and source follow-up gap register.

No product source, tests, schema, migration, Provider, env/secret, browser/runtime, database, dependency, deployment,
release readiness, final Pass, production usability, or Cost Calibration work is allowed.

## Branch

`codex/content-resource-management-uiux-contract-2026-07-02`

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-admin-model-prompt-log-governance-ui-ux-contract.md`

## Source Inspection

Read-only source inspection targets:

- `src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx`
- `src/app/(admin)/ops/resources/page.tsx`
- `src/app/(admin)/content/ContentKnowledgeOpsBaseline.tsx`
- `src/features/admin/content-admin-runtime.tsx`
- `src/app/(admin)/content/knowledge-nodes/page.tsx`
- `src/app/(admin)/content/materials/page.tsx`
- `src/app/api/v1/resources/**`
- `src/server/services/rag-resource-knowledge-runtime.ts`
- `src/server/repositories/rag-resource-knowledge-runtime-repository.ts`
- `src/server/contracts/admin-content-knowledge-ops-contract.ts`
- `src/server/services/admin-content-knowledge-ops-service.ts`
- `src/server/services/admin-content-knowledge-ops-route.ts`
- `src/server/validators/rag-resource-knowledge.ts`

## Implementation Plan

1. Create the docs-only contract under `docs/01-requirements/traceability/`.
2. Record source posture, existing decisions, access/role contract, IA, workflow, states, and follow-up gap register.
3. Create redacted evidence and two-pass audit review.
4. Update `project-state.yaml` and `task-queue.yaml` with exact package scope, allowed files, blocked files, and
   validation commands.
5. Run formatting and Module Run v2 gates.
6. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch only after gates pass.

## Risk Controls

- Do not modify product source.
- Do not inspect or record credentials, sessions, cookies, Authorization headers, env values, raw database rows, full
  resource content, raw Markdown body, raw chunk text, Provider payloads, raw Prompt, or raw AI input/output.
- Treat current source as static evidence only; do not claim runtime acceptance.
- Do not revive older matrix wording that placed resource write ownership under `ops_admin`.
- Keep OCR, direct source-less Markdown creation, raw chunk editing, public learner file access, and cloud conversion
  provisioning out of this package.

## Validation Commands

- `npm.cmd exec -- prettier --write --ignore-unknown docs/01-requirements/traceability/2026-07-02-content-resource-management-ui-ux-contract.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-content-resource-management-ui-ux-contract.md docs/05-execution-logs/evidence/2026-07-02-content-resource-management-ui-ux-contract.md docs/05-execution-logs/audits-reviews/2026-07-02-content-resource-management-ui-ux-contract.md`
- `npm.cmd run format:check`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-resource-management-ui-ux-contract-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId content-resource-management-ui-ux-contract-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-resource-management-ui-ux-contract-2026-07-02 -SkipRemoteAheadCheck`

## Closeout

Close only after the contract, evidence, state, queue, and two self-review passes are recorded and all declared gates
pass.
