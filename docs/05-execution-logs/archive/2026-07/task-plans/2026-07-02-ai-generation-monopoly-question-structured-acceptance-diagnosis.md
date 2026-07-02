# AI Generation Monopoly Question Structured Acceptance Diagnosis Plan

## Task Boundary

- Task id: `ai-generation-monopoly-question-structured-acceptance-diagnosis-2026-07-02`
- Branch: `codex/ai-generation-monopoly-question-structured-acceptance-diagnosis`
- Scope: source/test repair for AI出题 structured-preview acceptance diagnostics and fallback parsing only.
- Blocked: real Provider call, browser runtime, DB access or mutation, private OCR/material changes, dependency/package/lockfile changes, schema/migration/seed, staging/prod/cloud/deploy, PR, force push, release readiness, final Pass, Cost Calibration, and AI组卷 question-count preview repair.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-02-monopoly-scanned-pdf-ocr-runtime-rag-coverage.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-bounded-provider-rerun-after-question-structure-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-bounded-provider-rerun-after-question-structure-repair.md`

## Requirement Mapping

- `UC-ADV-CONTENT-ADMIN-AI-GENERATION`: content admins need reviewable AI出题 draft output, even when Provider formatting varies, as long as count and grounding gates remain safe.
- Shared parser contract applies across content admin, organization admin, learner, and employee AI出题 surfaces; this task must not add profession-specific branches.
- Admin ops formal-content boundary remains unchanged: generated results are review drafts and are not adopted into formal `question` records.

## First-Principles Diagnosis

- Monopoly RAG is now sufficient after OCR/runtime import, so the remaining blocker is not coverage.
- The route fails only after Provider execution, which means the route accepts grounding but rejects visible generated content as not an acceptable structured `question_set`.
- Existing parser is JSON-first. A robust acceptance layer should still require exact requested count, but it can safely summarize common numbered question-list output without storing raw question text.

## Implementation Steps

1. Add failing tests for AI出题 non-JSON numbered draft output with exactly the requested count.
2. Add tests that wrong numbered counts and unrelated prose still fail safely.
3. Implement shared parser fallback that recognizes numbered question draft markers and returns redacted draft summaries only.
4. Strengthen Provider instruction to explicitly avoid full question text, options, answers, and analysis.
5. Run focused route/provider parser tests, lint, typecheck, Prettier, diff check, and Module Run v2 gates.

## Acceptance Standards

- AI出题 structured preview accepts common numbered text/Markdown question-list output only when count equals requested `questionCount`.
- Wrong count, missing markers, or unrelated prose still fails safely.
- Parser fallback produces only redacted summaries and does not persist or expose raw content in evidence.
- AI组卷 structured parser behavior remains unchanged.
- No Provider/browser/DB/private OCR/dependency/schema/deploy/release/final Pass/Cost Calibration action is executed.
