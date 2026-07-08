# 2026-07-08 Organization Training Read Model Kind Evidence

## Scope

- Task: `organization-training-read-model-kind-2026-07-08`
- Branch: `codex/org-training-read-model-kind`
- Boundary: organization training lifecycle read-only DTO, route query handling, repository metadata lookup, and admin list filters only.
- Exclusions honored: no DB/schema/migration/seed/fixture change, no Provider call, no env/secret access, no package or lockfile change, no staging/prod/deploy/Cost Calibration.

## Implementation Evidence

- Added lifecycle item metadata labels:
  - `sourceKind`: `ai_question`, `ai_paper`, `platform_paper`, `manual_group`, `unknown`
  - `contentKind`: `question_training`, `paper_training`, `unknown`
- Added metadata-only source lookup from existing draft lineage, source context, and admin AI task metadata.
- Added route query parsing for `page`, `pageSize`, `status`, `sourceKind`, and `contentKind`.
- Added standard API pagination metadata on lifecycle list responses.
- Updated admin organization training list UI with source and training-shape filters plus product labels.
- Preserved existing publish, copy-to-new-draft, takedown, and employee answer routes.

## Requirement Mapping Result

- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`: maps to organization advanced admin lifecycle management, immutable published versions, no formal paper/mock/exam-report write, and standard admin training denial.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`: maps to AI出题/AI组卷 organization-owned output being distinguishable before organization training publish.
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`: maps to organization AI result-to-training closed-loop visibility without exposing raw AI content.
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-org-admin-workspace.md`: maps to organization admin workspace clarity and role boundary preservation.

## TDD / Regression Evidence

- Red check:
  - `npm.cmd exec -- vitest run src/server/services/organization-training-route.test.ts -t "filters and paginates organization training lifecycle read model by source and content kind" --reporter=dot`
  - Result: failed as expected before implementation because lifecycle list lacked `sourceKind`, `contentKind`, pagination, and source/content filtering.
- Targeted organization training route:
  - `npm.cmd exec -- vitest run src/server/services/organization-training-route.test.ts --reporter=dot`
  - Result: pass, 1 file, 41 tests.
- Targeted organization training UI:
  - `npm.cmd exec -- vitest run tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
  - Result: pass, 1 file, 14 tests.
- Targeted service read model:
  - `npm.cmd exec -- vitest run src/server/services/organization-training-service.test.ts --reporter=dot`
  - Result: pass, 1 file, 32 tests.
- Combined target set:
  - `npm.cmd exec -- vitest run src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
  - Result: pass, 3 files, 87 tests.
- Adjacent AI entry:
  - `npm.cmd exec -- vitest run tests/unit/admin-ai-generation-entry-surface.test.ts --reporter=dot`
  - Result: pass, 1 file, 39 tests.
- Lint:
  - `npm.cmd run lint`
  - Result: pass.
- Typecheck:
  - `npm.cmd run typecheck`
  - Result: pass.
- Prettier scoped check:
  - `npm.cmd exec -- prettier --check ...`
  - Result: pass.
- Diff check:
  - `git diff --check`
  - Result: pass.
- Full unit:
  - `npm.cmd run test:unit -- --reporter=dot`
  - Result: pass, 349 files, 1778 tests.

## Redaction Evidence

- Evidence contains only task labels, file paths, code-symbol-level behavior, command names, and pass/fail summaries.
- No credentials, session values, cookies, tokens, env values, database URLs, raw database rows, internal numeric ids, Provider payloads, raw prompts, raw AI output, full questions, full papers, or source materials are recorded.
