# Learner AI Knowledge Parameter UI Audit

## Scope

本审计覆盖学员端 AI训练页面的知识点参数 UI 与请求映射，不覆盖后台 AI 页面、服务层过滤、Provider、DB、schema 或浏览器验收。

## Pre-Implementation Checks

- 权限：不改登录、角色、授权、edition 判定。
- Provider：不执行 Provider-enabled 调用。
- 数据：不连接 DB、不读 env、不改 schema/migration/seed/fixture。
- UI：不硬编码教材知识点，不输出内部 id，不记录账号、session、cookie、token、localStorage 或完整内容。
- 边界：若无学生可见知识点列表，必须显示空态并保持均衡覆盖可提交；指定知识点无可选项时必须禁用提交并给出原因。

## Post-Implementation Audit

- Scope containment: pass. Changes are limited to learner AI page source, targeted learner tests, and governance docs.
- Permission and edition semantics: pass. Standard/unavailable behavior remains route state logic; UI visibility is not an authorization boundary.
- Personal/org context: pass. Personal remains default; organization quota/source preference is used only after explicit organization context selection.
- Knowledge parameter integrity: pass. UI writes `knowledgeNodeMode`, `knowledgeNodePublicIds`, `includeDescendants`, `knowledgeNodeSupplement`, and `sourcePreference` into the existing shared contract.
- Empty/disabled state: pass. `指定知识点` is disabled when no selectable student knowledge nodes exist; `均衡覆盖` remains available.
- Data boundary: pass. No DB, env, Provider, schema, migration, seed, fixture, package, or lockfile change.
- Redaction: pass. Tests and evidence use synthetic labels only and no credentials, session values, internal ids, raw content, Provider payload, raw prompt, or raw output.

## 品味合规自检 Checklist

- 第一性原理：pass，先明确学员端只能提交结构化范围，不能伪造知识点树数据。
- 交互状态：pass，覆盖空态和禁用态。
- Token 样式：pass，使用现有 Tailwind/token 类，无新魔法颜色。
- 命名规范：pass，新增字段沿用 `knowledgeNode` 合同命名。
- API/JSON 风格：pass，请求体仍为 camelCase。
- 兼容性：pass，未移除旧 `knowledgeNode`，补充说明继续兼容 legacy 字段。
- 权限边界：pass，未改登录、角色、授权或 edition 判定。
- 依赖边界：pass，未改 package/lockfile。
- 数据安全：pass，未记录敏感信息或完整题目/材料/资源内容。
- 验证门禁：pass for targeted tests/lint/typecheck/diff check and Module Run v2 gates.
