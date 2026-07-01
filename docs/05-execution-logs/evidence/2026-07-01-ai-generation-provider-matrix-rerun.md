# AI Generation Provider Matrix Rerun After Repair Evidence

## Redaction Boundary

- Allowed: task ids, branch, role labels, route labels, workflow labels, pass/fail/blocked/not_applicable status, safe count labels, duration buckets, validation command names, commit/merge/push/cleanup summaries.
- Forbidden: credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*`, database connection strings, raw DB rows, internal auto ids, PII, raw prompts, Provider payloads, raw AI input/output, complete generated content, screenshots, traces, raw DOM, HTML dumps, full question/paper/material/resource/chunk content.

## Initial State

- Branch: `codex/ai-generation-provider-matrix-rerun`
- Depends on: `ai-generation-provider-structure-feedback-repair-2026-07-01`
- Source repair commit: `3f7f6842f`
- Provider submit cap: 9.
- Interruption note: before the local service restart, 2 Provider submits had been triggered. The personal advanced AI 出题 result was safely captured as `草稿 10/10`; the personal advanced AI 组卷 submit was interrupted after request submission and before safe result capture.

## Matrix Results

- Preflight route availability after local service restart:
  - `personal_standard_student` `/ai-generation`: AI 出题 `1/0`, AI 组卷 `1/0`; outcome `not_applicable`, standard edition disabled as expected.
  - `personal_advanced_student` `/ai-generation`: AI 出题 `1/1`, AI 组卷 `1/1`; outcome eligible.
  - `org_standard_employee` `/ai-generation`: AI 出题 `1/0`, AI 组卷 `1/0`; outcome `not_applicable`, standard edition disabled as expected.
  - `org_advanced_employee` `/ai-generation`: AI 出题 `1/1`, AI 组卷 `1/1`; outcome eligible.
  - `org_standard_admin` organization AI routes: submit `0/0` for question and paper routes; outcome `not_applicable`, standard organization admin blocked as expected.
  - `org_advanced_admin` organization AI routes: submit `1/1` for question and paper routes; outcome eligible.
  - `content_admin` content AI routes: submit `1/1` for question and paper routes; outcome eligible.
  - `ops_admin` content AI question route submit `0/0`, organization AI question route submit `1/1`; outcome `fail`, ops admin unexpectedly sees a submit-capable organization AI route. Provider was not clicked for ops admin.
- Provider submit accounting:
  - Attempt 1, pre-restart: `personal_advanced_student` AI 出题 captured safely as `草稿 10/10`, `待评审 10`, near-action `under_300px`.
  - Attempt 2, pre-restart: `personal_advanced_student` AI 组卷 was interrupted after submit and before safe capture; no raw output was recorded.
  - Attempt 3, post-restart: `personal_advanced_student` AI 组卷 captured safely as `paper_section 3`, `题量 未识别`, near-action `under_300px`; outcome `partial`, structure visible but quantity not recognized.
  - Attempt 4, post-restart: `org_advanced_employee` AI 出题 captured safely as `草稿 10/10`, `待评审 10`, near-action `under_300px`; outcome `pass`.
  - Attempt 5, post-restart: `org_advanced_employee` AI 组卷 captured safely as `paper_section 3`, `题量 未识别`, near-action `under_300px`; outcome `partial`, structure visible but quantity not recognized.
  - Attempt 6, post-restart: `org_advanced_admin` AI 出题 captured safely as `草稿 10/10`, `待评审 10`, near-action `under_300px`; outcome `pass`.
  - Attempt 7, post-restart: `org_advanced_admin` AI 组卷 captured safely as `paper_section 4`, `题量 24`, near-action `under_300px`; outcome `pass`.
  - Attempt 8, post-restart: `content_admin` AI 出题 captured safely as `草稿 10/10`, `待评审 10`, near-action `under_300px`; outcome `pass`.
  - Attempt 9, post-restart: `content_admin` AI 组卷 captured safely as `paper_section 3`, `题量 23`, near-action `under_300px`; outcome `pass`.
- Matrix conclusion: `completed_with_findings`. The Provider feedback-placement and question-count structure repair holds for eligible question-generation routes. AI 组卷 still has partial quantity recognition for learner/employee routes, ops admin route access is unexpectedly submit-capable, and the cross-cutting RAG grounding / internal governance UI issues remain follow-up source repair scope.

## Cross-Cutting Scan

### CROSS-001 Resource / RAG Grounding Constraint

- Status: fail, source-level root cause identified.
- Affected surfaces: personal advanced learner AI 出题 / AI 组卷, organization advanced employee AI 出题 / AI 组卷, organization advanced admin AI 出题 / AI 组卷, content admin AI 出题 / AI 组卷.
- Safe source evidence:
  - `src/server/services/personal-ai-generation-route-integrated-provider-execution-service.ts` builds the personal Provider request context from task/workflow metadata only and sends a generic owner-preview instruction. The request context does not include retrieved `resource`, `knowledge_base`, `chunk`, `citation`, or selected `knowledge_node` evidence.
  - `src/server/services/admin-ai-generation-runtime-bridge-service.ts` builds the admin Provider request context from workspace/generation/owner metadata only and sends a generic owner-preview instruction. The request context does not include retrieved `resource`, `knowledge_base`, `chunk`, `citation`, or selected `knowledge_node` evidence.
  - `src/server/services/route-integrated-provider-execution-service.ts` parses structural previews from Provider output, but this validates shape only; it does not prove source-material grounding.
- Root cause label: provider_request_not_rag_grounded_form_parameters_only.
- Owner-facing implication: generic or off-domain items can appear even when local resources exist, because the model is not currently forced to retrieve and cite owner-provided material before generation.
- Expected follow-up: later source repair must add evidence retrieval/gating before Provider calls and block or clearly explain generation when material coverage is insufficient. Evidence must remain summary-only and must not store full resource/chunk/question/provider output.

### CROSS-002 Internal Governance Copy Exposure

- Status: fail, source-level scope identified.
- Affected surfaces: learner AI result/current summary/history/detail areas, organization employee AI result/current summary/history/detail areas, organization advanced admin AI routes, content admin AI routes, and shared admin history/detail result surfaces.
- Safe source evidence:
  - `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx` renders normal user-facing fields for local contract state, runtime/status metadata, content visibility, citation count, and redaction status; labels include business-inappropriate governance wording such as redaction/local contract visibility.
  - `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx` is the shared page for content and organization admin AI routes and renders local contract summary/status/content visibility/provider execution fields to normal operators.
  - Unit tests under `tests/unit/student-personal-ai-generation-ui.test.ts`, `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`, and `tests/unit/admin-ai-generation-entry-surface.test.ts` currently assert these governance labels, so the behavior is intentional rather than accidental.
- Root cause label: governance_debug_metadata_rendered_on_product_surfaces.
- Owner-facing implication: paid learners, employees, enterprise admins, and content operators see technical safety/evidence language instead of product language such as generating, draft ready, needs review, material insufficient, or generation failed.
- Expected follow-up: later source repair must keep governance metadata in internal diagnostics/audit contexts only and replace ordinary UI with product wording. Raw prompt, Provider payload, raw AI output, credentials, storage, and full generated content remain prohibited from evidence.

## Validation Log

- `npm.cmd exec -- prettier --check --ignore-unknown <changed docs/state/evidence>`: pass.
- `git diff --check`: pass.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-provider-matrix-rerun-after-repair-2026-07-01`: pass.
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-provider-matrix-rerun-after-repair-2026-07-01 -SkipRemoteAheadCheck`: pass.
