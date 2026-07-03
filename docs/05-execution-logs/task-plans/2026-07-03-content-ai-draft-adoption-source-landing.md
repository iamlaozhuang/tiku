# Content AI Draft Adoption Source Landing Plan

## Task

- Task id: `content-ai-draft-adoption-source-landing-2026-07-03`
- Branch: `codex/content-ai-draft-adoption-source-landing-2026-07-03`
- Goal: land the content AI draft review/adoption source contract with attribution, weak/none evidence gates, editable formal draft boundary, and no direct publish.

## Required Reading Completed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/01-requirements/traceability/2026-07-03-source-landing-16-package-execution-map.md`

## Requirement Anchors

- `UX-REQ-09`
- `UX-REQ-13`
- `CT-REQ-023`
- `CT-REQ-040`
- `D11`

## Current Source Posture

- Content AI `AI出题` and `AI组卷` entries already route into the shared draft/review surface.
- Formal adoption route, repository, runtime tests, formal draft adapter, diff read model, and adoption-history read model already exist.
- Current UI blocks both `none` and `weak` evidence by treating anything other than sufficient evidence as ungrounded; the requirement says `none` blocks and `weak` requires explicit confirmation.
- Current repository eligibility checks content/platform scope and review state but does not reject `evidence_status = none` or require explicit weak-evidence confirmation at the source-of-truth layer.
- UI must not fabricate full `reviewedDraft` payloads from masked summaries; formal draft creation remains covered by the existing adapter when a reviewed draft payload is provided by an approved editor path.

## Implementation Plan

1. Add failing focused tests for:
   - repository rejects `evidence_status = none`;
   - repository rejects `weak` evidence unless `weakEvidenceConfirmed` is explicit;
   - content UI enables weak adoption only with weak-confirmation wording and sends `weakEvidenceConfirmed: true`;
   - content UI keeps `none` adoption disabled and avoids direct publish wording.
2. Extend the formal adoption command model and validator with optional `weakEvidenceConfirmed`.
3. Add repository evidence gates: `none` blocks adoption, `weak` requires explicit weak confirmation.
4. Refine content review UI copy and action request body while preserving redaction and no raw draft fabrication.
5. Record evidence, two self-review passes, and closeout.

## Boundaries

- Allowed source/test files:
  - `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
  - `src/server/models/admin-ai-generation-formal-adoption.ts`
  - `src/server/validators/admin-ai-generation-formal-adoption.ts`
  - `src/server/repositories/admin-ai-generation-formal-adoption-repository.ts`
  - `tests/unit/admin-ai-generation-entry-surface.test.ts`
  - `src/server/repositories/admin-ai-generation-formal-adoption-repository.test.ts`
- Allowed governance files:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `docs/01-requirements/traceability/2026-07-03-source-landing-16-package-execution-map.md`
  - `docs/05-execution-logs/task-plans/2026-07-03-content-ai-draft-adoption-source-landing.md`
  - `docs/05-execution-logs/evidence/2026-07-03-content-ai-draft-adoption-source-landing.md`
  - `docs/05-execution-logs/audits-reviews/2026-07-03-content-ai-draft-adoption-source-landing.md`
- Blocked: `.env*`, package and lockfiles, schema/migration/seed, direct DB connection or mutation, Provider calls/configuration, Prompt changes, browser/e2e/dev-server runtime, staging/prod/deploy, PR, force push, release readiness, final Pass, Cost Calibration.

## Follow-Up Gap

- A full visual editor that maps persisted structured generated content into reviewed formal question/paper fields remains outside this package unless an existing approved editor payload is available. This package must not fabricate raw content from masked summaries.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts src/server/repositories/admin-ai-generation-formal-adoption-repository.test.ts src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/server/services/admin-ai-generation-review-result-diff-service.test.ts src/server/services/admin-ai-generation-adoption-history-read-model-service.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run format:check`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-ai-draft-adoption-source-landing-2026-07-03`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId content-ai-draft-adoption-source-landing-2026-07-03`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-ai-draft-adoption-source-landing-2026-07-03 -SkipRemoteAheadCheck`
