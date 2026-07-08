# AI Generation Knowledge Scope Contract Audit

## Scope

本审计覆盖结构化知识点范围契约和请求 normalizer，不覆盖 UI 选择器、不覆盖 RAG 过滤、不覆盖 AI 组卷题源过滤。

## Pre-Implementation Checks

- 权限：不改登录、角色、授权、edition 判定。
- Provider：不执行 Provider-enabled 调用。
- 数据：不连接 DB、不读 env、不改 schema/migration/seed/fixture。
- 兼容：保留 legacy `knowledgeNode` 字段直到 UI 分支完成迁移。

## Post-Implementation Audit

- Scope containment: pass. Changes are limited to the shared generation parameter contract, request normalizers, default UI parameter construction, and targeted tests.
- Permission and edition semantics: pass. No login, role, authorization, or edition判定逻辑 changed.
- Provider boundary: pass. No Provider-enabled execution and no Provider payload/prompt/output recorded.
- Data boundary: pass. No DB connection, schema, migration, seed, fixture, or raw data change.
- Compatibility: pass. Legacy `knowledgeNode` remains present and maps into `knowledgeNodeSupplement` when explicit structured fields are absent.
- Rejection behavior: pass. Explicit malformed structured knowledge scope is rejected instead of silently degrading into `null`.
- Cross-branch boundary: pass. This branch does not add visible selectors or source filtering UI; those remain in later matrix rows.

## 品味合规自检 Checklist

- 第一性原理：pass，先把“知识点范围”抽成请求契约，再让各入口复用。
- 单一事实源：pass，normalizer lives in the shared route-integrated contract module.
- 命名规范：pass，使用 glossary 中的 `knowledgeNode` / `knowledge_node` 语义，不新增自造缩写。
- API/JSON 风格：pass，新增字段保持 camelCase。
- 类型显式：pass，generation parameter fixtures now include required structured fields.
- 兼容性：pass，旧 `knowledgeNode` 字段未移除。
- UI token/code 约束：pass，未新增样式或魔法值。
- 数据安全：pass，未记录凭证、env、DB 行、Provider payload、raw prompt/raw output 或完整题目/材料。
- 依赖边界：pass，未改 package/lockfile。
- 验证门禁：pass for targeted tests/lint/typecheck/diff check and Module Run v2 gates.
