# 2026-07-08 AI 知识点选择源证据

## Scope

- Task: `ai-knowledge-node-picker-2026-07-08`
- Branch: `codex/ai-knowledge-node-picker-2026-07-08`
- Evidence mode: redacted command/status/code-symbol evidence only.

## Requirement Mapping Result

| Requirement                                  | Evidence                                                                                                                                |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 四类角色 AI 参数面板可选择知识点树节点       | `StudentPersonalAiGenerationPage` 接入个人/企业员工共享学员面板；`AdminAiGenerationEntryPage` 接入内容后台/企业高级管理员共享后台面板。 |
| AI出题 / AI组卷 均支持结构化知识点 public id | targeted UI tests 覆盖学员 AI出题、企业员工 AI组卷、内容后台 AI出题、企业管理员 AI组卷提交 selected `knowledgeNodePublicIds`。          |
| 只读、脱敏、无 Provider / DB 写入            | 新增 `/api/v1/ai-generation/knowledge-nodes` 只读 GET；测试验证只返回 public knowledge-node DTO，不包含内部数字 id。                    |
| 标准/高级版边界不改语义                      | 页面既有授权/edition 门禁未变；新增选项路由不执行生成，生成请求仍走既有高级版门禁。                                                     |

## TDD Red

- Command: `npm.cmd exec -- vitest run tests/unit/ai-generation-knowledge-node-options-route.test.ts tests/unit/student-personal-ai-generation-ui.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`
- Result: failed as expected before implementation.
- Red reason: new options route module absent; learner/admin selected knowledge-node labels absent.

## Green Verification

- Command: `npm.cmd exec -- vitest run tests/unit/ai-generation-knowledge-node-options-route.test.ts tests/unit/student-personal-ai-generation-ui.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`
- Result: pass, 3 files / 78 tests.

- Command: `npm.cmd run lint`
- Result: pass.

- Command: `npm.cmd run typecheck`
- Result: pass.

- Command: `git diff --check`
- Result: pass.

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-knowledge-node-picker-2026-07-08`
- Result: pass.

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-knowledge-node-picker-2026-07-08 -SkipRemoteAheadCheck`
- Result: first run blocked on repository checkpoint drift; after updating `project-state.yaml` checkpoint to current `master` / `origin/master`, rerun passed.

## Safety Evidence

- DB/schema/migration/seed/fixture: not changed.
- Provider: not called; no Provider code path enabled.
- Env/secret/session/cookie/localStorage values: not read into evidence; tests use synthetic tokens only.
- Package/lockfile: not changed.
- Browser/dev server/e2e/staging/prod/cost calibration: not executed.

## Closeout Readiness

- Ready for local commit, fast-forward merge to `master`, master gate, push, and short-branch cleanup under the approved closeout policy.
