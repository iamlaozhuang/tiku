# AI Generation Grounding Product UI Repair

## Task

- Task id: `ai-generation-grounding-product-ui-repair-2026-07-01`
- Branch: `codex/ai-generation-grounding-product-ui-repair`
- Scope: source repair for two cross-role AI 出题 / AI 组卷 findings from the provider matrix rerun:
  - generation is not constrained by imported resource / RAG evidence;
  - ordinary learner, employee, content admin, and organization admin screens expose internal governance copy.
- Secondary scoped regressions from the same matrix:
  - ops admin can see a submit-capable organization AI route;
  - AI 组卷 structured preview may show `题量 未识别` when Provider output uses supported section-like structures without `questionCount`.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- all ADR files under `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- prior evidence: `docs/05-execution-logs/evidence/2026-07-01-ai-generation-provider-matrix-rerun.md`

## Boundaries

- Local source, tests, and documentation state only.
- No DB reset, seed, import, raw DB read, schema, migration, dependency, package, lockfile, staging, prod, cloud, deploy, PR, force push, release-readiness, final Pass, or Cost Calibration.
- No real Provider call in this task. Provider behavior is tested with deterministic fakes only.
- No browser runtime in this task unless a later task materializes a separate manual verification boundary.
- No `.env*` read or modification.
- Evidence must not include credentials, cookies, tokens, sessions, localStorage, Authorization headers, env values, database connection strings, raw DB rows, internal auto ids, PII, Provider payloads, prompts, raw AI input/output, complete generated content, screenshots, traces, raw DOM, HTML dumps, or full question/paper/material/resource/chunk content.

## Root Cause Scan Coverage

- Learner / employee surface: `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- Content / organization admin surface: `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- Public route wrappers:
  - `src/app/(student)/ai-generation/page.tsx`
  - `src/app/(admin)/content/ai-question-generation/page.tsx`
  - `src/app/(admin)/content/ai-paper-generation/page.tsx`
  - `src/app/(admin)/organization/ai-question-generation/page.tsx`
  - `src/app/(admin)/organization/ai-paper-generation/page.tsx`
- Role coverage:
  - personal advanced learner;
  - organization advanced employee through the shared learner / employee AI page;
  - content admin;
  - organization advanced admin;
  - ops admin route denial for organization AI pages.
- Personal Provider execution: `src/server/services/personal-ai-generation-route-integrated-provider-execution-service.ts`
- Admin Provider execution: `src/server/services/admin-ai-generation-runtime-bridge-service.ts`
- Shared Provider contract / structured preview: `src/server/services/route-integrated-provider-execution-service.ts`
- Local resource RAG reuse point: `src/server/services/rag-resource-knowledge-runtime.ts`
- Role guard regression: organization AI admin route load / submit path tests.
- Repository-wide wording scan classifies non-AI governance pages such as AI audit logs, model configuration, and redeem code management as outside this scoped AI 出题 / AI 组卷 product UI repair.

## Implementation Plan

1. Write failing tests first for:
   - Provider execution blocks before credential access when grounding evidence is insufficient;
   - Provider executor receives a grounding context when evidence is sufficient;
   - ordinary learner/admin UI no longer renders local-contract/redaction/content-visibility governance copy;
   - ops admin cannot get submit-capable organization AI routes;
   - paper draft preview derives question count from supported nested question arrays or distribution totals.
2. Add shared AI generation parameter and grounding contracts without exposing chunk text in public DTOs.
3. Reuse local RAG runtime for owner-preview grounding and block generation on `weak` / `none` evidence.
4. Make learner/admin submit bodies carry business generation parameters into the server route.
5. Replace ordinary UI governance wording with product wording such as generating, draft ready, needs review, material insufficient, or generation failed.
6. Keep formal question / paper writes blocked; generated raw content remains visible only as transient local owner-preview output.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-01-ai-generation-grounding-product-ui-repair.md`
- `docs/05-execution-logs/evidence/2026-07-01-ai-generation-grounding-product-ui-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-grounding-product-ui-repair.md`
- `src/server/contracts/route-integrated-provider-execution-contract.ts`
- `src/server/contracts/personal-ai-generation-request-contract.ts`
- `src/server/contracts/admin-ai-generation-runtime-bridge-contract.ts`
- `src/server/contracts/admin-ai-generation-local-contract.ts`
- `src/server/contracts/personal-ai-generation-runtime-bridge-contract.ts`
- `src/server/models/personal-ai-generation-request.ts`
- `src/server/models/personal-ai-generation-runtime-bridge.ts`
- `src/server/validators/personal-ai-generation-request.ts`
- `src/server/services/route-integrated-provider-execution-service.ts`
- `src/server/services/personal-ai-generation-request-service.ts`
- `src/server/services/personal-ai-generation-request-context-service.ts`
- `src/server/services/personal-ai-generation-route-integrated-provider-execution-service.ts`
- `src/server/services/personal-ai-generation-runtime-bridge-service.ts`
- `src/server/services/admin-ai-generation-runtime-bridge-service.ts`
- `src/server/services/admin-ai-generation-local-contract-route.ts`
- `src/server/services/owner-preview-qwen-visible-ai-runtime-control.ts`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `tests/unit/student-personal-ai-generation-ui.test.ts`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`
- `tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts`
- `src/server/services/route-integrated-provider-execution-service.test.ts`
- `src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts`
- `src/server/services/admin-ai-generation-runtime-bridge-service.test.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`
- `src/server/services/admin-ai-generation-local-contract-route.test.ts`
- `src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts`

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts tests/unit/student-personal-ai-generation-ui.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-01-ai-generation-grounding-product-ui-repair.md docs/05-execution-logs/evidence/2026-07-01-ai-generation-grounding-product-ui-repair.md docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-grounding-product-ui-repair.md src/server/contracts/route-integrated-provider-execution-contract.ts src/server/contracts/personal-ai-generation-request-contract.ts src/server/contracts/personal-ai-generation-runtime-bridge-contract.ts src/server/contracts/admin-ai-generation-runtime-bridge-contract.ts src/server/contracts/admin-ai-generation-local-contract.ts src/server/models/personal-ai-generation-request.ts src/server/models/personal-ai-generation-runtime-bridge.ts src/server/validators/personal-ai-generation-request.ts src/server/services/route-integrated-provider-execution-service.ts src/server/services/personal-ai-generation-request-service.ts src/server/services/personal-ai-generation-request-context-service.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.ts src/server/services/personal-ai-generation-runtime-bridge-service.ts src/server/services/admin-ai-generation-runtime-bridge-service.ts src/server/services/admin-ai-generation-local-contract-route.ts src/server/services/owner-preview-qwen-visible-ai-runtime-control.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx tests/unit/student-personal-ai-generation-ui.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-grounding-product-ui-repair-2026-07-01`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-grounding-product-ui-repair-2026-07-01 -SkipRemoteAheadCheck`

## Exit Criteria

- Cross-role scan maps both user-highlighted issues to shared source surfaces and tests.
- Provider execution cannot proceed without sufficient local grounding evidence.
- Product UI no longer shows governance-only wording on ordinary AI 出题 / AI 组卷 screens.
- Ops admin organization AI submit regression is covered.
- Paper draft preview no longer reports `题量 未识别` for supported nested structures.
- Evidence records only safe status summaries and validation results.
