# Knowledge Node Resource Link Resolver Audit

## Scope

本审计覆盖 `knowledge-node-resource-link-resolver-2026-07-08`，只复核资源关联解析和 local RAG 知识点范围过滤。

## Pre-Implementation Checks

- 权限：不改 content admin、super_admin、ops_admin 的权限函数。
- edition：不改授权或 edition 判定。
- 数据：不执行 DB，不读取 env，不改 fixture，不改 schema/migration/seed。
- Provider：不触发 Provider-enabled 调用。
- 关联：必须消除 profession-only first-node fallback。

## Post-Implementation Audit

- 关系根因：原实现使用 profession-only first-node fallback；已删除该路径。
- 解析规则：新解析只按 profession、level、subject 匹配已有知识点引用；无匹配返回空数组，不写错误关联。
- 多节点支持：一个资源可以写入多个匹配的 `knowledge_node_resource` 关系，适配教材或知识点文档覆盖多个知识点的情况。
- RAG 边界：local RAG 只有在请求传入 knowledge node 范围时才按目录声明的 `knowledgeNodePublicIds` 过滤；未声明关联的旧资源在无范围请求下保持兼容。
- 权限边界：未修改 content admin、super_admin、ops_admin 的权限判定。
- edition 边界：未修改授权或 edition 判定。
- 数据边界：未执行 DB、未读取 env、未改 fixture、未改 schema/migration/seed。
- Provider 边界：未执行 Provider-enabled 调用。

## 品味合规自检 Checklist

- [x] 修复了根因：删除 profession-only first-node fallback，而不是在 UI 上遮盖问题。
- [x] 改动范围收敛在资源关联解析、local RAG scope filter 和 targeted tests。
- [x] 未新增依赖，未改 package/lockfile。
- [x] 未改 schema、migration、seed、fixture。
- [x] 未改变登录、角色、授权、edition 语义。
- [x] evidence 未记录完整题目、完整材料、完整资源正文、DB 行或 Provider payload。
