# 2026-07-09 content AI local e2e regression evidence

## Scope

- Task id: `content-ai-local-e2e-regression-2026-07-09`
- Branch: `codex/content-ai-local-e2e-regression`
- Scope: localhost-only regression for content-admin AI出题/AI组卷 closed-loop surfaces and adjacent personal/organization advanced role boundaries.
- Evidence mode: redacted route labels, visible state labels, command names, aggregate counts, and pass/fail status only.

## Requirement Mapping Result

- Content-admin AI出题 maps to generated result -> review/adoption -> formal question draft -> explicit publish path, with no immediate user usability before publish.
- Content-admin AI组卷 maps to plan/select -> platform formal question references -> formal paper draft with section/question composition -> explicit publish path.
- Organization AI generation and enterprise training remain organization/training-domain only and are not mixed with content-admin formal adoption.
- Personal advanced and organization advanced employee AI训练 remain learner-domain flows; standard roles remain hidden, denied, upgrade-guided, or unavailable.

## Source Regression Validation

- `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/admin-question-material-ui.test.ts tests/unit/admin-paper-ui.test.ts --reporter=dot`
  - Result: pass, 3 files, 80 tests.
- `corepack pnpm@10.26.1 exec vitest run src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/lib/admin-ai-generation-formal-draft-payload.test.ts src/server/services/paper-draft-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts --reporter=dot`
  - Result: pass, 4 files, 67 tests.
- `corepack pnpm@10.26.1 exec vitest run src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/student-personal-ai-generation-ui.test.ts --reporter=dot`
  - Result: pass, 4 files, 96 tests.
- `corepack pnpm@10.26.1 exec vitest run src/server/services/organization-training-route.test.ts src/server/services/organization-training-service.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts --reporter=dot`
  - Result: pass, 6 files, 119 tests.
- `corepack pnpm@10.26.1 run typecheck`
  - Result: pass.
- `corepack pnpm@10.26.1 run lint`
  - Result: pass.
- `git diff --check`
  - Result: pass.

## Localhost Read-Only Browser Evidence

- Browser target: `http://127.0.0.1:3000`.
- Browser role context observed: content-admin workspace session.
- Screenshots, raw DOM dumps, traces, browser storage, cookies, tokens, sessions, localStorage, and Auth headers: not read or recorded.
- `/content/ai-question-generation`
  - Result: pass. Visible content-admin AI出题 surface showed content AI assistance, pending question draft, draft review, review/adopt/reject, and generate-pending-draft labels.
- `/content/ai-paper-generation`
  - Result: pass. Visible content-admin AI组卷 surface showed pending paper draft, plan/select flow language, platform formal question source wording, and generate-pending-paper-draft label.
- `/content/questions`
  - Result: pass. Content question management surface was reachable and showed question lifecycle controls at label level.
- `/content/papers`
  - Result: pass. Content paper management surface was reachable and showed draft/published/publish/takedown lifecycle labels at label level.
- `/organization/ai-question-generation`, `/organization/ai-paper-generation`, `/organization/organization-training`
  - Result: pass for current role boundary. Current content-admin session received the organization-workspace denied state and a return-to-content action.
- `/ai-generation`, `/organization-training`
  - Result: pass for current session boundary. Current browser session redirected to login for learner routes; no credentials were entered.

## Not Executed

- Browser submit/adopt/publish/takedown actions were not executed.
- Reason: read-only code inspection confirmed the local AI generation route uses Postgres-backed repositories by default; the current local service DB target was not confirmed as 0704 DB in this turn, and this branch does not have approval to perform DB write-path acceptance without that confirmation.
- Provider-enabled execution was not executed.
- Direct DB connection, DB mutation, schema, migration, seed, fixture, dependency, package/lockfile, staging, production, deploy, and Cost Calibration actions were not executed.

## Sensitive Boundary

- Evidence contains no credentials, session/cookie/token/localStorage/Auth header values, env values, DB URL, DB rows, internal numeric ids, Provider payload, raw prompt, raw AI output, complete question text, complete paper text, material text, resource text, chunk content, screenshots, traces, or raw DOM.
