# Learner AI Knowledge Parameter UI Evidence

## Task

- Task id: `learner-ai-knowledge-parameter-ui-2026-07-08`
- Branch: `codex/learner-ai-knowledge-parameter-ui-2026-07-08`
- Scope: learner AI training knowledge parameter UI and request mapping.

## Requirement Mapping Result

| Requirement                                               | Mapping                                            | Result   |
| --------------------------------------------------------- | -------------------------------------------------- | -------- |
| 学员端 AI出题 / AI组卷 接收结构化知识点参数               | learner AI form state and request body             | pass     |
| 标准版 AI 训练直接路由仍为纯不可用态                      | existing unavailable page state and targeted tests | pass     |
| 个人默认个人授权；员工组织额度必须显式选择                | existing authorization selector and targeted tests | pass     |
| 不改权限、edition、DB、Provider、schema、fixture、package | task queue allowed/blocked files and validation    | enforced |

## Read Evidence

- Re-read matrix row `learner-ai-knowledge-parameter-ui-2026-07-08`.
- Re-read AI generation requirement overlays and UIUX batch 0/3/4 baselines.
- Re-read learner AI page source and targeted tests.
- Confirmed student page has no student-scoped knowledge-node list API; current knowledge-node collection route is content-admin scoped.

## Validation Results

## Implementation Evidence

- Learner AI page now has a structured knowledge scope panel for `AI出题` and `AI组卷`.
- Balanced coverage remains the safe default and submits an empty `knowledgeNodePublicIds` list.
- Optional supplement text maps to `knowledgeNode` and `knowledgeNodeSupplement` as a soft constraint.
- `指定知识点` mode is blocked when no student-visible selectable knowledge nodes exist.
- Organization employee AI paper source preference maps to `sourcePreference`.
- No student-scoped knowledge-node API was introduced; current knowledge-node collection remains content-admin scoped.

## Validation Results

- `npm.cmd exec -- vitest run src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/student-personal-ai-generation-ui.test.ts`: pass, 2 files, 44 tests.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `git diff --check`: pass.
- `Test-ModuleRunV2PreCommitHardening`: pass.
- `Test-ModuleRunV2PrePushReadiness -SkipRemoteAheadCheck`: pass.

## Safety Result

- No Provider execution.
- No DB read/write.
- No env/secret access.
- No package or lockfile change.
- No schema/migration/seed/fixture change.
- No browser runtime or session/storage inspection.
- Evidence is limited to code symbols and validation status.
