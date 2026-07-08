# 2026-07-08 资源知识点绑定 UI 对抗式审计

## Scope

审计范围为 `knowledge-resource-binding-ui-2026-07-08` 分支的资源绑定 UI/DTO/测试改动。

## Adversarial Findings

| 检查项                                      | 结论                                                                  |
| ------------------------------------------- | --------------------------------------------------------------------- |
| 是否改变登录、角色、授权或 edition 语义？   | 否。仅改内容后台资源页面、DTO 和测试，未改 auth/effectiveEdition。    |
| 是否新增 DB/schema/migration/seed/fixture？ | 否。数据库映射不新增查询，未改 schema/migration/seed/fixture。        |
| 是否执行 Provider、读取 env 或连接 DB？     | 否。仅运行 unit/lint/typecheck/diff。                                 |
| 是否扩大 `ops_admin` 权限？                 | 否。资源 runtime 既有权限拒绝未改，测试仍覆盖 ops admin 被拒绝。      |
| 是否暴露内部 id 或资源原文？                | 否。页面显示 public id 数量，不显示内部数字 id；evidence 不记录原文。 |
| 是否只核销 G1？                             | 是。学员/后台 AI 知识点选择和 AI 组卷消费留给后续已登记分支。         |

## Three-Round Review

### Round 1 - Functional

- 上传表单会把文本框里的 public id 拆分为多个 `knowledgeNodePublicIds` FormData 字段。
- 资源列表能显示已绑定数量；未绑定资源显示 `0 个`，属于空态。
- 服务端本地资源映射会返回已保存的 public id 列表。

### Round 2 - Risk

- public id 文本不是权限边界，只是资源绑定输入；权限仍由现有资源接口和服务层控制。
- 本分支未实现知识点树选择器，避免与后续 AI picker 分支混在一起。
- 数据库资源暂时返回空绑定列表，不引入未经设计的 join 或 schema 变更。

### Round 3 - Regression

- targeted resource UI/runtime tests 通过。
- typecheck/lint/diff 通过。
- 无 package/lockfile/env/schema/migration/seed/fixture 改动。

## Decision

本分支可提交、合入 `master`、跑 master 门禁、推送并清理短分支。
