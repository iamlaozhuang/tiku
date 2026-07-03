# 2026-07-03 Content Resource Management Source Landing Plan

## Task

Implement the confirmed content-resource management source landing package after the accepted UI/UX contract.

Task id: `content-resource-management-source-landing-2026-07-03`

Branch: `codex/content-resource-management-source-landing-2026-07-03`

## Read Baseline

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
- `docs/01-requirements/traceability/2026-07-02-content-resource-management-ui-ux-contract.md`
- Relevant source and tests under the allowed file list below.

## Decision Anchors

- `UX-REQ-14`: resource management moves to the content workspace and uses guided, business-readable wording.
- `CT-REQ-031`: content resource management needs a content-admin UX/source path.
- `CT-REQ-045`: old operations resource write entry must not remain the active primary route.
- `CT-REQ-057`: older role matrices must not preserve `ops_admin` resource ownership.
- `CT-REQ-059`: resource search-index rebuild belongs to `content_admin` / `super_admin`.
- `CT-REQ-060`: owner-facing `ops_admin` resource checklist wording is superseded.

## Allowed Writes

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-03-content-resource-management-source-landing.md`
- `docs/05-execution-logs/evidence/2026-07-03-content-resource-management-source-landing.md`
- `docs/05-execution-logs/audits-reviews/2026-07-03-content-resource-management-source-landing.md`
- `src/app/(admin)/content/resources/page.tsx`
- `src/app/(admin)/content/ContentKnowledgeOpsBaseline.tsx`
- `src/app/(admin)/ops/resources/page.tsx`
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`
- `src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx`
- `src/server/services/rag-resource-knowledge-runtime.ts`
- `tests/unit/admin-dashboard-layout-navigation.test.ts`
- `tests/unit/admin-content-knowledge-ops-baseline.test.ts`
- `tests/unit/admin-resource-knowledge-ui-layout.test.ts`
- `tests/unit/phase-9-rag-resource-knowledge-runtime.test.ts`

## Blocked Scope

- Database schema, migration, seed, direct database connection or mutation.
- Provider/model calls, Provider configuration reads, Prompt registry edits, env/secret access.
- Dependency or lockfile changes.
- Object storage rollout, OCR, cloud conversion provisioning, raw chunk editing, embedding viewers, raw content exports.
- Organization training, operations authorization, `redeem_code`, model health check, Prompt registry, learner flows.
- Staging/prod deployment, PR, force-push, Cost Calibration, release readiness, final Pass, production-usability claims.

## Implementation Approach

1. Add `/content/resources` as the primary content-workspace resource page.
2. Remove resource management from the operations navigation and add it to the content navigation.
3. Redirect the old `/ops/resources` page to `/content/resources` so eligible multi-role admins land on the content path while `ops_admin` is denied by the content workspace guard.
4. Restrict resource runtime write/read handlers to `content_admin` and `super_admin`; authenticated `ops_admin` receives permission denied instead of resource access.
5. Replace ordinary resource UI copy with business wording: `资料`, `解析草稿`, `发布`, `重建检索索引`, and safe failure/identifier wording.
6. Add visible pagination/page-size/sort controls and URL-query preservation for the resource list UI.
7. Keep raw chunk, embedding, storage path, internal id, raw full content export, OCR, and Provider work out of scope.

## Validation

- `npm.cmd run test:unit -- tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/admin-content-knowledge-ops-baseline.test.ts tests/unit/admin-resource-knowledge-ui-layout.test.ts tests/unit/phase-9-rag-resource-knowledge-runtime.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run format:check`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-resource-management-source-landing-2026-07-03`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId content-resource-management-source-landing-2026-07-03`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-resource-management-source-landing-2026-07-03 -SkipRemoteAheadCheck`

## Evidence Rules

Evidence may record task ids, file paths, changed source categories, route names, role names, validation commands, and
redacted expected/observed summaries.

Evidence must not record credentials, tokens, sessions, cookies, Authorization headers, env values, raw DB rows, internal
numeric ids, PII, plaintext `redeem_code`, Provider payloads, prompts, raw AI IO, raw employee answers, full
question/paper/material/resource/chunk content, screenshots, traces, or raw DOM dumps.

## Self-Review

- Pass 1: Check route/nav/service authorization against `UX-REQ-14`, `CT-REQ-045`, `CT-REQ-057`, `CT-REQ-059`, and
  `CT-REQ-060`.
- Pass 2: Check UI copy, state coverage, pagination controls, evidence redaction, and blocked-scope drift.
