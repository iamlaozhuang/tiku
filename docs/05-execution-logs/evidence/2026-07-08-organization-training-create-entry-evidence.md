# 2026-07-08 Organization Training Create Entry Evidence

## Scope

- Task: `organization-training-create-entry-2026-07-08`
- Branch: `codex/org-training-create-entry`
- Boundary: organization training admin create-entry UI and focused unit tests only.
- Adopted prior stages instead of repeating:
  - stage 1 list management closure;
  - stage 2 lifecycle source/content read model.

## Implementation Evidence

- The create wizard now starts with business intent:
  - `新建试卷训练`
  - `新建题目训练`
- Source choices are filtered by intent:
  - paper training: `AI组卷结果`, `平台试卷快照`
  - question training: `AI出题结果`, `手动题组`
- Removed the ambiguous create-entry source label `企业 AI 结果`.
- Removed the main-flow manual platform-paper identifier field from the create entry.
- Kept source handoff guidance inside the enterprise training domain:
  - AI results enter enterprise training drafts only;
  - platform paper snapshot selection is described as list-based, not internal identifier entry;
  - `mock_exam` remains excluded from enterprise training sources.

## Requirement Mapping Result

- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`: maps to the four-step enterprise training wizard and first-release sources.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`: maps to organization AI output staying in the organization/training domain.
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`:
  - `CT-REQ-016`: enterprise training source model and four-step wizard;
  - `CT-REQ-018`: `mock_exam` is not a training source;
  - `CT-REQ-024` and `CT-REQ-048`: organization AI handoff remains training-draft only.
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-org-admin-workspace.md`: maps to clearer organization admin training creation and AI-to-training handoff.

## TDD / Regression Evidence

- Adoption baseline check:
  - Command: `npm.cmd exec -- vitest run src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
  - Result: pass, 3 files, 87 tests.
- Red check:
  - Command: `npm.cmd exec -- vitest run tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
  - Result: failed as expected before implementation because the UI still exposed `训练形态`, `企业 AI 结果`, and a manual `试卷快照` field.
- Green focused check:
  - Command: `npm.cmd exec -- vitest run tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
  - Result: pass, 1 file, 14 tests.
- Combined organization training target set:
  - Command: `npm.cmd exec -- vitest run src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
  - Result: pass, 3 files, 87 tests.
- Adjacent organization AI entry:
  - Command: `npm.cmd exec -- vitest run tests/unit/admin-ai-generation-entry-surface.test.ts --reporter=dot`
  - Result: pass, 1 file, 39 tests.
- Lint:
  - Command: `npm.cmd run lint`
  - Result: pass.
- Typecheck:
  - Command: `npm.cmd run typecheck`
  - Result: pass.
- Scoped Prettier check:
  - Command: `npm.cmd exec -- prettier --check ...`
  - Result: pass.
- Diff check:
  - Command: `git diff --check`
  - Result: pass.
- Full unit:
  - First command run timed out before producing a test result; it was not counted as pass/fail.
  - Re-run command: `npm.cmd run test:unit -- --reporter=dot`
  - Result: pass, 349 files, 1778 tests.

## Boundary Evidence

- DB/schema/migration/seed/fixture: not changed.
- DB read/write or destructive operation: not executed.
- Provider/API model execution: not executed.
- Package or lockfile: not changed.
- Staging/prod/deploy/env/secret/Cost Calibration: not executed.
- Browser/runtime screenshot: not executed for this source-only unit-validated stage.
- Evidence contains no credentials, sessions, cookies, tokens, localStorage values, env values, DB URLs, DB raw rows, internal numeric ids, Provider payloads, raw prompts, raw AI output, or full question/paper/material text.
