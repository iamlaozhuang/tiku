# 2026-07-06 Content Admin History Adoption Loop Audit

## 对抗式审查结论

当前改动针对内容后台历史 AI 生成结果无法进入正式草稿采用的问题做最小闭环补齐，没有放宽角色权限、没有引入直接发布、没有新增 schema/migration/dependency，也没有触发 Provider 或 DB 运行时。

## 风险检查

- 权限边界：历史 `reviewedDraft` 只随内容后台历史接口返回；组织后台结果返回 `null`。
- 正式内容边界：AI 采用仍走 `formal-adoptions` 和正式草稿 adapter，不直接发布正式 `question` 或 `paper`。
- 历史伪造风险：无 persisted reviewed draft 的 history-only 结果仍不能点击采用。
- 敏感信息：未记录 Provider payload、raw prompt、raw output、凭证、DB 行或完整业务内容到 evidence。
- 复用情况：正式草稿 payload 构造从前端单点抽到纯函数，当前结果和服务端持久化共用。
- 回归面：未改标准版、组织训练发布、员工答题、统计、Provider、DB schema 或依赖。

## 剩余边界

- 本任务未执行浏览器、真实 Provider、运行时 DB 或 staging/prod 验证。
- 已用本地 unit/type/lint/format/diff/full-unit 门禁覆盖当前 source/test/docs 变更。
