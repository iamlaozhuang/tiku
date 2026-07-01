# AI generation admin debug summary UI repair plan

## Task

- Task id: `ai-generation-admin-debug-summary-ui-repair-2026-07-01`
- Branch: `codex/ai-generation-admin-debug-summary-ui-repair`
- Scope: repair shared admin AI generation visible-content/history wording so content and organization admin pages do not show local-contract/redaction diagnostic summary text as ordinary UI.
- Out of scope: database/schema/migration/seed changes, package/lockfile changes, Provider calls, `.env*` reads/writes, staging/prod/cloud/deploy, e2e automation, Cost Calibration, release readiness, final Pass.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- All ADR files under `docs/02-architecture/adr/`
- Skills: `test-driven-development`, `systematic-debugging`

## Root Cause Hypothesis

- The admin local-contract route creates a diagnostic `contentPreviewMasked` fallback containing redacted local-contract wording.
- The shared admin AI generation UI renders that field in ordinary generated-content/history surfaces without translating it to business language or hiding it when only diagnostic content exists.

## TDD Plan

1. RED: add focused admin UI tests proving generated-content/history surfaces must not render local-contract/redaction diagnostic wording.
2. RED: add route/service test proving fallback `contentPreviewMasked` uses product wording or null-safe business text rather than diagnostic wording.
3. GREEN: update the shared admin mapping/rendering path with the smallest change that preserves structured preview, history separation, grounding gate, and review actions.
4. Verify with focused tests, lint, typecheck, diff check, and Module Run v2 gates.

## Risk Controls

- Do not change RAG/grounding Provider gates.
- Do not hide genuine Provider-visible content; only sanitize diagnostic fallback summaries before ordinary UI.
- Do not change student/employee AI surfaces unless a focused test proves a regression.
- Evidence records only status, counts, safe labels, and validation command names.
