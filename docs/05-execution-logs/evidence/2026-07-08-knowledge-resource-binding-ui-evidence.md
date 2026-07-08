# 2026-07-08 资源知识点绑定 UI Evidence

## Context

- Branch: `codex/knowledge-resource-binding-ui-2026-07-08`
- Task: `knowledge-resource-binding-ui-2026-07-08`
- Scope: 内容后台资源上传表单、资源列表展示、资源 DTO/映射、targeted tests。
- Provider/DB/env: 未执行 Provider；未读取 env；未连接或写入 DB；未改 schema/migration/seed/fixture/package/lockfile。

## Requirement Mapping Result

| 需求来源                                                                                  | 映射结果                                                                                           |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `docs/01-requirements/modules/05-rag-knowledge.md`                                        | 教材、课件、知识点文档等资源作为 AI 知识库资料使用；本分支补齐资源绑定知识点树节点的显式 UI 参数。 |
| `docs/01-requirements/modules/06-admin-ops.md`                                            | 内容后台是资源与 Markdown/RAG 知识库主入口；本分支没有把资源写入口扩给 `ops_admin`。               |
| `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md` | 知识点树不是资源本身，资源通过 public id 列表表达支持关系；本分支只让 UI 提交和展示该关系。        |

## TDD Evidence

```text
npm.cmd exec -- vitest run tests/unit/admin-content-knowledge-ops-baseline.test.ts
RED: 1 failed / 16 tests
Expected failure: resource row did not show "知识点绑定 2 个"; upload form had no "知识点业务标识" input.
```

```text
npm.cmd exec -- vitest run tests/unit/admin-content-knowledge-ops-baseline.test.ts tests/unit/phase-9-rag-resource-knowledge-runtime.test.ts
GREEN: 2 files passed / 20 tests
```

```text
npm.cmd exec -- vitest run tests/unit/admin-content-knowledge-ops-baseline.test.ts tests/unit/phase-9-rag-resource-knowledge-runtime.test.ts tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts
PASS: 3 files passed / 27 tests
```

## Gate Evidence

```text
npm.cmd run typecheck
PASS
```

```text
npm.cmd run lint
PASS
```

```text
git diff --check
PASS
```

## Source Summary

- `AdminResourceOpsSummaryDto` 新增 `knowledgeNodePublicIds: string[]`。
- 本地资源 DTO 映射返回资源已绑定的 knowledge node public id 列表；数据库资源映射在不新增 schema/query 的前提下返回空列表。
- 内容后台资源上传表单新增 `知识点业务标识` 多行输入，按逗号、空格、换行拆分后提交 `knowledgeNodePublicIds`。
- 资源列表新增 `知识点绑定 N 个` 摘要，避免展示内部数字 id 或原始资源内容。

## Redaction

- 未记录凭证、session、cookie、token、env 值、DB URL、DB 原始行、内部数字 id、Provider payload、raw prompt、raw AI output。
- 未记录完整题目、试卷、材料、资源正文或 chunk 内容。
- 测试内容仅使用脱敏标题、public id 和状态断言。
