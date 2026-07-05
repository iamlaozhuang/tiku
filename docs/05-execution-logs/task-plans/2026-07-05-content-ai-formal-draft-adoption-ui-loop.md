# Content AI Formal Draft Adoption UI Loop

Task id: `content-ai-formal-draft-adoption-ui-loop-2026-07-05`

Branch: `codex/content-ai-formal-draft-adoption-2026-07-05`

## Scope

- Wire content-admin current-session structured AI drafts into the existing formal draft adoption runtime.
- Reuse `AdminAiGenerationEntryPage` and the existing formal adoption route/service/adapter.
- Add a small UI-side mapper from structured preview summaries to reviewed formal draft payloads.
- No schema, DB connection, DB mutation, Provider call, env/secret read, dependency change, browser/e2e, deploy, release, final Pass, or Cost Calibration.

## Read Baseline

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md` through `adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- Current AI generation baseline evidence and focused source/tests.

## First-Principles Finding

Content AI formal adoption requires two things at the same time:

1. governance approval and traceability for a content-admin generated result;
2. a reviewed formal draft payload that the existing question/paper writers can validate and write as draft content.

The current UI can submit the governance approval, but it does not submit `reviewedDraft`; the runtime adapter already requires that payload before it can create formal question/paper drafts. Therefore the minimal high-leverage fix is to preserve and submit current-session structured preview payloads instead of inventing a new backend path.

## Implementation Plan

1. RED: update admin AI generation UI tests so current-session content AI adoption must send `reviewedDraft`, and history-only adoption must not claim draft creation.
2. GREEN: add a pure mapper from `structuredPreview` plus generation parameters to formal question/paper draft payloads.
3. Wire `AdminAiGenerationEntryPage` to derive reviewed draft payloads for the matching current-session `resultPublicId` and include them only for content-admin approved adoption.
4. Keep organization AI unchanged: it copies to organization training draft, not formal platform content.
5. Validate with focused tests, typecheck, lint, scoped prettier, diff checks, Module Run v2 precommit/prepush, then commit/merge/push/cleanup.

## Risk Defense

- Do not persist raw generated content in new tables or evidence.
- Do not read `.env*`, credentials, sessions, DB rows, or provider payloads.
- Do not weaken role boundaries: `org_advanced_admin` still cannot use content formal adoption.
- If a result has no current structured draft payload, the UI must not imply formal draft creation.
