# Admin AI knowledge parameter UI evidence

Task id: `admin-ai-knowledge-parameter-ui-2026-07-08`

Branch: `codex/admin-ai-knowledge-parameter-ui-2026-07-08`

## Scope Evidence

- Updated backend AI generation UI for `content_admin` and `org_advanced_admin`.
- Replaced free-text-only knowledge-point parameter controls with structured coverage mode, selected-node public-id list placeholder, include-descendants flag, and supplement field.
- Added submit blocking when `指定知识点` is selected without selectable knowledge-node public ids.
- Mapped organization AI paper source preference into `generationParameters.sourcePreference`.
- Preserved content AI draft/review boundary and organization AI enterprise-training draft boundary.

## Requirement Mapping Result

- `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`: UI submits structured knowledge-point scope instead of relying on free-text-only parameters.
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`: AI组卷 keeps plan-and-select wording and role-specific source preference.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`: organization AI remains organization-owned training draft content.
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-5-content-admin-cross-role-closure.md`: content AI remains governed draft/review content.

## Validation Evidence

Commands run locally on the short branch:

| Command                                                                                                                                                | Result                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| `npm.cmd exec -- vitest run src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts` | pass, 2 files, 46 tests                    |
| `npm.cmd run lint`                                                                                                                                     | pass                                       |
| `npm.cmd run typecheck`                                                                                                                                | pass                                       |
| `git diff --check`                                                                                                                                     | pass                                       |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-knowledge-parameter-ui-2026-07-08`                                                            | pass after SSOT/read mapping heading fix   |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-knowledge-parameter-ui-2026-07-08 -SkipRemoteAheadCheck`                                        | pass after repository checkpoint alignment |

## Redaction And Risk Evidence

- No Provider execution was run.
- No DB read/write, migration, schema, seed, fixture, rawfiles, env, package, or lockfile change was made.
- No browser runtime, screenshot, raw DOM, session/cookie/token/localStorage, credential, env value, DB row, Provider payload, raw prompt, raw AI output, full question, full paper, full material, or raw resource content was recorded.
- Forbidden path diff check will be covered by Module Run v2 pre-commit and pre-push gates.

## Current Status

Source implementation and targeted validation pass. Module Run v2 closeout gates passed; ready for commit, merge, push, and short-branch cleanup.
