# 2026-07-06 Organization Admin AI Training UI Recontract Task Plan

## Metadata

- Task id: `ai-training-org-admin-ui-recontract-2026-07-06`
- Branch: `codex/ai-training-org-admin-ui-recontract-2026-07-06`
- Date: 2026-07-06
- Task type: local source and focused unit UI contract repair.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- Latest local evidence for package 1 through package 2 UI baseline:
  - `docs/05-execution-logs/evidence/2026-07-06-ai-paper-plan-and-select-backend-contract.md`
  - `docs/05-execution-logs/evidence/2026-07-06-ai-training-learner-employee-ui-recontract.md`

## Scope

This package covers only the organization advanced admin AI training content UI contract:

- page copy must present the organization surface as `企业 AI 训练内容`;
- AI出题 must present an enterprise training question draft flow;
- AI组卷 must present an enterprise training paper draft flow;
- organization admin quantity controls must align with the 3/10 and 30/80 contract;
- AI组卷 must show source range `平台正式题库` and `本企业已发布训练题`;
- AI组卷 must show source preference options `均衡使用`, `优先使用企业题`, and `优先使用平台题`;
- AI组卷 must show structured knowledge coverage options in Chinese product wording;
- generated organization draft next steps must include employee-view preview and publish-oriented actions.

## Non-Scope

- No content admin UI repair in this package.
- No route, repository, database, schema, migration, seed, or dependency change.
- No Provider execution, Provider configuration, prompt payload inspection, or Cost Calibration.
- No browser, e2e, DB-backed runtime, staging, production, deployment, PR, push, or force-push.
- No release readiness, production usability, final Pass, or broad role-matrix claim.

## TDD Plan

1. Add focused unit assertions to `tests/unit/admin-ai-generation-entry-surface.test.ts` for the organization advanced admin page:
   - page label and product wording;
   - AI出题 default quantity 3 and max 10;
   - AI组卷 default quantity 30 and max 80;
   - AI组卷 source range, source preference, structured knowledge coverage, and next actions.
   - adjacent helper assertions in `src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx` when shared wording changes.
2. Run the focused test and record the RED failure.
3. Update `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx` with minimal UI contract changes.
4. Run the focused test and broader existing admin AI unit file.
5. Run `typecheck`, `lint`, `git diff --check`, scoped Prettier check, and Module Run v2 pre-commit hardening.

## Evidence Policy

Evidence may record only file paths, test names, command statuses, role labels, UI labels, count values, and redacted summaries.

Evidence must not record credentials, tokens, cookies, sessions, env values, DB URLs, DB rows, internal ids, Provider payloads, raw prompts, raw AI output, full question text, full paper text, full material text, screenshots, DOM dumps, private fixture values, employee raw answers, or plaintext `redeem_code`.

## Risk Controls

- Keep implementation on the shared admin AI generation page and existing unit suite.
- Do not alter authorization enforcement; UI visibility is not the security boundary.
- Preserve existing organization training copy flow tests.
- Preserve content admin tests unless explicitly updated by this organization-only contract.
- Keep all user-visible text Chinese and avoid internal terms such as Provider, payload, structuredPreview, grounding, fallback, ownerType, or source context in ordinary UI.
