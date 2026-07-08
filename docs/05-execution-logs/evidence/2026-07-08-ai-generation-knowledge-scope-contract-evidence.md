# AI Generation Knowledge Scope Contract Evidence

## Task

- Task id: `ai-generation-knowledge-scope-contract-2026-07-08`
- Branch: `codex/ai-generation-knowledge-scope-contract-2026-07-08`
- Scope: shared route-integrated AI generation knowledge scope contract and request normalizers.

## Requirement Mapping Result

| Requirement                                               | Mapping                                               | Result   |
| --------------------------------------------------------- | ----------------------------------------------------- | -------- |
| 四角色 AI 出题/组卷接收结构化知识点范围                   | shared generation parameter contract                  | pass     |
| 非法 public id 不可进入任务请求                           | shared normalizer used by personal/admin routes       | pass     |
| 保持旧字段兼容                                            | `knowledgeNode` retained and mapped to supplement     | pass     |
| 不改权限、edition、DB、Provider、schema、fixture、package | task queue allowed/blocked files and validation gates | enforced |

## Read Evidence

- Re-read matrix row `ai-generation-knowledge-scope-contract-2026-07-08`.
- Re-read shared route-integrated provider execution contract.
- Re-read personal AI generation request validator and admin local contract route normalizer.
- Re-read targeted tests around route-integrated provider execution, personal requests, and admin local contract route.

## Validation Results

## Implementation Evidence

- `route-integrated-provider-execution-contract` now defines a structured knowledge scope contract:
  - `knowledgeNodeMode`
  - `knowledgeNodePublicIds`
  - `includeDescendants`
  - `knowledgeNodeSupplement`
  - `sourcePreference`
- Personal AI generation request validation uses the shared normalizer and rejects malformed explicit generation parameters.
- Admin AI generation local contract routing uses the shared normalizer and rejects malformed public ids.
- Student/admin UI default parameter constructors include the default structured scope without changing visible UI.
- Route-integrated test fixtures were updated so required generation parameter objects remain explicit and type-safe.

## Validation Results

- `npm.cmd exec -- vitest run src/server/validators/personal-ai-generation-request.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/route-integrated-provider-execution-service.test.ts`: pass, 3 files, 72 tests.
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
