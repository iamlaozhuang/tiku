# 0704 组卷选择器响应契约对抗式审查

## 审查结论

| 边界         | 结果 | 结论                                                                                |
| ------------ | ---- | ----------------------------------------------------------------------------------- |
| 正式列表契约 | pass | 题目与材料均消费 `data: T[]`，分页继续读取顶层 `pagination`。                       |
| 真实分页     | pass | 题目和材料模式均证明第 2 页请求和返回记录不同；材料不再固定请求第 1 页。            |
| 组卷范围     | pass | 仍按试卷 profession、level、subject 和 available 状态预筛选。                       |
| 材料完整性   | pass | 选择材料后才按 `materialPublicId` 加载关联题目，添加 payload 保留材料题组快照信息。 |
| 生命周期     | pass | 仅草稿显示选题入口；已发布试卷仍只读。                                              |
| 服务端授权   | pass | 未以客户端显隐替代内容管理员路由保护，未改服务端权限。                              |
| 正式内容     | pass | 仍通过既有草稿试卷加题 endpoint；未写母题、材料或已发布试卷。                       |
| 敏感信息     | pass | UI、测试与 evidence 未新增业务标识展示、内部数字 ID、凭证或完整内容。               |
| Provider     | pass | 无 Provider 请求、配置、Prompt、payload、AI 输出或 Cost Calibration。               |
| 数据与依赖   | pass | 无 package/lockfile、schema、migration、seed 或直接数据库变更。                     |
| 累计回归     | pass | affected 5/5 files、33/33 tests；full unit 357/357 files、1931/1931 tests。         |

## 失败注入

- 将数组 envelope 恢复为错误对象 wrapper 时，组件测试会在列表渲染前失败。
- 将材料请求页码重新固定为 1 时，材料第 2 页用例无法看到服务端第 2 页记录并失败。
- 移除 `materialPublicId` 查询时，材料优先添加测试无法证明关联题目范围并失败。
- 改动已发布试卷选题入口时，只读测试失败。

## 剩余门禁

- 分支提交前完成 format、diff 和 Module Run v2。
- `--ff-only` 合入本地 master 后，使用既有 0704DB localhost 会话做脱敏题目/材料选择 smoke；禁止记录凭证、会话和完整内容。
- 远端 push 仍需 fresh approval。
